import { useNavigate } from "react-router-dom";

import { useAuth } from "../services/AuthContext";
import { logout } from "../services/authService";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <section className="dashboard-card">
      <h2>Welcome to GetaWay</h2>
      <p>Signed in as: {user?.email || user?.phoneNumber || "Unknown user"}</p>
      <p>
        Authentication is ready. Next phase will ask for location permission and
        map integration.
      </p>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </section>
  );
}

export default DashboardPage;
