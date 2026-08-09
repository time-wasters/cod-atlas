import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-sans/latin-500.css";
import Home from "../app/page";
import "../app/globals.css";

document.documentElement.style.setProperty("--font-geist-sans", "Arial, sans-serif");
document.documentElement.style.setProperty("--font-geist-mono", "ui-monospace, monospace");

const root = document.getElementById("root");
if (!root) throw new Error("Static application root is missing");

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
