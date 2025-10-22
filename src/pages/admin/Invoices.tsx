import { useEffect } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';

function Invoices() {
  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Halaman Invoice Management
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Invoices;
