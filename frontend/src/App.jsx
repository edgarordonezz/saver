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
      {showLogin ? <LoginForm /> : <RegisterForm onRegistered={() => setShowLogin(true)} />}
      <button onClick={() => setShowLogin(!showLogin)}>
        {showLogin ? "Need an account? Register" : "Already have an account? Log in"}
      </button>
    </div>
  );
}

export default App;
