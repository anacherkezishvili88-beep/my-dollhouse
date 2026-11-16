# My Dollhouse

This is an interactive collage dollhouse, and a continuation of my autobiographical p5.js game *Ana's World*. You open a shopping cart full of cut-outs I collected (furniture, posters, floors, walls, props, clothes, and my friends and me as stick-figure dolls), pick a section to throw its items around the page, and then drag them into the room to build a home. Clothes dropped onto a character stay on them, so you can dress everyone up.

## How to Play

- Click the cart in the top left to see the sections.
- Click a section and its items scatter around the page.
- Drag an item into the room. Anything in the room can be dragged around again, and whatever you move last goes in front.
- Drop clothes onto a character to dress them, and drag them off to take them off.
- Scroll over an item to make it bigger or smaller.
- `erase`: turn it on and click things to remove them, or drag something onto the button.
- `ctrl+z`: undo (the button or the keyboard shortcut).

The room is saved in `localStorage`, so it's still there when you come back.

## How It Works

The project uses React and Vite, set up the same way as the class demo.

- `src/items.json` has every item: its section, image file, how wide it's drawn, and the box around the visible part of the image (some of my PNGs have a lot of empty space around them).
- `src/Dollhouse.jsx` is the main component. It keeps track of everything with `useState`:
  - `pieces`: everything in the room, with its position, size and layer. Clothes being worn store which character they're on.
  - `history`: older versions of `pieces`, for undo.
  - `view`, `section` and `scattered`: which screen is open and where the scattered items landed.
  - `erasing`: whether erase mode is on.
- `src/Menus.jsx` has the cart screen and the scatter screen.
- `src/Cutout.jsx` draws an image, and a piece in the room (characters also draw the clothes they're wearing).
- `src/helpers.js` has the functions the components share: finding items, moving and layering pieces, putting clothes on and off, the scatter layout, and checking which image is under the mouse.
- `src/style.css` has all the styles.
- All of my images are in `public/dollhouseAssets`, sorted into folders by section.

## Using This Repository

```bash
npm install
npm run dev
```

It's published with the `deploy.yaml` GitHub Actions workflow from the class demo (Settings → Pages → Source → GitHub Actions).

## Resources and AI Use

- The design (Figma prototypes) and all the images are mine.
- The project setup, `main.jsx`, the `localStorage` + `useEffect` pattern and the `deploy.yaml` workflow follow the class react-demo.
- I used Claude (Anthropic) to help me plan the idea and write the code: the drag and drop, dressing up the characters, the scatter layout, undo, and checking which image is under the mouse. I then reorganized the code to follow the structure and style of the class demo. Some of the prompts I used:
  - "I want it for the user to be able to move things around inside the space… maybe I can have a scan of myself in the middle and the user could dress me up"
  - "The first image is how I want the website to be introduced to the user. The second image is how I want it to look like when the user clicks on the cart button… I want the objects to scatter around the page… I want the user to be able to dress up the characters with the items in the clothes folder"
  - "help me edit the code I have so far to look similar to my instructor's, at least formatting wise"
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and [Document.elementsFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint)
