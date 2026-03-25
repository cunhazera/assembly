import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setIsAdmin(data?.role === 'admin');
          setLoading(false);
        });
    });
  }, []);

  return { isAdmin, loading };
}
