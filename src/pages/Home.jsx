import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import Posts from '../components/Posts';

function Home() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const { session } = useSession();

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { error } = await supabase.from("posts").insert({
      user_id: session.sub,
      content: content,
    });

    if (!error) {
      setContent("");
      fetchPosts();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (!error) fetchPosts();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button>Post!</button>
      </form>

      {posts.map((post) => (
        <Posts
          key={post.id}
          user={post.user_id}
          content={post.content}
          date={post.created_at}
          onDelete={
            post.user_id === session?.sub
            ? () => handleDelete(post.id)
            : undefined
          }
        />
      ))}
    </>
  );
}

export default Home;