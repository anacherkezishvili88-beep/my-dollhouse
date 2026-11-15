// Spreads a category's items around the page (the "scatter" screen).
// The page is split into a loose grid; every item gets a shuffled cell
// plus a random nudge, so it looks tossed rather than lined up.
import { STAGE_W, STAGE_H, heightForWidth } from "./items.js";

const AREA = { left: 60, top: 130, right: STAGE_W - 60, bottom: STAGE_H - 40 };

export function scatterItems(itemList) {
  const areaW = AREA.right - AREA.left;
  const areaH = AREA.bottom - AREA.top;
  const count = itemList.length;
  const cols = Math.ceil(Math.sqrt((count * areaW) / areaH));
  const rows = Math.ceil(count / cols);
  const cellW = areaW / cols;
  const cellH = areaH / rows;
  const cells = shuffle([...Array(cols * rows).keys()]).slice(0, count);

  return itemList.map((item, i) => {
    const w = item.width;
    const h = heightForWidth(item, w);
    // Shrink anything too big for its cell (it grows back when picked up).
    const scale = Math.min(1, (cellW * 0.9) / w, (cellH * 0.9) / h);
    const col = cells[i] % cols;
    const row = Math.floor(cells[i] / cols);
    const spareX = cellW - w * scale;
    const spareY = cellH - h * scale;
    const x = AREA.left + col * cellW + spareX / 2 + (Math.random() - 0.5) * spareX * 0.7;
    const y = AREA.top + row * cellH + spareY / 2 + (Math.random() - 0.5) * spareY * 0.7;
    return {
      itemId: item.id,
      x,
      y,
      scale,
      // where it flies in from (the middle of the page), for the animation
      fromX: STAGE_W / 2 - x - (w * scale) / 2,
      fromY: STAGE_H / 2 - y - (h * scale) / 2,
      delay: i * 30,
    };
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
