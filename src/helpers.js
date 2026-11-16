// Helper functions that the components share.
// Most of them work with the list of pieces that are in the room.
import data from "./items.json";

// The room is designed on a 1440 x 900 canvas. It gets scaled to fit
// the browser window, so the room looks the same on every screen.
export let STAGE_WIDTH = 1440;
export let STAGE_HEIGHT = 900;

export let categories = data.categories;
export let items = data.items;

/* ---------- Items ---------- */

export function getItem(itemId) {
  return items.find((item) => item.id == itemId);
}

export function itemsInCategory(categoryId) {
  return items.filter((item) => item.category == categoryId);
}

// For example: getItemByName("furniture", "couch-1")
export function getItemByName(categoryId, name) {
  return getItem(categoryId + "/" + name);
}

export function isCharacter(item) {
  return item.category == "characters";
}

export function isClothing(item) {
  return item.category == "clothes";
}

// Images are in the public folder. BASE_URL makes sure the path
// still works once the site is on GitHub Pages
export function assetUrl(path) {
  return import.meta.env.BASE_URL + path;
}

// How tall an item is when it's drawn at a certain width
export function heightForWidth(item, width) {
  return (width * item.crop[3]) / item.crop[2];
}

// Every piece in the room needs its own id, so the same couch can be
// added twice
let idCounter = 0;
export function makeId() {
  idCounter = idCounter + 1;
  return Date.now() + "-" + idCounter;
}

// Works out how much to scale the canvas so it fits the window,
// and where to put it so it's in the middle
export function measureStage() {
  let scale = Math.min(
    window.innerWidth / STAGE_WIDTH,
    window.innerHeight / STAGE_HEIGHT,
  );
  return {
    scale: scale,
    left: (window.innerWidth - STAGE_WIDTH * scale) / 2,
    top: (window.innerHeight - STAGE_HEIGHT * scale) / 2,
  };
}

/* ---------- Pieces in the room ----------
Each piece is an object like this:
  { id, itemId, x, y, scale, z, parent }
- x and y are the top left corner on the canvas. Clothes that a character
  is wearing have a parent (the character's id), and then x and y are
  measured from the character instead.
- z decides what's in front. A bigger z is drawn on top.
These functions always return a new list instead of changing the old one,
so React knows the state changed. */

export function findPiece(pieces, id) {
  return pieces.find((piece) => piece.id == id);
}

export function nextZ(pieces) {
  let highest = 0;
  for (let piece of pieces) {
    highest = Math.max(highest, piece.z);
  }
  return highest + 1;
}

// The clothes a character is wearing, back to front
export function childrenOf(pieces, id) {
  return pieces
    .filter((piece) => piece.parent == id)
    .sort((a, b) => a.z - b.z);
}

// Everything that isn't being worn, in the order it should be drawn.
// Each category has a "band" in items.json: walls are at the back,
// then floors, rugs, posters, furniture and props, and characters in front.
export function piecesInOrder(pieces) {
  return pieces
    .filter((piece) => piece.parent == null && getItem(piece.itemId))
    .sort((a, b) => {
      let bandA = getItem(a.itemId).band;
      let bandB = getItem(b.itemId).band;
      if (bandA != bandB) {
        return bandA - bandB;
      }
      return a.z - b.z;
    });
}

export function updatePiece(pieces, id, changes) {
  return pieces.map((piece) => {
    if (piece.id == id) {
      return { ...piece, ...changes };
    }
    return piece;
  });
}

// Removing a character also removes the clothes they're wearing
export function removePiece(pieces, id) {
  return pieces.filter((piece) => piece.id != id && piece.parent != id);
}

export function bringToFront(pieces, id) {
  return updatePiece(pieces, id, { z: nextZ(pieces) });
}

// Move a piece by dx and dy (in canvas pixels). Clothes being worn
// are measured from their character, so we divide by the character's scale
export function moveBy(pieces, id, dx, dy) {
  let piece = findPiece(pieces, id);
  if (piece == null) {
    return pieces;
  }
  let parent = findPiece(pieces, piece.parent);
  let parentScale = parent ? parent.scale : 1;
  return updatePiece(pieces, id, {
    x: piece.x + dx / parentScale,
    y: piece.y + dy / parentScale,
  });
}

// Where a piece actually is on the canvas
export function canvasPosition(pieces, piece) {
  let parent = findPiece(pieces, piece.parent);
  if (parent == null) {
    return { x: piece.x, y: piece.y, scale: piece.scale };
  }
  return {
    x: parent.x + piece.x * parent.scale,
    y: parent.y + piece.y * parent.scale,
    scale: piece.scale * parent.scale,
  };
}

// Put a piece of clothing on a character
export function putOn(pieces, id, characterId) {
  let piece = findPiece(pieces, id);
  let character = findPiece(pieces, characterId);
  let position = canvasPosition(pieces, piece);
  return updatePiece(pieces, id, {
    parent: characterId,
    x: (position.x - character.x) / character.scale,
    y: (position.y - character.y) / character.scale,
    scale: position.scale / character.scale,
    z: nextZ(pieces),
  });
}

// Take a piece of clothing off, back into the room
export function takeOff(pieces, id) {
  let piece = findPiece(pieces, id);
  let position = canvasPosition(pieces, piece);
  return updatePiece(pieces, id, {
    parent: null,
    x: position.x,
    y: position.y,
    scale: position.scale,
    z: nextZ(pieces),
  });
}

