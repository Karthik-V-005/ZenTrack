import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ← THIS LINE IS CRITICAL

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
