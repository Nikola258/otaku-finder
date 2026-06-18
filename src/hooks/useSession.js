// useSession.js
// Dit is een custom React hook die bijhoudt of een gebruiker is ingelogd.
// Hij geeft de huidige sessie (gebruikersgegevens) en een laadstatus terug.
// Gebruik deze hook in elk component dat moet weten wie er is ingelogd.

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controleer of er een actieve sessie is wanneer de app laadt
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
      setLoading(false);
    });

    // Luister naar auth-wijzigingen (inloggen, uitloggen)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    // Verwijder de listener wanneer het component unmount
    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}
