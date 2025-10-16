// Check if session is valid
export const isSessionValid = (): boolean => {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('tokenExpiry');
  
  if (!token || !expiry) {
    return false;
  }
  
  const now = new Date().getTime();
  const expiryTime = parseInt(expiry);
  
  if (now > expiryTime) {
    clearSession();
    return false;
  }
  
  return true;
};

// Clear session data
export const clearSession = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
};

// Get token for API requests
export const getToken = (): string | null => {
  if (isSessionValid()) {
    return localStorage.getItem('token');
  }
  return null;
};

// Get user role
export const getUserRole = (): string | null => {
  if (isSessionValid()) {
    return localStorage.getItem('userRole');
  }
  return null;
};

// Get user data
export const getUserData = (): unknown | null => {
  if (isSessionValid()) {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  }
  return null;
};
