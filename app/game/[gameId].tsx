import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth }        from '../../src/hooks/useAuth';
import { useGameState }   from '../../src/hooks/useGameState';
import { BoardView }      from '../../src/components/BoardView';
import { PlayerList }     from '../../src/components/PlayerList';
import { DiceRollOverlay } from '../../src/components/DiceRollOverlay';
import { GameControls }   from '../../src/components/GameControls';
import { GameLog }        from '../../src/components/GameLog';
import { PALETTE, GROUP_COLORS } from '../../src/game/boardData';

export default function GameScreen() {
  const { gameId }  = useLocalSearchParams<{ gameId: string }>();
  const { user }    = useAuth();
  const uid         = user?.uid ?? '';

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
    return <View style={styles.center}><Text style={styles.dim}>Loading game…</Text></View>;
  }

  const currentPlayer = gameState.players[gameState.playerOrder[gameState.currentPlayerIndex]];
  const accentColor   = currentPlayer?.color ?? PALETTE.goldLight;

  return (
    <View style={styles.root}>

      {/* ── Turn banner ── */}
      <View style={[styles.banner, { borderBottomColor: accentColor + '33' }]}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerName}>
            {isMyTurn ? 'Your Turn' : `${currentPlayer.name}'s Turn`}
          </Text>
          <Text style={styles.bannerSub}>
            {isMyTurn
              ? gameState.phase === 'roll'     ? 'Roll the dice to move'
              : gameState.phase === 'action'   ? 'Choose an action'
              :                                  'End your turn'
              : 'Waiting for other player…'}
          </Text>
        </View>
        {isMyTurn && (
          <View style={[styles.turnBadge, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
            <Text style={[styles.turnBadgeTxt, { color: accentColor }]}>YOUR TURN</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <BoardView gameState={gameState} />
        <PlayerList gameState={gameState} myId={uid} />

        {/* ── Current tile card ── */}
        {myPlayer && currentTile && (
          <View style={[styles.tileCard, currentTile.group && { borderLeftColor: GROUP_COLORS[currentTile.group], borderLeftWidth: 4 }]}>
            <Text style={styles.tileCardLabel}>You are on</Text>
            <Text style={styles.tileCardName}>{currentTile.name}</Text>
            {currentTile.price ? (
              <Text style={styles.tileCardPrice}>Price: {currentTile.price} MAD</Text>
            ) : null}
            {(() => {
              const prop = gameState.properties[String(myPlayer.position)];
              if (prop?.ownerId && prop.ownerId !== uid) {
                const owner = gameState.players[prop.ownerId];
                return <Text style={styles.rentWarn}>Owned by {owner?.name}  •  Riad lvl {prop.level}</Text>;
              }
              if (prop?.ownerId === uid) {
                return <Text style={styles.ownedGood}>Your property  •  Riad lvl {prop.level}</Text>;
              }
              return null;
            })()}
          </View>
        )}

        <GameLog log={gameState.log} />
      </ScrollView>

      <DiceRollOverlay diceResult={gameState.diceResult} />

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
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: PALETTE.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PALETTE.bg },
  dim:    { color: PALETTE.muted },
  scroll: { flex: 1 },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    gap: 12, borderBottomWidth: 1,
  },
  dot:        { width: 12, height: 12, borderRadius: 6 },
  bannerInfo: { flex: 1 },
  bannerName: { color: PALETTE.text, fontSize: 17, fontWeight: '800' },
  bannerSub:  { color: PALETTE.muted, fontSize: 11, marginTop: 1 },
  turnBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  turnBadgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  tileCard: {
    backgroundColor: PALETTE.surface,
    margin: 10, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A4A',
    borderLeftColor: '#2A2A4A',
  },
  tileCardLabel: { color: PALETTE.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 3 },
  tileCardName:  { color: PALETTE.text,  fontSize: 20, fontWeight: '800' },
  tileCardPrice: { color: PALETTE.goldLight, fontSize: 14, marginTop: 4 },
  rentWarn:      { color: PALETTE.terra,     fontSize: 13, marginTop: 4 },
  ownedGood:     { color: PALETTE.teal,      fontSize: 13, marginTop: 4 },
});
