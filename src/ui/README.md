# Algolia Demo UI

This UI showcases the power of Agolia search against the dataset uploaded using the ingester.

It supports the following features:

- Autocomplete / query suggestions
- Dynamic Facet rendering
- Search history
- Popular searches
- Sorting
- Filtering
- Match highlighting
- Event tracking
- Breadcrumb navigation
- Pagination
- Custom rules

## Launching the demo

From within the `ui` directory first install all dependencies using `npm i`. Once this completes you can launch the UI using `npm run start`; this will launch a browser window with the demo UI on port `3000`.

### Supported Indexes

The demo showcases the following indexes:

- `products`
- `products_query_suggestions`
- `product_price_asc`
- `product_price_desc`
- `product_price_popular`
