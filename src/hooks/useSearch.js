import { useState, useEffect, useMemo } from "react";
import { debounce } from "../utils/helpers";
import ApiService from "../services/api";

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (!searchQuery.trim()) {
          setResults([]);
          setSuggestions([]);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const [searchResults, searchSuggestions] = await Promise.all([
            ApiService.globalSearch(searchQuery),
            ApiService.getSearchSuggestions(searchQuery),
          ]);

          setResults(searchResults.data || []);
          setSuggestions(searchSuggestions.data || []);
        } catch (err) {
          setError(err.message);
          setResults([]);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    error,
    clearSearch,
  };
}
