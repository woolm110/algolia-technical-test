import React, { useEffect, useRef, createElement, Fragment, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import { autocomplete } from '@algolia/autocomplete-js';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';

import { searchClient } from '../config/SearchClient';

import '@algolia/autocomplete-theme-classic';

import { INSTANT_SEARCH_QUERY_SUGGESTIONS } from '../config/Constants';

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
    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      searchClient,
      getSearchParams: () => ({ clickAnalytics: true }),
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
