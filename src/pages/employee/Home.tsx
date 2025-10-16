import { useEffect } from 'react';
import { isSessionValid, clearSession, getUserData } from '../../utils/auth';

function EmployeeHome() {
  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }

    const userData = getUserData();
    console.log('Employee User Data:', userData);
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Employee Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Logout
          </button>
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Selamat datang di halaman employee POS Pro
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeHome;
