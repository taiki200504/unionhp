import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { NewsList } from '../components/NewsList';
import { CategoryList } from '../components/CategoryList';
import { UserProfile } from '../components/UserProfile';
import { useDataCache } from '../utils/performance';

// モックデータ
const mockNews = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `ニュース${i + 1}`,
  content: `コンテンツ${i + 1}`,
  category: { id: (i % 3) + 1, name: `カテゴリー${(i % 3) + 1}` },
  status: 'published'
}));

const mockCategories = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `カテゴリー${i + 1}`,
  slug: `category-${i + 1}`
}));

describe('Frontend Performance Tests', () => {
  describe('NewsList Component', () => {
    it('should render large lists efficiently', async () => {
      const startTime = performance.now();
      
      render(<NewsList news={mockNews} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 100件のニュースを200ms以内にレンダリング
      expect(renderTime).toBeLessThan(200);

      // 仮想化リストが正しく機能していることを確認
      const visibleItems = screen.getAllByTestId('news-item');
      expect(visibleItems.length).toBeLessThan(mockNews.length);
    });

    it('should handle filtering efficiently', async () => {
      render(<NewsList news={mockNews} />);

      const startTime = performance.now();
      
      fireEvent.change(screen.getByPlaceholderText('検索...'), {
        target: { value: 'ニュース1' }
      });

      await waitFor(() => {
        const filteredItems = screen.getAllByTestId('news-item');
        expect(filteredItems.length).toBeLessThan(mockNews.length);
      });

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      // フィルタリングを100ms以内に完了
      expect(filterTime).toBeLessThan(100);
    });

    it('should handle infinite scroll efficiently', async () => {
      render(<NewsList news={mockNews} />);

      const startTime = performance.now();
      
      // スクロールイベントをシミュレート
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      await waitFor(() => {
        const visibleItems = screen.getAllByTestId('news-item');
        expect(visibleItems.length).toBeGreaterThan(10);
      });

      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      // スクロール処理を50ms以内に完了
      expect(scrollTime).toBeLessThan(50);
    });
  });

  describe('CategoryList Component', () => {
    it('should render categories efficiently', async () => {
      const startTime = performance.now();
      
      render(<CategoryList categories={mockCategories} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // カテゴリーリストを50ms以内にレンダリング
      expect(renderTime).toBeLessThan(50);
    });

    it('should handle category selection efficiently', async () => {
      render(<CategoryList categories={mockCategories} />);

      const startTime = performance.now();
      
      fireEvent.click(screen.getByText('カテゴリー1'));

      await waitFor(() => {
        expect(screen.getByText('カテゴリー1')).toHaveClass('selected');
      });

      const endTime = performance.now();
      const selectionTime = endTime - startTime;

      // カテゴリー選択を20ms以内に完了
      expect(selectionTime).toBeLessThan(20);
    });
  });

  describe('UserProfile Component', () => {
    it('should handle form updates efficiently', async () => {
      render(<UserProfile />);

      const startTime = performance.now();
      
      fireEvent.change(screen.getByLabelText('名前'), {
        target: { value: '新しい名前' }
      });

      fireEvent.change(screen.getByLabelText('プロフィール'), {
        target: { value: '新しいプロフィール' }
      });

      await waitFor(() => {
        expect(screen.getByLabelText('名前')).toHaveValue('新しい名前');
      });

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // フォーム更新を30ms以内に完了
      expect(updateTime).toBeLessThan(30);
    });
  });

  describe('Data Cache', () => {
    it('should cache data efficiently', async () => {
      const mockFetch = jest.fn().mockResolvedValue(mockNews);
      const cacheKey = 'test-news';

      // 最初のデータ取得
      const firstStartTime = performance.now();
      await act(async () => {
        await useDataCache(cacheKey, mockFetch);
      });
      const firstFetchTime = performance.now() - firstStartTime;

      // 2回目のデータ取得（キャッシュヒット）
      const secondStartTime = performance.now();
      await act(async () => {
        await useDataCache(cacheKey, mockFetch);
      });
      const secondFetchTime = performance.now() - secondStartTime;

      // キャッシュヒットの方が高速であることを確認
      expect(secondFetchTime).toBeLessThan(firstFetchTime);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Image Loading', () => {
    it('should load images efficiently', async () => {
      const mockImage = {
        src: 'https://example.com/test.jpg',
        onload: jest.fn(),
        onerror: jest.fn()
      };

      global.Image = jest.fn(() => mockImage);

      const startTime = performance.now();
      
      render(<img src="https://example.com/test.jpg" alt="テスト画像" />);

      await act(async () => {
        mockImage.onload();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 画像読み込みを100ms以内に完了
      expect(loadTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage', async () => {
      const initialMemory = window.performance.memory?.usedJSHeapSize || 0;
      
      // コンポーネントのマウント/アンマウントを繰り返す
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<NewsList news={mockNews} />);
        unmount();
      }

      const finalMemory = window.performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // メモリ使用量の増加が50MB以内であることを確認
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
}); 