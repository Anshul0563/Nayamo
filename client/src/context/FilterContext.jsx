import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash'; // Add if not exist, or implement simple debounce

// Filter reducer
const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.field]: action.value };
    case 'CLEAR_FILTERS':
      return {
        search: '',
        category: '',
        rating: 0,
        priceRange: [0, 50000],
        sort: '',
        page: 1,
      };
    case 'SET_PAGE':
      return { ...state, page: action.value };
    case 'SET_MULTIPLE':
      return { ...state, ...action.changes };
    default:
      return state;
  }
};

// Sort mapping: frontend UI → backend service params
const SORT_MAP = {
  '': null,
  'price-asc': 'low',
  'price-desc': 'high',
  'rating-desc': '-ratings.average', // Approximate, backend may need update
  '-createdAt': 'newest',
};

// Context
const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useReducer(filterReducer, {
    search: '',
    category: '',
    rating: 0,
    priceRange: [0, 50000],
    sort: '',
    page: 1,
  });

  // Sync URL params ↔ state
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const newState = {
      search: params.get('search') || '',
      category: params.get('category') || '',
      rating: Number(params.get('rating')) || 0,
      sort: params.get('sort') || '',
      page: Number(params.get('page')) || 1,
    };
    // Price from params
    newState.priceRange = [
      Number(params.get('priceMin')) || 0,
      Number(params.get('priceMax')) || 50000,
    ];
    dispatch({ type: 'SET_MULTIPLE', changes: newState });
  }, [searchParams]);

  // Debounced URL update
  const debouncedSetParams = useCallback(
    debounce((updates) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.set('page', '1'); // Reset page on filter change
      setSearchParams(params, { replace: true });
    }, 300),
    [searchParams, setSearchParams]
  );

  const updateFilter = useCallback((field, value) => {
    dispatch({ type: 'SET_FILTER', field, value });
    let paramValue = value;
    if (field === 'priceRange') {
      debouncedSetParams({ priceMin: value[0], priceMax: value[1] });
      return;
    }
    if (field === 'sort') {
      paramValue = SORT_MAP[value] || value;
    }
    debouncedSetParams({ [field]: paramValue === 0 ? '' : paramValue });
  }, [debouncedSetParams]);

  const setPage = (page) => {
    dispatch({ type: 'SET_PAGE', value: page });
    setSearchParams((params) => {
      params.set('page', page.toString());
      return params;
    });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
    setSearchParams({}, { replace: true });
  };

  // Computed
  const activeFilterCount = useMemo(() => 
    [state.category, state.rating > 0 ? 1 : 0, 
     state.priceRange[0] > 0 || state.priceRange[1] < 50000 ? 1 : 0,
     state.sort ? 1 : 0].filter(Boolean).length, 
    [state]
  );

  const apiParams = useMemo(() => ({
    page: state.page,
    ...(state.category && { category: state.category }),
    ...(state.search && { search: state.search }),
    ...(state.rating > 0 && { rating: state.rating }),
    ...(state.priceRange[0] > 0 && { min: state.priceRange[0] }),
    ...(state.priceRange[1] < 50000 && { max: state.priceRange[1] }),
    sort: SORT_MAP[state.sort] || state.sort,
  }), [state]);

  const value = {
    filters: state,
    updateFilter,
    setPage,
    clearFilters,
    activeFilterCount,
    apiParams,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
};

