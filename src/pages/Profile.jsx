import { useSession } from '../hooks/useSession';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';

export function Profile() {
  const { session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const MAX_NAME = 20;
  const MAX_BIO = 150;
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username ?? '');
      setBio(data.bio ?? '');
      setIsPrivate(data.is_private ?? false);
    }
  }

  async function updateProfile() {
    const { error } = await supabase
      .from('profiles')
      .update({ username, bio, is_private: isPrivate })
      .eq('user_id', session.user.id);

    if (!error) fetchProfile();
  }

  async function uploadAvatar(image) {
    const fileName = `${session.user.id}-${Date.now()}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, image);

      if (error) {
          alert(error.message);
          return;
      }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('user_id', session.user.id);
  }

  useEffect(() => {
    if (!session) return;
    fetchProfile();
    fetchPosts();
  }, [session]);

  // Haal de posts op van deze gebruiker, nieuwste eerst
  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) fetchPosts();
  }

  if (sessionLoading) return <p>Laden...</p>;
  if (!session) return <p>Niet ingelogd.</p>;
  if (!profile) return <p>Profiel laden...</p>;

    return (
        <div>
            <h2>Edit Profile</h2>

            {profile.avatar_url && (
                <img
                    src={profile.avatar_url}
                    alt="Profile"
                    width={100}
                />
            )}

            <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadAvatar(e.target.files[0])}
            />

            <input
                type="text"
                value={username}
                maxLength={MAX_NAME}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <p>{username.length}/{MAX_NAME}</p>

            <textarea
                value={bio}
                maxLength={MAX_BIO}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
            />
            <p>{bio.length}/{MAX_BIO}</p>

            <label>
                <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Profiel privé maken
            </label>

            <button onClick={updateProfile}>
                Opslaan
            </button>
            <div>
                <button onClick={() => supabase.auth.signOut()}>logout</button>
            </div>

            {/* Posts van deze gebruiker */}
            <h3>User's Posts</h3>
            {posts.map((post) => (
              <PostCard key={post.id} content={post.content} image={post.image_url} date={post.created_at} onDelete={() => handleDelete(post.id)} />
            ))}
        </div>
    );
}

export function PublicProfile() {
    const {id} = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (data) setProfile(data);
    }
    fetchProfile();
  }, [id]);

  if (!profile) return <p>Profiel laden...</p>;

  return (
    <div>
      <h2>{profile.username}</h2>
      <p>{profile.bio}</p>
    </div>
  );
}
