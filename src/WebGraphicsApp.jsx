import { Routes, Route, NavLink, Navigate, useLocation } from "react-router";
import FirstTryScene from "./FirstTryScene.jsx";
import SharkScene from "./SharkScene.jsx";

export default function WebGraphicsApp() {
  const { pathname } = useLocation();
  // Entfernt ein eventuelles /shark oder /first-try am Ende, um die saubere Basis-URL zu erhalten
  const basePath = pathname.replace(/\/(shark|first-try)\/?$/, "");

  const linkStyle = ({ isActive }) => ({
    padding: "6px 14px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
    backgroundColor: isActive ? "#0ea5e9" : "#e2e8f0",
    color: isActive ? "#ffffff" : "#1e293b",
  });

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <NavLink to={`${basePath}/shark`} style={linkStyle}>
          Shark (Hai-Spirale)
        </NavLink>
        <NavLink to={`${basePath}/first-try`} style={linkStyle}>
          First Try
        </NavLink>
      </nav>

      <Routes>
        <Route index element={<Navigate to="shark" replace />} />
        <Route path="first-try" element={<FirstTryScene />} />
        <Route path="shark" element={<SharkScene />} />
      </Routes>
    </div>
  );
}
