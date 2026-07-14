/**
 * SmartWish AI Frontend API Service
 */

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

export async function generatePostersApi(studentData, photoFile, apiKey) {
  const formData = new FormData();
  
  // Append text fields
  formData.append('name', studentData.name);
  formData.append('department', studentData.department);
  formData.append('year', studentData.year);
  formData.append('rollNo', studentData.rollNo);
  formData.append('birthdayQuote', studentData.birthdayQuote || '');
  if (apiKey) {
    formData.append('apiKey', apiKey);
  }
  
  // Append file
  formData.append('photo', photoFile);

  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate birthday posters.');
  }

  return await response.json();
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Backend health check failed:', err);
  }
  return null;
}
