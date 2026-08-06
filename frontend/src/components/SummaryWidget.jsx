import { useState, useEffect } from "react";
import { authFetch } from "../api";

function SummaryWidget({ refreshTrigger }) {
    const [summary, setSummary] = useState(null)
    const [expanded, setExpanded] = useState(false)
    const [error, setError] = useState("")

    const fetchSummary = async () => {
        try {
            const res = await authFetch(`http://localhost:8000/summary/`);
            if (!res.ok) {
                const err = await res.json().catch(() => ([]));
                throw new Error(err.detail || "Failed to load summary");
            }
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [refreshTrigger]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!summary) return null;

    const bestStreak = summary.habits.reduce(
        (max, h) => Math.max(max, h.longest_streak),
        0
    );

    return (
        <div className="summary-widget">
            <div className="summary-collapsed" onClick={() => setExpanded(!expanded)}>
                <span>💰 ${summary.total_saved.toFixed(2)} saved</span>
                <span>🔥 {bestStreak} day streak</span>
                <span>{expanded ? "▲" : "▼"}</span>
            </div>

            {expanded && (
                <div className="summary-expanded">
                    <p>Total times skipped: {summary.total_times_skipped}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Habit</th>
                                <th>Saved</th>
                                <th>Times Skipped</th>
                                <th>Longest Streak</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.habits.map((h) => (
                                <tr key={h.habit_id}>
                                    <td>{h.name}</td>
                                    <td>${h.total_saved.toFixed(2)}</td>
                                    <td>{h.times_skipped}</td>
                                    <td>{h.longest_streak}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SummaryWidget;