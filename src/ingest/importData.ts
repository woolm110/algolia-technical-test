import { AlgoliaUploader } from './index';

const INDEX_NAME = 'test';
const DATA_SOURCE = 'public/products.xml';

const uploader = new AlgoliaUploader(INDEX_NAME, DATA_SOURCE);

uploader.importData();
