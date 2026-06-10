import { useSession } from '../hooks/useSession';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useParams } from 'react-router-dom';

export function Profile() {
  const { session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.sub)
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
      .eq('user_id', session.sub);

    if (!error) fetchProfile();
  }

  async function uploadAvatar(image) {
    const fileName = `${session.sub}-${Date.now()}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, image);

    if (error) return;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('user_id', session.sub);
  }

  useEffect(() => {
    if (!session) return;
    fetchProfile();
  }, [session]);

  if (sessionLoading) return <p>Laden...</p>;
  if (!session) return <p>Niet ingelogd.</p>;
  if (!profile) return <p>Profiel laden...</p>;

  return (
    <div>
      <h2>{username}</h2>
      <p>{bio}</p>
      <label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
        Profiel privé maken
      </label>
      <button onClick={updateProfile}>Opslaan</button>
    </div>
  );
}

export function PublicProfile() {
  const { id } = useParams();
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
