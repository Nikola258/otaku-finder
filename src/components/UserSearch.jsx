
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import ProfileField from './ProfileField';
import PostCard from './PostCard';
import '../css/UserSearch.css';
import '../css/Profile.css';

// Dropdown option lists used throughout the search form
const GENRES = ['Horror', 'Comedy', 'Action', 'Romance', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller', 'Slice of Life', 'Sports'];
const MEDIA = ['Anime', 'Manga', 'Light Novel', 'Visual Novel', 'Game'];
const LANGUAGES = ['Japanese', 'English', 'Korean', 'Chinese', 'French', 'Spanish'];
const TIMEZONES = ['UTC -12','UTC -11','UTC -10','UTC -9','UTC -8','UTC -7','UTC -6','UTC -5','UTC -4','UTC -3','UTC -2','UTC -1','UTC 0','UTC +1','UTC +2','UTC +3','UTC +4','UTC +5','UTC +6','UTC +7','UTC +8','UTC +9','UTC +10','UTC +11','UTC +12'];
const AGES = Array.from({ length: 83 }, (_, i) => i + 13);

// Initialize navigation and retrieve the current logged-in user's ID
function UserSearch() {
  const navigate = useNavigate();
  const { session } = useSession();
  const myId = session?.user?.id;

  // Search filter states
  const [username, setUsername] = useState('');
  const [postKeyword, setPostKeyword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [genres, setGenres] = useState(['', '', '', '']);
  const [mediaType, setMedia] = useState('');
  const [language, setLanguage] = useState('');
  const [timezone, setTimezone] = useState('');

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleGenreChange = (index, value) => {
    const updated = [...genres];
    updated[index] = value;
    setGenres(updated);
  };

  const goToProfile = (id) => navigate(`/profile/${id}`);

  const handleSearch = async () => {
    const pickedGenres = genres.filter(Boolean);

    // Get blocked user IDs (both directions)
    const { data: blockData } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${myId},blocked_id.eq.${myId}`);

    const blockedIds = (blockData ?? []).map(b => b.blocker_id === myId ? b.blocked_id : b.blocker_id);

    // Build and execute a profile search query by excluding blocked users
    // and applying any selected username, age, gender, media, language,
    // timezone and genre filters
    let userQuery = supabase.from('profiles').select('*');
    if (blockedIds.length) userQuery = userQuery.not('user_id', 'in', `(${blockedIds.join(',')})`);
    if (username) userQuery = userQuery.ilike('username', `%${username}%`);
    if (age) userQuery = userQuery.eq('age', age);
    if (gender) userQuery = userQuery.eq('gender', gender);
    if (mediaType) userQuery = userQuery.eq('media_type', mediaType);
    if (language) userQuery = userQuery.eq('language', language);
    if (timezone) userQuery = userQuery.eq('timezone', timezone);
    if (pickedGenres.length) userQuery = userQuery.contains('genres', pickedGenres);
    const { data: foundUsers = [] } = await userQuery;

    // Get the list of private user IDs I follow (accepted)
    const { data: myFollows = [] } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', myId)
      .eq('status', 'accepted');
    const followingIds = myFollows.map(follow => follow.following_id);

    // Only show posts from public users OR private users I follow
    const allowedUserIds = foundUsers
      .filter(user => !user.is_private || followingIds.includes(user.user_id))
      .map(user => user.user_id);

    let postQuery = supabase.from('posts').select('*').in('user_id', allowedUserIds.length ? allowedUserIds : ['none']);
    if (mediaType) postQuery = postQuery.eq('media_type', mediaType);
    if (language) postQuery = postQuery.eq('language', language);
    if (pickedGenres.length) postQuery = postQuery.in('genre', pickedGenres);
    if (postKeyword) postQuery = postQuery.ilike('content', `%${postKeyword}%`);

    if (username) {
      const { data = [] } = await supabase.from('profiles').select('user_id').ilike('username', `%${username}%`);
      const ids = data.map(user => user.user_id).filter(id => allowedUserIds.includes(id));
      if (!ids.length) { setUsers(foundUsers); setPosts([]); setSearched(true); return; }
      postQuery = postQuery.in('user_id', ids);
    }

    const { data: foundPosts = [] } = await postQuery;
    setUsers(foundUsers);
    setPosts(foundPosts);
    setSearched(true);
  };

  const handleReset = () => {
    setUsername('');
    setPostKeyword('');
    setAge('');
    setGender('');
    setGenres(['', '', '', '']);
    setMedia('');
    setLanguage('');
    setTimezone('');
    setUsers([]);
    setPosts([]);
    setSearched(false);
  };

  return (
    <main className="profile-main">
      <div className="profile-fields">

        <ProfileField label="Name :">
          <input
            type="text"
            value={username}
            placeholder="Search by username..."
            onChange={e => setUsername(e.target.value)}
          />
        </ProfileField>

        <ProfileField label="Post :">
          <input
            type="text"
            value={postKeyword}
            placeholder="Search by post content..."
            onChange={e => setPostKeyword(e.target.value)}
          />
        </ProfileField>

        <ProfileField label="Age :">
          <select value={age} onChange={e => setAge(e.target.value)}>
            <option value="">Any</option>
            {AGES.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </ProfileField>

        <ProfileField label="Gender :">
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Any</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </ProfileField>

        <ProfileField label="Favourite genres :" fullWidth>
          {genres.map((genre, index) => (
            <select
              key={index}
              value={genre}
              onChange={e => handleGenreChange(index, e.target.value)}
            >
              <option value="">----------</option>
              {GENRES.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          ))}
        </ProfileField>

        <ProfileField label="Favourite media :">
          <select value={mediaType} onChange={e => setMedia(e.target.value)}>
            <option value="">Any</option>
            {MEDIA.map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </ProfileField>

        <ProfileField label="Favourite language :">
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="">Any</option>
            {LANGUAGES.map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </ProfileField>

        <ProfileField label="Time zone :">
          <select value={timezone} onChange={e => setTimezone(e.target.value)}>
            <option value="">Any</option>
            {TIMEZONES.map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </ProfileField>

      </div>

      <div className="user-search__actions">
        <button className="profile-save" onClick={handleSearch}>Search</button>
        <button className="user-search__reset" onClick={handleReset}>Reset</button>
      </div>

      {searched && (
        <>
          <section className="profile-posts">
            <h2 className="profile-posts__title">Users</h2>

            {!users.length && (
              <p className="profile-posts__empty">No users found.</p>
            )}

            {users.map(user => (
              <div
                key={user.user_id}
                className="user-search__card"
                onClick={() => goToProfile(user.user_id)}
              >
                <div className="user-search__avatar">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.username} />
                    : <span>?</span>}
                </div>

                <div className="user-search__info">
                  <span className="user-search__name">{user.username}{user.is_private ? ' 🔒' : ''}</span>
                  <span className="user-search__meta">
                    {user.age} · {user.gender} · {user.media_type} · {user.language}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="profile-posts">
            <h2 className="profile-posts__title">Posts</h2>

            {!posts.length && (
              <p className="profile-posts__empty">No posts found.</p>
            )}

            {posts.map(post => (
              <PostCard
                key={post.id}
                content={post.content}
                image={post.image_url}
                date={post.created_at}
              />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default UserSearch;
