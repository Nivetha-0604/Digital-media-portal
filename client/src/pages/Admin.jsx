import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Admin() {
  const [media, setMedia] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');
  const load = () => {
    api('/media/admin/all').then(setMedia).catch(e => setErr(e.message));
    api('/media/admin/users').then(setUsers).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  const remove = async id => { if (window.confirm('Remove this media?')) { await api('/media/' + id, { method: 'DELETE' }); load(); } };

  return (
    <>
      <h2>Admin panel</h2>
      {err && <p className="err">{err}</p>}
      <div className="stats">
        <div><b>{users.length}</b>Users</div><div><b>{media.length}</b>Media items</div>
        <div><b>{media.reduce((a, m) => a + m.views, 0)}</b>Total views</div>
      </div>
      <h3>All media</h3>
      {media.map(m => (
        <div key={m._id} className="listrow">
          <Link to={'/watch/' + m._id}><b>{m.title}</b></Link>
          <small>{m.type} · {m.category} · by {m.uploader?.name} · 👁 {m.views}</small>
          <button className="danger" onClick={() => remove(m._id)}>Remove</button>
        </div>
      ))}
      <h3>Users</h3>
      {users.map(u => (
        <div key={u._id} className="listrow"><b>{u.name}</b><small>{u.email}</small><em className="rolebadge">{u.role}</em></div>
      ))}
    </>
  );
}
