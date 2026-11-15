# my dollhouse

An interactive collage dollhouse and the next chapter of my autobiographical p5.js game *Ana's World*. Visitors open a shopping cart full of cut-outs I collected (furniture, posters, floors, walls, props, clothes, and my friends and me as stick-figure dolls), toss a section's items across the page, and drag them into a room to build a home. Clothes dropped onto a character stick to them and move with them, so you can dress everyone up.

**Live site:** https://YOUR-USERNAME.github.io/YOUR-REPO/

## How to play

1. Click the **cart** (top left) to open the sections.
2. Click a section: its items scatter around the page.
3. **Drag** any item into the room. Drag things around to rearrange them; whatever you touch last comes to the front of its layer.
4. Drop **clothes** onto a **character** to dress them. Drag a piece off them to take it off.
5. **Scroll** (or pinch on a trackpad) over an item to make it bigger or smaller.
6. **erase**: click it, then click things to remove them (or drag something onto the erase button). **ctrl+z** (button or keyboard) undoes. Esc closes menus.

The room is saved in the browser, so it's still there when you come back.

## How it works

- **Items:** all artwork lives in `public/dollhouseAssets/`, one folder per section, as PNGs. `src/data/items.json` lists every item (61 in total) with its section, file path, display size, and the box around its visible pixels. Some PNGs have large transparent margins, so the app crops them on screen with CSS instead of editing the files.
- **React state** (`src/App.jsx`), using `useState`:
  - `placed`: everything in the room, as `{ uid, itemId, x, y, scale, z, parent }`. Clothes worn by a character have `parent` set to that character and store their position relative to them, so they move with them.
  - `history`: earlier versions of `placed`, used by ctrl+z.
  - `view` (`"room"`, `"menu"` or `"scatter"`), `activeCategory`, `scattered` (where each item landed on the scatter screen), and `isErasing`.
  - `useSavedState` is `useState` plus `localStorage`.
- **Layout:** the room is designed on a fixed 1440 × 900 stage that scales to fit the window (`useStageScale`), so a room looks the same on any screen.
- **Layers:** each section has a layer band (walls → floor → rugs → posters → furniture/props → characters). Within a band, the most recently moved item is in front.
- **Clicking through transparency:** `utils/hitTest.js` checks the actual pixel under the mouse, so clicking the empty space around a chandelier grabs whatever is behind it.

## Project structure

```
public/dollhouseAssets/   my PNGs (buttons, characters, clothes, floors, furniture, posters, props, walls)
src/
  App.jsx                 all state + what happens on click / drag / drop
  data/items.json         the item list
  components/
    Stage.jsx             1440×900 layer scaled to the window
    Cutout.jsx            draws one PNG cropped to its visible content
    Piece.jsx             an item in the room (characters also draw their clothes)
    CartMenu.jsx          the cart screen with a collage per section
    ScatterView.jsx       a section's items tossed around the page
    CornerButtons.jsx     cart, erase, ctrl+z and the sticky note
  hooks/
    usePieceDrag.js       dragging (works from the scatter screen into the room)
    useStageScale.js      fits the stage to the window
    useSavedState.js      useState + localStorage
  utils/
    items.js              item lookups and asset paths
    pieces.js             pure helpers for adding/moving/layering/dressing pieces
    scatter.js            the random scatter layout
    hitTest.js            pixel-accurate "what's under the mouse"
  styles/                 global tokens + one stylesheet per part of the page
```

## Running locally / deploying

```
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

Deployment uses the GitHub Actions workflow in `.github/workflows/deploy.yml`: in the repository go to **Settings → Pages → Source → GitHub Actions**, and every push to `main` publishes the site. `vite.config.js` uses `base: "./"`, so asset paths work whatever the repository is called.

## Resources & AI use

- **Design and art:** the Figma prototypes and every image in `dollhouseAssets/` were made or collected by me.
- **Claude (Anthropic)** helped me pick the concept and wrote the React code from my prototypes: the component structure, the drag/drop and dress-up logic, the scatter layout, undo, the pixel hit-testing, the cropping of transparent margins, and the GitHub Pages workflow. Example prompts:
  - *"I want it for the user to be able to move things around inside the space… maybe I can have a scan of myself in the middle and the user could dress me up."*
  - *"The first image is how I want the website to be introduced to the user. The second image is how I want it to look when the user clicks on the cart button… once they do I want the objects to scatter around the page… I want the user to be able to dress up the characters with the items in the clothes folder."*
- [React docs: Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Vite docs: Deploying to GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and [Document.elementsFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint)
