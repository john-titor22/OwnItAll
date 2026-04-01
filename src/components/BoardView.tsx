import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { GameState } from '../game/types';
import { BOARD, GROUP_COLORS, PALETTE, TILE_ICONS, tileImage } from '../game/boardData';

// ── Board geometry ──────────────────────────────────────────────────────────
const BS = 300;                            // board square (px)
const C  = 50;                             // corner tile size
const S  = Math.floor((BS - C * 2) / 6);  // ≈ 33 — side tile narrow dimension

// Perimeter tile order for each side
// Bottom row L→R   (corners: 0=BL, 7=BR)
const BOTTOM    = [0, 1, 2, 3, 4, 5, 6, 7];
// Right col  T→B on screen (13 is near top-right corner 14, 8 is near corner 7)
const RIGHT_COL = [13, 12, 11, 10, 9, 8];
// Top row    L→R on screen (21=TL corner, 14=TR corner)
const TOP       = [21, 20, 19, 18, 17, 16, 15, 14];
// Left col   T→B on screen (22 near corner 21, 27 near corner 0)
const LEFT_COL  = [22, 23, 24, 25, 26, 27];

const CORNER_SET = new Set([0, 7, 14, 21]);

// ── Single tile ─────────────────────────────────────────────────────────────
interface TileCellProps {
  id: number;
  gs: GameState;
  onPress: () => void;
  isVert?: boolean;   // true for left/right column tiles
}

