import { useState } from "react";

function SummaryWidget({ summary }) {
    const [expanded, setExpanded] = useState(false);

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