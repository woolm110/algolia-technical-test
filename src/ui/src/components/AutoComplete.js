import { autocomplete } from '@algolia/autocomplete-js';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import React, { createElement, Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';

import { INSTANT_SEARCH_QUERY_SUGGESTIONS } from '../config/Constants';
import { searchClient } from '../config/SearchClient';

import '@algolia/autocomplete-theme-classic';

function Autocomplete(props) {
  const containerRef = useRef(null);
  const panelRootRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const search = autocomplete({
      insights: true,
      container: containerRef.current,
      getSearchParams: () => ({ clickAnalytics: true }),
      renderer: { createElement, Fragment, render: () => { } },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;

          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }

        panelRootRef.current.render(children);
      },
      ...props,
    });

    return () => {
      search.destroy();
    };
  }, [props]);

  return <div ref={containerRef} />;
}

/**
 * SearchBoxWithSuggestions
 * Create an instance of a search box
 * component with AutoComplete
 */
export function SearchBoxWithSuggestions() {
  const { setIndexUiState } = useInstantSearch();
  const { query } = useSearchBox();

  const plugins = useMemo(() => {
    const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
      key: 'search',
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
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

    return [querySuggestionsPlugin, recentSearchesPlugin];
  }, []);

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
