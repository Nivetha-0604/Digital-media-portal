import { useEffect, useState } from 'react';
import { api } from '../api';
import MediaCard from '../components/MediaCard';

export default function Home() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('new');
  const [err, setErr] = useState('');

  useEffect(() => { api('/media/categories').then(setCats).catch(e => setErr(e.message)); }, []);
  useEffect(() => {
    api('/media?' + new URLSearchParams({ q, type, category, sort })).then(d => { setItems(d); setErr(''); }).catch(e => setErr(e.message));
  }, [q, type, category, sort]);

  return (
    <>
      <section className="hero">
        <h1>Watch, listen and explore</h1>
        <p>Videos, music and photos shared by creators. Register as a Creator to publish your own.</p>
        <input className="search" placeholder="🔍 Search by title, tag or description..." value={q} onChange={e => setQ(e.target.value)} />
      </section>

      <div className="tabs">
        {[['', 'All'], ['video', '🎬 Videos'], ['audio', '🎵 Audio'], ['image', '🖼 Images']].map(([v, l]) =>
          <button key={v} className={type === v ? 'tab on' : 'tab'} onClick={() => setType(v)}>{l}</button>)}
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="new">Newest</option><option value="popular">Most viewed</option><option value="liked">Most liked</option>
        </select>
      </div>
      <div className="chips">
        <span className={!category ? 'chip on' : 'chip'} onClick={() => setCategory('')}>All categories</span>
        {cats.map(c => <span key={c} className={category === c ? 'chip on' : 'chip'} onClick={() => setCategory(c)}>{c}</span>)}
      </div>

      {err && <p className="err">{err}</p>}
      <div className="grid">
        {items.map(m => <MediaCard key={m._id} m={m} />)}
        {!items.length && !err && <p>No media found.</p>}
      </div>
    </>
  );
}
