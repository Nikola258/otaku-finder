import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import '../css/Admin.css';

function Admin() {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!session) return;
    checkAdmin();
  }, [session]);

  async function checkAdmin() {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .single();

    if (data?.is_admin) {
      setIsAdmin(true);
      fetchReports();
    }
    setChecked(true);
  }

  async function fetchReports() {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!data) return;

    // Fetch reporter and reported user profiles separately
    const userIds = [...new Set([...data.map(r => r.reporter_id), ...data.map(r => r.reported_user_id)])];
    const { data: profiles } = await supabase.from('profiles').select('user_id, username').in('user_id', userIds);

    const getUsername = (id) => profiles?.find(p => p.user_id === id)?.username ?? 'Unknown';

    setReports(data.map(report => ({
      ...report,
      reporterName: getUsername(report.reporter_id),
      reportedName: getUsername(report.reported_user_id),
    })));
  }

  async function deletePost(report) {
    await supabase.from('posts').delete().eq('id', report.post_id);
    await supabase.from('reports').delete().eq('id', report.id);
    fetchReports();
  }

  async function ignoreReport(reportId) {
    await supabase.from('reports').delete().eq('id', reportId);
    fetchReports();
  }

  if (loading || !checked) return <p className="profile-loading">Loading...</p>;
  if (!session || !isAdmin) return <p className="profile-loading">Geen toegang.</p>;

  return (
    <main className="admin-main">
      <h2 className="admin-title">Admin — Meldingen</h2>

      {reports.length === 0 && <p className="admin-empty">Geen openstaande meldingen.</p>}

      {reports.map(report => (
        <div key={report.id} className="admin-card">
          <div className="admin-card__info">
            <span className="admin-card__reason">{report.reason}</span>
            <span className="admin-card__meta">
              Gemeld door: <strong>{report.reporterName}</strong> · Over: <strong>{report.reportedName}</strong>
            </span>
            <span className="admin-card__date">
              {new Date(report.created_at).toLocaleString('nl-NL')}
            </span>
          </div>

          <div className="admin-card__actions">
            {report.post_id && (
              <button className="admin-btn--secondary" onClick={() => navigate('/posts/' + report.post_id)}>
                Bekijk post
              </button>
            )}
            <button className="admin-btn--secondary" onClick={() => navigate('/profile/' + report.reported_user_id)}>
              Bekijk profiel
            </button>
            <button className="admin-btn--danger" onClick={() => deletePost(report)}>
              Verwijder post
            </button>
            <button className="admin-btn--ignore" onClick={() => ignoreReport(report.id)}>
              Negeer
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}

export default Admin;
