import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import '../css/Friends.css';

// Reusable card shown in all 4 sections
function UserCard({ user, actions }) {
  return (
    <div className="friends-card">
      <div className="friends-avatar">
        {user?.avatar_url
          ? <img src={user.avatar_url} alt={user.username} />
          : <span>?</span>}
      </div>
      <div className="friends-info">
        <span className="friends-name">{user?.username}</span>
      </div>
      <div className="friends-actions">{actions}</div>
    </div>
  );
}

function Friends() {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const myId = session?.user?.id;

  useEffect(() => {
    if (myId) fetchFollowData();
  }, [myId]);

  const fetchFollowData = async () => {
    const { data: received = [] } = await supabase.from('follows').select('*').eq('following_id', myId);
    const { data: sent = [] }     = await supabase.from('follows').select('*').eq('follower_id', myId);

    const ids = [...received.map(f => f.follower_id), ...sent.map(f => f.following_id)];

    let profiles = [];
    if (ids.length) {
      const { data = [] } = await supabase.from('profiles').select('user_id, username, avatar_url').in('user_id', ids);
      profiles = data;
    }

    const attach = (follow, idField) => ({ ...follow, profile: profiles.find(p => p.user_id === follow[idField]) });

    const r = received.map(follow => attach(follow, 'follower_id'));
    const s = sent.map(follow => attach(follow, 'following_id'));

    setFollowers(r.filter(follow => follow.status === 'accepted'));
    setIncoming(r.filter(follow => follow.status === 'pending'));
    setFollowing(s.filter(follow => follow.status === 'accepted'));
    setOutgoing(s.filter(follow => follow.status === 'pending'));
  };

  const searchUsers = async () => {
    if (!searchInput.trim()) return;
    const { data = [] } = await supabase.from('profiles').select('*').ilike('username', '%' + searchInput + '%').neq('user_id', myId);
    setSearchResults(data);
  };

  const sendFollow = async (targetId, isPrivate) => {
    await supabase.from('follows').insert({ follower_id: myId, following_id: targetId, status: isPrivate ? 'pending' : 'accepted' });
    fetchFollowData();
    searchUsers();
  };

  const acceptRequest  = async (id) => { await supabase.from('follows').update({ status: 'accepted' }).eq('id', id); fetchFollowData(); };
  const declineRequest = async (id) => { await supabase.from('follows').delete().eq('id', id); fetchFollowData(); };
  const unfollow = async (id) => { await supabase.from('follows').delete().eq('id', id); fetchFollowData(); };

  const getFollowStatus = (userId) => {
    const found = [...following, ...outgoing].find(follow => follow.profile?.user_id === userId);
    return found ? found.status : null;
  };

  if (loading)  return <p className="profile-loading">Loading...</p>;
  if (!session) return <p className="profile-loading">Not logged in.</p>;

  return (
    <main className="friends-main">

      {/* Search & add friends */}
      <section className="friends-section">
        <h2 className="friends-title">Add Friend</h2>
        <div className="friends-search-row">
          <input className="friends-input" type="text" placeholder="Search by username..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchUsers()} />
          <button className="friends-btn" onClick={searchUsers}>Search</button>
        </div>

        {searchResults.map(user => {
          const status = getFollowStatus(user.user_id);
          return (
            <UserCard key={user.user_id} user={user} actions={<>
              <button className="friends-btn--secondary" onClick={() => navigate('/profile/' + user.user_id)}>View Profile</button>
              {status === null && <button className="friends-btn" onClick={() => sendFollow(user.user_id, user.is_private)}>{user.is_private ? 'Request' : 'Follow'}</button>}
              {status === 'pending' && <span className="friends-tag">Pending</span>}
              {status === 'accepted' && <span className="friends-tag">Following</span>}
            </>} />
          );
        })}
      </section>

      {/* Incoming follow requests */}
      {incoming.length > 0 && (
        <section className="friends-section">
          <h2 className="friends-title">Follow Requests</h2>
          {incoming.map(request => (
            <UserCard key={request.id} user={request.profile} actions={<>
              <button className="friends-btn--secondary" onClick={() => navigate('/profile/' + request.profile?.user_id)}>View Profile</button>
              <button className="friends-btn" onClick={() => acceptRequest(request.id)}>Accept</button>
              <button className="friends-btn--danger" onClick={() => declineRequest(request.id)}>Decline</button>
            </>} />
          ))}
        </section>
      )}

      {/* People who follow me */}
      <section className="friends-section">
        <h2 className="friends-title">Followers</h2>
        {!followers.length && <p className="friends-empty">No followers yet.</p>}
        {followers.map(follower => (
          <UserCard key={follower.id} user={follower.profile} actions={
            <button className="friends-btn--secondary" onClick={() => navigate('/profile/' + follower.profile?.user_id)}>View Profile</button>
          } />
        ))}
      </section>

      {/* People I follow */}
      <section className="friends-section">
        <h2 className="friends-title">Following</h2>
        {!following.length && <p className="friends-empty">Nobody yet.</p>}
        {following.map(follow => (
          <UserCard key={follow.id} user={follow.profile} actions={<>
            <button className="friends-btn--secondary" onClick={() => navigate('/profile/' + follow.profile?.user_id)}>View Profile</button>
            <button className="friends-btn--danger" onClick={() => unfollow(follow.id)}>Unfollow</button>
          </>} />
        ))}
      </section>

    </main>
  );
}

export default Friends;
 