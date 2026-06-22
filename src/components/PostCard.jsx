import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import '../css/PostCard.css';
import commentIcon from '../assets/comment.png';
import likeIcon from '../assets/like.png';
import flagIcon from '../assets/report-flag.png';

const REASONS = ['Spam', 'Ongewenst gedrag', 'Geen anime', 'Ongepaste inhoud', 'Anders'];

function PostCard({ content, image, date, onDelete, postId, postUserId }) {
  const { session } = useSession();
  const navigate = useNavigate();
  const myId = session?.user?.id;

  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState('');
  const [reported, setReported] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');

  const formattedDate = new Date(date).toLocaleString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  useEffect(() => {
    if (!postId) return;
    fetchLikes(myId);
    fetchCommentCount();
  }, [postId, myId]);

  async function fetchLikes(currentMyId) {
    const { data, error } = await supabase.from('likes').select('id, user_id').eq('post_id', postId);
    if (error) { console.error('fetchLikes error:', error); return; }
    setLikeCount(data?.length ?? 0);
    setLiked((data ?? []).some(like => like.user_id === currentMyId));
  }

  async function toggleLike() {
    if (!myId || likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      setLiked(false);
      setLikeCount(c => c - 1);
      const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', myId);
      if (error) { console.error('unlike error:', error.message); setLiked(true); setLikeCount(c => c + 1); }
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
      const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: myId });
      if (error) { console.error('like error:', error.message); setLiked(false); setLikeCount(c => c - 1); }
    }
    setLikeLoading(false);
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) { console.error('fetchComments error:', error); return; }

    const list = data ?? [];
    if (!list.length) { setComments([]); setCommentCount(0); return; }

    const userIds = [...new Set(list.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', userIds);

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]));
    const enriched = list.map(c => ({ ...c, profile: profileMap[c.user_id] }));
    setComments(enriched);
    setCommentCount(enriched.length);
  }

  async function fetchCommentCount() {
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
    if (error) { console.error('fetchCommentCount error:', error); return; }
    setCommentCount(count ?? 0);
  }

  async function submitComment() {
    if (!newComment.trim() || !myId) return;
    await supabase.from('comments').insert({ post_id: postId, user_id: myId, content: newComment });
    setNewComment('');
    fetchComments();
  }

  function toggleComments() {
    if (!showComments) fetchComments();
    setShowComments(prev => !prev);
  }

  async function submitReport() {
    if (!reason) return;
    await supabase.from('reports').insert({
      reporter_id: myId,
      post_id: postId,
      reported_user_id: postUserId,
      reason,
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

          {/* Like */}
          <div className="post-card-like" onClick={toggleLike} style={{ cursor: likeLoading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img src={likeIcon} alt="like" className="post-card-icon" style={{ opacity: liked ? 1 : 0.5 }} />
            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{likeCount}</span>
          </div>

          {/* Comment */}
          <div className="post-card-like" onClick={() => postId && navigate(`/posts/${postId}`)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img src={commentIcon} alt="comment" className="post-card-icon" />
            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{commentCount}</span>
          </div>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="post-card-comments">
          {comments.map(comment => (
            <div key={comment.id} className="post-card-comment">
              <span className="post-card-comment__name">{comment.profile?.username ?? 'User'}</span>
              <span className="post-card-comment__text">{comment.content}</span>
            </div>
          ))}

          {myId && (
            <div className="post-card-comment-input">
              <input
                type="text"
                placeholder="Schrijf een reactie..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
              />
              <button onClick={submitComment}>Post</button>
            </div>
          )}
        </div>
      )}

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
