import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getUser } from '../api';
import MediaCard from '../components/MediaCard';
import { ytId } from '../media';

export default function Watch() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = getUser();
  const [m, setM] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [text, setText] = useState('');
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [fav, setFav] = useState(false);
  const [note, setNote] = useState('');
  const [bad, setBad] = useState(false);

  useEffect(() => {
    setM(null); setBad(false);
    api('/media/' + id).then(d => { setM(d); setLikes(d.likes.length); setLiked(d.liked); setFav(d.favorited); }).catch(e => setNote(e.message));
    api(`/media/${id}/comments`).then(setComments).catch(() => {});
    api(`/media/${id}/related`).then(setRelated).catch(() => {});
    window.scrollTo(0, 0);
  }, [id]);

  const like = async () => { try { const r = await api(`/media/${id}/like`, { method: 'POST' }); setLikes(r.likes); setLiked(r.liked); } catch (e) { setNote(e.message); } };
  const favorite = async () => { try { setFav((await api(`/media/${id}/favorite`, { method: 'POST' })).favorited); } catch (e) { setNote(e.message); } };
  const share = () => { navigator.clipboard.writeText(window.location.href); setNote('Link copied!'); };
  const comment = async () => { const c = await api(`/media/${id}/comments`, { method: 'POST', body: { text } }); setComments([c, ...comments]); setText(''); };
  const delComment = async cid => { await api(`/media/${id}/comments/${cid}`, { method: 'DELETE' }); setComments(comments.filter(c => c._id !== cid)); };
  const remove = async () => { if (window.confirm('Delete this media?')) { await api('/media/' + id, { method: 'DELETE' }); nav('/'); } };
  const edit = async () => {
    const title = window.prompt('New title', m.title);
    if (title) { await api('/media/' + id, { method: 'PUT', body: { title } }); setM({ ...m, title }); }
  };

  if (!m) return <p>{note || 'Loading...'}</p>;
  const yt = ytId(m.fileUrl);
  const owner = user && (user.role === 'admin' || user.name === m.uploader?.name);
  return (
    <div className="watchpage">
      <div className="watch">
        {yt ? <iframe className="embed" src={`https://www.youtube.com/embed/${yt}`} allowFullScreen title={m.title} />
          : bad ? <div className="badmedia">⚠️ This {m.type} can't be played in the browser.<br />
              Use a <b>direct link</b> ending in .mp4 / .mp3 / .jpg, or a <b>YouTube link</b>. Files like .mkv, .avi or .mov (HEVC) must be converted to .mp4 first.
              <br /><a href={m.fileUrl} target="_blank" rel="noreferrer">Open the original link</a></div>
          : <>
            {m.type === 'video' && <video src={m.fileUrl} poster={m.thumbnail} controls autoPlay onError={() => setBad(true)} />}
            {m.type === 'audio' && <div className="audiobox"><div className="vinyl">♪</div><audio src={m.fileUrl} controls autoPlay onError={() => setBad(true)} /></div>}
            {m.type === 'image' && <img src={m.fileUrl} alt={m.title} onError={() => setBad(true)} />}
          </>}
        <h2>{m.title}</h2>
        <small>👁 {m.views} views · {m.category} · by {m.uploader?.name} · {new Date(m.createdAt).toLocaleDateString()}</small>
        <div className="actions">
          <button className={liked ? 'on' : ''} onClick={like} disabled={!user}>👍 {likes}</button>
          <button className={fav ? 'on' : ''} onClick={favorite} disabled={!user}>{fav ? '★ Saved' : '☆ Save'}</button>
          <button onClick={share}>🔗 Share</button>
          {owner && <><button onClick={edit}>✏️ Edit</button><button className="danger" onClick={remove}>🗑 Delete</button></>}
        </div>
        {!user && <small>Login to like, save and comment.</small>}
        {note && <p className="note">{note}</p>}
        <p>{m.description}</p>
        <p>{m.tags.map(t => <span key={t} className="tag">#{t}</span>)}</p>

        <h3>{comments.length} Comments</h3>
        {user && <div className="row"><input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment..." />
          <button onClick={comment} disabled={!text.trim()}>Post</button></div>}
        {comments.map(c => (
          <div key={c._id} className="comment">
            <b>{c.user?.name}</b> <small>{new Date(c.createdAt).toLocaleString()}</small>
            {user && (user.role === 'admin' || user.name === c.user?.name) && <span className="x" onClick={() => delComment(c._id)}>✕</span>}
            <div>{c.text}</div>
          </div>
        ))}
      </div>
      <aside>
        <h3>Related</h3>
        <div className="side">{related.map(r => <MediaCard key={r._id} m={r} />)}</div>
      </aside>
    </div>
  );
}
