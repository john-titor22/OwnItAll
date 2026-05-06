import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { createGame, joinGame, deleteStaleLobbies, getGame } from '../src/firebase/gameService';
import { HowToPlay } from '../src/components/HowToPlay';
import { PALETTE } from '../src/game/boardData';

const SESSION_KEY = 'ownitall_session';
const APP_URL     = 'https://ownitall-production.up.railway.app';

export default function HomeScreen() {
  const { loading, user, ensureSignedIn } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();

  const [name,        setName]        = useState('');
  const [code,        setCode]        = useState('');
  const [busy,        setBusy]        = useState(false);
  const [showRules,   setShowRules]   = useState(false);
  const [resumeGame,  setResumeGame]  = useState<{ gameId: string } | null>(null);

  // Pre-fill code from URL param (?code=XXXXX)
  useEffect(() => {
    if (params.code) setCode(params.code.toUpperCase());
  }, [params.code]);

  // Check for an active session the player can resume
  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const { gameId, uid } = JSON.parse(raw) as { gameId: string; uid: string };
        if (uid !== user.uid) return;
        const game = await getGame(gameId);
        if (
          game &&
          game.status === 'playing' &&
          game.players[uid] &&
          !game.players[uid].isBankrupt
        ) {
          setResumeGame({ gameId });
        } else {
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } catch {}
    })();
  }, [loading, user]);

  useEffect(() => { deleteStaleLobbies().catch(() => {}); }, []);

  if (loading) {
    return <View style={s.center}><Text style={s.dim}>Loading…</Text></View>;
  }

  async function handleCreate() {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    setBusy(true);
    try {
      const u      = await ensureSignedIn();
      const gameId = await createGame(u.uid, name.trim());
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ gameId, uid: u.uid }));
      router.push(`/lobby/${gameId}`);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setBusy(false);
  }

  async function handleJoin() {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    if (!code.trim()) { Alert.alert('Enter a game code'); return; }
    setBusy(true);
    try {
      const u = await ensureSignedIn();
      await joinGame(code.trim().toUpperCase(), u.uid, name.trim());
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ gameId: code.trim().toUpperCase(), uid: u.uid }));
      router.push(`/lobby/${code.trim().toUpperCase()}`);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero image */}
      <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Jemaa_el-Fna_at_dusk.jpg/640px-Jemaa_el-Fna_at_dusk.jpg' }}
        style={s.hero}
        resizeMode="cover"
      />
      <View style={s.heroOverlay} />

      {/* How to play button */}
      <TouchableOpacity style={s.rulesBtn} onPress={() => setShowRules(true)}>
        <Text style={s.rulesBtnTxt}>?</Text>
      </TouchableOpacity>

      <View style={s.content}>
        <Text style={s.title}>Own It All</Text>
        <Text style={s.subtitle}>✦  Marrakech Edition  ✦</Text>

        {/* Resume game banner */}
        {resumeGame && (
          <TouchableOpacity
            style={s.resumeBanner}
            onPress={() => router.push(`/game/${resumeGame.gameId}`)}
            activeOpacity={0.85}
          >
            <Text style={s.resumeIcon}>▶</Text>
            <View>
              <Text style={s.resumeTitle}>Game in progress</Text>
              <Text style={s.resumeSub}>Tap to rejoin — {resumeGame.gameId}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Name input */}
        <Text style={s.inputLabel}>YOUR NAME</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Hassan"
          placeholderTextColor={PALETTE.muted}
          value={name}
          onChangeText={setName}
          maxLength={20}
          editable={!busy}
        />

        <TouchableOpacity style={[s.btn, s.btnGold]} onPress={handleCreate} disabled={busy}>
          <Text style={s.btnTextDark}>{busy ? '…' : '✦  Create New Game'}</Text>
        </TouchableOpacity>

        <View style={s.sep}>
          <View style={s.line} />
          <Text style={s.sepText}>or join existing</Text>
          <View style={s.line} />
        </View>

        <Text style={s.inputLabel}>GAME CODE</Text>
        <TextInput
          style={s.input}
          placeholder="Paste code here"
          placeholderTextColor={PALETTE.muted}
          value={code}
          onChangeText={t => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          editable={!busy}
        />

        <TouchableOpacity style={[s.btn, s.btnTeal]} onPress={handleJoin} disabled={busy}>
          <Text style={s.btnTextLight}>{busy ? '…' : 'Join Game'}</Text>
        </TouchableOpacity>
      </View>

      <HowToPlay visible={showRules} onClose={() => setShowRules(false)} />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg },
  dim:       { color: PALETTE.muted },

  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 260,
    backgroundColor: 'rgba(10,10,22,0.65)',
  },

  rulesBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 28,
    right: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: PALETTE.goldLight + '55',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  rulesBtnTxt: { color: PALETTE.goldLight, fontSize: 17, fontWeight: '900' },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 160,
    paddingBottom: 40,
  },

  title: {
    fontSize: 42, fontWeight: '900',
    color: PALETTE.goldLight, textAlign: 'center', letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13, color: PALETTE.sand,
    textAlign: 'center', marginBottom: 24, letterSpacing: 3,
  },

  resumeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PALETTE.teal + '22',
    borderWidth: 1, borderColor: PALETTE.teal + '55',
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  resumeIcon:  { color: PALETTE.teal, fontSize: 20, fontWeight: '900' },
  resumeTitle: { color: PALETTE.teal, fontSize: 13, fontWeight: '800' },
  resumeSub:   { color: PALETTE.muted, fontSize: 11, marginTop: 2 },

  inputLabel: { color: PALETTE.muted, fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  input: {
    backgroundColor: PALETTE.surface, color: PALETTE.text,
    padding: 14, borderRadius: 12, fontSize: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2A4A',
  },

  btn: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  btnGold:      { backgroundColor: PALETTE.goldLight },
  btnTeal:      { backgroundColor: PALETTE.teal },
  btnTextDark:  { color: PALETTE.bg,  fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  btnTextLight: { color: '#fff',      fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  sep: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line:    { flex: 1, height: 1, backgroundColor: '#2A2A4A' },
  sepText: { color: PALETTE.muted, marginHorizontal: 12, fontSize: 12 },
});
