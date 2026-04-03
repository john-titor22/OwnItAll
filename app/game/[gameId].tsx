import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Pressable, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth }            from '../../src/hooks/useAuth';
import { useGameState }       from '../../src/hooks/useGameState';
import { useTokenAnimation }  from '../../src/hooks/useTokenAnimation';
import { BoardView }          from '../../src/components/BoardView';
import { GameControls }       from '../../src/components/GameControls';
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

  // Card dismiss state — player can tap the board to hide the action card
  const [cardDismissed, setCardDismissed] = useState(false);

  // Reset dismiss whenever the turn or phase changes (new action = fresh card)
  useEffect(() => { setCardDismissed(false); }, [gameState?.currentPlayerIndex, gameState?.phase]);

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

  // Mirror PurchaseModal's own visibility logic so we can drive the peek bar
  const showPurchaseCard = isMyTurn && canBuy && gameState.phase === 'action';
  const showEndTurnCard  = isMyTurn && !showPurchaseCard &&
    (gameState.phase === 'end_turn' || gameState.phase === 'action');
  const cardActive = showPurchaseCard || showEndTurnCard;

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

        {/* Player cards row — wraps cleanly for 2-4 players */}
        <View style={s.playerRow}>
          {gameState.playerOrder.map((pid) => {
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
        </View>

        {/* Turn chip — own row so it never fights with player cards */}
        <View style={[s.turnChip, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
          <View style={[s.chipDot, { backgroundColor: accentColor }]} />
          <Text style={[s.chipText, { color: accentColor }]} numberOfLines={1}>{turnLabel}</Text>
        </View>

      </View>

      {/* ── Subtle info strip — tile name + log, sits in dead space above board ── */}
      {myPlayer && currentTile && (
        <View style={s.infoStrip}>
          <View style={s.infoRow}>
            <View style={[
              s.infoTileDot,
              currentTile.group && { backgroundColor: GROUP_COLORS[currentTile.group] },
            ]} />
            <Text style={s.infoTileName} numberOfLines={1}>{currentTile.name}</Text>
            {!prop?.ownerId && currentTile.price && (
              <Text style={s.infoPrice}>{currentTile.price} MAD</Text>
            )}
            {tileOwner && tileOwner.id !== uid && (
              <Text style={s.infoOwned}>💸 {tileOwner.name}</Text>
            )}
            {prop?.ownerId === uid && (
              <Text style={[s.infoOwned, { color: PALETTE.teal }]}>✓ Yours</Text>
            )}
          </View>

          {/* Log entries — 2 lines, very muted */}
          {[...(Array.isArray(gameState.log)
            ? gameState.log
            : Object.values(gameState.log ?? {})
          )].reverse().slice(0, 2).map((entry, i) => (
            <Text key={i} style={[s.infoLog, i === 0 && s.infoLogNewest]} numberOfLines={1}>
              {i === 0 ? '▸ ' : '  '}{entry}
            </Text>
          ))}
        </View>
      )}

      {/* ── Board ── tap empty space to dismiss action card */}
      <Pressable
        style={s.boardArea}
        onPress={() => { if (cardActive && !cardDismissed) setCardDismissed(true); }}
      >
        <BoardView gameState={gameState} displayPositions={displayPositions} />

        {/* Peek bar: shows when card is dismissed so player can still act */}
        {cardDismissed && cardActive && (
          <View style={s.peekBar}>
            {showPurchaseCard && (
              <TouchableOpacity
                style={s.peekOpen}
                onPress={() => setCardDismissed(false)}
                activeOpacity={0.8}
              >
                <Text style={s.peekOpenTxt}>↑  View Offer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={s.peekEnd}
              onPress={handleEndTurn}
              activeOpacity={0.8}
            >
              <Text style={s.peekEndTxt}>{showPurchaseCard ? 'Pass  →' : 'End Turn  →'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Pressable>

      {/* ── Footer ── */}
      <View style={s.footer}>

        {/* Turn countdown bar — visible to all, auto-acts for the active player */}
        {gameState.status === 'playing' && (
          <TurnTimer
            turnStartedAt={gameState.turnStartedAt}
            onExpire={handleTimerExpire}
          />
        )}

        {/* Roll Dice + Riad buttons; Buy + End Turn are in PurchaseModal */}
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
        dismissed={cardDismissed}
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
    paddingBottom: 4,
  },
  playerRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
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

  // Turn chip — sits on its own compact row below player cards
  turnChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
    marginTop: 4,
  },
  chipDot:  { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  // Board — centered so any leftover space splits above & below the board
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Peek bar — shown at bottom of board when action card is dismissed
  peekBar: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  peekOpen: {
    flex: 1,
    backgroundColor: PALETTE.goldLight,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: 'center',
    shadowColor: PALETTE.goldLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  peekOpenTxt: { color: '#1A1000', fontSize: 13, fontWeight: '900' },
  peekEnd: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PALETTE.muted,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: 'center',
  },
  peekEndTxt: { color: PALETTE.text, fontSize: 13, fontWeight: '700' },

  // Subtle info strip — between header and board
  infoStrip: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTileDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PALETTE.muted,
  },
  infoTileName: {
    flex: 1,
    color: PALETTE.text,
    fontSize: 12,
    fontWeight: '700',
  },
  infoPrice: {
    color: PALETTE.goldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  infoOwned: {
    color: PALETTE.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  infoLog:       { color: PALETTE.muted,  fontSize: 9,  lineHeight: 13 },
  infoLogNewest: { color: PALETTE.sand,   fontSize: 10, fontWeight: '600' },

  // Footer
  footer: {
    backgroundColor: '#0E0E22',
    borderTopWidth: 1,
    borderTopColor: '#1A1A36',
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
  },
});
