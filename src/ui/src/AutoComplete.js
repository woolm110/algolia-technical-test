import React, { useEffect, useRef, createElement, Fragment } from 'react';
import { render } from 'react-dom';

import { autocomplete } from '@algolia/autocomplete-js';

import '@algolia/autocomplete-theme-classic';

export function Autocomplete(props) {
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
