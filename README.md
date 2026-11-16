# My Dollhouse

This is an interactive collage dollhouse, and a conceptual continuation of my autobiographical p5.js game *Ana's World*. You open a shopping cart full of cut-outs I collected (furniture, posters, floors, walls, props, clothes, and my friends and me as stick-figure dolls), that the user can drag them into the room to build a home. You can also dress the characters, inspired by the dressup games I used to play in my childhood. 

## How to Play

- Click the cart in the top left to see the sections
- Click a section and take a look at all the items
- Drag an item into the room, change scale however you want, and place it wherever you'd like
- Drop clothes onto a character to dress them, and drag them off to take them off
- Scroll over an item to make it bigger or smaller
- `erase`: turn it on and click things to remove them
- `ctrl+z`: undo

The room is saved in `localStorage`, so it's still there when you come back.

## How It Works

The project uses React and Vite

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

## Process and AI Use

- I created the UI and the design of the website all by myself. I used Figma to create the website protptypes: https://www.figma.com/design/iZBQz0fsgUG9tZAGP5BknU/Archive-UI?node-id=0-1&t=A6rf53xqF2mc42H1-1 
- I collected the website assets from Pinterest and my own images and doodles of stick figures
- The project setup, `main.jsx`, the `localStorage` + `useEffect` pattern and the `deploy.yaml` workflow follow the class react-demo.
- I used Claude AI to teach me how to do drag and drop, dress up the characters, and create the scatter layout in the menu. I also used AI to learn how to do checking which image is selected with the mouse
- I made sure to learn and understand all the code. I reorganized and edited it to how I wanted it. I also used AI to debug some issues like not being able to push changes to Github. 


 Some of the prompts I used:
 - "How do I use react to have the user interact with the website by being able to drag and drop items into the space" 
 - "How do I use js and react to dress up the characters and be able to select and drag and drop while saving how it looks like" 
 - "How do I make the scatter layout and animation for it" 
 - "i'm trying to commit changes in Github Desktop but it's not updating the website or showing up on github website in the actions section" 
