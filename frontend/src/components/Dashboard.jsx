import { useEffect, useState } from "react";
import { authFetch } from "../api";
import { useAuth } from "../context/AuthContext"
import AddHabitForm from "./AddHabitForm";

function Dashboard() {
    const [habits, setHabits] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const {logout} = useAuth();

    const fetchHabits = async () => {
        try {
            const res = await authFetch("http://localhost:8000/habits/");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to load habits");
            }
            const data = await res.json();
            setHabits(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    return (
        <div>
            <button onClick={logout}>Log out</button>
            <AddHabitForm onHabitAdded={fetchHabits} />
            <h1>Your Habits</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
                habits.length === 0 ? (
                    <p>No habits yet.</p>
                ) : (
                    <ul>
                        {habits.map((habit) => (
                            <li key={habit.id}>
                                {habit.name} — ${habit.typical_cost.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    );
}

export default Dashboard;