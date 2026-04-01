import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { createGame, joinGame } from '../src/firebase/gameService';
import { PALETTE } from '../src/game/boardData';

export default function HomeScreen() {
  const { loading, ensureSignedIn } = useAuth();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <View style={styles.center}><Text style={styles.dim}>Loading…</Text></View>;
  }

  async function handleCreate() {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    setBusy(true);
    try {
      const user   = await ensureSignedIn();
      const gameId = await createGame(user.uid, name.trim());
      router.push(`/lobby/${gameId}`);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setBusy(false);
  }

  async function handleJoin() {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    if (!code.trim()) { Alert.alert('Enter a game code'); return; }
    setBusy(true);
    try {
      const user = await ensureSignedIn();
      await joinGame(code.trim(), user.uid, name.trim());
      router.push(`/lobby/${code.trim()}`);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero image */}
      <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Jemaa_el-Fna_at_dusk.jpg/640px-Jemaa_el-Fna_at_dusk.jpg' }}
        style={styles.hero}
        resizeMode="cover"
      />
      {/* Gradient overlay */}
      <View style={styles.heroOverlay} />

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Own It All</Text>
        <Text style={styles.subtitle}>✦  Marrakech Edition  ✦</Text>

        {/* Name input */}
        <Text style={styles.inputLabel}>YOUR NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Hassan"
          placeholderTextColor={PALETTE.muted}
          value={name}
          onChangeText={setName}
          maxLength={20}
          editable={!busy}
        />

        {/* Create */}
        <TouchableOpacity style={[styles.btn, styles.btnGold]} onPress={handleCreate} disabled={busy}>
          <Text style={styles.btnTextDark}>{busy ? '…' : '✦  Create New Game'}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.sep}>
          <View style={styles.line} />
          <Text style={styles.sepText}>or join existing</Text>
          <View style={styles.line} />
        </View>

        {/* Code input */}
        <Text style={styles.inputLabel}>GAME CODE</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste code here"
          placeholderTextColor={PALETTE.muted}
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          editable={!busy}
        />

        <TouchableOpacity style={[styles.btn, styles.btnTeal]} onPress={handleJoin} disabled={busy}>
          <Text style={styles.btnTextLight}>{busy ? '…' : 'Join Game'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg },
  dim:       { color: PALETTE.muted },

  hero: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 260,
  },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 260,
    backgroundColor: 'rgba(10,10,22,0.65)',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 160,
    paddingBottom: 40,
  },

  title: {
    fontSize: 42,
    fontWeight: '900',
    color: PALETTE.goldLight,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.sand,
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 3,
  },

  inputLabel: {
    color: PALETTE.muted,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  input: {
    backgroundColor: PALETTE.surface,
    color: PALETTE.text,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },

  btn: {
    width: '100%', padding: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 8,
  },
  btnGold:      { backgroundColor: PALETTE.goldLight },
  btnTeal:      { backgroundColor: PALETTE.teal },
  btnTextDark:  { color: PALETTE.bg,   fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  btnTextLight: { color: '#fff',       fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  sep: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 18,
  },
  line:    { flex: 1, height: 1, backgroundColor: '#2A2A4A' },
  sepText: { color: PALETTE.muted, marginHorizontal: 12, fontSize: 12 },
});
