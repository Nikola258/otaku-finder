// PrivateRoute.jsx
// Dit component beschermt routes die alleen zichtbaar mogen zijn voor ingelogde gebruikers.
// Wikkel een route in met <PrivateRoute> om hem te beveiligen.
// Als de gebruiker niet is ingelogd, wordt hij automatisch doorgestuurd naar /login.

import { Navigate } from 'react-router';
import { useSession } from '../hooks/useSession';

export default function PrivateRoute({ children }) {
  const { session, loading } = useSession();

  // Wacht tot we weten of de gebruiker is ingelogd
  if (loading) return null;

  // Niet ingelogd? Stuur door naar de loginpagina
  if (!session) return <Navigate to="/login" />;

  // Wel ingelogd? Toon de gewenste pagina
  return children;
}