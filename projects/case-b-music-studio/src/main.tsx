import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// `import.meta.env.BASE_URL` mirrors `base` from vite.config.ts. In dev it's
// "/", on GitHub Pages it's "/Civic-AI-Github-Repository/". Strip any trailing
// slash so React Router doesn't double up when generating Link hrefs.
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
