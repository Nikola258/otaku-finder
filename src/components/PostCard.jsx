import { useState } from 'react';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import '../css/PostCard.css';
import bookmarkIcon from '../assets/bookmark.png';
import commentIcon from '../assets/comment.png';
import likeIcon from '../assets/like.png';
import flagIcon from '../assets/report-flag.png';

const REASONS = ['Spam', 'Ongewenst gedrag', 'Geen anime', 'Ongepaste inhoud', 'Anders'];

function PostCard({ content, image, date, onDelete, postId, postUserId }) {
  const { session } = useSession();
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState('');
  const [reported, setReported] = useState(false);

  const formattedDate = new Date(date).toLocaleString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  async function submitReport() {
    if (!reason) return;
    await supabase.from('reports').insert({
      reporter_id: session.user.id,
      post_id: postId,
      reported_user_id: postUserId,
      reason: reason,
      status: 'pending'
    });
    setShowReport(false);
    setReported(true);
  }

  return (
    <div className="post-card">
      <p className="post-card-content">{content}</p>
      {image && <img src={image} alt="post" className="post-card-image" />}

      <div className="post-card-actions">
        <small className="post-card-date">{formattedDate}</small>
        <div className="post-card-icons">
          {onDelete && <button className="post-card-delete" onClick={onDelete}>Delete</button>}
          {reported
            ? <span className="post-card-reported">Reported</span>
            : <img src={flagIcon} alt="flag" className="post-card-icon" onClick={() => setShowReport(true)} style={{ cursor: 'pointer' }} />
          }
          <img src={likeIcon} alt="like" className="post-card-icon" />
          <img src={commentIcon} alt="comment" className="post-card-icon" />
          <img src={bookmarkIcon} alt="bookmark" className="post-card-icon" />
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="report-modal">
          <p className="report-modal__title">Reden voor melding</p>
          <select className="report-modal__select" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Kies een reden...</option>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="report-modal__actions">
            <button className="report-modal__submit" onClick={submitReport}>Verstuur</button>
            <button className="report-modal__cancel" onClick={() => setShowReport(false)}>Annuleer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
