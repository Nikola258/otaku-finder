import { useSession } from '../hooks/useSession';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileField from '../components/ProfileField';
import PostCard from '../components/PostCard';
import '../css/Profile.css';

const GENRES = ['Horror', 'Comedy', 'Action', 'Romance', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller', 'Slice of Life', 'Sports'];
const MEDIA_TYPES = ['Anime', 'Manga', 'Light Novel', 'Visual Novel', 'Game'];
const LANGUAGES = ['Japanese', 'English', 'Korean', 'Chinese', 'French', 'Spanish'];
const TIMEZONES = ['UTC -12', 'UTC -11', 'UTC -10', 'UTC -9', 'UTC -8', 'UTC -7', 'UTC -6', 'UTC -5', 'UTC -4', 'UTC -3', 'UTC -2', 'UTC -1', 'UTC 0', 'UTC +1', 'UTC +2', 'UTC +3', 'UTC +4', 'UTC +5', 'UTC +6', 'UTC +7', 'UTC +8', 'UTC +9', 'UTC +10', 'UTC +11', 'UTC +12'];
const AGE_OPTIONS = Array.from({ length: 83 }, (_, i) => i + 13); // 13–95

export function Profile() {
  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  // Editable fields
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('18');
  const [gender, setGender] = useState('Male');
  const [genres, setGenres] = useState(['', '', '', '']);
  const [mediaType, setMediaType] = useState('Anime');
  const [language, setLanguage] = useState('Japanese');
  const [timezone, setTimezone] = useState('UTC +2');
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
      setAge(data.age ?? '18');
      setGender(data.gender ?? 'Male');
      const g = data.genres ?? [];
      setGenres([g[0] ?? '', g[1] ?? '', g[2] ?? '', g[3] ?? '']);
      setMediaType(data.media_type ?? 'Anime');
      setLanguage(data.language ?? 'Japanese');
      setTimezone(data.timezone ?? 'UTC +2');
      setIsPrivate(data.is_private ?? false);
    }
  }

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

  async function updateProfile() {
    await supabase
      .from('profiles')
      .update({ username, age, gender, genres, media_type: mediaType, language, timezone, is_private: isPrivate })
      .eq('user_id', session.user.id);
    fetchProfile();
  }

  async function uploadAvatar(file) {
    const fileName = `${session.user.id}-${Date.now()}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file);
    if (error) { alert(error.message); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('user_id', session.user.id);
    fetchProfile();
  }

  function handleGenreChange(index, value) {
    const updated = [...genres];
    updated[index] = value;
    setGenres(updated);
  }

  useEffect(() => {
    if (!session) return;
    fetchProfile();
    fetchPosts();
  }, [session]);

  if (sessionLoading) return <p className="profile-loading">Loading...</p>;
  if (!session) return <p className="profile-loading">Not logged in.</p>;
  if (!profile) return <p className="profile-loading">Loading profile...</p>;

  return (
    <main className="profile-main">
        {/* Avatar row */}
        <div className="profile-avatar-row">
          <div className="profile-avatar-box">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="Profile" className="profile-avatar-img" />
              : <span className="profile-avatar-placeholder">IMG</span>
            }
          </div>
          <label className="profile-avatar-btn">
            change profile picture
            <input type="file" accept="image/*" hidden onChange={(e) => uploadAvatar(e.target.files[0])} />
          </label>
        </div>

        {/* Profile fields */}
        <div className="profile-fields">
          <ProfileField label="Name :">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              onBlur={updateProfile}
            />
          </ProfileField>

          <ProfileField label="Age :">
            <select value={age} onChange={(e) => { setAge(e.target.value); }} onBlur={updateProfile}>
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </ProfileField>

          <ProfileField label="Gender :">
            <select value={gender} onChange={(e) => setGender(e.target.value)} onBlur={updateProfile}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </ProfileField>

          <ProfileField label="Favourite genres :" fullWidth>
            {genres.map((g, i) => (
              <select key={i} value={g} onChange={(e) => handleGenreChange(i, e.target.value)} onBlur={updateProfile}>
                <option value="">----------</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            ))}
          </ProfileField>

          <ProfileField label="Favourite media :">
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} onBlur={updateProfile}>
              {MEDIA_TYPES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </ProfileField>

          <ProfileField label="Favourite language :">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} onBlur={updateProfile}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </ProfileField>

          <ProfileField label="Time zone :">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} onBlur={updateProfile}>
              {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
            </select>
          </ProfileField>

          <ProfileField label="Prive :" noHighlight>
            <button
              type="button"
              className={`profile-toggle ${isPrivate ? 'profile-toggle--on' : ''}`}
              onClick={() => setIsPrivate((v) => !v)}
            >
              <span className="profile-toggle__thumb" />
            </button>
          </ProfileField>
        </div>

        <button className="profile-save" onClick={updateProfile}>Save</button>

        {/* User's posts */}
        <section className="profile-posts">
          <h2 className="profile-posts__title">User's Posts</h2>
          <div className="profile-posts__list">
            {posts.length === 0 && <p className="profile-posts__empty">No posts yet.</p>}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                content={post.content}
                image={post.image_url}
                date={post.created_at}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
          </div>
        </section>

        <button className="profile-logout" onClick={() => supabase.auth.signOut()}>
          Logout
        </button>
      </main>
  );
}

export function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', id).single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [id]);

  if (!profile) return <p className="profile-loading">Loading profile...</p>;

  return (
    <main className="profile-main">
      <div className="profile-avatar-row">
          <div className="profile-avatar-box">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="Profile" className="profile-avatar-img" />
              : <span className="profile-avatar-placeholder">IMG</span>
            }
          </div>
          <span className="profile-username">{profile.username}</span>
        </div>
        <p style={{ color: '#aaa' }}>{profile.bio}</p>
    </main>
  );
}
