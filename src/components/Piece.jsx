import Cutout from "./Cutout.jsx";
import { getItem, isCharacter } from "../utils/items.js";
import { childrenOf } from "../utils/pieces.js";

// One thing in the room. Characters also draw the clothes they're wearing,
// inside their own box, so the clothes move (and scale) with them.
export default function Piece({ piece, placed, layer, draggingUid }) {
  const item = getItem(piece.itemId);
  if (!item) return null;
  const character = isCharacter(item);

  return (
    <div
      className={`piece ${piece.uid === draggingUid ? "is-dragging" : ""}`}
      style={{ left: piece.x, top: piece.y, zIndex: layer }}
    >
      <Cutout
        item={item}
        width={item.width * piece.scale}
        data-uid={piece.uid}
        data-character={character ? piece.uid : undefined}
      />
      {character && (
        <div className="worn" style={{ transform: `scale(${piece.scale})` }}>
          {childrenOf(placed, piece.uid).map((clothing) => (
            <Piece key={clothing.uid} piece={clothing} placed={placed} layer={1} draggingUid={draggingUid} />
          ))}
        </div>
      )}
    </div>
  );
}
