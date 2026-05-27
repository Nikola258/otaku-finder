// useSession.js
// Dit is een custom React hook die bijhoudt of een gebruiker is ingelogd.
// Hij geeft de huidige sessie (gebruikersgegevens) en een laadstatus terug.
// Gebruik deze hook in elk component dat moet weten wie er is ingelogd.

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSession() {
  const [session, setSession] = useState(null); // null = niet ingelogd
  const [loading, setLoading] = useState(true); // true zolang we de auth status ophalen

  useEffect(() => {
    // Controleer of er een actieve sessie is wanneer de app laadt
    supabase.auth.getClaims().then(({ data }) => {
      setSession(data?.claims ?? null);
      setLoading(false);
    });

    // Luister naar auth-wijzigingen (inloggen, uitloggen)
    // Dit wordt automatisch uitgevoerd wanneer de auth status verandert
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data }) => {
        setSession(data?.claims ?? null);
      });
    });

    // Verwijder de listener wanneer het component unmount
    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}