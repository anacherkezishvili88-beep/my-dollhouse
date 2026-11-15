// Helpers for reading the item data in items.json.
import data from "../data/items.json";

// The room is designed on a fixed 1440 × 900 "stage" that gets scaled
// to fit the browser window, so a layout looks the same on every screen.
export const STAGE_W = 1440;
export const STAGE_H = 900;

export const categories = data.categories;
export const items = data.items;

const itemById = new Map(items.map((item) => [item.id, item]));

export function getItem(itemId) {
  return itemById.get(itemId);
}

export function itemsInCategory(categoryId) {
  return items.filter((item) => item.category === categoryId);
}

// e.g. getItemByName("furniture", "couch-1")
export function getItemByName(categoryId, name) {
  return itemById.get(`${categoryId}/${name}`);
}

export function isCharacter(item) {
  return item.category === "characters";
}

export function isClothing(item) {
  return item.category === "clothes";
}

// Prefix asset paths with Vite's base URL so images load on GitHub Pages.
export function assetUrl(path) {
  return import.meta.env.BASE_URL + path;
}

// Height of an item's visible content when drawn at a given width.
export function heightForWidth(item, width) {
  return (width * item.crop[3]) / item.crop[2];
}

let counter = 0;
export function makeUid() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
}
