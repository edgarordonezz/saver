import { authFetch } from "../api";
import { useState, useEffect } from "react";

function HabitRow({ habit, onDelete, onEntryLogged }) {
    const [showMissedForm, setShowMissedForm] = useState(false);
    const [missedDate, setMissedDate] = useState("");
    const [amount, setAmount] = useState(habit.typical_cost);
    const [error, setError] = useState("");
    const [entries, setEntries] = useState([]);

    const fetchEntries = async () => {
        try {
            const res = await authFetch(
                `http://localhost:8000/habits/${habit.id}/entries/`
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
                `You already logged an entry for ${habit.name} on ${date}. Log another one anyway?`
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
                }
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

    const todayStr = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    return (
        <tr>
            <td>{habit.name}</td>
            <td>${habit.typical_cost.toFixed(2)}</td>
            <td>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    step="0.01"
                    style={{ width : "70px"}}
                />
                <button onClick={() => logEntry(todayStr)}>Skipped today</button>
                <button onClick={() => setShowMissedForm(!showMissedForm)}>
                    Log a missed day
                </button>
                <button onClick={() => onDelete(habit.id)}>Delete</button>

                {showMissedForm && (
                    <div>
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
            </td>
        </tr>
    );
}

export default HabitRow;