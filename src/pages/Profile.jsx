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
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Editable fields
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('18');
  const [gender, setGender] = useState('Male');
  const [genres, setGenres] = useState(['', '', '', '']);
  const [mediaType, setMediaType] = useState('Anime');
  const [language, setLanguage] = useState('Japanese');
  const [timezone, setTimezone] = useState('UTC +2');
  const [isPrivate, setIsPrivate] = useState(false);
  const [bio, setBio] = useState('');

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
      setBio(data.bio ?? '');
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

  async function fetchBlockedUsers() {
    const { data: blockData } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', session.user.id);

    if (!blockData?.length) { setBlockedUsers([]); return; }

    const ids = blockData.map(b => b.blocked_id);
    const { data: profiles } = await supabase.from('profiles').select('user_id, username, avatar_url').in('user_id', ids);
    setBlockedUsers(profiles ?? []);
  }

  async function unblockUser(blockedId) {
    await supabase.from('blocks').delete().eq('blocker_id', session.user.id).eq('blocked_id', blockedId);
    fetchBlockedUsers();
  }

  async function updateProfile() {
    await supabase
      .from('profiles')
      .update({ username, age, gender, genres, media_type: mediaType, language, timezone, is_private: isPrivate, bio })
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
    fetchBlockedUsers();
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

          <ProfileField label="Bio :">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell something about yourself..."
              rows={3}
              onBlur={updateProfile}
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', resize: 'vertical', outline: 'none', fontSize: '0.9rem' }}
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
                postId={post.id}
                postUserId={post.user_id}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
          </div>
        </section>

        <button className="profile-logout" onClick={() => supabase.auth.signOut()}>
          Logout
        </button>

        {/* Blocked users */}
        {blockedUsers.length > 0 && (
          <section className="profile-posts">
            <h2 className="profile-posts__title">Geblokkeerde gebruikers</h2>
            {blockedUsers.map(user => (
              <div key={user.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1e1b1b', borderRadius: '8px', padding: '10px 16px', marginBottom: '8px' }}>
                <div className="profile-avatar-box" style={{ width: '36px', height: '36px' }}>
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.username} className="profile-avatar-img" /> : <span className="profile-avatar-placeholder">?</span>}
                </div>
                <span style={{ color: '#fff', flex: 1 }}>{user.username}</span>
                <button className="profile-logout" onClick={() => unblockUser(user.user_id)}>Deblokkeer</button>
              </div>
            ))}
          </section>
        )}
      </main>
  );
}

export function PublicProfile() {
  const { id } = useParams();
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [canSeePosts, setCanSeePosts] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [iBlockedThem, setIBlockedThem] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', id).single();
      if (!profileData) return;
      setProfile(profileData);

      if (!session) return;
      const myId = session.user.id;

      // Check if either side has blocked the other
      const { data: blockData } = await supabase
        .from('blocks')
        .select('id, blocker_id')
        .or(`blocker_id.eq.${myId},blocked_id.eq.${myId}`)
        .or(`blocker_id.eq.${id},blocked_id.eq.${id}`);

      const blocked = (blockData ?? []).some(b =>
        (b.blocker_id === myId) || (b.blocker_id === id)
      );

      const iBlocked = (blockData ?? []).some(b => b.blocker_id === myId);

      setIsBlocked(blocked);
      setIBlockedThem(iBlocked);
      if (blocked) return;

      // Check if we can see posts
      if (profileData.is_private !== true) {
        setCanSeePosts(true);
        const { data } = await supabase.from('posts').select('*').eq('user_id', id).order('created_at', { ascending: false });
        setPosts(data ?? []);
      } else {
        const { data: follow } = await supabase
          .from('follows').select('id')
          .eq('follower_id', myId).eq('following_id', id).eq('status', 'accepted')
          .single();
        if (follow) {
          setCanSeePosts(true);
          const { data } = await supabase.from('posts').select('*').eq('user_id', id).order('created_at', { ascending: false });
          setPosts(data ?? []);
        }
      }
    }
    load();
  }, [id, session]);

  async function blockUser() {
    await supabase.from('blocks').insert({ blocker_id: session.user.id, blocked_id: id });
    setIsBlocked(true);
    setIBlockedThem(true);
    setPosts([]);
    setCanSeePosts(false);
  }

  async function unblockUser() {
    await supabase.from('blocks').delete().eq('blocker_id', session.user.id).eq('blocked_id', id);
    setIsBlocked(false);
    setIBlockedThem(false);
  }

  if (!profile) return <p className="profile-loading">Loading profile...</p>;

  if (isBlocked && !iBlockedThem) {
    return <main className="profile-main"><p className="profile-loading">Dit profiel is niet beschikbaar.</p></main>;
  }

  return (
    <main className="profile-main">
      <div className="profile-avatar-row">
        <div className="profile-avatar-box">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="Profile" className="profile-avatar-img" />
            : <span className="profile-avatar-placeholder">IMG</span>
          }
        </div>
        <span className="profile-username">{profile.username}{profile.is_private ? ' 🔒' : ''}</span>
        {session && session.user.id !== id && (
          iBlockedThem
            ? <button className="profile-save" style={{ marginLeft: '12px' }} onClick={unblockUser}>Unblock</button>
            : <button className="profile-logout" style={{ marginLeft: '12px' }} onClick={blockUser}>Block</button>
        )}
      </div>

      {!isBlocked && (
        <>
          <div className="profile-fields">
            {profile.bio && <ProfileField label="Bio :"><span>{profile.bio}</span></ProfileField>}
            <ProfileField label="Age :"><span>{profile.age}</span></ProfileField>
            <ProfileField label="Gender :"><span>{profile.gender}</span></ProfileField>            <ProfileField label="Favourite genres :" fullWidth>
              {(profile.genres ?? []).filter(Boolean).map((g, i) => <span key={i}>{g}</span>)}
            </ProfileField>
            <ProfileField label="Favourite media :"><span>{profile.media_type}</span></ProfileField>
            <ProfileField label="Favourite language :"><span>{profile.language}</span></ProfileField>
            <ProfileField label="Time zone :"><span>{profile.timezone}</span></ProfileField>
          </div>

          <section className="profile-posts">
            <h2 className="profile-posts__title">Posts</h2>
            {!canSeePosts
              ? <p className="profile-posts__empty">Dit account is privé. Volg deze gebruiker om posts te zien.</p>
              : posts.length === 0
                ? <p className="profile-posts__empty">Geen posts.</p>
                : posts.map(post => (
                  <PostCard key={post.id} content={post.content}
                    image={post.image_url} date={post.created_at}
                    postId={post.id} postUserId={post.user_id} />
                ))
            }
          </section>
        </>
      )}
    </main>
  );
}
