import { useEffect, useState } from 'react';
import { api, getUser } from '../api';
import MediaCard from '../components/MediaCard';

export default function Favorites() {
  const [items, setItems] = useState([]);
  useEffect(() => { if (getUser()) api('/media/favorites').then(setItems).catch(() => {}); }, []);
  return (
    <>
      <h2>★ Your saved items</h2>
      <div className="grid">{items.map(m => <MediaCard key={m._id} m={m} />)}</div>
      {!items.length && <p>Nothing saved yet. Open any media and click “Save”.</p>}
    </>
  );
}
