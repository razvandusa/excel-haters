// src/api/terminals.js
const TERMINALS_API_URL =
  import.meta.env.VITE_TERMINALS_API_URL || "/api/terminals";

export function normalizeTerminal(terminal) {
  return {
    id: terminal.id,
    name: terminal.name,
    type: String(terminal.type ?? "").toLowerCase(),
    isActive: Boolean(terminal.isActive),
  };
}

export async function fetchTerminals(signal) {
  const response = await fetch(TERMINALS_API_URL, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeTerminal) : [];
}

export async function deleteTerminal(id) {
  const response = await fetch(`${TERMINALS_API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete failed with status ${response.status}`);
  }
  return true;
}

export async function updateTerminalStatus(id, isActive) {
  const response = await fetch(`${TERMINALS_API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) {
    throw new Error(`Update failed with status ${response.status}`);
  }
  return true;
}

export async function createTerminal({ name, isActive }) {
  const response = await fetch("/api/terminals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, isActive }),
  });
  if (!response.ok) throw new Error("Failed to create terminal");
  return response.json();
}
