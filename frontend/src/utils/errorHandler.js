import { toast } from 'react-toastify';

// エラーメッセージのマッピング
const errorMessages = {
  'Network Error': 'サーバーに接続できません。インターネット接続を確認してください。',
  'Request failed with status code 401': '認証に失敗しました。再度ログインしてください。',
  'Request failed with status code 403': 'この操作を実行する権限がありません。',
  'Request failed with status code 404': 'リソースが見つかりません。',
  'Request failed with status code 500': 'サーバーエラーが発生しました。しばらく経ってから再度お試しください。'
};

// エラーハンドラー
export const handleError = (error) => {
  console.error('Error:', error);

  // エラーメッセージの取得
  let message = error.response?.data?.message || error.message;
  
  // エラーメッセージのマッピング
  if (errorMessages[message]) {
    message = errorMessages[message];
  }

  // トースト通知の表示
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

  // 401エラーの場合はログアウト処理
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return Promise.reject(error);
};

// APIリクエストのラッパー
export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      return handleError(error);
    }
  };
};

// フォームエラーハンドラー
export const handleFormError = (error, setErrors) => {
  if (error.response?.data?.errors) {
    const formErrors = {};
    error.response.data.errors.forEach(err => {
      formErrors[err.field] = err.message;
    });
    setErrors(formErrors);
  } else {
    handleError(error);
  }
};

// バリデーションエラーハンドラー
export const handleValidationError = (error, setErrors) => {
  if (error.response?.data?.validationErrors) {
    setErrors(error.response.data.validationErrors);
  } else {
    handleError(error);
  }
};

// グローバルエラーバウンダリ
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>予期せぬエラーが発生しました</h2>
          <p>ページを更新するか、しばらく経ってから再度お試しください。</p>
          <button onClick={() => window.location.reload()}>
            ページを更新
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 