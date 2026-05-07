import { Link } from "react-router-dom";

import AppRoutes from "./routes.jsx";
import { useAuth } from "../features/auth/services/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>GetaWay Web</h1>
        <nav>
          <Link to="/">Home</Link>
          {isAuthenticated ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </header>
      <main className="page-container">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
