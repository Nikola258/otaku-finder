// Auth.jsx
// Dit component verwerkt drie modi: inloggen, registreren en wachtwoord vergeten.
// Geef de gewenste modus mee via de 'mode' prop, bijvoorbeeld: <Auth mode="login" />
// De routing in App.jsx bepaalt welke modus wordt getoond.

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Als de gebruiker al is ingelogd, stuur hem door naar de homepage
  const { session, loading: sessionLoading } = useSession();
  if (sessionLoading) return null;
  if (session) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'login') {
      // Inloggen met e-mail en wachtwoord
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate('/');
    }

    if (mode === 'register') {
      // Nieuw account aanmaken
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account aangemaakt! Je kunt nu inloggen.');
    }

    // Wachtwoord vergeten functionaliteit is voorlopig uitgezet, maar hier is hoe het zou werken:
    // if (mode === 'forgot') {
    //   // Stuur een wachtwoord-reset e-mail
    //   const { error } = await supabase.auth.resetPasswordForEmail(email);
    //   if (error) setError(error.message);
    //   else setMessage('Controleer je e-mail voor een resetlink.');
    // }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>
          {mode === 'login' && 'Inloggen'}
          {mode === 'register' && 'Account aanmaken'}
          {/* {mode === 'forgot' && 'Wachtwoord vergeten'} */}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jij@voorbeeld.nl"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="auth-field">
              <label>Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Even wachten...' : (
              <>
                {mode === 'login' && 'Inloggen'}
                {mode === 'register' && 'Account aanmaken'}
                {/* {mode === 'forgot' && 'Resetmail versturen'} */}
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <a href="/register">Nog geen account? Registreer hier</a>
              {/* Wachtwoord vergeten zetten we even uit */}
              {/* <a href="/forgot">Wachtwoord vergeten?</a> */}
            </>
          )}
          {mode === 'register' && <a href="/login">Al een account? Log hier in</a>}
          {/* {mode === 'forgot' && <a href="/login">Terug naar inloggen</a>} */}
        </div>
      </div>
    </div>
  );
}