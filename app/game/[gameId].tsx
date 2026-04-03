import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth }            from '../../src/hooks/useAuth';
import { useGameState }       from '../../src/hooks/useGameState';
import { useTokenAnimation }  from '../../src/hooks/useTokenAnimation';
import { BoardView }          from '../../src/components/BoardView';
import { GameControls }       from '../../src/components/GameControls';
import { GameLog }            from '../../src/components/GameLog';
import { DiceRollOverlay }    from '../../src/components/DiceRollOverlay';
import { PurchaseModal }      from '../../src/components/PurchaseModal';
import { FloatingText, useFloatingTransactions, PlayerLayout } from '../../src/components/FloatingText';
import { TurnTimer } from '../../src/components/TurnTimer';
import { PALETTE, GROUP_COLORS } from '../../src/game/boardData';

function fmtMoney(m: number): string {
  if (m < 0) return `-${fmtMoney(-m)}`;
  if (m >= 1000) return `${+(m / 1000).toFixed(1)}k`;
  return String(m);
}

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { user }   = useAuth();
  const uid        = user?.uid ?? '';

  const {
    gameState, loading, isMyTurn, myPlayer, currentTile,
    canBuy, upgradableTiles,
    handleRollDice, handleBuyProperty, handleEndTurn, handleUpgrade,
  } = useGameState(gameId, uid);

  // Animated token positions
  const displayPositions = useTokenAnimation(gameState);

  // Player card layout refs for floating text positioning
  const [playerLayouts, setPlayerLayouts] = useState<Record<string, PlayerLayout>>({});
  const { items: floatItems, remove: removeFloat } = useFloatingTransactions(
    gameState?.players ?? {},
    playerLayouts,
  );

  useEffect(() => {
    if (gameState?.status !== 'finished') return;
    const winner = gameState.winnerId
      ? gameState.players[gameState.winnerId]?.name ?? 'Unknown'
      : 'Unknown';
    Alert.alert('Game Over!', `${winner} wins Marrakech!`, [
      { text: 'Back to Home', onPress: () => router.replace('/') },
    ]);
  }, [gameState?.status]);

  // Auto-action when turn timer expires (only fires for the active player)
  function handleTimerExpire() {
    if (!isMyTurn || !gameState) return;
    if (gameState.phase === 'roll') {
      handleRollDice();
    } else {
      handleEndTurn();
    }
  }

  if (loading || !gameState || !user) {
    return <View style={s.center}><Text style={s.dim}>Loading…</Text></View>;
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

      {/* Decorative background circles */}
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      {/* ── Header ── */}
      <View style={s.header}>

        <View style={s.playerRow}>
          {gameState.playerOrder.map((pid, idx) => {
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
                    borderColor:   p.color,
                    shadowColor:   p.color,
                    shadowOpacity: 0.7,
                    shadowRadius:  8,
                    elevation:     8,
                  },
                ]}
                onLayout={e => {
                  const { x, y, width, height } = e.nativeEvent.layout;
                  setPlayerLayouts(prev => ({
                    ...prev,
                    [pid]: { x: x + width / 2 - 30, y: y + height },
                  }));
                }}
              >
                <View style={[s.avatar, { backgroundColor: p.color }]}>
                  <Text style={s.avatarLetter}>{p.name[0].toUpperCase()}</Text>
                </View>
                <View style={s.playerInfo}>
                  <Text style={s.playerName} numberOfLines={1}>
                    {p.name}{isMe ? ' ✦' : ''}
                  </Text>
                  <Text style={[s.playerMoney, p.isBankrupt && { color: PALETTE.terra }]}>
                    {p.isBankrupt ? 'OUT' : fmtMoney(p.money)}
                  </Text>
                </View>
                {isActive && <View style={[s.activeDot, { backgroundColor: p.color }]} />}
              </View>
            );
          })}

          {/* Turn chip — right-aligned in the same row as player cards */}
          <View style={[s.turnChip, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
            <View style={[s.chipDot, { backgroundColor: accentColor }]} />
            <Text style={[s.chipText, { color: accentColor }]} numberOfLines={1}>{turnLabel}</Text>
          </View>
        </View>

      </View>

      {/* ── Board ── */}
      <View style={s.boardArea}>
        <BoardView gameState={gameState} displayPositions={displayPositions} />
      </View>

      {/* ── Footer ── */}
      <View style={s.footer}>

        {/* Turn countdown bar — visible to all, auto-acts for the active player */}
        {gameState.status === 'playing' && (
          <TurnTimer
            turnStartedAt={gameState.turnStartedAt}
            onExpire={handleTimerExpire}
          />
        )}

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
            {!prop?.ownerId && currentTile.price && (
              <View style={s.priceBadge}>
                <Text style={s.priceText}>{currentTile.price}</Text>
                <Text style={s.priceCur}>MAD</Text>
              </View>
            )}
          </View>
        )}

        <GameLog log={gameState.log} />

        {/* Roll Dice + Riad buttons stay in footer; Buy + End Turn moved to PurchaseModal */}
        {isMyTurn && (
          <GameControls
            phase={gameState.phase}
            canBuy={false}          /* Buy is handled by PurchaseModal */
            showEndTurn={false}     /* End Turn handled by PurchaseModal */
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

      {/* ── Overlays ── */}
      <DiceRollOverlay diceResult={gameState.diceResult} />

      {/* Purchase card + End Turn consolidated overlay */}
      <PurchaseModal
        tileId={myPlayer?.position ?? null}
        phase={gameState.phase}
        canBuy={canBuy}
        isMyTurn={isMyTurn}
        playerMoney={myPlayer?.money ?? 0}
        onBuy={handleBuyProperty}
        onEndTurn={handleEndTurn}
      />

      {/* Floating transaction text */}
      <FloatingText items={floatItems} onDone={removeFloat} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg },
  dim:    { color: PALETTE.muted },

  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: PALETTE.goldLight, opacity: 0.025, top: -100, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#5BB8D4', opacity: 0.03, bottom: 80, left: -60,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 26,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  playerRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  playerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#13132B', borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowRadius: 0,
  },
  avatar:       { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontSize: 15, fontWeight: '900' },
  playerInfo:   { gap: 1 },
  playerName:   { color: PALETTE.text,  fontSize: 12, fontWeight: '800' },
  playerMoney:  { color: '#2ECC71',     fontSize: 11, fontWeight: '700' },
  activeDot:    { width: 7, height: 7, borderRadius: 4, marginLeft: 2, shadowOpacity: 0.9, shadowRadius: 4 },

  // Turn chip — inline with player cards
  turnChip: {
    marginLeft: 'auto',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  chipDot:  { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  // Board — centered so any leftover space splits above & below the board
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    backgroundColor: '#0E0E22',
    borderTopWidth: 1,
    borderTopColor: '#1A1A36',
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
  },
  tileCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#1A1A36',
    borderLeftWidth: 4, borderLeftColor: PALETTE.muted, gap: 10,
  },
  tileCardLeft: { flex: 1, gap: 2 },
  tileName:     { color: PALETTE.text,      fontSize: 14, fontWeight: '900' },
  tileStatus:   { color: PALETTE.terra,     fontSize: 11, fontWeight: '600' },
  priceBadge: {
    backgroundColor: PALETTE.goldLight + '22', borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.goldLight + '55',
    paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center',
  },
  priceText: { color: PALETTE.goldLight, fontSize: 16, fontWeight: '900' },
  priceCur:  { color: PALETTE.goldLight, fontSize: 9,  fontWeight: '600', opacity: 0.8 },
});
