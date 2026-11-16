import {
  assetUrl,
  childrenOf,
  getItem,
  heightForWidth,
  isCharacter,
} from "./helpers.js";

/*
Draws one of my PNGs at a certain width.
Some of the PNGs have a lot of empty space around them, so the image
sits inside a box that only shows the visible part ("crop" in items.json).
Props:
- item: the item from items.json
- width: how wide to draw it
*/
export function Cutout({ item, width, className, style, id, characterId }) {
  let [fullWidth] = item.natural;
  let [cropX, cropY, cropWidth] = item.crop;
  // how much bigger or smaller the image is drawn compared to the file
  let ratio = width / cropWidth;

  return (
    <div
      className={"cutout " + (className || "")}
      style={{ ...style, width: width, height: heightForWidth(item, width) }}
      data-id={id}
      data-character={characterId}
    >
      <img
        src={assetUrl(item.file)}
        alt={item.name}
        draggable={false}
        style={{
          left: -cropX * ratio,
          top: -cropY * ratio,
          width: fullWidth * ratio,
        }}
      />
    </div>
  );
}

/*
One thing in the room. Characters also draw the clothes they're wearing
inside their own box, so the clothes move with them.
Props:
- piece: the piece object (see helpers.js)
- pieces: every piece in the room (to find the character's clothes)
- layer: which layer it's drawn on
- draggingId: the piece that's being dragged right now
*/
export function Piece({ piece, pieces, layer, draggingId }) {
  let item = getItem(piece.itemId);
  if (item == null) {
    return null;
  }

  let character = isCharacter(item);
  let className = "piece";
  if (piece.id == draggingId) {
    className = "piece dragging";
  }

  return (
    <div
      className={className}
      style={{ left: piece.x, top: piece.y, zIndex: layer }}
    >
      <Cutout
        item={item}
        width={item.width * piece.scale}
        id={piece.id}
        characterId={character ? piece.id : undefined}
      />

      {/* The clothes this character is wearing */}
      {character && (
        <div className="worn" style={{ transform: `scale(${piece.scale})` }}>
          {childrenOf(pieces, piece.id).map((clothing) => (
            <Piece
              key={clothing.id}
              piece={clothing}
              pieces={pieces}
              layer={1}
              draggingId={draggingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
