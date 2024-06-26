import { AlgoliaUploader } from './index';

const INDEX_NAME = 'test';
const FILE_PATH = 'public/products.xml';

const uploader = new AlgoliaUploader(INDEX_NAME, FILE_PATH);

uploader.importInitialData();
