import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginAPI } from '../api';

interface AdminValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: () => void;
}

function AdminValidationModal({ isOpen, onClose, onValidationSuccess }: AdminValidationModalProps) {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!adminUsername || !adminPassword) {
      toast.error('Username dan password admin harus diisi');
      setLoading(false);
      return;
    }

    try {
      const response = await loginAPI(adminUsername, adminPassword);

      if (response.success && response.role === 'admin') {
        toast.success('Validasi admin berhasil');
        setAdminUsername('');
        setAdminPassword('');
        onValidationSuccess();
      } else {
        toast.error('Hanya admin yang dapat melakukan validasi');
        setLoading(false);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Validasi admin gagal');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAdminUsername('');
    setAdminPassword('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div 
        className="rounded-xl shadow-2xl w-full max-w-md relative"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 transition-opacity disabled:opacity-50 z-10"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div 
          className="p-6 border-b" 
          style={{ 
            backgroundColor: 'var(--color-primary)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <h2 className="text-2xl font-bold text-white">Validasi Admin</h2>
          <p className="text-sm text-white/80 mt-1">
            Masukkan kredensial admin untuk melanjutkan registrasi employee
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleValidate} className="p-6 space-y-4">
          {/* Admin Username */}
          <div>
            <label 
              htmlFor="adminUsername" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Username Admin
            </label>
            <input
              type="text"
              id="adminUsername"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--color-surface)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="Masukkan username admin"
              autoComplete="off"
            />
          </div>

          {/* Admin Password */}
          <div>
            <label 
              htmlFor="adminPassword" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Password Admin
            </label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--color-surface)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="Masukkan password admin"
              autoComplete="off"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Memvalidasi...' : 'Validasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminValidationModal;
