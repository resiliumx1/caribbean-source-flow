import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove the static gate skeleton once React takes over
const skeleton = document.getElementById("gate-skeleton");
if (skeleton) skeleton.remove();

createRoot(document.getElementById("root")!).render(<App />);
