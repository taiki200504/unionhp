import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/admin'); // ログイン成功時に管理画面トップへ遷移
      } else {
        setError(data.message || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('通信エラー');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:400,margin:'40px auto',padding:24,border:'1px solid #ccc',borderRadius:8}}>
      <h2 style={{textAlign:'center'}}>管理者ログイン</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" style={{width:'100%',marginBottom:12,padding:8}} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" style={{width:'100%',marginBottom:12,padding:8}} />
      <div>
        <button
          type="submit"
          className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          ログイン
        </button>
      </div>
      <div className="text-center mt-4">
        <Link to="/signup" className="text-indigo-600 hover:text-indigo-500">
          新規登録はこちら
        </Link>
      </div>
      {error && <div style={{color:'red',marginTop:12}}>{error}</div>}
    </form>
  );
} 