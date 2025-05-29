import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { App } from '../App';
import { mockApi } from '../utils/api';

// モックデータ
const mockNews = [
  {
    id: 1,
    title: 'テストニュース1',
    content: 'テストコンテンツ1',
    category: { id: 1, name: 'カテゴリー1' },
    status: 'published'
  },
  {
    id: 2,
    title: 'テストニュース2',
    content: 'テストコンテンツ2',
    category: { id: 2, name: 'カテゴリー2' },
    status: 'published'
  }
];

const mockCategories = [
  { id: 1, name: 'カテゴリー1', slug: 'category-1' },
  { id: 2, name: 'カテゴリー2', slug: 'category-2' }
];

describe('End-to-End Tests', () => {
  beforeEach(() => {
    // APIモックの設定
    mockApi.get.mockImplementation((url) => {
      if (url === '/news') {
        return Promise.resolve({ data: mockNews });
      }
      if (url === '/categories') {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('User Flow Tests', () => {
    it('should complete user registration and login flow', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      // 登録画面に移動
      fireEvent.click(screen.getByText(/新規登録/i));

      // ユーザー登録
      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByText(/登録/i));

      await waitFor(() => {
        expect(screen.getByText(/登録が完了しました/i)).toBeInTheDocument();
      });

      // ログイン
      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByText(/ログイン/i));

      await waitFor(() => {
        expect(screen.getByText(/ようこそ/i)).toBeInTheDocument();
      });
    });

    it('should complete news creation and editing flow', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      // ログイン
      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'admin@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'admin123' }
      });
      fireEvent.click(screen.getByText(/ログイン/i));

      await waitFor(() => {
        expect(screen.getByText(/ようこそ/i)).toBeInTheDocument();
      });

      // ニュース作成
      fireEvent.click(screen.getByText(/ニュース作成/i));
      fireEvent.change(screen.getByLabelText(/タイトル/i), {
        target: { value: '新しいニュース' }
      });
      fireEvent.change(screen.getByLabelText(/内容/i), {
        target: { value: '新しいコンテンツ' }
      });
      fireEvent.select(screen.getByLabelText(/カテゴリー/i), {
        target: { value: '1' }
      });
      fireEvent.click(screen.getByText(/作成/i));

      await waitFor(() => {
        expect(screen.getByText(/ニュースが作成されました/i)).toBeInTheDocument();
      });

      // ニュース編集
      fireEvent.click(screen.getByText(/編集/i));
      fireEvent.change(screen.getByLabelText(/タイトル/i), {
        target: { value: '更新されたニュース' }
      });
      fireEvent.click(screen.getByText(/更新/i));

      await waitFor(() => {
        expect(screen.getByText(/ニュースが更新されました/i)).toBeInTheDocument();
      });
    });
  });

  describe('News Management Flow', () => {
    it('should handle news listing and filtering', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      // ニュース一覧の表示
      await waitFor(() => {
        expect(screen.getByText('テストニュース1')).toBeInTheDocument();
        expect(screen.getByText('テストニュース2')).toBeInTheDocument();
      });

      // カテゴリーでフィルタリング
      fireEvent.select(screen.getByLabelText(/カテゴリー/i), {
        target: { value: '1' }
      });

      await waitFor(() => {
        expect(screen.getByText('テストニュース1')).toBeInTheDocument();
        expect(screen.queryByText('テストニュース2')).not.toBeInTheDocument();
      });

      // 検索
      fireEvent.change(screen.getByPlaceholderText(/検索/i), {
        target: { value: 'テストニュース1' }
      });

      await waitFor(() => {
        expect(screen.getByText('テストニュース1')).toBeInTheDocument();
        expect(screen.queryByText('テストニュース2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Category Management Flow', () => {
    it('should handle category creation and management', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      // 管理者としてログイン
      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'admin@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'admin123' }
      });
      fireEvent.click(screen.getByText(/ログイン/i));

      // カテゴリー管理画面に移動
      fireEvent.click(screen.getByText(/カテゴリー管理/i));

      // カテゴリー作成
      fireEvent.change(screen.getByLabelText(/カテゴリー名/i), {
        target: { value: '新しいカテゴリー' }
      });
      fireEvent.click(screen.getByText(/作成/i));

      await waitFor(() => {
        expect(screen.getByText('新しいカテゴリー')).toBeInTheDocument();
      });

      // カテゴリー編集
      fireEvent.click(screen.getByText(/編集/i));
      fireEvent.change(screen.getByLabelText(/カテゴリー名/i), {
        target: { value: '更新されたカテゴリー' }
      });
      fireEvent.click(screen.getByText(/更新/i));

      await waitFor(() => {
        expect(screen.getByText('更新されたカテゴリー')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle API errors gracefully', async () => {
      // APIエラーをシミュレート
      mockApi.get.mockRejectedValueOnce(new Error('API Error'));

      render(
        <MemoryRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });

      // リトライ
      fireEvent.click(screen.getByText(/再試行/i));

      await waitFor(() => {
        expect(screen.getByText('テストニュース1')).toBeInTheDocument();
      });
    });
  });
}); 