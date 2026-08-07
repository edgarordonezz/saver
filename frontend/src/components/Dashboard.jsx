import { useEffect, useState } from "react";
import { authFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import AddHabitForm from "./AddHabitForm";
import HabitRow from "./HabitRow";
import SummaryWidget from "./SummaryWidget";

function Dashboard() {
    const [habits, setHabits] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0)
    const { logout } = useAuth();


    const fetchHabits = async () => {
        try {
            const res = await authFetch("http://localhost:8000/habits/");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to load habits");
            }
            const data = await res.json();
            setHabits(data);
            setRefreshCount((c) => c + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleDelete = async (habitId) => {
        try {
            const res = await authFetch(`http://localhost:8000/habits/${habitId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to delete habit");
            }
            fetchHabits(); // re-fetch so the list updates
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <button onClick={logout}>Log out</button>
            </div>
            <AddHabitForm onHabitAdded={fetchHabits} />
            <h1>Your Habits</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading &&
                !error &&
                (habits.length === 0 ? (
                    <p>No habits yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Habit</th>
                                <th>Typical Cost</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map((habit) => (
                                <HabitRow
                                    key={habit.id}
                                    habit={habit}
                                    onDelete={handleDelete}
                                    onEntryLogged={fetchHabits}
                                />
                            ))}
                        </tbody>
                    </table>
                ))}
                <SummaryWidget refreshTrigger={refreshCount}/>
        </div>
    );
}

export default Dashboard;
