import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import PostCard from '../components/PostCard';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    supabase.from('posts').select('*').eq('id', id).single()
      .then(({ data }) => setPost(data));
  }, [id]);

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
    </main>
  );
}

export default PostDetail;
 