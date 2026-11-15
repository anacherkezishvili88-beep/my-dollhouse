// Pure helpers for the `placed` array (everything in the room).
// Each piece looks like:
//   { uid, itemId, x, y, scale, z, parent }
// - x / y: top-left corner in stage px. If `parent` is set (clothes worn by
//   a character), x / y are relative to that character instead.
// - z: higher = drawn in front (within its layer band, see items.json).
// They always return a NEW array so React notices the change.
import { getItem } from "./items.js";

export function nextZ(list) {
  return list.reduce((max, p) => Math.max(max, p.z), 0) + 1;
}

export function findPiece(list, uid) {
  return list.find((p) => p.uid === uid);
}

export function childrenOf(list, uid) {
  return list.filter((p) => p.parent === uid).sort((a, b) => a.z - b.z);
}

// Top-level pieces in drawing order: walls → floors → posters → furniture → characters.
export function topLevelInOrder(list) {
  return list
    .filter((p) => !p.parent && getItem(p.itemId)) // skip anything no longer in items.json
    .sort((a, b) => getItem(a.itemId).band - getItem(b.itemId).band || a.z - b.z);
}

export function updatePiece(list, uid, changes) {
  return list.map((p) => (p.uid === uid ? { ...p, ...changes } : p));
}

// Removing a character also removes the clothes they're wearing.
export function removePiece(list, uid) {
  return list.filter((p) => p.uid !== uid && p.parent !== uid);
}

export function bringToFront(list, uid) {
  return updatePiece(list, uid, { z: nextZ(list) });
}

// Move by a distance measured in stage px. Worn clothes move in their
// character's coordinates, so divide by the character's scale.
export function moveBy(list, uid, dx, dy) {
  const piece = findPiece(list, uid);
  if (!piece) return list;
  const parent = piece.parent && findPiece(list, piece.parent);
  const factor = parent ? parent.scale : 1;
  return updatePiece(list, uid, { x: piece.x + dx / factor, y: piece.y + dy / factor });
}

// Where a piece really is on the stage (resolving worn clothes).
export function stagePosition(list, piece) {
  const parent = piece.parent && findPiece(list, piece.parent);
  if (!parent) return { x: piece.x, y: piece.y, scale: piece.scale };
  return {
    x: parent.x + piece.x * parent.scale,
    y: parent.y + piece.y * parent.scale,
    scale: piece.scale * parent.scale,
  };
}

// Put a piece of clothing on a character (converting to their coordinates).
export function attachTo(list, uid, characterUid) {
  const piece = findPiece(list, uid);
  const character = findPiece(list, characterUid);
  const abs = stagePosition(list, piece);
  return updatePiece(list, uid, {
    parent: characterUid,
    x: (abs.x - character.x) / character.scale,
    y: (abs.y - character.y) / character.scale,
    scale: abs.scale / character.scale,
    z: nextZ(list),
  });
}

// Take a piece of clothing off (back onto the room).
export function detach(list, uid) {
  const piece = findPiece(list, uid);
  const abs = stagePosition(list, piece);
  return updatePiece(list, uid, { parent: null, ...abs, z: nextZ(list) });
}
