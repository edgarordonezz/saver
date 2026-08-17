import { authFetch } from "../api";
import { useState, useEffect } from "react";

function HabitRow({ habit, stats, onDelete, onEntryLogged }) {
    const [showMissedForm, setShowMissedForm] = useState(false);
    const [missedDate, setMissedDate] = useState("");
    const [amount, setAmount] = useState(habit.typical_cost);
    const [error, setError] = useState("");
    const [entries, setEntries] = useState([]);

    const fetchEntries = async () => {
        try {
            const res = await authFetch(
                `http://localhost:8000/habits/${habit.id}/entries/`,
            );
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch {
            // fail silently here
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const logEntry = async (date) => {
        const alreadyLogged = entries.some((e) => e.date === date);
        if (alreadyLogged) {
            const confirmed = window.confirm(
                `You already logged an entry for ${habit.name} on ${date}. Log another one anyway?`,
            );
            if (!confirmed) return;
        }

        try {
            const res = await authFetch(
                `http://localhost:8000/habits/${habit.id}/entries/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date,
                        skipped: true,
                        amount,
                    }),
                },
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to log entry");
            }
            onEntryLogged();
            fetchEntries();
            setShowMissedForm(false);
            setMissedDate("");
            setAmount(habit.typical_cost);
        } catch (err) {
            setError(err.message);
        }
    };

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    return (
        <div className="row">
            <div className="row-top">
                <div className="row-main">
                    <div className="row-name">{habit.name}</div>
                    <div className="row-cost">${habit.typical_cost.toFixed(2)} typical</div>
                </div>

                {stats
                    ? stats.longest_streak > 0 && (
                        <span className="badge">
                            🔥 {stats.longest_streak}{" "}
                            {stats.longest_streak === 1 ? "day" : "days"}
                        </span>
                    )
                    : entries.length > 0 && (
                        <span className="badge">
                            🔥 {entries.length} {entries.length === 1 ? "skip" : "skips"}
                        </span>
                    )}

                <div className="row-actions">
                    <input
                        className="amount-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        step="0.01"
                    />
                    <button className="primary" onClick={() => logEntry(todayStr)}>
                        Skipped today
                    </button>
                    <button onClick={() => setShowMissedForm(!showMissedForm)}>
                        Log missed
                    </button>
                    <button className="danger" onClick={() => onDelete(habit.id)}>
                        Delete
                    </button>
                </div>
            </div>

            {showMissedForm && (
                <div className="missed-form">
                    <input
                        type="date"
                        value={missedDate}
                        onChange={(e) => setMissedDate(e.target.value)}
                        max={todayStr}
                    />
                    <button onClick={() => logEntry(missedDate)} disabled={!missedDate}>
                        Confirm
                    </button>
                </div>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default HabitRow;
