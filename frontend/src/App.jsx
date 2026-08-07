import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";

function App() {

  const [showLogin, setShowLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return ( 
    <div>
      {showLogin ? (
        <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
      ) : (
        <RegisterForm 
          onRegistered={() => setShowLogin(true)}
          onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
}

export default App;
