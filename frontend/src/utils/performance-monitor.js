import { useEffect, useRef } from 'react';
import { reportWebVitals } from '../reportWebVitals';

// パフォーマンスメトリクスの収集
const collectMetrics = () => {
  const metrics = {
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0, // Time to First Byte
    fmp: 0, // First Meaningful Paint
    tti: 0, // Time to Interactive
  };

  // First Contentful Paint
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.fcp = entries[entries.length - 1].startTime;
  }).observe({ entryTypes: ['paint'] });

  // Largest Contentful Paint
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.lcp = entries[entries.length - 1].startTime;
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.fid = entries[0].processingStart - entries[0].startTime;
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift
  new PerformanceObserver((entryList) => {
    let cls = 0;
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
    metrics.cls = cls;
  }).observe({ entryTypes: ['layout-shift'] });

  return metrics;
};

// コンポーネントのレンダリングパフォーマンスを監視
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);

  useEffect(() => {
    const startTime = performance.now();
    renderCount.current++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderTimes.current.push(renderTime);

      // レンダリング時間が閾値を超えた場合に警告
      if (renderTime > 100) {
        console.warn(
          `${componentName}のレンダリング時間が長すぎます: ${renderTime}ms`
        );
      }

      // メトリクスを収集して送信
      const metrics = collectMetrics();
      reportWebVitals(metrics);
    };
  });
};

// メモリ使用量の監視
export const useMemoryMonitor = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.performance && window.performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = window.performance.memory;
        const memoryUsage = (usedJSHeapSize / totalJSHeapSize) * 100;

        if (memoryUsage > 80) {
          console.warn(`メモリ使用量が高すぎます: ${memoryUsage.toFixed(2)}%`);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
};

// ネットワークリクエストの監視
export const useNetworkMonitor = () => {
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (duration > 1000) {
          console.warn(
            `APIリクエストが遅すぎます: ${args[0]} (${duration.toFixed(2)}ms)`
          );
        }

        return response;
      } catch (error) {
        console.error('APIリクエストエラー:', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};

// 画像読み込みの最適化
export const useImageOptimization = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    document.querySelectorAll('img[data-src]').forEach((img) => {
      observer.observe(img);
    });

    return () => observer.disconnect();
  }, []);
};

// パフォーマンスレポートの生成
export const generatePerformanceReport = () => {
  const metrics = collectMetrics();
  const report = {
    timestamp: new Date().toISOString(),
    metrics,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    memory: window.performance.memory
      ? {
          usedJSHeapSize: window.performance.memory.usedJSHeapSize,
          totalJSHeapSize: window.performance.memory.totalJSHeapSize
        }
      : null
  };

  // レポートをサーバーに送信
  fetch('/api/performance-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(report)
  }).catch(console.error);

  return report;
};

// パフォーマンス最適化の推奨事項を生成
export const generateOptimizationSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.fcp > 1000) {
    suggestions.push('First Contentful Paintが遅すぎます。初期バンドルサイズの削減を検討してください。');
  }

  if (metrics.lcp > 2500) {
    suggestions.push('Largest Contentful Paintが遅すぎます。画像の最適化とレイアウトの改善を検討してください。');
  }

  if (metrics.fid > 100) {
    suggestions.push('First Input Delayが高すぎます。メインスレッドのブロッキングを減らしてください。');
  }

  if (metrics.cls > 0.1) {
    suggestions.push('Cumulative Layout Shiftが高すぎます。レイアウトの安定性を改善してください。');
  }

  return suggestions;
}; 