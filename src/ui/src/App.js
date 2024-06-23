import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination } from 'react-instantsearch';
import './App.css';

const searchClient = algoliasearch('7JU241Q6VH', 'fbe80fe18f09ceb6a0883b332c1052b0');

const Hit = ({ hit }) => (
  <div className="hit-item">
    <div className="hit-item-inner">
      <img src={hit.image} alt={hit.name} />
      <div>
        <strong>{hit.name}</strong>
      </div>
      <div>{hit.description}</div>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <InstantSearch searchClient={searchClient} indexName="products">
        <div className="search-box-container">
          <SearchBox />
        </div>
        <div className="search-content">
          <div className="refinement-list-container">
            <RefinementList
              attribute="categories"
              searchable={false}
              searchablePlaceholder="Search categories"
              operator="or"
              limit={5}
              showMoreLimit={10}
              showMore={true}
            />
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
