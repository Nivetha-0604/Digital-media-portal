import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { guessType, looksDirect, ytId, ytThumb } from '../media';

export default function Upload() {
  const [f, setF] = useState({ title: '', description: '', category: 'General', tags: '', url: '', thumbnail: '', type: 'video' });
  const [source, setSource] = useState('file');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const ready = f.title && (source === 'file' ? file : f.url);

  const submit = async () => {
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => { if (v) form.append(k, v); });
    if (source === 'file') { form.delete('url'); form.append('file', file); } else { form.delete('file'); }
    setBusy(true);
    try { const m = await api('/media', { method: 'POST', form }); nav('/watch/' + m._id); }
    catch (e) { setMsg(e.message); setBusy(false); }
  };

  return (
    <div className="box wide">
      <h2>Upload / add media</h2>
      <div className="tabs">
        <button className={source === 'file' ? 'tab on' : 'tab'} onClick={() => setSource('file')}>📁 Upload a file</button>
        <button className={source === 'url' ? 'tab on' : 'tab'} onClick={() => setSource('url')}>🔗 Paste a link</button>
      </div>
      {source === 'file'
        ? <input type="file" accept="video/*,audio/*,image/*" onChange={e => setFile(e.target.files[0])} />
        : <>
            <input placeholder="Direct link to .mp4 / .mp3 / .jpg ..." value={f.url} onChange={e => { const url = e.target.value; setF({ ...f, url, type: guessType(url), thumbnail: ytId(url) ? ytThumb(ytId(url)) : f.thumbnail }); }} />
            {f.url && !looksDirect(f.url) && <p className="err">⚠️ This looks like a web page, not a media file. Use a direct link ending in .mp4 / .mp3 / .jpg, or a YouTube link. (Google Drive, Instagram and similar page links won't play.)</p>}
            {ytId(f.url) && <p className="note">✓ YouTube link detected – it will play embedded.</p>}
            <select value={f.type} onChange={set('type')}>
              <option value="video">Video</option><option value="audio">Audio</option><option value="image">Image</option>
            </select>
            <input placeholder="Thumbnail image link (optional)" value={f.thumbnail} onChange={set('thumbnail')} />
          </>}
      {file && source === 'file' && file.type.startsWith('image') && <img className="preview" src={URL.createObjectURL(file)} alt="preview" />}
      <input placeholder="Title *" value={f.title} onChange={set('title')} />
      <textarea rows="3" placeholder="Description" value={f.description} onChange={set('description')} />
      <input list="cats" placeholder="Category (e.g. Music, Nature, Education)" value={f.category} onChange={set('category')} />
      <datalist id="cats">{['Music', 'Nature', 'Animals', 'Animation', 'Education', 'Sports', 'Technology', 'Travel', 'Food', 'Gaming'].map(c => <option key={c} value={c} />)}</datalist>
      <input placeholder="Tags, comma separated" value={f.tags} onChange={set('tags')} />
      {msg && <p className="err">{msg}</p>}
      <button className="full" onClick={submit} disabled={!ready || busy}>{busy ? 'Uploading...' : 'Publish'}</button>
    </div>
  );
}
