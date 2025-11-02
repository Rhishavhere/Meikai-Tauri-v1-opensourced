import React from "react";
import ReactDOM from "react-dom/client";
import BrowserWindow from "./BrowserWindow";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserWindow />
  </React.StrictMode>,
);
