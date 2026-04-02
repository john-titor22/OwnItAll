import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Modal, Animated, Dimensions,
} from 'react-native';
import { GameState } from '../game/types';
import { BOARD, GROUP_COLORS, PALETTE, TILE_ICONS, tileImage } from '../game/boardData';

// ── Board geometry — full screen width, flat ─────────────────────────────────
const SW = Dimensions.get('window').width;
const BS = SW - 4;                               // board square — fills screen
const C  = Math.round(BS * 0.18);               // corner tile size  (~70px)
const S  = Math.floor((BS - C * 2) / 6);        // side tile narrow dim (~43px)

// Perimeter order
const BOTTOM    = [0, 1, 2, 3, 4, 5, 6, 7];
const RIGHT_COL = [13, 12, 11, 10, 9, 8];
const TOP       = [21, 20, 19, 18, 17, 16, 15, 14];
const LEFT_COL  = [22, 23, 24, 25, 26, 27];

const CORNER_SET = new Set([0, 7, 14, 21]);

// ── Bounce token ─────────────────────────────────────────────────────────────
function BounceToken({ color, initial }: { color: string; initial: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[s.token, { backgroundColor: color, transform: [{ scale }] }]}>
      <Text style={s.tokenTxt}>{initial}</Text>
    </Animated.View>
  );
}

// ── Single tile ───────────────────────────────────────────────────────────────
interface TileCellProps {
  id: number;
  gs: GameState;
  onPress: () => void;
  isVert?: boolean;
}

