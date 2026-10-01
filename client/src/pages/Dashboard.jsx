import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const load = () => api('/media/mine').then(setItems).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);
  const remove = async id => { if (window.confirm('Delete?')) { await api('/media/' + id, { method: 'DELETE' }); load(); } };
  const edit = async m => { const title = window.prompt('New title', m.title); if (title) { await api('/media/' + m._id, { method: 'PUT', body: { title } }); load(); } };
  const sum = k => items.reduce((a, m) => a + (k === 'likes' ? m.likes.length : m[k]), 0);

  return (
    <>
      <h2>Creator dashboard</h2>
      {err && <p className="err">{err}</p>}
      <div className="stats">
        <div><b>{items.length}</b>Uploads</div><div><b>{sum('views')}</b>Total views</div><div><b>{sum('likes')}</b>Total likes</div>
      </div>
      {!items.length && <p>You haven't uploaded anything yet. <Link to="/upload">Upload your first item</Link></p>}
      {items.map(m => (
        <div key={m._id} className="listrow">
          <Link to={'/watch/' + m._id}><b>{m.title}</b></Link>
          <small>{m.type} · {m.category} · 👁 {m.views} · 👍 {m.likes.length}</small>
          <span><button onClick={() => edit(m)}>Edit</button><button className="danger" onClick={() => remove(m._id)}>Delete</button></span>
        </div>
      ))}
    </>
  );
}
