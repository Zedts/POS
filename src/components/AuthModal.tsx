import { useState, useEffect } from 'react';
import { X, Lock, User, Phone, MapPin, GraduationCap, BookOpen, CreditCard } from 'lucide-react';
import { loginAPI, registerAPI, registerCustomerAPI } from '../api/index';
import { toast } from 'react-toastify';
import AdminValidationModal from './AdminValidationModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (role: string, userData: any) => void;
}

function AuthModal({ isOpen, onClose, mode: initialMode, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Tab State (customer or employee)
  const [registerTab, setRegisterTab] = useState<'customer' | 'employee'>('customer');
  const [adminValidationOpen, setAdminValidationOpen] = useState(false);
  const [adminValidated, setAdminValidated] = useState(false);

  // Login State
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  // Register State
  const [registerData, setRegisterData] = useState({
    nisn: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
    studentClass: 'X',
    major: 'RPL',
  });

  // Sync mode with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccess('');
      setRegisterTab('customer'); // Always start with customer tab
      setAdminValidated(false);
    }
  }, [isOpen, initialMode]);

  // Handle tab switch in register mode
  const handleRegisterTabChange = (tab: 'customer' | 'employee') => {
    if (tab === 'employee') {
      // Show admin validation popup immediately
      setAdminValidationOpen(true);
    } else {
      setRegisterTab('customer');
      setAdminValidated(false);
    }
  };

  // Handle admin validation success
  const handleAdminValidationSuccess = () => {
    setAdminValidationOpen(false);
    setAdminValidated(true);
    setRegisterTab('employee');
    toast.success('Validasi berhasil! Silakan isi form employee');
  };

  // Handle admin validation close
  const handleAdminValidationClose = () => {
    setAdminValidationOpen(false);
    setRegisterTab('customer'); // Return to customer tab
    setAdminValidated(false);
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!loginData.username || !loginData.password) {
      toast.error('Username dan password harus diisi');
      setLoading(false);
      return;
    }

    try {
      const response = await loginAPI(loginData.username, loginData.password);
      
      if (response.success) {
        // Store token in localStorage with 8 hour expiry
        const expiryTime = new Date().getTime() + (8 * 60 * 60 * 1000);
        localStorage.setItem('token', response.token);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userData', JSON.stringify(response.data));

        toast.success('Login berhasil! Mengalihkan...');
        setTimeout(() => {
          onSuccess(response.role, response.data);
          setLoading(false);
        }, 1000);
      } else {
        toast.error(response.message || 'Login gagal');
        setLoading(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!registerData.nisn || !registerData.username || !registerData.password || !registerData.fullName) {
      toast.error('NISN, username, password, dan nama lengkap harus diisi');
      setLoading(false);
      return;
    }

    // NISN validation: must be exactly 10 digits
    if (registerData.nisn.length !== 10 || !/^\d{10}$/.test(registerData.nisn)) {
      toast.error('NISN harus 10 digit angka');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        nisn: registerData.nisn,
        username: registerData.username,
        password: registerData.password,
        fullName: registerData.fullName,
        phone: registerData.phone,
        address: registerData.address,
        studentClass: registerData.studentClass,
        major: registerData.major,
      };

      // Determine which API to call based on register tab
      const response = registerTab === 'customer'
        ? await registerCustomerAPI(payload)
        : await registerAPI(payload);

      if (response.success) {
        const roleText = registerTab === 'customer' ? 'Customer' : 'Employee';
        toast.success(`Registrasi ${roleText} berhasil! Mengalihkan...`);
        
        // Auto-login after successful registration
        const loginResponse = await loginAPI(registerData.username, registerData.password);
        
        if (loginResponse.success) {
          // Store token in localStorage with 8 hour expiry
          const expiryTime = new Date().getTime() + (8 * 60 * 60 * 1000);
          localStorage.setItem('token', loginResponse.token);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
          localStorage.setItem('userRole', loginResponse.role);
          localStorage.setItem('userData', JSON.stringify(loginResponse.data));

          setTimeout(() => {
            onSuccess(loginResponse.role, loginResponse.data);
            setLoading(false);
          }, 1500);
        }
      } else {
        toast.error(response.message || 'Registrasi gagal');
        setLoading(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat registrasi');
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  return (
    <>
      {/* Admin Validation Modal */}
      <AdminValidationModal
        isOpen={adminValidationOpen}
        onClose={handleAdminValidationClose}
        onValidationSuccess={handleAdminValidationSuccess}
      />

      {/* Main Auth Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div 
          className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Login' : 'Register'}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:opacity-80 transition-opacity"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/80 text-sm mt-2">
              {mode === 'login' 
                ? 'Masuk ke akun POS Pro Anda' 
                : 'Daftar sebagai customer atau employee'}
            </p>
          </div>

          {/* Register Tabs (Only show in register mode) */}
          {mode === 'register' && (
            <div className="flex border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <button
                type="button"
                onClick={() => handleRegisterTabChange('customer')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  registerTab === 'customer'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleRegisterTabChange('employee')}
                className={`flex-1 py-3 px-4 font-medium transition-colors relative ${
                  registerTab === 'employee'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Employee
                {adminValidated && registerTab === 'employee' && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Tervalidasi
                  </span>
                )}
              </button>
            </div>
          )}

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
              <p className="text-sm">{success}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  NISN
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={registerData.nisn}
                    onChange={(e) => setRegisterData({ ...registerData, nisn: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan NISN"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Kelas
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    <select
                      value={registerData.studentClass}
                      onChange={(e) => setRegisterData({ ...registerData, studentClass: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--color-surface)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      required
                    >
                      <option value="X">X</option>
                      <option value="XI">XI</option>
                      <option value="XII">XII</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Jurusan
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    <select
                      value={registerData.major}
                      onChange={(e) => setRegisterData({ ...registerData, major: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--color-surface)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      required
                    >
                      <option value="RPL">RPL</option>
                      <option value="DKV1">DKV1</option>
                      <option value="DKV2">DKV2</option>
                      <option value="BR">BR</option>
                      <option value="MP">MP</option>
                      <option value="AK">AK</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Nomor Telepon (Opsional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Alamat (Opsional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <textarea
                    value={registerData.address}
                    onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 resize-none"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan alamat"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Masukkan password (min. 6 karakter)"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Konfirmasi password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {mode === 'login' ? 'Daftar disini' : 'Login disini'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default AuthModal;
