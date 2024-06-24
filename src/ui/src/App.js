import React, { useState } from 'react';
import { InstantSearch, Hits, Pagination, Configure, HierarchicalMenu, RefinementList, SortBy, Breadcrumb } from 'react-instantsearch';

import '@algolia/autocomplete-theme-classic';
import 'instantsearch.css/themes/satellite.css';

import './App.css';
import { SearchBoxWithSuggestions } from './components/AutoComplete';
import { Hit } from './components/Hit';
import { searchClient } from './config/SearchClient';
import { INSTANT_SEARCH_INDEX_NAME, INSTANT_SEARCH_HIERARCHICAL_CATEGORIES, INSTANT_SEARCH_SORT_POPULAR, INSTANT_SEARCH_SORT_PRICE_DESC, INSTANT_SEARCH_SORT_PRICE_ASC } from './config/Constants';

import aa from 'search-insights';

aa('init', {
  appId: '7JU241Q6VH',
  apiKey: 'fbe80fe18f09ceb6a0883b332c1052b0',
});

function App() {
  const [selectedHit, setSelectedHit] = useState(null);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

  const handleHitClick = (hit) => {
    setSelectedHit(hit);
  };

  const closeModal = () => {
    setSelectedHit(null);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    aa('convertedObjectIDsAfterSearch', {
      eventName: 'Added to cart',
      index: INSTANT_SEARCH_INDEX_NAME,
      objectIDs: [selectedHit.objectID],
      queryID: selectedHit.__queryID,
    });

    setShowAddToCartSuccess(true);

    setTimeout(() => {
      setShowAddToCartSuccess(false);
    }, 2000);
  };

  return (
    <div className="App">
      <InstantSearch searchClient={searchClient} indexName={INSTANT_SEARCH_INDEX_NAME} insights>
        <Configure hitsPerPage={10} />
        <div className="search-box-container">
          <SearchBoxWithSuggestions />
        </div>
        <div className="header-container">
          <Breadcrumb attributes={INSTANT_SEARCH_HIERARCHICAL_CATEGORIES} />
          <SortBy
            items={[
              { label: 'Popular', value: INSTANT_SEARCH_SORT_POPULAR },
              { label: 'Price (Highest)', value: INSTANT_SEARCH_SORT_PRICE_DESC },
              { label: 'Price (Lowest)', value: INSTANT_SEARCH_SORT_PRICE_ASC },
            ]}
          />
        </div>
        <div className="search-content">
          <div className="refinement-list-container">
            <h3>Categories</h3>
            <HierarchicalMenu
              attributes={INSTANT_SEARCH_HIERARCHICAL_CATEGORIES}
              showMore={true}
              translations={{
                showMoreButtonText({ isShowingMore }) {
                  return isShowingMore ? 'Show less categories' : 'Show more categories';
                },
              }}
            />
            <h3>Brand</h3>
            <RefinementList
              attribute="brand"
            />
            <h3>Price</h3>
            <RefinementList
              attribute="price_range"
              transformItems={(items) => {
                return items.map((item) => ({
                  ...item,
                  label: `£${item.label}`,
                }));
              }}
            />
            <h3>Rating</h3>
            <RefinementList
              attribute="rating"
              sortBy={['name']}
              transformItems={(items) => {
                return items.map((item) => ({
                  ...item,
                  label: `${item.label} stars`,
                }));
              }}
            />
            <h3>Free Shipping</h3>
            <RefinementList
              attribute="free_shipping"
              sortBy={['name']}
              transformItems={(items) => {
                return items.map((item) => ({
                  ...item,
                  label: item.label === 'true' ? 'Yes' : 'No',
                }));
              }}
            />
          </div>
          <div className="hits-container">
            <Hits hitComponent={(props) => <Hit {...props} onClick={handleHitClick} />} />
            <Pagination className="Pagination" />
          </div>
        </div>
      </InstantSearch>

      {selectedHit && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <h2>{selectedHit.name}</h2>
            <img src={selectedHit.image} alt={selectedHit.name} />
            <p>{selectedHit.description}</p>
            <button
              type="button"
              onClick={handleAddToCart}
            >Add to Cart</button>
          </div>
        </div>
      )}

      {showAddToCartSuccess && (
        <div className="success-message">
          Item added to cart successfully!
        </div>
      )}
    </div>
  );
}

export default App;
