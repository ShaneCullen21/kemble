import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { asset } from "./asset.js";
import "./styles.css";

document.documentElement.style.setProperty(
  "--dot-pattern",
  `url("${asset("assets/ed19e.png")}")`,
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
