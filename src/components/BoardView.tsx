import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Modal, Animated, Dimensions,
} from 'react-native';
import { GameState } from '../game/types';
import {
  BOARD, GROUP_COLORS, PALETTE, tileImage, TILE_ICON_IMAGES,
} from '../game/boardData';

const BOTTOM    = [0, 1, 2, 3, 4, 5, 6, 7];
const RIGHT_COL = [13, 12, 11, 10, 9, 8];
const TOP       = [21, 20, 19, 18, 17, 16, 15, 14];
const LEFT_COL  = [22, 23, 24, 25, 26, 27];
const CORNER_SET = new Set([0, 7, 14, 21]);

function tileBgUri(id: number, type: string, name: string): string | undefined {
  if (type === 'property' || type === 'station') return tileImage(id, name);
  return TILE_ICON_IMAGES[type];
}

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

type Side = 'top' | 'bottom' | 'left' | 'right';
interface TileCellProps {
  id: number; gs: GameState; onPress: () => void;
  side?: Side; displayPositions?: Record<string, number>;
  C: number;
}

function TileCell({ id, gs, onPress, side = 'bottom', displayPositions, C }: TileCellProps) {
  const tile       = BOARD[id];
  const isCorner   = CORNER_SET.has(id);
  const isVert     = side === 'left' || side === 'right';
  const prop       = gs.properties[String(id)];
  const owner      = prop?.ownerId ? gs.players[prop.ownerId] : null;
  const here       = Object.values(gs.players).filter(p =>
    (displayPositions?.[p.id] ?? p.position) === id
  );
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;
  const bgUri      = tileBgUri(tile.id, tile.type, tile.name);

  const barStyle =
    side === 'top'    ? s.barTop    :
    side === 'bottom' ? s.barBottom :
    side === 'left'   ? s.barLeft   :
                        s.barRight;

  const cornerStyle = isCorner
    ? { flex: undefined as undefined, width: C, height: C, backgroundColor: '#091510', borderWidth: 1, borderColor: '#2A5040', alignItems: 'center' as const, justifyContent: 'center' as const }
    : undefined;

  return (
    <TouchableOpacity
      style={[s.tile, cornerStyle, isVert && s.vertTile]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {bgUri && (
        <Image source={{ uri: bgUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      )}
      <View style={[s.vignette, isCorner && s.vignetteCorner]} />

      {groupColor && <View style={[barStyle, { backgroundColor: groupColor }]} />}

      {isCorner && (
        <Text
          style={[s.cornerName, { fontSize: Math.round(C * 0.13), lineHeight: Math.round(C * 0.17) }]}
          numberOfLines={3}
        >
          {tile.name}
        </Text>
      )}

      {(prop?.level ?? 0) > 0 && (
        <View style={s.riadRow}>
          {Array.from({ length: prop!.level }).map((_, i) => (
            <View key={i} style={s.riadDot} />
          ))}
        </View>
      )}

      {owner && (
        <View style={[s.ownerStrip, { backgroundColor: owner.color, shadowColor: owner.color, shadowOpacity: 0.9, shadowRadius: 6 }]} />
      )}

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

interface Props {
  gameState:         GameState;
  displayPositions?: Record<string, number>;
  boardSize?:        number;
}

export function BoardView({ gameState, displayPositions, boardSize }: Props) {
  const SW = Dimensions.get('window').width;
  const BS = boardSize != null ? boardSize : Math.min(SW - 20, 390);
  const C  = Math.round(BS * 0.18);

  const [selected, setSelected] = useState<number | null>(null);

  const selTile  = selected !== null ? BOARD[selected]                        : null;
  const selProp  = selected !== null ? gameState.properties[String(selected)] : null;
  const selOwner = selProp?.ownerId  ? gameState.players[selProp.ownerId]     : null;
  const selBgUri = selTile ? tileBgUri(selTile.id, selTile.type, selTile.name) : undefined;

  return (
    <View style={s.scene}>
      {/* Walnut frame */}
      <View style={[s.frame, { width: BS + 8, height: BS + 8 }]}>
        <View style={[s.board, { width: BS, height: BS }]}>

          <View style={{ height: C, width: BS, flexDirection: 'row' }}>
            {TOP.map(id => (
              <TileCell key={id} id={id} gs={gameState} displayPositions={displayPositions}
                onPress={() => setSelected(id)} side="top" C={C} />
            ))}
          </View>

          <View style={{ width: BS, height: BS - C * 2, flexDirection: 'row' }}>
            <View style={{ width: C, height: BS - C * 2, flexDirection: 'column' }}>
              {LEFT_COL.map(id => (
                <TileCell key={id} id={id} gs={gameState} displayPositions={displayPositions}
                  onPress={() => setSelected(id)} side="left" C={C} />
              ))}
            </View>

            <View style={s.center}>
              <View style={{
                position: 'absolute',
                width: C * 1.6, height: C * 1.6, borderRadius: C * 0.8,
                borderWidth: 1.5, borderColor: PALETTE.goldLight + '35',
              }} />
              <View style={{
                position: 'absolute',
                width: C * 1.1, height: C * 1.1, borderRadius: C * 0.55,
                borderWidth: 1, borderColor: PALETTE.goldLight + '20',
              }} />
              <Text style={[s.centerTitle, {
                fontSize: Math.round(C * 0.38),
                lineHeight: Math.round(C * 0.45),
              }]}>
                OWN{'\n'}IT ALL
              </Text>
              <Text style={[s.centerSub, { fontSize: Math.round(C * 0.13) }]}>
                ✦  Marrakech  ✦
              </Text>
              {(gameState.parkingPot ?? 0) > 0 && (
                <Text style={[s.centerSub, {
                  fontSize: Math.round(C * 0.12),
                  color: '#2ECC71',
                  marginTop: 4,
                  fontWeight: '800',
                }]}>
                  🅿 {gameState.parkingPot} MAD
                </Text>
              )}
            </View>

            <View style={{ width: C, height: BS - C * 2, flexDirection: 'column' }}>
              {RIGHT_COL.map(id => (
                <TileCell key={id} id={id} gs={gameState} displayPositions={displayPositions}
                  onPress={() => setSelected(id)} side="right" C={C} />
              ))}
            </View>
          </View>

          <View style={{ height: C, width: BS, flexDirection: 'row' }}>
            {BOTTOM.map(id => (
              <TileCell key={id} id={id} gs={gameState} displayPositions={displayPositions}
                onPress={() => setSelected(id)} side="bottom" C={C} />
            ))}
          </View>

        </View>
      </View>

      {/* Tile detail bottom-sheet */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setSelected(null)}>
          {selTile && (
            <View style={s.card}>
              {selBgUri ? (
                <Image source={{ uri: selBgUri }} style={s.cardImg} resizeMode="cover" />
              ) : (
                <View style={[s.cardImg, s.cardImgFallback]} />
              )}
              {selTile.group && (
                <View style={[s.cardBand, { backgroundColor: GROUP_COLORS[selTile.group] }]} />
              )}
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{selTile.name}</Text>
                {selTile.price     && <Text style={s.cardPrice}>Price: {selTile.price} MAD</Text>}
                {selTile.taxAmount && <Text style={s.cardTax}>Tax: {selTile.taxAmount} MAD</Text>}
                {selTile.rent && (
                  <View style={s.rentTable}>
                    <Text style={s.rentHeader}>RENT SCHEDULE</Text>
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
                      <Text style={[s.ownerLvl, { color: selOwner.color }]}>
                        · Riad lvl {selProp!.level}
                      </Text>
                    )}
                  </View>
                )}
                <Text style={s.tapClose}>Tap anywhere to close</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  scene: { alignItems: 'center' },

  frame: {
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

  board: {
    flexDirection: 'column',
    backgroundColor: '#1A5E38',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6A3A18',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A5E38',
  },

  centerTitle: {
    color: PALETTE.goldLight,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  centerSub: {
    color: PALETTE.sand + 'CC',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 5,
  },

  tile: {
    flex: 1,
    backgroundColor: '#0F1C14',
    borderWidth: 0.5,
    borderColor: '#1E3228',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertTile: {
    flex: 1,
    width: undefined,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  } as any,
  vignetteCorner: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  barTop:    { position: 'absolute', top:    0, left: 0, right:  0, height: 8 },
  barBottom: { position: 'absolute', bottom: 0, left: 0, right:  0, height: 8 },
  barLeft:   { position: 'absolute', top:    0, left: 0, bottom: 0, width:  7 },
  barRight:  { position: 'absolute', top:    0, right:0, bottom: 0, width:  7 },

  cornerName: {
    color: '#FFE899',
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 3,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  ownerStrip: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 5,
  },

  riadRow: {
    position: 'absolute', bottom: 8, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 2,
  },
  riadDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#2ECC71',
    shadowColor: '#2ECC71', shadowOpacity: 0.9, shadowRadius: 3,
  },

  tokens: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', flexWrap: 'wrap', gap: 2,
    paddingTop: 6,
  },
  token: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#ffffffbb',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 3, elevation: 4,
  },
  tokenTxt: { color: '#fff', fontSize: 9, fontWeight: '900' },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  cardImg:         { width: '100%', height: 190 },
  cardImgFallback: { backgroundColor: PALETTE.surface2, height: 100 },
  cardBand:        { height: 6, width: '100%' },
  cardBody:        { padding: 20, paddingBottom: 40 },
  cardTitle:       { color: PALETTE.text,     fontSize: 22, fontWeight: '900', marginBottom: 4 },
  cardPrice:       { color: PALETTE.goldLight, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardTax:         { color: '#E74C3C',         fontSize: 15, marginBottom: 4 },

  rentTable:  { marginTop: 10, borderTopWidth: 1, borderTopColor: '#2A2A4A', paddingTop: 10, gap: 4 },
  rentHeader: { color: PALETTE.muted, fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  rentRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  rentLbl:    { color: PALETTE.muted, fontSize: 13 },
  rentAmt:    { color: PALETTE.text,  fontSize: 13, fontWeight: '700' },

  ownerBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, borderWidth: 1.5, borderRadius: 10, padding: 10,
  },
  ownerDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  ownerTxt: { color: PALETTE.text, fontSize: 14, fontWeight: '600', flex: 1 },
  ownerLvl: { fontSize: 14, fontWeight: '700' },

  tapClose: { color: PALETTE.muted, fontSize: 11, textAlign: 'center', marginTop: 16 },
});
