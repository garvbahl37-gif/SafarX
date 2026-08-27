const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback to local server for development


export const getDocuments = async (token) => {
  const res = await fetch(`${API_BASE}/documents`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
};

export const uploadDocument = async (formData, token) => {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
};

export const deleteDocument = async (id, token) => {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
};
