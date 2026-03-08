const TERMINALS_API_URL =
  import.meta.env.VITE_TERMINALS_API_URL || "/api/terminals";

export async function createComponent({ terminalId, name, type, isActive }) {
  const response = await fetch(
    `${TERMINALS_API_URL}/${terminalId}/components`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, isActive }),
    },
  );
  if (!response.ok) {
    throw new Error(`Create component failed with status ${response.status}`);
  }
  return response.json();
}

export async function deleteComponent(componentId) {
  const response = await fetch(`/api/components/${componentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete component failed with status ${response.status}`);
  }
  return true;
}

const AI_LAYOUTS_URL = "/api/ai/terminal-layouts";

export async function uploadLayoutImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(AI_LAYOUTS_URL, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
  return response.json();
}

export async function getLayoutAnalysis(jobId) {
  const response = await fetch(
    `${AI_LAYOUTS_URL}/${encodeURIComponent(jobId)}`,
  );
  if (!response.ok) {
    throw new Error(`Get analysis failed with status ${response.status}`);
  }
  return response.json();
}

export async function commitLayout(jobId, { name, isActive, components }) {
  const response = await fetch(
    `${AI_LAYOUTS_URL}/${encodeURIComponent(jobId)}/commit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, isActive, components }),
    },
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Create component failed (${response.status}): ${errorBody}`,
    );
  }
  return response.json();
}
