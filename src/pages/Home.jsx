import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import PostCard from '../components/PostCard';
import ProfileField from '../components/ProfileField';
import '../css/Profile.css';

const GENRES    = ['Horror', 'Comedy', 'Action', 'Romance', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller', 'Slice of Life', 'Sports'];
const MEDIA     = ['Anime', 'Manga', 'Light Novel', 'Visual Novel', 'Game'];
const LANGUAGES = ['Japanese', 'English', 'Korean', 'Chinese', 'French', 'Spanish'];

function Home() {
  const { session } = useSession();

  // Post form state
  const [content, setContent]   = useState('');
  const [image, setImage]       = useState(null);
  const [genre, setGenre]       = useState('');
  const [mediaType, setMedia]   = useState('');
  const [language, setLanguage] = useState('');

  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;
    if (image) {
      const fileName = `${session.user.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, image);
      if (uploadError) { console.log(uploadError); return; }
      const { data } = supabase.storage.from('posts').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('posts').insert({
      user_id: session.user.id,
      content,
      image_url: imageUrl,
      genre,
      media_type: mediaType,
      language,
    });

    if (!error) {
      setContent(''); setImage(null);
      setGenre(''); setMedia(''); setLanguage('');
      fetchPosts();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) fetchPosts();
  };

  return (
    <main className="profile-main">
      {/* Post creation form */}
      <form onSubmit={handleSubmit}>
        <div className="profile-fields">
          <ProfileField label="Content :">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', resize: 'vertical', outline: 'none', fontSize: '0.9rem' }}
            />
          </ProfileField>

          <ProfileField label="Image :">
            <input type="file" accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ color: '#aaa', fontSize: '0.85rem' }} />
          </ProfileField>

          <ProfileField label="Genre :">
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">None</option>
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </ProfileField>

          <ProfileField label="Media :">
            <select value={mediaType} onChange={(e) => setMedia(e.target.value)}>
              <option value="">None</option>
              {MEDIA.map((m) => <option key={m}>{m}</option>)}
            </select>
          </ProfileField>

          <ProfileField label="Language :">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">None</option>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </ProfileField>
        </div>

        <button className="profile-save" style={{ marginTop: '10px' }}>Post</button>
      </form>

      {/* Feed */}
      <section className="profile-posts">
        <div className="profile-posts__list">
          {posts.map((post) => (
            <PostCard key={post.id} content={post.content}
              image={post.image_url} date={post.created_at}
              postId={post.id} postUserId={post.user_id}
              onDelete={post.user_id === session?.user?.id ? () => handleDelete(post.id) : undefined} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
