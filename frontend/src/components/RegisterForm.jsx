import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function RegisterForm({ onRegistered }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")
    const { register } = useAuth()

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            await register(email, password);
            onRegistered?.();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {error && <p>{error}</p>}
            <button type="submit">Register</button>
        </form>
    );
}

export default RegisterForm;