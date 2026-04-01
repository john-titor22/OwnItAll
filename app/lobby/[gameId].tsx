import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { subscribeToGame, startGame } from '../../src/firebase/gameService';
import { GameState } from '../../src/game/types';
import { PALETTE } from '../../src/game/boardData';

export default function LobbyScreen() {
  const { gameId }          = useLocalSearchParams<{ gameId: string }>();
  const { user }            = useAuth();
  const [game, setGame]     = useState<GameState | null>(null);

  useEffect(() => {
    const unsub = subscribeToGame(gameId, setGame);
    return unsub;
  }, [gameId]);

  useEffect(() => {
    if (game?.status === 'playing') router.replace(`/game/${gameId}`);
  }, [game?.status]);

  if (!game) {
    return <View style={styles.center}><Text style={styles.dim}>Connecting…</Text></View>;
  }

  const isHost      = game.createdBy === user?.uid;
  const playerCount = Object.keys(game.players).length;
  const canStart    = isHost && playerCount >= 2;

  return (
    <View style={styles.container}>
      {/* Header image */}
      <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Koutoubia-Minaret.jpg/400px-Koutoubia-Minaret.jpg' }}
        style={styles.headerImg}
        resizeMode="cover"
      />
      <View style={styles.headerOverlay} />

      <View style={styles.headerContent}>
        <Text style={styles.title}>Game Lobby</Text>
        <TouchableOpacity
          style={styles.codeBox}
          onPress={() => Share.share({ message: `Join my Own It All game! Code: ${gameId}` })}
        >
          <Text style={styles.codeLabel}>GAME CODE</Text>
          <Text style={styles.codeValue}>{gameId}</Text>
          <Text style={styles.codeTap}>Tap to share ↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>PLAYERS  {playerCount} / 4</Text>

        {game.playerOrder.map((pid) => {
          const p = game.players[pid];
          if (!p) return null;
          return (
            <View key={pid} style={[styles.playerRow, { borderLeftColor: p.color }]}>
              <View style={[styles.avatar, { backgroundColor: p.color }]}>
                <Text style={styles.avatarText}>{p.name[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.playerName}>{p.name}</Text>
              {pid === game.createdBy && <Text style={styles.hostTag}>HOST</Text>}
            </View>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 2 - playerCount) }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.playerRow, styles.emptyRow, { borderLeftColor: '#2A2A4A' }]}>
            <View style={[styles.avatar, { backgroundColor: '#2A2A4A' }]}>
              <Text style={styles.avatarText}>?</Text>
            </View>
            <Text style={styles.emptyText}>Waiting for player…</Text>
          </View>
        ))}

        <Text style={styles.hint}>
          {isHost
            ? canStart ? 'Everyone is here — start when ready!' : 'Share the code to invite players'
            : 'Waiting for the host to start…'}
        </Text>

        {isHost && (
          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.disabled]}
            onPress={() => canStart && startGame(gameId)}
            disabled={!canStart}
          >
            <Text style={styles.startTxt}>Start Game</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg },
  dim:       { color: PALETTE.muted },

  headerImg:     { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, backgroundColor: 'rgba(10,10,22,0.6)' },
  headerContent: { height: 200, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16 },

  title: { fontSize: 28, fontWeight: '900', color: PALETTE.goldLight, letterSpacing: 2 },

  codeBox: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.goldLight + '55',
  },
  codeLabel: { color: PALETTE.muted, fontSize: 9, letterSpacing: 2 },
  codeValue: { color: PALETTE.goldLight, fontSize: 13, fontFamily: 'monospace', marginVertical: 2 },
  codeTap:   { color: PALETTE.teal, fontSize: 10 },

  body: { flex: 1, padding: 20 },

  sectionLabel: { color: PALETTE.muted, fontSize: 10, letterSpacing: 2, marginBottom: 12 },

  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.surface,
    padding: 12, borderRadius: 10,
    marginBottom: 8, borderLeftWidth: 4,
  },
  emptyRow: { opacity: 0.4 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  playerName:  { color: PALETTE.text, fontSize: 16, fontWeight: '600', flex: 1 },
  emptyText:   { color: PALETTE.muted, fontSize: 14, flex: 1 },
  hostTag:     { color: PALETTE.goldLight, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  hint: { color: PALETTE.muted, textAlign: 'center', marginVertical: 20, fontSize: 13 },

  startBtn: {
    backgroundColor: PALETTE.goldLight,
    padding: 16, borderRadius: 12, alignItems: 'center',
  },
  disabled: { opacity: 0.35 },
  startTxt: { color: PALETTE.bg, fontSize: 17, fontWeight: '900', letterSpacing: 1 },
});
