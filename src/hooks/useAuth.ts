import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_ID_KEY = '@ownitall_player_id';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useAuth() {
  const [uid, setUid]         = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PLAYER_ID_KEY).then((stored) => {
      if (stored) {
        setUid(stored);
      } else {
        const newId = generateId();
        AsyncStorage.setItem(PLAYER_ID_KEY, newId);
        setUid(newId);
      }
      setLoading(false);
    });
  }, []);

  // Matches the old shape so no other file needs to change
  const user = uid ? { uid } : null;

  async function ensureSignedIn(): Promise<{ uid: string }> {
    if (uid) return { uid };
    const newId = generateId();
    await AsyncStorage.setItem(PLAYER_ID_KEY, newId);
    setUid(newId);
    return { uid: newId };
  }

  return { user, loading, ensureSignedIn };
}
