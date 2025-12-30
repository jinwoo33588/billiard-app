import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import type { InsightsResponse } from './types';

export function useInsights(windowSize: number) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await axiosInstance.get<InsightsResponse>('/users/insights', {
          params: { window: windowSize },
        });

        if (mounted) setData(res.data);
      } catch (e) {
        console.error(e);
        if (mounted) setErrorMsg('분석 데이터를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [windowSize]);

  return { data, loading, errorMsg };
}