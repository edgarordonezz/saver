import { useEffect, useState } from "react";
import { authFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import AddHabitForm from "./AddHabitForm";
import HabitRow from "./HabitRow";

function Dashboard() {
    const [habits, setHabits] = useState([]);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);
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

    const fetchSummary = async () => {
        try {
            const res = await authFetch("http://localhost:8000/summary/");
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch {
            // summary is supplementary to the main list, fail silently
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [refreshCount]);

    const handleDelete = async (habitId) => {
        try {
            const res = await authFetch(`http://localhost:8000/habits/${habitId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to delete habit");
            }
            fetchHabits();
        } catch (err) {
            setError(err.message);
        }
    };

    // lookup so each HabitRow can get its own real streak/skip stats
    const habitStatsById = {};
    if (summary) {
        summary.habits.forEach((h) => {
            habitStatsById[h.habit_id] = h;
        });
    }
    const bestStreakHabit = summary
        ? summary.habits.reduce(
            (best, h) => (h.longest_streak > (best?.longest_streak ?? -1) ? h : best),
            null
        )
        : null;
    const bestStreak = bestStreakHabit?.longest_streak ?? 0;

    return (

        <div>
            <header className="app-header">
                <div className="brand">
                    <div className="brand-mark">S</div>
                    <div className="brand-name">Saver</div>
                </div>
                <button onClick={logout}>Log out</button>
            </header>

            <div className="page">
                <h1 className="greeting">Welcome back</h1>
                {summary && (
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total saved</div>
                            <div className="stat-value">
                                ${summary.total_saved.toFixed(2)}
                            </div>
                            <div className="stat-sub">
                                {summary.total_times_skipped} times skipped
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Best streak</div>
                            <div className="stat-value">
                                {bestStreak} {bestStreak === 1 ? "day" : "days"}
                            </div>
                            <div className="stat-sub">across all habits</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Habits tracked</div>
                            <div className="stat-value">{habits.length}</div>
                            <div className="stat-sub">active</div>
                        </div>
                    </div>
                )}

                <div className="card-section">
                    <h2 className="card-title">Your habits</h2>
                    <AddHabitForm onHabitAdded={fetchHabits} />
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {!loading &&
                        !error &&
                        (habits.length === 0 ? (
                            <p>No habits yet.</p>
                        ) : (
                            <div className="row-list">
                                {habits.map((habit) => (
                                    <HabitRow
                                        key={habit.id}
                                        habit={habit}
                                        stats={habitStatsById[habit.id]}
                                        onDelete={handleDelete}
                                        onEntryLogged={fetchHabits}
                                    />
                                ))}
                            </div>
                        ))}
                </div>

                {bestStreakHabit && bestStreak > 0 && (
                    <div className="insight">
                        <div className="insight-icon">💡</div>
                        <div>
                            <div className="insight-eyebrow">Insight</div>
                            <div className="insight-text">
                                Your strongest habit is <b>{bestStreakHabit.name}</b> — a{" "}
                                {bestStreak} {bestStreak === 1 ? "day" : "day"} streak worth{" "}
                                <b>${bestStreakHabit.total_saved.toFixed(2)}</b> so far.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;