/* ---------- Scatter ----------
When you click a section, its items get thrown around the page.
The page is split into a grid, every item gets a random cell, and
then it's moved a little so it doesn't look lined up. */

export function scatterItems(itemList, seed) {
  // the same seed always gives the same layout
  let random = seededRandom(seed);
  let left = 60;
  let top = 130;
  let areaWidth = STAGE_WIDTH - 120;
  let areaHeight = STAGE_HEIGHT - 170;

  let count = itemList.length;
  let columns = Math.ceil(Math.sqrt((count * areaWidth) / areaHeight));
  let rows = Math.ceil(count / columns);
  let cellWidth = areaWidth / columns;
  let cellHeight = areaHeight / rows;

  // shuffle the cell numbers so items land in random cells
  let cells = [];
  for (let i = 0; i < columns * rows; i++) {
    cells.push(i);
  }
   shuffle(cells, random);

  return itemList.map((item, i) => {
    let width = item.width;
    let height = heightForWidth(item, width);

     // If the item has a "spot" in items.json, put it exactly there
    if (item.spot) {
      return {
        itemId: item.id,
        x: item.spot.x,
        y: item.spot.y,
        scale: 1,
        fromX: STAGE_WIDTH / 2 - item.spot.x - width / 2,
        fromY: STAGE_HEIGHT / 2 - item.spot.y - height / 2,
        delay: i * 30,
      };
    }

    // shrink anything that's too big for its cell
    let scale = Math.min(
      1,
      (cellWidth * 0.9) / width,
      (cellHeight * 0.9) / height,
    );

    let column = cells[i] % columns;
    let row = Math.floor(cells[i] / columns);
    let spaceX = cellWidth - width * scale;
    let spaceY = cellHeight - height * scale;
    let x = left + column * cellWidth + spaceX / 2;
    let y = top + row * cellHeight + spaceY / 2;
    x = x + (random() - 0.5) * spaceX * 0.7;
    y = y + (random() - 0.5) * spaceY * 0.7;

    return {
      itemId: item.id,
      x: x,
      y: y,
      scale: scale,
      // where it flies in from (the middle of the page) for the animation
      fromX: STAGE_WIDTH / 2 - x - (width * scale) / 2,
      fromY: STAGE_HEIGHT / 2 - y - (height * scale) / 2,
      delay: i * 30,
    };
  });
}

function shuffle(list, random) {
  for (let i = list.length - 1; i > 0; i--) {
    let j = Math.floor(random() * (i + 1));
    let temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
}

// Makes "random" numbers that come out the same every time for the
// same seed (a word, like the section's name)
function seededRandom(seed) {
  let value = 1;
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) % 2147483646;
  }
  value = value + 1;
  return function () {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

/* ---------- What's under the mouse? ----------
The PNGs have see-through parts. Instead of grabbing the whole rectangle,
we check if the pixel under the mouse is actually visible. That way,
clicking next to the chandelier grabs the couch behind it. */

// Saved pixel data for each image, so we only read it once
let pixelCache = {};

function getPixels(img) {
  if (pixelCache[img.src]) {
    return pixelCache[img.src];
  }
  if (!img.complete || img.naturalWidth == 0) {
    return null;
  }
  let canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  let context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(img, 0, 0);
  pixelCache[img.src] = context.getImageData(0, 0, canvas.width, canvas.height);
  return pixelCache[img.src];
}

function isVisibleAt(img, mouseX, mouseY) {
  let pixels = getPixels(img);
  if (pixels == null) {
    return true; // the image hasn't loaded yet, so just count it
  }
  let box = img.getBoundingClientRect();
  let px = Math.floor(((mouseX - box.left) / box.width) * pixels.width);
  let py = Math.floor(((mouseY - box.top) / box.height) * pixels.height);
  if (px < 0 || py < 0 || px >= pixels.width || py >= pixels.height) {
    return false;
  }
  let alpha = pixels.data[(py * pixels.width + px) * 4 + 3];
  return alpha > 30;
}

// The piece in front that has a visible pixel under the mouse
export function findPieceAt(mouseX, mouseY) {
  for (let element of document.elementsFromPoint(mouseX, mouseY)) {
    let cutout = element.closest("[data-id]");
    if (cutout == null) {
      continue;
    }
    let img = cutout.querySelector("img");
    if (img && isVisibleAt(img, mouseX, mouseY)) {
      return cutout.dataset.id;
    }
  }
  return null;
}

// A character under the mouse (used when dropping clothes).
// We skip the piece that's being dragged since it's under the mouse too
export function findCharacterAt(mouseX, mouseY, draggedId) {
  for (let element of document.elementsFromPoint(mouseX, mouseY)) {
    let cutout = element.closest("[data-id]");
    if (cutout && cutout.dataset.id == draggedId) {
      continue;
    }
    let character = element.closest("[data-character]");
    if (character) {
      return character.dataset.character;
    }
  }
  return null;
}

// Is the mouse over the erase button? Dropping something there deletes it
export function isOverErase(mouseX, mouseY) {
  let elements = document.elementsFromPoint(mouseX, mouseY);
  return elements.some((element) => element.closest(".erase-button"));
}
