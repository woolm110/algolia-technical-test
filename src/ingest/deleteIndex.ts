import { AlgoliaUploader } from './index';

const INDEX_TO_DELETE = 'test';

const uploader = new AlgoliaUploader(INDEX_TO_DELETE);

uploader.deleteIndex().then(() => {
  console.log(`Index "${INDEX_TO_DELETE}" deleted successfully.`);
}).catch((error) => {
  console.error('Error deleting index:', error);
});
