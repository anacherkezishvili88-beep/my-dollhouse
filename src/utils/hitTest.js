// Figuring out what's under the mouse.
// PNG cut-outs have transparent areas, so instead of grabbing whatever
// rectangle is on top, we check the actual pixel: clicking the empty space
// around a chandelier grabs the couch behind it instead.

const alphaCache = new Map(); // image src → pixel data

function getPixels(img) {
  if (alphaCache.has(img.src)) return alphaCache.get(img.src);
  if (!img.complete || !img.naturalWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  alphaCache.set(img.src, pixels);
  return pixels;
}

function isOpaqueAt(img, clientX, clientY) {
  const pixels = getPixels(img);
  if (!pixels) return true; // not loaded yet: assume it's solid
  const rect = img.getBoundingClientRect();
  const px = Math.floor(((clientX - rect.left) / rect.width) * pixels.width);
  const py = Math.floor(((clientY - rect.top) / rect.height) * pixels.height);
  if (px < 0 || py < 0 || px >= pixels.width || py >= pixels.height) return false;
  return pixels.data[(py * pixels.width + px) * 4 + 3] > 30;
}

// The front-most placed piece with a visible pixel at this point.
export function findPieceAt(clientX, clientY) {
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    const cutout = el.closest("[data-uid]");
    if (!cutout) continue;
    const img = cutout.querySelector("img");
    if (img && isOpaqueAt(img, clientX, clientY)) return cutout.dataset.uid;
  }
  return null;
}

// A character whose box is under this point (used when dropping clothes).
// `ignoreUid` is the piece being dragged, which is itself under the pointer.
export function findCharacterAt(clientX, clientY, ignoreUid) {
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    if (el.closest("[data-uid]")?.dataset.uid === ignoreUid) continue;
    const character = el.closest("[data-character]");
    if (character) return character.dataset.character;
  }
  return null;
}

// Is the pointer over the erase button? (drop something there to delete it)
export function isOverEraseButton(clientX, clientY) {
  return document.elementsFromPoint(clientX, clientY).some((el) => el.closest("[data-erase-target]"));
}
