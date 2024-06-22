import { AlgoliaUploader } from './index';

const INDEX_NAME = 'products';
const FILE_PATH = 'public/products.json';

const uploader = new AlgoliaUploader(INDEX_NAME, FILE_PATH);

uploader.importInitialData();
