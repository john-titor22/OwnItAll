import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth }         from '../../src/hooks/useAuth';
import { useGameState }    from '../../src/hooks/useGameState';
import { BoardView }       from '../../src/components/BoardView';
import { GameControls }    from '../../src/components/GameControls';
import { GameLog }         from '../../src/components/GameLog';
import { DiceRollOverlay } from '../../src/components/DiceRollOverlay';
import { PALETTE, GROUP_COLORS } from '../../src/game/boardData';

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { user }   = useAuth();
  const uid        = user?.uid ?? '';

  const {
    gameState, loading, isMyTurn, myPlayer, currentTile,
    canBuy, upgradableTiles,
    handleRollDice, handleBuyProperty, handleEndTurn, handleUpgrade,
  } = useGameState(gameId, uid);

  useEffect(() => {
    if (gameState?.status !== 'finished') return;
    const winner = gameState.winnerId
      ? gameState.players[gameState.winnerId]?.name ?? 'Unknown'
      : 'Unknown';
    Alert.alert('Game Over!', `${winner} wins Marrakech!`, [
      { text: 'Back to Home', onPress: () => router.replace('/') },
    ]);
  }, [gameState?.status]);

  if (loading || !gameState || !user) {
    return (
      <View style={s.center}>
        <Text style={s.dim}>Loading game…</Text>
      </View>
    );
  }

  const currentIdx    = gameState.currentPlayerIndex;
  const currentPlayer = gameState.players[gameState.playerOrder[currentIdx]];
  const accentColor   = currentPlayer?.color ?? PALETTE.goldLight;
  const prop          = myPlayer ? gameState.properties[String(myPlayer.position)] : null;
  const tileOwner     = prop?.ownerId ? gameState.players[prop.ownerId] : null;

  const turnLabel = isMyTurn
    ? gameState.phase === 'roll'   ? 'Your Turn — Roll!'
    : gameState.phase === 'action' ? 'Your Turn — Act'
    :                                'Your Turn — End'
    : `${currentPlayer?.name ?? '…'}'s Turn`;

  return (
    <View style={s.root}>

      {/* ── Decorative background circles (Moroccan geometry) ── */}
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      {/* ══════════════════════════════════════════
          HEADER — player avatar cards
      ══════════════════════════════════════════ */}
      <View style={s.header}>

        {/* Player cards */}
        <View style={s.playerRow}>
          {gameState.playerOrder.map(pid => {
            const p        = gameState.players[pid];
            const isActive = pid === gameState.playerOrder[currentIdx];
            const isMe     = pid === uid;
            if (!p) return null;
            return (
              <View
                key={pid}
                style={[
                  s.playerCard,
                  isActive && {
                    borderColor: p.color,
                    shadowColor: p.color,
                    shadowOpacity: 0.7,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                ]}
              >
                {/* Avatar circle */}
                <View style={[s.avatar, { backgroundColor: p.color }]}>
                  <Text style={s.avatarLetter}>{p.name[0].toUpperCase()}</Text>
                </View>

                {/* Info */}
                <View style={s.playerInfo}>
                  <Text style={s.playerName} numberOfLines={1}>
                    {p.name}{isMe ? ' ✦' : ''}
                  </Text>
                  <Text
                    style={[
                      s.playerMoney,
                      p.isBankrupt && { color: PALETTE.terra },
                    ]}
                  >
                    {p.isBankrupt ? 'OUT' : `${p.money}M`}
                  </Text>
                </View>

                {/* Active indicator dot */}
                {isActive && <View style={[s.activeDot, { backgroundColor: p.color }]} />}
              </View>
            );
          })}
        </View>

        {/* Turn pill */}
        <View style={[s.turnPill, { backgroundColor: accentColor + '22', borderColor: accentColor + '66' }]}>
          <View style={[s.turnPillDot, { backgroundColor: accentColor }]} />
          <Text style={[s.turnPillText, { color: accentColor }]} numberOfLines={1}>
            {turnLabel}
          </Text>
        </View>

      </View>

      {/* ══════════════════════════════════════════
          BOARD
      ══════════════════════════════════════════ */}
      <View style={s.boardArea}>
        <BoardView gameState={gameState} />
      </View>

      {/* ══════════════════════════════════════════
          FOOTER — tile info + log + controls
      ══════════════════════════════════════════ */}
      <View style={s.footer}>

        {/* Current tile card */}
        {myPlayer && currentTile && (
          <View style={[
            s.tileCard,
            currentTile.group && { borderLeftColor: GROUP_COLORS[currentTile.group] },
          ]}>
            <View style={s.tileCardLeft}>
              <Text style={s.tileName} numberOfLines={1}>{currentTile.name}</Text>
              {tileOwner && tileOwner.id !== uid && (
                <Text style={s.tileStatus}>
                  Owned by {tileOwner.name} · Riad lvl {prop!.level}
                </Text>
              )}
              {prop?.ownerId === uid && (
                <Text style={[s.tileStatus, { color: PALETTE.teal }]}>
                  Your property · Riad lvl {prop.level}
                </Text>
              )}
              {!prop?.ownerId && currentTile.price && (
                <Text style={[s.tileStatus, { color: PALETTE.muted }]}>For sale</Text>
              )}
            </View>
            {!prop?.ownerId && currentTile.price ? (
              <View style={s.priceBadge}>
                <Text style={s.priceText}>{currentTile.price}</Text>
                <Text style={s.priceCur}>MAD</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Log */}
        <GameLog log={gameState.log} />

        {/* Action buttons */}
        {isMyTurn && (
          <GameControls
            phase={gameState.phase}
            canBuy={canBuy}
            upgradableTiles={upgradableTiles}
            gameState={gameState}
            myId={uid}
            onRoll={handleRollDice}
            onBuy={handleBuyProperty}
            onEndTurn={handleEndTurn}
            onUpgrade={handleUpgrade}
          />
        )}

      </View>

      <DiceRollOverlay diceResult={gameState.diceResult} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PALETTE.bg,
  },
  dim: { color: PALETTE.muted },

  // Background decorations
  bgCircle1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: PALETTE.goldLight,
    opacity: 0.025,
    top: -100, right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#5BB8D4',
    opacity: 0.03,
    bottom: 80, left: -60,
  },

  // ── Header ──
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 26,
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },

  playerRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#13132B',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
  },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  avatarLetter: { color: '#fff', fontSize: 15, fontWeight: '900' },
  playerInfo:   { gap: 1 },
  playerName:   { color: PALETTE.text, fontSize: 12, fontWeight: '800' },
  playerMoney:  { color: '#2ECC71', fontSize: 11, fontWeight: '700' },
  activeDot: {
    width: 7, height: 7, borderRadius: 4,
    marginLeft: 2,
    shadowOpacity: 0.9, shadowRadius: 4,
  },

  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  turnPillDot:  { width: 7, height: 7, borderRadius: 4 },
  turnPillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },

  // ── Board area ──
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },

  // ── Footer ──
  footer: {
    backgroundColor: '#0E0E22',
    borderTopWidth: 1,
    borderTopColor: '#1A1A36',
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
  },

  tileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A36',
    borderLeftWidth: 4,
    borderLeftColor: PALETTE.muted,
    gap: 10,
  },
  tileCardLeft: { flex: 1, gap: 2 },
  tileName:  { color: PALETTE.text, fontSize: 14, fontWeight: '900' },
  tileStatus:{ color: PALETTE.terra, fontSize: 11, fontWeight: '600' },

  priceBadge: {
    backgroundColor: PALETTE.goldLight + '22',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.goldLight + '55',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  priceText: { color: PALETTE.goldLight, fontSize: 16, fontWeight: '900' },
  priceCur:  { color: PALETTE.goldLight, fontSize: 9,  fontWeight: '600', opacity: 0.8 },
});
