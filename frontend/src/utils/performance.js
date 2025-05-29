import { useCallback, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';

// メモ化されたコンポーネントの作成
export const memoizeComponent = (Component, propsAreEqual = null) => {
  return React.memo(Component, propsAreEqual);
};

// メモ化されたコールバックの作成
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// メモ化された値の作成
export const useMemoizedValue = (value, deps) => {
  return useMemo(() => value, deps);
};

// 無限スクロールの最適化
export const useInfiniteScroll = (fetchData, options = {}) => {
  const {
    threshold = 100,
    rootMargin = '0px',
    enabled = true
  } = options;

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && enabled) {
        fetchData();
      }
    }, { threshold, rootMargin });
    if (node) observer.current.observe(node);
  }, [fetchData, threshold, rootMargin, enabled]);

  return lastElementRef;
};

// データのキャッシュ管理
export const useDataCache = (key, fetchData, options = {}) => {
  const queryClient = useQueryClient();
  const {
    staleTime = 5 * 60 * 1000, // 5分
    cacheTime = 30 * 60 * 1000, // 30分
    enabled = true
  } = options;

  return useQuery(key, fetchData, {
    staleTime,
    cacheTime,
    enabled,
    onSuccess: (data) => {
      // キャッシュの更新
      queryClient.setQueryData(key, data);
    }
  });
};

// 画像の遅延読み込み
export const useLazyImage = (src, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px'
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => setIsLoaded(true);
            img.onerror = (err) => setError(err);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, threshold, rootMargin]);

  return { imgRef, isLoaded, error };
};

// パフォーマンスメトリクスの収集
export const usePerformanceMetrics = () => {
  const metrics = useRef({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null  // Cumulative Layout Shift
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        metrics.current.fcp = entries[entries.length - 1].startTime;
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        metrics.current.lcp = entries[entries.length - 1].startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        metrics.current.fid = entries[0].processingStart - entries[0].startTime;
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let cls = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
        metrics.current.cls = cls;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }, []);

  return metrics.current;
};

// パフォーマンス最適化されたリスト
export const useOptimizedList = (items, options = {}) => {
  const {
    itemHeight = 50,
    overscan = 5,
    containerHeight = 500
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight
      }
    }));
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    containerRef,
    handleScroll,
    visibleItems,
    totalHeight: items.length * itemHeight
  };
}; 