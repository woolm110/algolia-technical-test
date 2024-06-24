import React, { useEffect, useRef, createElement, Fragment, useCallback, useMemo } from 'react';
import { render } from 'react-dom';

import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import { autocomplete } from '@algolia/autocomplete-js';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';

import { searchClient } from '../config/SearchClient';

import '@algolia/autocomplete-theme-classic';

import { INSTANT_SEARCH_QUERY_SUGGESTIONS } from '../config/Constants';

function Autocomplete(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const search = autocomplete({
      ...props,
      container: containerRef.current,
      renderer: { createElement, Fragment, render },
    });

    return () => search.destroy();
  }, [props]);

  return <div ref={containerRef} />;
}

export function SearchBoxWithSuggestions() {
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
