const BASE_URL = "http://localhost:8000";

// ---------- AUTH ----------

async function createUser(email, password) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  console.log("created user:", data);
  return data;
}

async function login(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  console.log("login response:", data);
  return data.access_token;
}

// ---------- HABITS ----------

async function getHabits(token) {
  const response = await fetch(`${BASE_URL}/habits/`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await response.json();
  console.log("all habits:", data);
  return data;
}

async function createHabit(token, name, typicalCost) {
  const response = await fetch(`${BASE_URL}/habits/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, typical_cost: typicalCost }),
  });
  const data = await response.json();
  console.log("created habit:", data);
  return data;
}

async function getHabitById(token, habitId) {
  const response = await fetch(`${BASE_URL}/habits/${habitId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await response.json();
  console.log("got habit:", data);
  return data;
}

async function updateHabit(token, habitId, name, typicalCost) {
  const response = await fetch(`${BASE_URL}/habits/${habitId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, typical_cost: typicalCost }),
  });
  const data = await response.json();
  console.log("updated habit:", data);
  return data;
}

async function deleteHabit(token, habitId) {
  const response = await fetch(`${BASE_URL}/habits/${habitId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  console.log("delete status:", response.status);
}

// ---------- ENTRIES ----------

async function createEntry(token, habitId, date, skipped, amount) {
  const response = await fetch(`${BASE_URL}/habits/${habitId}/entries/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ date, skipped, amount }),
  });
  const data = await response.json();
  console.log("created entry:", data);
  return data;
}

async function getEntries(token, habitId) {
  const response = await fetch(`${BASE_URL}/habits/${habitId}/entries/`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await response.json();
  console.log("entries:", data);
  return data;
}

// ---------- SUMMARY ----------

async function getSummary(token) {
  const response = await fetch(`${BASE_URL}/summary`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await response.json();
  console.log("summary:", data);
  return data;
}

// ---------- RUN ----------

async function run() {
  // Only needed the first time — after that, this user already exists
  // and will just log "Email already registered", which is fine to ignore.
  await createUser("new@example.com", "new");

  const token = await login("new@example.com", "new");
  console.log("got token:", token);

  const habit = await createHabit(token, "coffee", 5.0);
  const entry = await createEntry(token, habit.id, "2026-07-31", true, 5.0);
  const entries = await getEntries(token, habit.id);
  const summary = await getSummary(token);
  const updatedHabit = await updateHabit(token, habit.id, "coffee", 6.0);
  await deleteHabit(token, habit.id);
}

run();