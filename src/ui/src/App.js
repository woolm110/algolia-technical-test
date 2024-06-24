import React, { useCallback, useMemo } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Hits, Pagination, Configure, useInstantSearch, useSearchBox, HierarchicalMenu } from 'react-instantsearch';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';

import '@algolia/autocomplete-theme-classic';
import 'instantsearch.css/themes/satellite.css';

import './App.css';
import { Autocomplete } from './AutoComplete';

const searchClient = algoliasearch('7JU241Q6VH', 'fbe80fe18f09ceb6a0883b332c1052b0');
const INSTANT_SEARCH_QUERY_SUGGESTIONS = 'products_query_suggestions';
const INSTANT_SEARCH_INDEX_NAME = 'products';
const INSTANT_SEARCH_HIERARCHICAL_CATEGORIES = [
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
  'hierarchicalCategories.lvl2'
];

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

function SearchBoxWithSuggestions() {
  const { setIndexUiState } = useInstantSearch();
  const { query } = useSearchBox();

  const plugins = useMemo(() => {
    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      searchClient,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setIndexUiState((indexUiState) => ({
              ...indexUiState,
              query: item.query
            }));
          },
        };
      },
    });

    return [querySuggestionsPlugin];
  }, [setIndexUiState]);

  const initialState = useMemo(() => ({ query }), [query]);

  const onReset = useCallback(
    () =>
      setIndexUiState((indexUiState) => ({
        ...indexUiState,
        query: '',
        page: 1,
      })),
    [setIndexUiState]
  );

  const onSubmit = useCallback(
    ({ state }) =>
      setIndexUiState((indexUiState) => ({
        ...indexUiState,
        query: state.query,
        page: 1,
      })),
    [setIndexUiState]
  );

  return (
    <Autocomplete
      placeholder="Search for products…"
      plugins={plugins}
      initialState={initialState}
      onReset={onReset}
      onSubmit={onSubmit}
    />
  );
}

function App() {
  return (
    <div className="App">
      <InstantSearch searchClient={searchClient} indexName={INSTANT_SEARCH_INDEX_NAME} insights={true}>
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
