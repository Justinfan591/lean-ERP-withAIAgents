import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const qc = new QueryClient();

// // Start MSW in the background; don't block render.
// if (import.meta.env.DEV) {
//   import("./mocks/browser").then(({ worker }) => {
//     worker.start({ onUnhandledRequest: "bypass" });
//   });
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
