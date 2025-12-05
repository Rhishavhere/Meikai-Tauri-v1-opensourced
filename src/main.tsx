import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import TitleBarPage from "./components/TitleBar";
import "./index.css";

// Simple routing based on URL path
function Router() {
  const path = window.location.pathname;
  
  if (path === '/titlebar') {
    return <TitleBarPage />;
  }
  
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
