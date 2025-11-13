'use client';

import { useEffect, useState } from 'react';
import { EscrowData } from '../types/escrow';

export function useEscrowData() {
  const [data, setData] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/mockdata/synthetic_escrow_data.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load escrow data');
        }
        return res.json();
      })
      .then((json: EscrowData[]) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

