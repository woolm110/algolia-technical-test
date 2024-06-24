import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import React, { Fragment, useCallback, useMemo } from 'react';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';

import { INSTANT_SEARCH_QUERY_SUGGESTIONS } from '../config/Constants';
import { searchClient } from '../config/SearchClient';
import { Autocomplete } from '../services/AutoComplete.service';

import '@algolia/autocomplete-theme-classic';

/**
 * SearchBoxWithSuggestions
 * Create an instance of a search box
 * component with AutoComplete
 */
export function SearchBoxWithSuggestions() {
  const { setIndexUiState } = useInstantSearch();
  const { query, refine: setQuery } = useSearchBox();

  const plugins = useMemo(() => {
    const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
      key: 'search',
      limit: 5,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setQuery(item.label);
            setIndexUiState((indexUiState) => ({
              ...indexUiState,
              query: item.label,
              page: 1,
            }));
          },
          templates: {
            ...source.templates,
            header({ state }) {
              if (state.query) {
                return null;
              }
              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">Your searches</span>
                  <div className="aa-SourceHeaderLine" />
                </Fragment>
              );
            },
          },
        };
      },
    });

    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      getSearchParams() {
        return recentSearchesPlugin.data.getAlgoliaSearchParams({
          hitsPerPage: 5,
        });
      },
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setQuery(item.query);
            setIndexUiState((indexUiState) => ({
              ...indexUiState,
              query: item.query,
              page: 1,
            }));
          },
          templates: {
            ...source.templates,
            header({ state }) {
              if (state.query) {
                return null;
              }

              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">Popular searches</span>
                  <div className="aa-SourceHeaderLine" />
                </Fragment>
              );
            },
          },
        };
      },
    });

    return [recentSearchesPlugin, querySuggestionsPlugin];
  }, [setIndexUiState, setQuery]);

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
      openOnFocus={true}
      insights={true}
      onReset={onReset}
      onSubmit={onSubmit}
    />
  );
}
