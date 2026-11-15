import Cutout from "./Cutout.jsx";
import { categories, getItemByName, heightForWidth } from "../utils/items.js";
import "../styles/menu.css";

// The screen that opens from the cart: one little collage per section.
// Click a collage to scatter that section's items around the page.
export default function CartMenu({ onPick }) {
  return (
    <>
      {categories.map((category) => (
        <button
          key={category.id}
          className="menu-section"
          style={{ left: category.menu.x, top: category.menu.y - 44, width: category.menu.w }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onPick(category.id)}
        >
          <span className="menu-label">{category.label}</span>
          <MenuCollage category={category} />
        </button>
      ))}
    </>
  );
}

// Overlaps a few preview items inside the section's box.
function MenuCollage({ category }) {
  const { w: boxW, h: boxH, preview } = category.menu;
  const previewItems = preview.map((name) => getItemByName(category.id, name)).filter(Boolean);
  const count = previewItems.length;

  return (
    <span className="menu-collage" style={{ width: boxW, height: boxH }}>
      {previewItems.map((item, i) => {
        // Alternate tall/short and spread them out with some overlap.
        const targetH = boxH * (i % 2 === 0 ? 0.9 : 0.72);
        let width = (targetH * item.crop[2]) / item.crop[3];
        width = Math.min(width, boxW * 0.6);
        const height = heightForWidth(item, width);
        const left = count === 1 ? 0 : (i * (boxW - width)) / (count - 1);
        const top = boxH - height - (i % 2 === 0 ? 0 : boxH * 0.12);
        return (
          <Cutout
            key={item.id}
            item={item}
            width={width}
            className="menu-preview"
            style={{ position: "absolute", left, top }}
          />
        );
      })}
    </span>
  );
}
