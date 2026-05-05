import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  rating: 0,
  priceRange: [0, 50000],
  sort: "",
  page: 1,
};

const SORT_MAP = {
  "": "",
  "price-asc": "low",
  "price-desc": "high",
  "rating-desc": "rating-desc",
  "-createdAt": "newest",
};

const normalizeNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const filterReducer = (state, action) => {
  switch (action.type) {
    case "SET_FILTER":
      return { ...state, [action.field]: action.value };
    case "CLEAR_FILTERS":
      return DEFAULT_FILTERS;
    case "SET_PAGE":
      return { ...state, page: action.value };
    case "SET_MULTIPLE":
      return { ...state, ...action.changes };
    default:
      return state;
  }
};

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useReducer(filterReducer, DEFAULT_FILTERS);
  const debounceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    dispatch({
      type: "SET_MULTIPLE",
      changes: {
        search: params.get("search") || "",
        category: params.get("category") || "",
        rating: normalizeNumber(params.get("rating"), 0),
        sort: params.get("sort") || "",
        page: normalizeNumber(params.get("page"), 1),
        priceRange: [
          normalizeNumber(params.get("min") ?? params.get("priceMin"), 0),
          normalizeNumber(params.get("max") ?? params.get("priceMax"), 50000),
        ],
      },
    });
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const setUrlParams = useCallback(
    (updates, { debounce = true } = {}) => {
      const applyUpdates = () => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined || value === 0) {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });

        if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
          params.set("page", "1");
        }

        setSearchParams(params, { replace: true });
      };

      if (!debounce) {
        applyUpdates();
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(applyUpdates, 250);
    },
    [searchParams, setSearchParams],
  );

  const updateFilter = useCallback(
    (field, value) => {
      dispatch({ type: "SET_FILTER", field, value });

      if (field === "priceRange") {
        setUrlParams({ min: value[0], max: value[1] });
        return;
      }

      const paramValue = field === "sort" ? SORT_MAP[value] ?? value : value;
      setUrlParams({ [field]: paramValue });
    },
    [setUrlParams],
  );

  const setPage = useCallback(
    (page) => {
      dispatch({ type: "SET_PAGE", value: page });
      setUrlParams({ page }, { debounce: false });
    },
    [setUrlParams],
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(
    () =>
      [
        state.search,
        state.category,
        state.rating > 0,
        state.priceRange[0] > 0 || state.priceRange[1] < 50000,
        state.sort,
      ].filter(Boolean).length,
    [state],
  );

  const apiParams = useMemo(
    () => ({
      page: state.page,
      ...(state.category && { category: state.category }),
      ...(state.search && { search: state.search }),
      ...(state.rating > 0 && { rating: state.rating }),
      ...(state.priceRange[0] > 0 && { min: state.priceRange[0] }),
      ...(state.priceRange[1] < 50000 && { max: state.priceRange[1] }),
      ...(state.sort && { sort: SORT_MAP[state.sort] || state.sort }),
    }),
    [state],
  );

  const value = useMemo(
    () => ({
      filters: state,
      updateFilter,
      setPage,
      clearFilters,
      activeFilterCount,
      apiParams,
    }),
    [state, updateFilter, setPage, clearFilters, activeFilterCount, apiParams],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within FilterProvider");
  }
  return context;
};
