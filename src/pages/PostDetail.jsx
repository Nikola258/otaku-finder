import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import PostCard from '../components/PostCard';
import '../css/PostCard.css';

function PostDetail() {
  const { id } = useParams();
  const { session } = useSession();
  const myId = session?.user?.id;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (error) { console.error('fetchComments error:', error); return; }

    const comments = data ?? [];
    if (!comments.length) { setComments([]); return; }

    const userIds = [...new Set(comments.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', userIds);

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]));
    setComments(comments.map(c => ({ ...c, profile: profileMap[c.user_id] })));
  }, [id]);

  useEffect(() => {
    supabase.from('posts').select('*').eq('id', id).single()
      .then(({ data }) => setPost(data));
    fetchComments();
  }, [id, fetchComments]);

  async function submitComment() {
    if (!newComment.trim() || !myId) return;
    await supabase.from('comments').insert({ post_id: id, user_id: myId, content: newComment });
    setNewComment('');
    fetchComments();
  }

  if (!post) return <p className="profile-loading">Post laden...</p>;

  return (
    <main style={{ padding: '28px 36px', maxWidth: '780px' }}>
      <PostCard
        content={post.content}
        image={post.image_url}
        date={post.created_at}
        postId={post.id}
        postUserId={post.user_id}
      />

      <div className="post-card-comments" style={{ marginTop: '0' }}>
        <h3 style={{ color: '#FF5E00', fontSize: '0.95rem', margin: '0 0 8px 0' }}>
          Comments ({comments.length})
        </h3>

        {comments.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No comments yet.</p>
        )}

        {comments.map(comment => (
          <div key={comment.id} className="post-card-comment">
            <span className="post-card-comment__name">{comment.profile?.username ?? 'User'}</span>
            <span className="post-card-comment__text">{comment.content}</span>
          </div>
        ))}

        {myId && (
          <div className="post-card-comment-input" style={{ marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
            />
            <button onClick={submitComment}>Post</button>
          </div>
        )}
      </div>
    </main>
  );
}

export default PostDetail;
