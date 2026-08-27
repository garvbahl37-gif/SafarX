import { useState, useEffect } from "react";
import ApiService from "../services/api";

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { dependencies = [], enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await ApiService.request(endpoint);

        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [endpoint, enabled, ...dependencies]);

  const refetch = () => {
    if (enabled) {
      setLoading(true);
      setError(null);
      // Trigger useEffect by updating a dependency
    }
  };

  return { data, loading, error, refetch };
}
