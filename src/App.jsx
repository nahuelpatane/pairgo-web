import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import BackpackerProfile from "./pages/BackpackerProfile";
import ManagerProfile from "./pages/ManagerProfile";

export default function App() {
  const { user } = useAuth();
  const [view, setView] = useState("landing");

  const goToProfile = () => setView("profile");
  const goToLanding = () => setView("landing");

  if (view === "profile" && user) {
    if (user.role === "manager") {
      return <ManagerProfile onBack={goToLanding} />;
    }
    return <BackpackerProfile onBack={goToLanding} />;
  }

  return <LandingPage onViewProfile={goToProfile} onLoginSuccess={goToProfile} />;
}
