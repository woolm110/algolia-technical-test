import algoliasearch from 'algoliasearch';
import fs from 'fs';

const StreamArray = require('stream-json/streamers/StreamArray');

export class AlgoliaUploader {
  private index: any;
  private client: any;
  private filePath: any;
  private maxChunkSize: number;
  private chunks: any[];
  private chunkSize: number;
  private stream: any;

  constructor(
    indexName: string,
    filePath?: string,
    maxChunkSize: number = 10 * 1024 * 1024, // 10 MB
    apiKey: string = '7d3e557e727538667996535eee4efb33',
    appId: string = '7JU241Q6VH'
  ) {
    this.client = algoliasearch(appId, apiKey);
    this.index = this.client.initIndex(indexName);
    this.filePath = filePath;

    this.maxChunkSize = maxChunkSize;
    this.chunks = [];
    this.chunkSize = 0;
  }

  private uploadObjects(isPartialUpdate = false) {
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

  public deleteIndex(): Promise<void> {
    return this.index.delete();
  }

  public updateData() {
    console.log('Starting partial data update');

    this.processStream(true);
  }

  public importInitialData() {
    console.log('Starting full data update');

    this.processStream(false);
  }

  private processStream(isPartialUpdate: boolean) {
    this.stream = fs.createReadStream(this.filePath).pipe(StreamArray.withParser());

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
