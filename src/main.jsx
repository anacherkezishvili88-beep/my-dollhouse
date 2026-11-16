// Import the necessary function from the React library
import { createRoot } from "react-dom/client";

import { Dollhouse } from "./Dollhouse.jsx";

// The app lives inside the "app" div from index.html
let root = createRoot(document.getElementById("app"));

// Render the dollhouse component
root.render(<Dollhouse />);
