import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Animated,
} from 'react-native';
import { GameState } from '../game/types';
import { BOARD, GROUP_COLORS, PALETTE, TILE_ICONS, tileImage } from '../game/boardData';

// ── Board geometry ──────────────────────────────────────────────────────────
const BS = 324;                            // board square (px)
const C  = 54;                             // corner tile size
const S  = Math.floor((BS - C * 2) / 6);  // = 36 — side tile narrow dimension

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

// ── Bounce token ────────────────────────────────────────────────────────────
function BounceToken({ color, initial }: { color: string; initial: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.token, { backgroundColor: color, transform: [{ scale }] }]}>
      <Text style={styles.tokenTxt}>{initial}</Text>
    </Animated.View>
  );
}

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
            <BounceToken key={p.id} color={p.color} initial={p.name[0].toUpperCase()} />
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
                <View style={styles.starRing} />
                <View style={styles.starRing2} />
                <Text style={styles.centerTitle}>OWN{'\n'}IT ALL</Text>
                <Text style={styles.centerSub}>✦  Marrakech  ✦</Text>
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
    width:  BS + 28,
    height: BS + 20,
    backgroundColor: '#2A1408',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 32,
    borderWidth: 2,
    borderColor: '#4A2810',
  },

  // Perspective tilt — looks like a real board on a table
  boardWrapper: {
    width: BS,
    height: BS,
    transform: [
      { perspective: 750 },
      { rotateX: '30deg' },
    ],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
  },

  // Green felt board surface with gold + wood border
  board: {
    width: BS,
    height: BS,
    backgroundColor: '#185230',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#7A4520',
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
    backgroundColor: '#185230',
  },
  starRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: PALETTE.goldLight + '40',
  },
  starRing2: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: PALETTE.goldLight + '25',
  },
  centerTitle: {
    color: PALETTE.goldLight,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    lineHeight: 23,
    textShadowColor: '#000a',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  centerSub: {
    color: PALETTE.sand + 'CC',
    fontSize: 7.5,
    textAlign: 'center',
    letterSpacing: 2.5,
    marginTop: 5,
  },

  // ── Tile ──
  tile: {
    flex: 1,
    backgroundColor: '#0E1B14',
    borderWidth: 0.5,
    borderColor: '#1E3028',
    overflow: 'hidden',
    alignItems: 'center',
  },
  cornerTile: {
    flex: undefined,
    width: C,
    height: C,
    justifyContent: 'center',
    backgroundColor: '#081410',
    borderWidth: 1,
    borderColor: '#2A4A3A',
  },
  vertTile: {
    flex: 1,
    width: C,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorBar:   { height: 5, width: '100%' },
  tileImg:    { width: '100%', height: 26 },
  icon:       { fontSize: 10, marginTop: 1, lineHeight: 12 },
  cornerIcon: { fontSize: 20, marginBottom: 2 },

  name: {
    color: '#D4CFC5',
    fontSize: 6,
    textAlign: 'center',
    paddingHorizontal: 1,
    lineHeight: 8,
    fontWeight: '600',
  },
  cornerName: {
    color: '#FFE899',
    fontSize: 7.5,
    fontWeight: '800',
    lineHeight: 10,
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  price: {
    color: PALETTE.goldLight,
    fontSize: 6,
    fontWeight: '700',
  },
  ownerStrip: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 4,
    opacity: 0.9,
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
    shadowColor: '#2ECC71',
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  tokens: {
    position: 'absolute',
    bottom: 5, right: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    maxWidth: 30,
  },
  token: {
    width: 13, height: 13, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fff5',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  tokenTxt: { color: '#fff', fontSize: 7, fontWeight: 'bold' },

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
