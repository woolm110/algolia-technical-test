import React from 'react';
import { InstantSearch, Hits, Pagination, Configure, HierarchicalMenu } from 'react-instantsearch';

import '@algolia/autocomplete-theme-classic';
import 'instantsearch.css/themes/satellite.css';

import './App.css';
import { SearchBoxWithSuggestions } from './components/AutoComplete';
import { Hit } from './components/Hit';
import { searchClient } from './config/SearchClient';
import { INSTANT_SEARCH_INDEX_NAME, INSTANT_SEARCH_HIERARCHICAL_CATEGORIES } from './config/Constants';

function App() {
  return (
    <div className="App">
      <InstantSearch searchClient={searchClient} indexName={INSTANT_SEARCH_INDEX_NAME} insights>
        <Configure hitsPerPage={10} />
        <div className="search-box-container">
          <SearchBoxWithSuggestions />
        </div>
        <div className="search-content">
          <div className="refinement-list-container">
            <h3>Categories</h3>
            <HierarchicalMenu attributes={INSTANT_SEARCH_HIERARCHICAL_CATEGORIES} showMore={true} translations={{
              showMoreButtonText({ isShowingMore }) {
                return isShowingMore ? 'Show less categories' : 'Show more categories';
              },
            }} />
          </div>
          <div className="hits-container">
            <Hits hitComponent={Hit} />
            <Pagination className="Pagination" />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}

export default App;
