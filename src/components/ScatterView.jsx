import Cutout from "./Cutout.jsx";
import { getItem } from "../utils/items.js";
import "../styles/scatter.css";

// A section's items tossed around the page. Press on one to pick it up
// and drag it into the room.
export default function ScatterView({ label, scattered, onPickUp }) {
  return (
    <>
      <div className="scatter-header">
        <h2 className="scatter-label">{label}</h2>
        <p className="overlay-hint">drag things into your room · click empty space when you're done</p>
      </div>
      {scattered.map((entry) => {
        const item = getItem(entry.itemId);
        return (
          <div
            key={entry.itemId}
            className="scatter-item"
            style={{
              left: entry.x,
              top: entry.y,
              "--from-x": `${entry.fromX}px`,
              "--from-y": `${entry.fromY}px`,
              animationDelay: `${entry.delay}ms`,
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              onPickUp(entry, event);
            }}
          >
            <Cutout item={item} width={item.width * entry.scale} />
          </div>
        );
      })}
    </>
  );
}