function TileCell({ id, gs, onPress, isVert = false }: TileCellProps) {
  const tile      = BOARD[id];
  const isCorner  = CORNER_SET.has(id);
  const prop      = gs.properties[String(id)];
  const owner     = prop?.ownerId ? gs.players[prop.ownerId] : null;
  const here      = Object.values(gs.players).filter(p => p.position === id);
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        isCorner   && styles.cornerTile,
        isVert     && styles.vertTile,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Group colour bar (top edge) */}
      {groupColor && <View style={[styles.colorBar, { backgroundColor: groupColor }]} />}

      {/* Image (only for bottom-row property tiles — most visible when tilted) */}
      {!isVert && !isCorner && (tile.type === 'property' || tile.type === 'station') ? (
        <Image
          source={{ uri: tileImage(id, tile.name) }}
          style={styles.tileImg}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.icon, isCorner && styles.cornerIcon]}>
          {TILE_ICONS[tile.type] ?? ''}
        </Text>
      )}

      {/* Name */}
      <Text
        style={[styles.name, isCorner && styles.cornerName]}
        numberOfLines={isCorner ? 3 : 2}
      >
        {tile.name}
      </Text>

      {/* Price */}
      {tile.price && !isCorner && (
        <Text style={styles.price}>{tile.price}M</Text>
      )}

      {/* Owner colour strip at bottom */}
      {owner && (
        <View style={[styles.ownerStrip, { backgroundColor: owner.color }]} />
      )}

      {/* Riad pips */}
      {(prop?.level ?? 0) > 0 && (
        <View style={styles.riadRow}>
          {Array.from({ length: prop!.level }).map((_, i) => (
            <View key={i} style={styles.riadDot} />
          ))}
        </View>
      )}

      {/* Player tokens */}
      {here.length > 0 && (
        <View style={styles.tokens}>
          {here.map((p, i) => (
            <View key={i} style={[styles.token, { backgroundColor: p.color }]}>
              <Text style={styles.tokenTxt}>{p.name[0].toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Board ───────────────────────────────────────────────────────────────────
interface Props { gameState: GameState; }

export function BoardView({ gameState }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const press = (id: number) => setSelected(id);

  const selectedTile  = selected !== null ? BOARD[selected] : null;
  const selectedProp  = selected !== null ? gameState.properties[String(selected)] : null;
  const selectedOwner = selectedProp?.ownerId ? gameState.players[selectedProp.ownerId] : null;

  return (
    <View style={styles.scene}>

      {/* ── Table surface ── */}
      <View style={styles.table}>

        {/* ── 3-D tilted board wrapper ── */}
        <View style={styles.boardWrapper}>
          <View style={styles.board}>

            {/* TOP ROW */}
            <View style={styles.hRow}>
              {TOP.map(id => (
                <TileCell key={id} id={id} gs={gameState} onPress={() => press(id)} />
              ))}
            </View>

            {/* MIDDLE: left col + center + right col */}
            <View style={styles.middle}>

              {/* LEFT COLUMN */}
              <View style={styles.vCol}>
                {LEFT_COL.map(id => (
                  <TileCell key={id} id={id} gs={gameState} onPress={() => press(id)} isVert />
                ))}
              </View>

              {/* CENTER */}
              <View style={styles.center}>
                {/* Moroccan star pattern (CSS-only via box shadows not viable; use nested Views) */}
                <View style={styles.starRing} />
                <Text style={styles.centerTitle}>OWN{'\n'}IT ALL</Text>
                <Text style={styles.centerSub}>✦ Marrakech ✦</Text>
              </View>

              {/* RIGHT COLUMN */}
              <View style={styles.vCol}>
                {RIGHT_COL.map(id => (
                  <TileCell key={id} id={id} gs={gameState} onPress={() => press(id)} isVert />
                ))}
              </View>
            </View>

            {/* BOTTOM ROW */}
            <View style={styles.hRow}>
              {BOTTOM.map(id => (
                <TileCell key={id} id={id} gs={gameState} onPress={() => press(id)} />
              ))}
            </View>

          </View>{/* board */}
        </View>{/* boardWrapper */}
      </View>{/* table */}

      {/* ── Tile detail modal ── */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
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
                  <Text style={{ fontSize: 52 }}>{TILE_ICONS[selectedTile.type] ?? '⭐'}</Text>
                </View>
              )}

              {selectedTile.group && (
                <View style={[styles.cardColorBar, { backgroundColor: GROUP_COLORS[selectedTile.group] }]} />
              )}

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{selectedTile.name}</Text>

                {selectedTile.price    && <Text style={styles.cardPrice}>Price: {selectedTile.price} MAD</Text>}
                {selectedTile.taxAmount && <Text style={styles.cardTax}>Tax: {selectedTile.taxAmount} MAD</Text>}

                {selectedTile.rent && (
                  <View style={styles.rentTable}>
                    <Text style={styles.rentHeader}>RENT</Text>
                    {['Base', '1 Riad', '2 Riads', '3 Riads', '4 Riads'].map((lbl, i) => (
                      <View key={i} style={styles.rentRow}>
                        <Text style={styles.rentLbl}>{lbl}</Text>
                        <Text style={styles.rentAmt}>{selectedTile.rent![i]} MAD</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedOwner && (
                  <View style={[styles.ownerCard, { borderColor: selectedOwner.color }]}>
                    <View style={[styles.ownerDot, { backgroundColor: selectedOwner.color }]} />
                    <Text style={styles.ownerTxt}>Owned by {selectedOwner.name}</Text>
                    {selectedProp!.level > 0 && (
                      <Text style={styles.ownerLvl}>  Riad lvl {selectedProp!.level}</Text>
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

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scene: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },

  // Walnut table surface behind the board
  table: {
    width:  BS + 24,
    height: BS + 16,
    backgroundColor: '#3B1F0E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 28,
  },

  // Perspective tilt — looks like a real board on a table
  boardWrapper: {
    width: BS,
    height: BS,
    transform: [
      { perspective: 700 },
      { rotateX: '32deg' },
    ],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },

  // Green felt board surface with wood border
  board: {
    width: BS,
    height: BS,
    backgroundColor: '#1B5E35',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#6B3A1F',
  },

  // ── Layout ──
  hRow: {
    height: C,
    flexDirection: 'row',
    width: '100%',
  },
  middle: {
    flex: 1,
    flexDirection: 'row',
  },
  vCol: {
    width: C,
    flex: 1,
    flexDirection: 'column',
  },

  // Center area
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E35',
    borderWidth: 0.5,
    borderColor: '#2A7A4A',
  },
  starRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: PALETTE.goldLight + '33',
  },
  centerTitle: {
    color: PALETTE.goldLight,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    lineHeight: 22,
  },
  centerSub: {
    color: PALETTE.sand + 'AA',
    fontSize: 7,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 4,
  },

  // ── Tile ──
  tile: {
    flex: 1,
    backgroundColor: PALETTE.surface,
    borderWidth: 0.5,
    borderColor: '#1A2A1F',
    overflow: 'hidden',
    alignItems: 'center',
  },
  cornerTile: {
    flex: undefined,
    width: C,
    height: C,
    justifyContent: 'center',
    backgroundColor: '#0D1A12',
  },
  vertTile: {
    flex: 1,
    width: C,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorBar:  { height: 3, width: '100%' },
  tileImg:   { width: '100%', height: 24 },
  icon:      { fontSize: 9, marginTop: 2, lineHeight: 11 },
  cornerIcon:{ fontSize: 18, marginBottom: 2 },

  name: {
    color: PALETTE.text,
    fontSize: 5.5,
    textAlign: 'center',
    paddingHorizontal: 1,
    lineHeight: 7,
  },
  cornerName: {
    fontSize: 7,
    fontWeight: '700',
    lineHeight: 9,
  },
  price: {
    color: PALETTE.goldLight,
    fontSize: 5.5,
  },
  ownerStrip: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
  },
  riadRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 1,
    justifyContent: 'center',
  },
  riadDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#2ECC71',
  },
  tokens: {
    position: 'absolute',
    bottom: 4, right: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    maxWidth: 28,
  },
  token: {
    width: 12, height: 12, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#fff4',
  },
  tokenTxt: { color: '#fff', fontSize: 6, fontWeight: 'bold' },

  // ── Detail modal ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: 16,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  cardImg:            { width: '100%', height: 160 },
  cardImgPlaceholder: { backgroundColor: PALETTE.surface2, alignItems: 'center', justifyContent: 'center' },
  cardColorBar:       { height: 5, width: '100%' },
  cardBody:           { padding: 16 },
  cardTitle:          { color: PALETTE.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  cardPrice:          { color: PALETTE.goldLight, fontSize: 15, marginBottom: 6 },
  cardTax:            { color: '#E74C3C', fontSize: 15, marginBottom: 6 },

  rentTable:  { marginTop: 6, gap: 3 },
  rentHeader: { color: PALETTE.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  rentRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  rentLbl:    { color: PALETTE.muted, fontSize: 12 },
  rentAmt:    { color: PALETTE.text,  fontSize: 12, fontWeight: '600' },

  ownerCard: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, borderWidth: 1, borderRadius: 8, padding: 8,
  },
  ownerDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  ownerTxt: { color: PALETTE.text, fontSize: 13 },
  ownerLvl: { color: PALETTE.goldLight, fontSize: 13 },
});
