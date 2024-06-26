import React, { useState } from 'react';
import { Breadcrumb, Configure, DynamicWidgets, HierarchicalMenu, Hits, InstantSearch, Pagination, RefinementList, SortBy } from 'react-instantsearch';
import aa from 'search-insights';

import { SearchBoxWithSuggestions } from './components/AutoComplete.component';
import { Hit } from './components/Hit.component';
import { Panel } from './components/Panel.component';
import { INSTANT_SEARCH_HIERARCHICAL_CATEGORIES, INSTANT_SEARCH_INDEX_NAME, INSTANT_SEARCH_SORT_POPULAR, INSTANT_SEARCH_SORT_PRICE_ASC, INSTANT_SEARCH_SORT_PRICE_DESC } from './config/Constants';
import { searchClient } from './config/SearchClient';

import './App.css';
import '@algolia/autocomplete-theme-classic';
import 'instantsearch.css/themes/satellite.css';

aa('init', {
  appId: '7JU241Q6VH',
  apiKey: 'fbe80fe18f09ceb6a0883b332c1052b0',
});

function App() {
  const [selectedHit, setSelectedHit] = useState(null);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

  const handleHitClick = (hit) => {
    console.log('hit :>> ', hit);
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
            <DynamicWidgets>
              <Panel header="Categories">
                <HierarchicalMenu
                  attributes={INSTANT_SEARCH_HIERARCHICAL_CATEGORIES}
                  showMore={true}
                  translations={{
                    showMoreButtonText({ isShowingMore }) {
                      return isShowingMore ? 'Show less categories' : 'Show more categories';
                    },
                  }}
                />
              </Panel>
              <Panel header="Brand">
                <RefinementList
                  attribute="brand"
                />
              </Panel>
              <Panel header="Price">
                <RefinementList
                  attribute="price_range"
                  transformItems={(items) => {
                    return items.map((item) => ({
                      ...item,
                      label: `£${item.label}`,
                    }));
                  }}
                />
              </Panel>
              <Panel header="Rating">
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
              </Panel>
              <Panel header="Free Shipping">
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
              </Panel>
            </DynamicWidgets>
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
