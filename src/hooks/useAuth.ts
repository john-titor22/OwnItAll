import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function ensureSignedIn(): Promise<{ uid: string }> {
    if (auth.currentUser) return { uid: auth.currentUser.uid };
    const { user: newUser } = await signInAnonymously(auth);
    return { uid: newUser.uid };
  }

  return { user, loading, ensureSignedIn };
}
