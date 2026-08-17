import { useState } from "react";
import { authFetch } from "../api";

function AddHabitForm({ onHabitAdded }) {
    const [name, setName] = useState("");
    const [typicalCost, setTypicalCost] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch("http://localhost:8000/habits/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, typical_cost: parseFloat(typicalCost) }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to add habit");
            }
            setName("");
            setTypicalCost("");
            onHabitAdded?.();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form className="add-habit-form" onSubmit={handleSubmit}>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Habit name"
            />
            <input
                type="number"
                value={typicalCost}
                onChange={(e) => setTypicalCost(e.target.value)}
                placeholder="Typical Cost"
                step="0.01"
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit">Add Habit</button>
        </form>
    );
}

export default AddHabitForm;