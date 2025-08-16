
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDeployment } from "./utils/deploymentConfig";

// Initialize deployment configuration
initializeDeployment().then((config) => {
  console.log('CampuzBuzz initialized successfully:', config.environment);
}).catch((error) => {
  console.error('Failed to initialize deployment:', error);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
