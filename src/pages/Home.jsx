import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import PostCard from '../components/PostCard';

function Home() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const { session } = useSession();
  const [image, setImage] = useState(null);

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

    let imageUrl = null;

    if (image) {
      const fileName = `${session.user.id}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, image);

      if (uploadError) {
        console.log(uploadError);
        return;
      }

      const { data } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: session.user.id,
      content: content,
      image_url: imageUrl,
    });

    if (!error) {
      setContent("");
      setImage(null);
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
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button>Post!</button>
      </form>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          content={post.content}
          date={post.created_at}
          image={post.image_url}
        />
      ))}
    </>
  );
}

export default Home;
