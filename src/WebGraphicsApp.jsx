// app/external/web-graphics/src/WebGraphicsApp.jsx
import { Routes, Route, NavLink, Navigate } from "react-router";
import FirstTryPage from "./pages/FirstTryPage.jsx"; // or your existing component
import SharkPage from "./pages/SharkPage.jsx";       // or your existing component

export default function WebGraphicsApp() {
  return (
    <div className="web-graphics-wrapper">
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <NavLink to="first-try">First Try</NavLink>
        <NavLink to="shark">Shark</NavLink>
      </nav>

      <Routes>
        {/* Default to first-try when visiting /projects/web-graphics */}
        <Route index element={<Navigate to="first-try" replace />} />
        <Route path="first-try" element={<FirstTryPage />} />
        <Route path="shark" element={<SharkPage />} />
      </Routes>
    </div>
  );
}
