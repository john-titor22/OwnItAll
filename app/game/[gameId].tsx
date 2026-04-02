import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth }          from '../../src/hooks/useAuth';
import { useGameState }     from '../../src/hooks/useGameState';
import { BoardView }        from '../../src/components/BoardView';
import { GameControls }     from '../../src/components/GameControls';
import { GameLog }          from '../../src/components/GameLog';
import { DiceRollOverlay }  from '../../src/components/DiceRollOverlay';
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
    Alert.alert('🏆 Game Over!', `${winner} wins Marrakech!`, [
      { text: 'Home', onPress: () => router.replace('/') },
    ]);
  }, [gameState?.status]);

  if (loading || !gameState || !user) {
    return <View style={s.center}><Text style={s.dim}>Loading game…</Text></View>;
  }

  const currentPlayer = gameState.players[gameState.playerOrder[gameState.currentPlayerIndex]];
  const accentColor   = currentPlayer?.color ?? PALETTE.goldLight;
  const prop          = myPlayer ? gameState.properties[String(myPlayer.position)] : null;
  const tileOwner     = prop?.ownerId ? gameState.players[prop.ownerId] : null;

  return (
    <View style={s.root}>

      {/* ── Compact header: player chips + turn state ── */}
      <View style={s.header}>

        <View style={s.chips}>
          {gameState.playerOrder.map(pid => {
            const p        = gameState.players[pid];
            const isActive = pid === gameState.playerOrder[gameState.currentPlayerIndex];
            if (!p) return null;
            return (
              <View key={pid} style={[s.chip, isActive && { borderColor: p.color }]}>
                <View style={[s.chipDot, { backgroundColor: p.color }]} />
                <View>
                  <Text style={s.chipName} numberOfLines={1}>
                    {p.name}{pid === uid ? ' ✦' : ''}
                  </Text>
                  <Text style={[s.chipMoney, p.isBankrupt && { color: PALETTE.terra }]}>
                    {p.isBankrupt ? 'OUT' : `${p.money}M`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[s.turnBar, { borderLeftColor: accentColor }]}>
          <Text style={[s.turnName, { color: accentColor }]} numberOfLines={1}>
            {isMyTurn ? 'Your Turn' : `${currentPlayer?.name ?? '…'}'s Turn`}
          </Text>
          <Text style={s.turnSub} numberOfLines={1}>
            {isMyTurn
              ? gameState.phase === 'roll'   ? 'Roll the dice'
              : gameState.phase === 'action' ? 'Choose an action'
              :                                'End your turn'
              : 'Waiting for other player…'}
          </Text>
        </View>

      </View>

      {/* ── Board — fills all remaining space ── */}
      <View style={s.boardArea}>
        <BoardView gameState={gameState} />
      </View>

      {/* ── Footer: tile strip + log + controls ── */}
      <View style={s.footer}>

        {myPlayer && currentTile && (
          <View style={[
            s.tileStrip,
            currentTile.group
              ? { borderLeftColor: GROUP_COLORS[currentTile.group] }
              : {},
          ]}>
            <Text style={s.tileName} numberOfLines={1}>{currentTile.name}</Text>
            {tileOwner && tileOwner.id !== uid && (
              <Text style={s.tileRent} numberOfLines={1}>
                Owned by {tileOwner.name} · lvl {prop!.level}
              </Text>
            )}
            {prop?.ownerId === uid && (
              <Text style={s.tileOwned} numberOfLines={1}>
                Your property · lvl {prop.level}
              </Text>
            )}
            {!prop?.ownerId && currentTile.price && (
              <Text style={s.tilePrice} numberOfLines={1}>{currentTile.price} MAD</Text>
            )}
          </View>
        )}

        <GameLog log={gameState.log} />

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

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: PALETTE.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg },
  dim:    { color: PALETTE.muted },

  // ── Header ──
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 28,
    paddingHorizontal: 10,
    paddingBottom: 8,
    backgroundColor: PALETTE.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E3A',
    gap: 6,
  },
  chips: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#12122A',
    borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipDot:   { width: 8, height: 8, borderRadius: 4 },
  chipName:  { color: PALETTE.text,  fontSize: 11, fontWeight: '700' },
  chipMoney: { color: '#2ECC71',     fontSize: 10, fontWeight: '600' },

  turnBar: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 1,
  },
  turnName: { fontSize: 13, fontWeight: '800' },
  turnSub:  { color: PALETTE.muted, fontSize: 10, marginTop: 1 },

  // ── Board area ──
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.bg,
  },

  // ── Footer ──
  footer: {
    backgroundColor: PALETTE.surface,
    borderTopWidth: 1,
    borderTopColor: '#1E1E3A',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
  },
  tileStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A32',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  tileName:  { color: PALETTE.text,      fontSize: 13, fontWeight: '800', flex: 1 },
  tileRent:  { color: PALETTE.terra,     fontSize: 11 },
  tileOwned: { color: PALETTE.teal,      fontSize: 11 },
  tilePrice: { color: PALETTE.goldLight, fontSize: 11 },
});
