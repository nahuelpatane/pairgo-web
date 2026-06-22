import { useState, useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import BackpackerProfile from "./pages/BackpackerProfile";
import ManagerProfile from "./pages/ManagerProfile";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("landing");
  const didInit = useRef(false);

  // Once auth resolves on first load, send authenticated users straight to their profile
  useEffect(() => {
    if (loading || didInit.current) return;
    didInit.current = true;
    if (user) setView("profile");
  }, [loading, user]);

  // Admin panel — independent from user auth
  if (window.location.pathname === "/admin") {
    return <AdminPanel />;
  }

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0a0a08",
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{
          width: 28, height: 28,
          border: "2.5px solid rgba(232,101,74,.25)",
          borderTopColor: "#e8654a",
          borderRadius: "50%",
          animation: "spin .8s linear infinite",
        }} />
      </div>
    );
  }

  const goToProfile = () => setView("profile");
  const goToLanding = () => setView("landing");

  if (view === "profile" && user) {
    if (user.role === "manager") return <ManagerProfile onBack={goToLanding} />;
    return <BackpackerProfile onBack={goToLanding} />;
  }

  return <LandingPage onViewProfile={goToProfile} onLoginSuccess={goToProfile} />;
}
