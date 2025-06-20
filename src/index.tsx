import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { App } from "./App";

const container = document.getElementById("root");
const root = createRoot(container!); // The '!' tells TypeScript this won't be null
root.render(<App />);
