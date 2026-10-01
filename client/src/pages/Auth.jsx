import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    try {
      const data = await api('/auth/' + mode, { method: 'POST', body: f });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/'); window.location.reload();
    } catch (e) { setErr(e.message); }
  };
  const demo = (email, password) => setF({ ...f, email, password });

  return (
    <div className="box">
      <h2>{mode === 'login' ? 'Login' : 'Create account'}</h2>
      {mode === 'register' && <input placeholder="Name" value={f.name} onChange={set('name')} />}
      <input placeholder="Email" value={f.email} onChange={set('email')} />
      <input type="password" placeholder="Password (min 6 characters)" value={f.password} onChange={set('password')} />
      {mode === 'register' && (
        <select value={f.role} onChange={set('role')}>
          <option value="viewer">Viewer – browse, like, comment</option>
          <option value="creator">Creator – can also upload content</option>
        </select>
      )}
      {err && <p className="err">{err}</p>}
      <button className="full" onClick={submit}>{mode === 'login' ? 'Login' : 'Create account'}</button>
      <p className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
      </p>
      {mode === 'login' && (
        <div className="demo">
          <b>Demo accounts (click to fill):</b>
          <button onClick={() => demo('creator@demo.com', 'creator123')}>Creator</button>
          <button onClick={() => demo('viewer@demo.com', 'viewer123')}>Viewer</button>
          <button onClick={() => demo('admin@demo.com', 'admin123')}>Admin</button>
        </div>
      )}
    </div>
  );
}
