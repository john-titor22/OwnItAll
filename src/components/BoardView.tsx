import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { GameState } from '../game/types';
import { BOARD, GROUP_COLORS, PALETTE, TILE_ICONS, tileImage } from '../game/boardData';

interface Props {
  gameState: GameState;
}

export function BoardView({ gameState }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const spots: Record<number, { initial: string; color: string }[]> = {};
  Object.values(gameState.players).forEach((p) => {
    if (!spots[p.position]) spots[p.position] = [];
    spots[p.position].push({ initial: p.name[0].toUpperCase(), color: p.color });
  });

  const selectedTile = selected !== null ? BOARD[selected] : null;
  const selectedProp = selected !== null ? gameState.properties[String(selected)] : null;
  const selectedOwner = selectedProp?.ownerId ? gameState.players[selectedProp.ownerId] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>BOARD</Text>
      <View style={styles.grid}>
        {BOARD.map((tile) => {
          const prop       = gameState.properties[String(tile.id)];
          const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;
          const owner      = prop?.ownerId ? gameState.players[prop.ownerId] : null;
          const here       = spots[tile.id] ?? [];
          const icon       = TILE_ICONS[tile.type];
          const imgUri     = tileImage(tile.id, tile.name);

          return (
            <TouchableOpacity
              key={tile.id}
              style={styles.tile}
              onPress={() => setSelected(tile.id)}
              activeOpacity={0.8}
            >
              {/* Image */}
              {tile.type === 'property' || tile.type === 'station' ? (
                <Image
                  source={{ uri: imgUri }}
                  style={styles.img}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imgPlaceholder, { backgroundColor: PALETTE.surface2 }]}>
                  <Text style={styles.icon}>{icon}</Text>
                </View>
              )}

              {/* Group colour bar */}
              {groupColor && <View style={[styles.colorBar, { backgroundColor: groupColor }]} />}

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{tile.name}</Text>
                {tile.price ? <Text style={styles.price}>{tile.price}M</Text> : null}
              </View>

              {/* Owner band */}
              {owner && (
                <View style={[styles.ownerBand, { backgroundColor: owner.color }]} />
              )}

              {/* Riad pips */}
              {prop?.level > 0 && (
                <View style={styles.riads}>
                  {Array.from({ length: prop.level }).map((_, i) => (
                    <View key={i} style={styles.riadDot} />
                  ))}
                </View>
              )}

              {/* Player tokens */}
              {here.length > 0 && (
                <View style={styles.tokens}>
                  {here.map((p, i) => (
                    <View key={i} style={[styles.token, { backgroundColor: p.color }]}>
                      <Text style={styles.tokenText}>{p.initial}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tile detail modal */}
      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
          {selectedTile && (
            <View style={styles.card}>
              {selectedTile.type === 'property' || selectedTile.type === 'station' ? (
                <Image
                  source={{ uri: tileImage(selectedTile.id, selectedTile.name) }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                  <Text style={{ fontSize: 48 }}>{TILE_ICONS[selectedTile.type]}</Text>
                </View>
              )}

              {selectedTile.group && (
                <View style={[styles.cardColorBar, { backgroundColor: GROUP_COLORS[selectedTile.group] }]} />
              )}

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{selectedTile.name}</Text>

                {selectedTile.price ? (
                  <Text style={styles.cardPrice}>Price: {selectedTile.price} MAD</Text>
                ) : null}

                {selectedTile.taxAmount ? (
                  <Text style={styles.cardTax}>Tax: {selectedTile.taxAmount} MAD</Text>
                ) : null}

                {selectedTile.rent && (
                  <View style={styles.rentTable}>
                    <Text style={styles.rentLabel}>Rent</Text>
                    {['Base','1 Riad','2 Riads','3 Riads','4 Riads'].map((label, i) => (
                      <View key={i} style={styles.rentRow}>
                        <Text style={styles.rentLevel}>{label}</Text>
                        <Text style={styles.rentAmt}>{selectedTile.rent![i]} MAD</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedOwner && (
                  <View style={[styles.ownerRow, { borderColor: selectedOwner.color }]}>
                    <View style={[styles.ownerDot, { backgroundColor: selectedOwner.color }]} />
                    <Text style={styles.ownerName}>Owned by {selectedOwner.name}</Text>
                    {selectedProp!.level > 0 && (
                      <Text style={styles.ownerLevel}>  Riad lvl {selectedProp!.level}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 10, marginTop: 12 },
  label: { color: PALETTE.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },

  tile: {
    width: '23.8%',
    backgroundColor: PALETTE.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E3A',
    minHeight: 88,
  },
  img:            { width: '100%', height: 42 },
  imgPlaceholder: { width: '100%', height: 42, alignItems: 'center', justifyContent: 'center' },
  icon:           { fontSize: 18 },
  colorBar:       { height: 3, width: '100%' },
  info:           { padding: 4, flex: 1 },
  name:           { color: PALETTE.text, fontSize: 8, lineHeight: 11 },
  price:          { color: PALETTE.goldLight, fontSize: 8, marginTop: 2 },
  ownerBand:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  riads: {
    position: 'absolute', top: 2, right: 2,
    flexDirection: 'row', gap: 1,
  },
  riadDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#2ECC71',
  },
  tokens: {
    position: 'absolute', bottom: 5, right: 3,
    flexDirection: 'row', flexWrap: 'wrap', gap: 1, maxWidth: 36,
  },
  token:     { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  tokenText: { color: '#fff', fontSize: 7, fontWeight: 'bold' },

  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: 16, overflow: 'hidden',
    width: '90%', maxWidth: 340,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  cardImg:            { width: '100%', height: 160 },
  cardImgPlaceholder: { backgroundColor: PALETTE.surface2, alignItems: 'center', justifyContent: 'center' },
  cardColorBar:       { height: 5, width: '100%' },
  cardBody:           { padding: 16 },
  cardTitle:          { color: PALETTE.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  cardPrice:          { color: PALETTE.goldLight, fontSize: 15, marginBottom: 8 },
  cardTax:            { color: '#E74C3C', fontSize: 15, marginBottom: 8 },
  rentTable:          { marginTop: 4, gap: 3 },
  rentLabel:          { color: PALETTE.muted, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  rentRow:            { flexDirection: 'row', justifyContent: 'space-between' },
  rentLevel:          { color: PALETTE.muted, fontSize: 12 },
  rentAmt:            { color: PALETTE.text, fontSize: 12, fontWeight: '600' },
  ownerRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderRadius: 8, padding: 8,
  },
  ownerDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  ownerName:  { color: PALETTE.text, fontSize: 13 },
  ownerLevel: { color: PALETTE.goldLight, fontSize: 13 },
});
