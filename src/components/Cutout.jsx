import { assetUrl, heightForWidth } from "../utils/items.js";

// Draws one PNG at a given width, cropped to its visible content.
// The PNG files themselves are never changed: some have big transparent
// margins, so we hide those with a window (overflow: hidden) instead.
export default function Cutout({ item, width, className = "", style, ...rest }) {
  const [naturalW] = item.natural;
  const [cropX, cropY, cropW] = item.crop;
  const k = width / cropW; // PNG pixels → screen pixels

  return (
    <div
      className={`cutout ${className}`}
      style={{ ...style, width, height: heightForWidth(item, width) }}
      {...rest}
    >
      <img
        src={assetUrl(item.file)}
        alt={item.name}
        draggable={false}
        style={{ left: -cropX * k, top: -cropY * k, width: naturalW * k }}
      />
    </div>
  );
}
