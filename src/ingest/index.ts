import algoliasearch from 'algoliasearch';
import fs from 'fs';
import { Transform } from 'stream';
import { parseStringPromise } from 'xml2js';
import pick from 'lodash/pick';

export class AlgoliaUploader {
  private index: any;
  private client: any;
  private maxChunkSize: number;
  private chunks: any[];
  private chunkSize: number;
  private stream: any;
  private dataSource: string | any[];
  private fieldsToUpdate: string[];

  constructor(
    indexName: string,
    dataSource?: string | any[],
    fieldsToUpdate?: string[],
    maxChunkSize: number = 10 * 1024 * 1024, // 10 MB
    apiKey: string = '7d3e557e727538667996535eee4efb33',
    appId: string = '7JU241Q6VH'
  ) {
    this.client = algoliasearch(appId, apiKey);
    this.index = this.client.initIndex(indexName);

    this.dataSource = dataSource;
    this.fieldsToUpdate = fieldsToUpdate;
    this.maxChunkSize = maxChunkSize;
    this.chunks = [];
    this.chunkSize = 0;
  }

  /**
 * assignStream
 * Create a JSON stream of data
 * for each data source type
 */
  private async assignStream() {
    const dataSourceType = this.getDataSourceType();

    let jsonObject: any[];

    try {
      switch (dataSourceType) {
        case 'xmlFile':
          const xmlFileData = fs.readFileSync(this.dataSource as string, 'utf-8');
          jsonObject = await this.convertXmlToJson(xmlFileData);
          break;

        case 'jsonFile':
          const jsonFileData = fs.readFileSync(this.dataSource as string, 'utf-8');
          jsonObject = JSON.parse(jsonFileData);
          break;

        case 'xmlString':
          jsonObject = await this.convertXmlToJson(this.dataSource as string);
          break;

        case 'jsonObject':
          jsonObject = this.dataSource as any[];
          break;

        default:
          throw new Error('Unsupported or missing data source type');
      }

      this.dataSource = this.convertToArrayAndFilter(jsonObject);
      this.stream = this.createJsonStream();
    } catch (error) {
      throw new Error(`Error assigning stream: ${error.message}`);
    }
  }


  /**
   * getDataSourceType
   * Get the type for the parsed data souce
   */
  private getDataSourceType(): string {
    if (typeof this.dataSource === 'string') {
      if (this.isFilePath(this.dataSource)) {
        if (this.dataSource.endsWith('.xml')) {
          return 'xmlFile';
        }
        if (this.dataSource.endsWith('.json')) {
          return 'jsonFile'
        }
      }

      if (this.isXmlString(this.dataSource)) {
        return 'xmlString';
      }
    }

    if (Array.isArray(this.dataSource)) {
      return 'jsonObject';
    }
  }

  /**
   * isFilePath
   * Check if data source is a file path
   */
  private isFilePath(data: string): boolean {
    return fs.existsSync(data);
  }

  /**
   * isXmlString
   * Check if string is XML
   */
  private isXmlString(data: string): boolean {
    const xmlPattern = /<[^>]+>/;

    return xmlPattern.test(data.trim());
  }

  /**
   * convertXmlToJson
   * Convert incoming XML file data
   * or XML strings to JSON for processing
   */
  private async convertXmlToJson(xml: string): Promise<any[]> {
    try {
      const result = await parseStringPromise(xml, { explicitArray: false });

      return Array.isArray(result) ? result : [result];
    } catch (error) {
      throw new Error('Error converting XML to JSON: ' + error.message);
    }
  }

  /**
   * convertToArrayAndFilter
   * Format the array to ensure its consistent
   * for both JSON and XML data sources
   * Filter the payload if partially updating
   * only some fields
   */
  private convertToArrayAndFilter(jsonObject: any[]): any[] {
    const normalizedArray = jsonObject.flatMap(item => {
      if (item.root && item.root.row) {
        return Array.isArray(item.root.row) ? item.root.row : [item.root.row];
      }
      return item;
    });

    if (this.fieldsToUpdate && this.fieldsToUpdate.length) {
      return normalizedArray.map(item => pick(item, [...this.fieldsToUpdate, 'objectID']));
    }

    return normalizedArray;
  }

  /**
   * createJsonStream
   * Create a stream of JSON data
   * that can be proccessed by processStream
   */
  private createJsonStream() {
    const jsonStream = new Transform({
      objectMode: true,
      transform(data, encoding, callback) {
        callback(null, { value: data });
      }
    });

    (this.dataSource as any[]).forEach((item: any) => jsonStream.write(item));

    jsonStream.end();

    return jsonStream;
  }

  /**
   * uploadData
   * Handlea upload to Algolia based on
   * full update vs creating new records
   */
  private async uploadObjects(isUpdate = false) {
    if (isUpdate) {
      return this.index.partialUpdateObjects(this.chunks, { createIfNotExists: true })
        .then(() => {
          this.chunks = [];
          this.chunkSize = 0;
          this.stream.resume();
        })
        .catch((error: any) => {
          console.error('Error uploading objects:', error);

          this.stream.resume();
        });
    } else {
      return this.index.saveObjects(this.chunks, { autoGenerateObjectIDIfNotExist: true })
        .then(() => {
          this.chunks = [];
          this.chunkSize = 0;
          this.stream.resume();
        })
        .catch((error: any) => {
          console.error('Error uploading objects:', error);

          this.stream.resume();
        });
    }
  }

  /**
   * updateData
   * Send a full or partial update or data
   */
  public async updateData() {
    console.log('Starting partial data update');

    await this.assignStream();
    this.processStream(true);
  }

  /**
   * importInitialData
   * Full ingest of all fields and objects
   * Creates new records if they don't exist
   */
  public async importInitialData() {
    console.log('Starting full data update');

    await this.assignStream();
    this.processStream(false);
  }

  /**
   * processStream
   * Stream to handle data parsing
   * Split upload into chunks for better performance
   *
   * @param {boolean} isUpdate - is this a full ingest or an update of an existing object
   *
   */
  private processStream(isUpdate: boolean) {
    this.stream
      .on('data', async ({ value }) => {
        const objectSize = Buffer.byteLength(JSON.stringify(value)); // Get size of current object

        this.chunkSize += objectSize; // Keep track of total size in bytes
        this.chunks.push(value);

        if (this.chunkSize >= this.maxChunkSize) {
          this.stream.pause();

          await this.uploadObjects(isUpdate);
        }
      })
      .on('end', async () => {
        if (this.chunks.length) {
          console.log('Uploading remaining data, bytes remaining', this.chunkSize);
          console.log('Uploading remaining data, records remaining', this.chunks.length);

          await this.uploadObjects(isUpdate);
        }

        console.log('Import complete');
      })
      .on('error', (err) => {
        console.error('Stream error:', err);
      });
  }
}
