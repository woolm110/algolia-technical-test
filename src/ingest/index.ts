import algoliasearch from 'algoliasearch';
import fs from 'fs';
import { Transform } from 'stream';

const StreamArray = require('stream-json/streamers/StreamArray');

export class AlgoliaUploader {
  private index: any;
  private client: any;
  private maxChunkSize: number;
  private chunks: any[];
  private chunkSize: number;
  private stream: any;
  private dataSource: string | any[];

  constructor(
    indexName: string,
    dataSource?: string | any[],
    maxChunkSize: number = 10 * 1024 * 1024, // 10 MB
    apiKey: string = '7d3e557e727538667996535eee4efb33',
    appId: string = '7JU241Q6VH'
  ) {
    this.client = algoliasearch(appId, apiKey);
    this.index = this.client.initIndex(indexName);

    this.dataSource = dataSource;
    this.maxChunkSize = maxChunkSize;
    this.chunks = [];
    this.chunkSize = 0;
  }

  private async assignStream() {
    if (typeof this.dataSource === 'string') {
      this.stream = fs.createReadStream(this.dataSource).pipe(StreamArray.withParser());
    } else if (Array.isArray(this.dataSource)) {
      this.stream = this.createJsonStream();
    } else {
      throw new Error('Unsupported data source type');
    }
  }

  private createJsonStream() {
    const jsonStream = new Transform({
      objectMode: true,
      transform(data, encoding, callback) {
        callback(null, { value: data });
      }
    });

    Array.isArray(this.dataSource) && this.dataSource.forEach((item: any) => jsonStream.write(item));

    jsonStream.end();

    return jsonStream;
  }

  private async uploadObjects(isPartialUpdate = false) {
    if (isPartialUpdate) {
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

  public async deleteIndex(): Promise<void> {
    return this.index.delete();
  }

  public async updateData() {
    console.log('Starting partial data update');

    await this.assignStream();
    this.processStream(true);
  }

  public async importInitialData() {
    console.log('Starting full data update');

    await this.assignStream();
    this.processStream(false);
  }

  private processStream(isPartialUpdate: boolean) {
    this.stream
      .on('data', async ({ value }) => {
        const objectSize = Buffer.byteLength(JSON.stringify(value)); // Get size of current object

        this.chunkSize += objectSize; // Keep track of total size in bytes
        this.chunks.push(value);

        if (this.chunkSize >= this.maxChunkSize) {
          this.stream.pause();
          await this.uploadObjects(isPartialUpdate);
        }
      })
      .on('end', async () => {
        if (this.chunks.length) {
          console.log('Uploading remaining data, bytes remaining', this.chunkSize);
          console.log('Uploading remaining data, records remaining', this.chunks.length);

          await this.uploadObjects(isPartialUpdate);
        }

        console.log('Import complete');
      })
      .on('error', (err) => {
        console.error('Stream error:', err);
      });
  }
}
