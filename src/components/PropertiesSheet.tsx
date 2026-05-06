import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { GameState } from '../game/types';
import { BOARD, GROUP_COLORS, PALETTE } from '../game/boardData';

interface Props {
  visible:           boolean;
  gameState:         GameState;
  myId:              string;
  onClose:           () => void;
  onSell:            (tileId: number) => void;
}

const GROUP_ORDER = ['brown', 'light_blue', 'pink', 'orange', 'red', 'yellow', 'dark_blue'];
const GROUP_LABELS: Record<string, string> = {
  brown:      'Brown',
  light_blue: 'Light Blue',
  pink:       'Pink',
  orange:     'Orange',
  red:        'Red',
  yellow:     'Yellow',
  dark_blue:  'Dark Blue',
};

function sellPrice(tileId: number, level: number): number {
  const tile = BOARD[tileId];
  return Math.round(((tile.price ?? 0) + level * (tile.riadCost ?? 0)) / 2);
}

export function PropertiesSheet({ visible, gameState, myId, onClose, onSell }: Props) {
  const allTiles = BOARD.filter(t => t.type === 'property' || t.type === 'station');

  function handleSell(tileId: number) {
    const tile  = BOARD[tileId];
    const prop  = gameState.properties[String(tileId)];
    const price = sellPrice(tileId, prop?.level ?? 0);
    Alert.alert(
      `Sell ${tile.name}?`,
      `You'll receive ${price} MAD (50% of value).`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sell', style: 'destructive', onPress: () => onSell(tileId) },
      ],
    );
  }

  function renderGroup(group: string) {
    const tiles = allTiles.filter(t => t.group === group);
    if (tiles.length === 0) return null;

    const color = GROUP_COLORS[group];

    return (
      <View key={group} style={s.group}>
        <View style={s.groupHeader}>
          <View style={[s.groupSwatch, { backgroundColor: color }]} />
          <Text style={s.groupLabel}>{GROUP_LABELS[group]}</Text>
        </View>
        {tiles.map(tile => {
          const prop  = gameState.properties[String(tile.id)];
          const owner = prop?.ownerId ? gameState.players[prop.ownerId] : null;
          const isMe  = prop?.ownerId === myId;
          const level = prop?.level ?? 0;

          return (
            <View key={tile.id} style={[s.row, isMe && s.rowMine]}>
              <View style={[s.rowAccent, { backgroundColor: color }]} />
              <View style={s.rowBody}>
                <Text style={s.tileName} numberOfLines={1}>{tile.name}</Text>
                <Text style={s.tilePrice}>{tile.price} MAD</Text>
              </View>

              {/* Riad pips */}
              {level > 0 && (
                <View style={s.pips}>
                  {Array.from({ length: level }).map((_, i) => (
                    <View key={i} style={s.pip} />
                  ))}
                </View>
              )}

              {/* Owner badge or sell button */}
              {owner ? (
                isMe ? (
                  <TouchableOpacity
                    style={s.sellBtn}
                    onPress={() => handleSell(tile.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.sellTxt}>{sellPrice(tile.id, level)} MAD</Text>
                    <Text style={s.sellLabel}>Sell</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[s.ownerBadge, { borderColor: owner.color + '66' }]}>
                    <View style={[s.ownerDot, { backgroundColor: owner.color }]} />
                    <Text style={s.ownerName} numberOfLines={1}>{owner.name}</Text>
                  </View>
                )
              ) : (
                <Text style={s.freeTag}>Free</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  function renderStations() {
    const stations = allTiles.filter(t => t.type === 'station');
    if (stations.length === 0) return null;
    return (
      <View style={s.group}>
        <View style={s.groupHeader}>
          <Text style={[s.groupSwatch, { fontSize: 14 }]}>🚂</Text>
          <Text style={s.groupLabel}>Stations</Text>
        </View>
        {stations.map(tile => {
          const prop  = gameState.properties[String(tile.id)];
          const owner = prop?.ownerId ? gameState.players[prop.ownerId] : null;
          const isMe  = prop?.ownerId === myId;

          return (
            <View key={tile.id} style={[s.row, isMe && s.rowMine]}>
              <View style={[s.rowAccent, { backgroundColor: '#888' }]} />
              <View style={s.rowBody}>
                <Text style={s.tileName} numberOfLines={1}>{tile.name}</Text>
                <Text style={s.tilePrice}>{tile.price} MAD</Text>
              </View>
              {owner ? (
                isMe ? (
                  <TouchableOpacity
                    style={s.sellBtn}
                    onPress={() => handleSell(tile.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.sellTxt}>{sellPrice(tile.id, 0)} MAD</Text>
                    <Text style={s.sellLabel}>Sell</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[s.ownerBadge, { borderColor: owner.color + '66' }]}>
                    <View style={[s.ownerDot, { backgroundColor: owner.color }]} />
                    <Text style={s.ownerName} numberOfLines={1}>{owner.name}</Text>
                  </View>
                )
              ) : (
                <Text style={s.freeTag}>Free</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />
        <View style={s.header}>
          <Text style={s.title}>Properties</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {GROUP_ORDER.map(g => renderGroup(g))}
          {renderStations()}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    maxHeight: '78%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: PALETTE.muted,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A36',
  },
  title:    { color: PALETTE.text, fontSize: 18, fontWeight: '900' },
  closeBtn: { padding: 6 },
  closeTxt: { color: PALETTE.muted, fontSize: 16, fontWeight: '700' },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  group:       { marginBottom: 16 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  groupSwatch: { width: 14, height: 14, borderRadius: 3 },
  groupLabel:  { color: PALETTE.sand, fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface2,
    borderRadius: 12,
    marginBottom: 4,
    overflow: 'hidden',
    minHeight: 50,
  },
  rowMine: {
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  rowAccent: { width: 5, alignSelf: 'stretch' },
  rowBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tileName:  { color: PALETTE.text, fontSize: 13, fontWeight: '700' },
  tilePrice: { color: PALETTE.muted, fontSize: 11, marginTop: 1 },

  pips: {
    flexDirection: 'row',
    gap: 3,
    paddingRight: 6,
  },
  pip: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#2ECC71',
    shadowColor: '#2ECC71', shadowOpacity: 0.8, shadowRadius: 3,
  },

  ownerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    marginRight: 8,
    maxWidth: 90,
  },
  ownerDot:  { width: 8, height: 8, borderRadius: 4 },
  ownerName: { color: PALETTE.text, fontSize: 11, fontWeight: '600', flexShrink: 1 },

  sellBtn: {
    alignItems: 'center',
    backgroundColor: PALETTE.terra + '22',
    borderWidth: 1,
    borderColor: PALETTE.terra + '66',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    minWidth: 60,
  },
  sellTxt:   { color: PALETTE.terra, fontSize: 11, fontWeight: '900' },
  sellLabel: { color: PALETTE.terra, fontSize: 9, fontWeight: '700', opacity: 0.7 },

  freeTag: {
    color: PALETTE.muted,
    fontSize: 11,
    fontWeight: '600',
    marginRight: 12,
  },
});
