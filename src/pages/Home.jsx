import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import Posts from '../components/Posts';

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
      const fileName = `${session.sub}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
      . from("posts")
      . upload(fileName, image);

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
      user_id: session.sub,
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
    <button onClick={()=> supabase.auth.signOut()}>logout</button>
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
        <Posts
          key={post.id}
          user={post.user_id}
          content={post.content}
          date={post.created_at}
          image={post.image_url}
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