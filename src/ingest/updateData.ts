import { XMLParser } from 'fast-xml-parser';

import { AlgoliaUploader } from './index';

const INDEX_NAME = 'test';
// const DATA_SOURCE = 'public/update.json';
const DATA_SOURCE = 'public/update.xml';
// const DATA_SOURCE = [
//   {
//     "name": "3-Year Unlimited Cloud Storage Service Activation Card - Other",
//     "description": "Enjoy 3 years of unlimited Cloud...",
//     "brand": "Pogoplug",
//     "categories": [
//       "Best Buy Gift Cards",
//       "Entertainment Gift Cards"
//     ],
//     "hierarchicalCategories": {
//       "lvl0": "Best Buy Gift Cards",
//       "lvl1": "Best Buy Gift Cards > Entertainment Gift Cards"
//     },
//     "type": "Online data backup",
//     "price": 69,
//     "price_range": "50 - 100",
//     "image": "https://cdn-demo.algolia.com/bestbuy/1696302_sc.jpg",
//     "url": "http://www.bestbuy.com/site/3-year-unlimited-cloud-storage-service-activation-card-other/1696302.p?id=1219066776306&skuId=1696302&cmp=RMX&ky=1uWSHMdQqBeVJB9cXgEke60s5EjfS6M1W",
//     "free_shipping": true,
//     "popularity": 10000,
//     "rating": 2,
//     "objectID": "1696302"
//   }
// ]
// const DATA_SOURCE = `
//   <?xml version="1.0" encoding="UTF-8"?>
//     <root>
//         <row>
//             <name>3-Year Unlimited Cloud Storage Service Activation Card - Other</name>
//             <description>Enjoy 3 years of unlimited Cloud...</description>
//             <brand>Pogoplug</brand>
//             <categories>Best Buy Gift Cards</categories>
//             <categories>Entertainment Gift Cards</categories>
//             <hierarchicalCategories>
//                 <lvl0>Best Buy Gift Cards</lvl0>
//                 <lvl1>Best Buy Gift Cards &gt; Entertainment Gift Cards</lvl1>
//             </hierarchicalCategories>
//             <price>75</price>
//             <image>https://cdn-demo.algolia.com/bestbuy/1696302_sc.jpg</image>
//             <objectID>1696302</objectID>
//         </row>
//     </root>
// `;

const fieldsToUpdate = ['ratingratingtype', 'price_range', 'url', 'free_shipping', 'popularity', 'rating', 'custom']

const uploader = new AlgoliaUploader(INDEX_NAME, DATA_SOURCE, fieldsToUpdate);

uploader.updateData();
