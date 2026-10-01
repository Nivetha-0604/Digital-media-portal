import { Link } from 'react-router-dom';
import { ytId, ytThumb } from '../media';

export default function MediaCard({ m }) {
  const yt = ytId(m.fileUrl);
  const thumb = m.type === 'image' ? m.fileUrl : (m.thumbnail || (yt && ytThumb(yt)));
  return (
    <Link to={'/watch/' + m._id} className="card">
      <div className="thumbwrap">
        {thumb ? <img src={thumb} alt={m.title} loading="lazy" />
          : m.type === 'video' ? <video src={m.fileUrl + '#t=1'} preload="metadata" muted />
          : <div className="thumb">♪</div>}
        {m.type === 'video' && <span className="play">▶</span>}
        <span className={'badge ' + m.type}>{m.type}</span>
      </div>
      <h3>{m.title}</h3>
      <small>{m.category} · 👁 {m.views} · 👍 {m.likes?.length || 0}</small>
      <small>by {m.uploader?.name}</small>
    </Link>
  );
}
