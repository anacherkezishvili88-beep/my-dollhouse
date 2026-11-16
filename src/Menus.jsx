import { Cutout } from "./Cutout.jsx";
import {
  categories,
  getItem,
  getItemByName,
  heightForWidth,
} from "./helpers.js";

/*
The screen that opens when you click the cart.
Every section (furniture, posters, clothes...) gets a little collage.
Props:
- onPick: called with the section's id when you click one
*/
export function CartMenu({ onPick }) {
  return (
    <>
      {categories.map((category) => (
        <button
          key={category.id}
          className="menu-section"
          style={{
            left: category.menu.x,
            top: category.menu.y - 44,
            width: category.menu.w,
          }}
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

// Overlaps a few of the section's items inside its box
function MenuCollage({ category }) {
  let box = category.menu;
  let previewItems = box.preview
    .map((name) => getItemByName(category.id, name))
    .filter((item) => item != null);
  let count = previewItems.length;

  return (
    <span className="menu-collage" style={{ width: box.w, height: box.h }}>
      {previewItems.map((item, i) => {
        // every other item is a bit shorter, so they stagger
        let targetHeight = i % 2 == 0 ? box.h * 0.9 : box.h * 0.72;
        let width = (targetHeight * item.crop[2]) / item.crop[3];
        width = Math.min(width, box.w * 0.6);
        let height = heightForWidth(item, width);

        // spread them out from left to right, overlapping a little
        let left = 0;
        if (count > 1) {
          left = (i * (box.w - width)) / (count - 1);
        }
        let top = box.h - height;
        if (i % 2 == 1) {
          top = top - box.h * 0.12;
        }

        return (
          <Cutout
            key={item.id}
            item={item}
            width={width}
            className="menu-preview"
            style={{ position: "absolute", left: left, top: top }}
          />
        );
      })}
    </span>
  );
}

/*
A section's items thrown around the page.
Pressing on one picks it up so you can drag it into the room.
Props:
- label: the section's name
- scattered: where each item landed (from scatterItems in helpers.js)
- onPickUp: called when you press on an item
*/
export function ScatterView({ label, scattered, onPickUp }) {
  return (
    <>
      <div className="scatter-header">
        <h2>{label}</h2>
        <p className="hint">
          drag things into your room · click empty space when you're done
        </p>
      </div>

      {scattered.map((spot) => {
        let item = getItem(spot.itemId);
        return (
          <div
            key={spot.itemId}
            className="scatter-item"
            style={{
              left: spot.x,
              top: spot.y,
              "--from-x": spot.fromX + "px",
              "--from-y": spot.fromY + "px",
              animationDelay: spot.delay + "ms",
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              onPickUp(spot, event);
            }}
          >
            <Cutout item={item} width={item.width * spot.scale} />
          </div>
        );
      })}
    </>
  );
}