function TileCell({ id, gs, onPress, isVert = false }: TileCellProps) {
  const tile       = BOARD[id];
  const isCorner   = CORNER_SET.has(id);
  const prop       = gs.properties[String(id)];
  const owner      = prop?.ownerId ? gs.players[prop.ownerId] : null;
  const here       = Object.values(gs.players).filter(p => p.position === id);
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;

  return (
    <TouchableOpacity
      style={[s.tile, isCorner && s.cornerTile, isVert && s.vertTile]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* ── Thick colour bar — the group identity marker ── */}
      {groupColor && (
        <View style={[s.colorBar, isVert ? s.colorBarVert : s.colorBarHoriz, { backgroundColor: groupColor }]} />
      )}

      {/* ── Icon — big and centred ── */}
      <Text style={[s.icon, isCorner && s.cornerIcon]}>
        {TILE_ICONS[tile.type] ?? '⭐'}
      </Text>

      {/* ── Corner only: readable name ── */}
      {isCorner && (
        <Text style={s.cornerName} numberOfLines={3}>{tile.name}</Text>
      )}

      {/* ── Riad level pips ── */}
      {(prop?.level ?? 0) > 0 && (
        <View style={s.riadRow}>
          {Array.from({ length: prop!.level }).map((_, i) => (
            <View key={i} style={s.riadDot} />
          ))}
        </View>
      )}

      {/* ── Owner strip ── */}
      {owner && <View style={[s.ownerStrip, { backgroundColor: owner.color }]} />}

      {/* ── Player tokens ── */}
      {here.length > 0 && (
        <View style={s.tokens}>
          {here.map(p => (
            <BounceToken key={p.id} color={p.color} initial={p.name[0].toUpperCase()} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────
interface Props { gameState: GameState; }

export function BoardView({ gameState }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const selTile  = selected !== null ? BOARD[selected]                           : null;
  const selProp  = selected !== null ? gameState.properties[String(selected)]   : null;
  const selOwner = selProp?.ownerId   ? gameState.players[selProp.ownerId]       : null;

  return (
    <View style={s.scene}>
      {/* ── Walnut frame ── */}
      <View style={s.frame}>
        <View style={s.board}>

          {/* TOP ROW */}
          <View style={s.hRow}>
            {TOP.map(id => (
              <TileCell key={id} id={id} gs={gameState} onPress={() => setSelected(id)} />
            ))}
          </View>

          {/* MIDDLE */}
          <View style={s.middle}>
            <View style={s.vCol}>
              {LEFT_COL.map(id => (
                <TileCell key={id} id={id} gs={gameState} onPress={() => setSelected(id)} isVert />
              ))}
            </View>

            {/* CENTER */}
            <View style={s.center}>
              <View style={s.ring1} />
              <View style={s.ring2} />
              <Text style={s.centerTitle}>OWN{'\n'}IT ALL</Text>
              <Text style={s.centerSub}>✦  Marrakech  ✦</Text>
            </View>

            <View style={s.vCol}>
              {RIGHT_COL.map(id => (
                <TileCell key={id} id={id} gs={gameState} onPress={() => setSelected(id)} isVert />
              ))}
            </View>
          </View>

          {/* BOTTOM ROW */}
          <View style={s.hRow}>
            {BOTTOM.map(id => (
              <TileCell key={id} id={id} gs={gameState} onPress={() => setSelected(id)} />
            ))}
          </View>

        </View>
      </View>

      {/* ── Tile detail card (tap anywhere outside to close) ── */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setSelected(null)}>
          {selTile && (
            <View style={s.card}>
              {/* Hero image */}
              {selTile.type === 'property' || selTile.type === 'station' ? (
                <Image source={{ uri: tileImage(selTile.id, selTile.name) }} style={s.cardImg} resizeMode="cover" />
              ) : (
                <View style={[s.cardImg, s.cardImgFallback]}>
                  <Text style={{ fontSize: 56 }}>{TILE_ICONS[selTile.type] ?? '⭐'}</Text>
                </View>
              )}

              {/* Group colour band */}
              {selTile.group && (
                <View style={[s.cardBand, { backgroundColor: GROUP_COLORS[selTile.group] }]} />
              )}

              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{selTile.name}</Text>

                {selTile.price     && <Text style={s.cardPrice}>Price: {selTile.price} MAD</Text>}
                {selTile.taxAmount && <Text style={s.cardTax}>Tax: {selTile.taxAmount} MAD</Text>}

                {selTile.rent && (
                  <View style={s.rentTable}>
                    <Text style={s.rentHeader}>RENT</Text>
                    {['Base', '1 Riad', '2 Riads', '3 Riads', '4 Riads'].map((lbl, i) => (
                      <View key={i} style={s.rentRow}>
                        <Text style={s.rentLbl}>{lbl}</Text>
                        <Text style={s.rentAmt}>{selTile.rent![i]} MAD</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selOwner && (
                  <View style={[s.ownerBadge, { borderColor: selOwner.color }]}>
                    <View style={[s.ownerDot, { backgroundColor: selOwner.color }]} />
                    <Text style={s.ownerTxt}>Owned by {selOwner.name}</Text>
                    {(selProp?.level ?? 0) > 0 && (
                      <Text style={[s.ownerLvl, { color: selOwner.color }]}>  Riad lvl {selProp!.level}</Text>
                    )}
                  </View>
                )}

                <Text style={s.tapClose}>Tap outside to close</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const TILE_BG    = '#0F1C14';
const TILE_BDR   = '#1E3228';
const CORNER_BG  = '#091510';

const s = StyleSheet.create({
  scene: { alignItems: 'center' },

  // Walnut frame
  frame: {
    width:  BS + 8,
    height: BS + 8,
    backgroundColor: '#3A1A08',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#5A2E10',
  },

  // Green felt
  board: {
    width:  BS,
    height: BS,
    backgroundColor: '#1A5E38',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6A3A18',
  },

  // ── Layout ──
  hRow:   { height: C, flexDirection: 'row', width: '100%' },
  middle: { flex: 1, flexDirection: 'row' },
  vCol:   { width: C, flex: 1, flexDirection: 'column' },

  // ── Center ──
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A5E38',
  },
  ring1: {
    position: 'absolute',
    width: C * 1.6, height: C * 1.6,
    borderRadius: C * 0.8,
    borderWidth: 1.5,
    borderColor: PALETTE.goldLight + '35',
  },
  ring2: {
    position: 'absolute',
    width: C * 1.1, height: C * 1.1,
    borderRadius: C * 0.55,
    borderWidth: 1,
    borderColor: PALETTE.goldLight + '20',
  },
  centerTitle: {
    color: PALETTE.goldLight,
    fontSize: Math.round(C * 0.38),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    lineHeight: Math.round(C * 0.45),
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  centerSub: {
    color: PALETTE.sand + 'CC',
    fontSize: Math.round(C * 0.13),
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 6,
  },

  // ── Tile ──
  tile: {
    flex: 1,
    backgroundColor: TILE_BG,
    borderWidth: 0.5,
    borderColor: TILE_BDR,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTile: {
    flex: undefined,
    width: C, height: C,
    backgroundColor: CORNER_BG,
    borderWidth: 1,
    borderColor: '#2A5040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertTile: {
    flex: 1,
    width: C,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Colour bar — horizontal tiles: across the top; vertical tiles: left edge
  colorBarHoriz: { position: 'absolute', top: 0, left: 0, right: 0, height: 8 },
  colorBarVert:  { position: 'absolute', top: 0, left: 0, bottom: 0, width: 7 },
  colorBar:      {},   // placeholder — combined with Horiz/Vert

  icon:       { fontSize: Math.round(S * 0.48), lineHeight: Math.round(S * 0.56) },
  cornerIcon: { fontSize: Math.round(C * 0.38), marginBottom: 2 },

  cornerName: {
    color: '#FFE899',
    fontSize: Math.round(C * 0.115),
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 3,
    lineHeight: Math.round(C * 0.15),
  },

  // Owner strip at very bottom
  ownerStrip: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 5,
  },

  // Riad pips
  riadRow: {
    position: 'absolute',
    bottom: 7, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  riadDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#2ECC71',
    shadowColor: '#2ECC71', shadowOpacity: 0.9, shadowRadius: 3,
  },

  // Player tokens
  tokens: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingTop: 8,
  },
  token: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#ffffffaa',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 3, elevation: 4,
  },
  tokenTxt: { color: '#fff', fontSize: 9, fontWeight: '900' },

  // ── Detail modal ──
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  cardImg:        { width: '100%', height: 180 },
  cardImgFallback:{ backgroundColor: PALETTE.surface2, alignItems: 'center', justifyContent: 'center' },
  cardBand:       { height: 6, width: '100%' },
  cardBody:       { padding: 20, paddingBottom: 36 },
  cardTitle:      { color: PALETTE.text,      fontSize: 22, fontWeight: '900', marginBottom: 4 },
  cardPrice:      { color: PALETTE.goldLight,  fontSize: 16, marginBottom: 6, fontWeight: '700' },
  cardTax:        { color: '#E74C3C',          fontSize: 16, marginBottom: 6 },

  rentTable:  { marginTop: 10, gap: 4, borderTopWidth: 1, borderTopColor: '#2A2A4A', paddingTop: 10 },
  rentHeader: { color: PALETTE.muted, fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  rentRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  rentLbl:    { color: PALETTE.muted, fontSize: 14 },
  rentAmt:    { color: PALETTE.text,  fontSize: 14, fontWeight: '700' },

  ownerBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, borderWidth: 1.5, borderRadius: 10, padding: 10,
  },
  ownerDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  ownerTxt: { color: PALETTE.text, fontSize: 14, fontWeight: '600', flex: 1 },
  ownerLvl: { fontSize: 14, fontWeight: '700' },

  tapClose: { color: PALETTE.muted, fontSize: 11, textAlign: 'center', marginTop: 16 },
});
