import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { Login } from '../components/Login';
import { Register } from '../components/Register';
import { UserProfile } from '../components/UserProfile';
import { NewsForm } from '../components/NewsForm';

// モック関数
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockUpdateProfile = jest.fn();
const mockCreateNews = jest.fn();

describe('Frontend Security Tests', () => {
  describe('Authentication Tests', () => {
    it('should prevent access to protected routes without authentication', async () => {
      render(
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      );

      expect(screen.getByText(/ログインが必要です/i)).toBeInTheDocument();
    });

    it('should handle invalid login credentials', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <MemoryRouter>
          <AuthProvider>
            <Login onLogin={mockLogin} />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByText(/ログイン/i));

      await waitFor(() => {
        expect(screen.getByText(/認証に失敗しました/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation Tests', () => {
    it('should prevent XSS in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      render(
        <MemoryRouter>
          <NewsForm onSubmit={mockCreateNews} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/タイトル/i), {
        target: { value: xssPayload }
      });
      fireEvent.change(screen.getByLabelText(/内容/i), {
        target: { value: xssPayload }
      });

      const titleInput = screen.getByLabelText(/タイトル/i);
      const contentInput = screen.getByLabelText(/内容/i);

      expect(titleInput.value).not.toContain('<script>');
      expect(contentInput.value).not.toContain('<script>');
    });

    it('should validate password strength', async () => {
      render(
        <MemoryRouter>
          <Register onRegister={mockRegister} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'weak' }
      });

      await waitFor(() => {
        expect(screen.getByText(/パスワードは8文字以上必要です/i)).toBeInTheDocument();
      });
    });

    it('should prevent SQL injection in search input', async () => {
      const sqlInjectionPayload = "' OR '1'='1";
      
      render(
        <MemoryRouter>
          <NewsForm onSubmit={mockCreateNews} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/検索/i), {
        target: { value: sqlInjectionPayload }
      });

      const searchInput = screen.getByLabelText(/検索/i);
      expect(searchInput.value).not.toContain("' OR '1'='1");
    });
  });

  describe('Form Security Tests', () => {
    it('should prevent multiple form submissions', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Login onLogin={mockLogin} />
          </AuthProvider>
        </MemoryRouter>
      );

      const submitButton = screen.getByText(/ログイン/i);
      
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should clear sensitive data after logout', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <UserProfile />
          </AuthProvider>
        </MemoryRouter>
      );

      // ログアウトを実行
      fireEvent.click(screen.getByText(/ログアウト/i));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(sessionStorage.getItem('user')).toBeNull();
      });
    });
  });

  describe('API Security Tests', () => {
    it('should include CSRF token in requests', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(
        <MemoryRouter>
          <AuthProvider>
            <UserProfile />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-CSRF-Token': expect.any(String)
            })
          })
        );
      });
    });

    it('should handle API errors securely', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('API Error'));

      render(
        <MemoryRouter>
          <AuthProvider>
            <UserProfile />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/名前/i), {
        target: { value: '新しい名前' }
      });
      fireEvent.click(screen.getByText(/更新/i));

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
        expect(screen.getByText(/新しい名前/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Session Security Tests', () => {
    it('should handle session timeout', async () => {
      jest.useFakeTimers();

      render(
        <MemoryRouter>
          <AuthProvider>
            <UserProfile />
          </AuthProvider>
        </MemoryRouter>
      );

      // セッションタイムアウトをシミュレート
      act(() => {
        jest.advanceTimersByTime(3600000); // 1時間
      });

      await waitFor(() => {
        expect(screen.getByText(/セッションが切れました/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should prevent session hijacking', async () => {
      const originalToken = 'valid-token';
      localStorage.setItem('token', originalToken);

      render(
        <MemoryRouter>
          <AuthProvider>
            <UserProfile />
          </AuthProvider>
        </MemoryRouter>
      );

      // トークンの変更をシミュレート
      localStorage.setItem('token', 'hijacked-token');

      await waitFor(() => {
        expect(screen.getByText(/認証エラー/i)).toBeInTheDocument();
      });
    });
  });
}); 