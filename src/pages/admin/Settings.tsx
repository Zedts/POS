import { useEffect, useState, useRef } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  getAdminProfileAPI, 
  updateAdminProfileAPI,
  downloadBackupAPI,
  resetDatabaseAPI,
  restoreDatabaseAPI
} from '../../api';
import { Sun, Moon, User, Database, FileText, CreditCard, Upload, Download, RotateCcw } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface AdminProfile {
  id: number;
  username: string;
  full_name: string;
  created_date: string;
  updated_date: string;
}

function Settings() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Profile Edit States
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Database Management States
  const [resetting, setResetting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    
    fetchProfile();
    loadTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      // Only apply if user is using system theme
      if (savedTheme === 'system' || !savedTheme) {
        applyTheme('system');
      }
    };
    
    // Add listener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
    
    // Cleanup listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system if no saved preference
      setTheme('system');
      applyTheme('system');
    }
  };

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    // If system, detect from browser preference
    let actualTheme: 'light' | 'dark';
    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = selectedTheme;
    }
    
    if (actualTheme === 'dark') {
      root.style.setProperty('--color-primary', '#019f63');
      root.style.setProperty('--color-primary-dark', '#1F2937');
      root.style.setProperty('--color-text-primary', '#F9FAFB');
      root.style.setProperty('--color-text-secondary', '#a4e6cc');
      root.style.setProperty('--color-background', '#111827');
      root.style.setProperty('--color-surface', '#1F2937');
      root.style.setProperty('--color-border', '#374151');
      root.style.colorScheme = 'dark';
    } else {
      root.style.setProperty('--color-primary', '#019f63');
      root.style.setProperty('--color-primary-light', '#DDF6ED');
      root.style.setProperty('--color-text-primary', '#1F2937');
      root.style.setProperty('--color-text-secondary', '#4B5563');
      root.style.setProperty('--color-background', '#FFFFFF');
      root.style.setProperty('--color-surface', '#F8F9FA');
      root.style.setProperty('--color-border', '#E5E7EB');
      root.style.colorScheme = 'light';
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getAdminProfileAPI();
      if (response.success) {
        setProfile(response.data);
        setUsername(response.data.username);
        setFullName(response.data.full_name);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal mengambil data profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (profile) {
      setUsername(profile.username);
      setFullName(profile.full_name);
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveProfile = async () => {
    if (!username || !fullName) {
      toast.error('Username dan Full Name wajib diisi');
      return;
    }
    
    if (newPassword) {
      if (!currentPassword) {
        toast.error('Current password wajib diisi untuk mengganti password');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Password baru dan konfirmasi password tidak cocok');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('Password minimal 6 karakter');
        return;
      }
    }
    
    try {
      setSavingProfile(true);
      const response = await updateAdminProfileAPI({
        username,
        fullName,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword ? newPassword : undefined
      });
      
      if (response.success) {
        toast.success('Profile berhasil diupdate');
        await fetchProfile();
        setEditMode(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // If password changed, logout after 2 seconds
        if (newPassword) {
          setTimeout(() => {
            clearSession();
            window.location.href = '/';
          }, 2000);
          toast.info('Anda akan logout dalam 2 detik...');
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      toast.info('Downloading backup...');
      const blob = await downloadBackupAPI();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `script_backup_${new Date().getTime()}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Backup berhasil didownload');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal download backup');
    }
  };

  const handleResetDatabase = async () => {
    const confirm = window.confirm(
      'PERINGATAN: Tindakan ini akan menghapus SEMUA data dan mereset database ke kondisi awal!\n\nApakah Anda yakin ingin melanjutkan?'
    );
    
    if (!confirm) return;
    
    const doubleConfirm = window.confirm(
      'Konfirmasi kedua: Semua data akan hilang dan tidak dapat dikembalikan!\n\nLanjutkan reset database?'
    );
    
    if (!doubleConfirm) return;
    
    try {
      setResetting(true);
      const response = await resetDatabaseAPI();
      
      if (response.success) {
        toast.success('Database berhasil di-reset ke kondisi default');
        setTimeout(() => {
          clearSession();
          window.location.href = '/';
        }, 2000);
        toast.info('Anda akan logout dalam 2 detik...');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal reset database');
    } finally {
      setResetting(false);
    }
  };

  const handleRestoreFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.sql')) {
      toast.error('File harus berformat .sql');
      return;
    }
    
    const confirm = window.confirm(
      'PERINGATAN: Restore database akan menghapus SEMUA data saat ini!\n\nApakah Anda yakin ingin melanjutkan?'
    );
    
    if (!confirm) {
      event.target.value = '';
      return;
    }
    
    try {
      setRestoring(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const sqlContent = e.target?.result as string;
        
        try {
          const response = await restoreDatabaseAPI(sqlContent);
          
          if (response.success) {
            toast.success('Database berhasil di-restore dari file backup');
            setTimeout(() => {
              clearSession();
              window.location.href = '/';
            }, 2000);
            toast.info('Anda akan logout dalam 2 detik...');
          }
        } catch (error: unknown) {
          const err = error as { message?: string };
          toast.error(err.message || 'Gagal restore database');
        } finally {
          setRestoring(false);
          event.target.value = '';
        }
      };
      
      reader.onerror = () => {
        toast.error('Gagal membaca file');
        setRestoring(false);
        event.target.value = '';
      };
      
      reader.readAsText(file);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal membaca file');
      setRestoring(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Settings
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Kelola pengaturan sistem dan profile Anda
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme Settings Card */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex items-center mb-4">
                {theme === 'light' ? (
                  <Sun className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                ) : theme === 'dark' ? (
                  <Moon className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Sun className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                )}
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Theme Settings
                </h2>
              </div>
              
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Pilih tema tampilan aplikasi
              </p>
              
              <div className="space-y-3">
                {/* Light Mode Option */}
                <div 
                  onClick={() => {
                    setTheme('light');
                    localStorage.setItem('theme', 'light');
                    applyTheme('light');
                    toast.success('Theme changed to Light mode');
                  }}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                  style={{ 
                    backgroundColor: theme === 'light' ? 'var(--color-primary)' : 'var(--color-background)',
                    border: `2px solid ${theme === 'light' ? 'var(--color-primary)' : 'var(--color-border)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sun size={24} style={{ color: theme === 'light' ? 'white' : 'var(--color-text-secondary)' }} />
                    <div>
                      <h3 className="font-semibold" style={{ color: theme === 'light' ? 'white' : 'var(--color-text-primary)' }}>
                        Light Mode
                      </h3>
                      <p className="text-sm" style={{ color: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                        Tampilan terang
                      </p>
                    </div>
                  </div>
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: theme === 'light' ? 'white' : 'var(--color-border)',
                      backgroundColor: theme === 'light' ? 'white' : 'transparent'
                    }}
                  >
                    {theme === 'light' && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    )}
                  </div>
                </div>

                {/* Dark Mode Option */}
                <div 
                  onClick={() => {
                    setTheme('dark');
                    localStorage.setItem('theme', 'dark');
                    applyTheme('dark');
                    toast.success('Theme changed to Dark mode');
                  }}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-background)',
                    border: `2px solid ${theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Moon size={24} style={{ color: theme === 'dark' ? 'white' : 'var(--color-text-secondary)' }} />
                    <div>
                      <h3 className="font-semibold" style={{ color: theme === 'dark' ? 'white' : 'var(--color-text-primary)' }}>
                        Dark Mode
                      </h3>
                      <p className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                        Tampilan gelap
                      </p>
                    </div>
                  </div>
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: theme === 'dark' ? 'white' : 'var(--color-border)',
                      backgroundColor: theme === 'dark' ? 'white' : 'transparent'
                    }}
                  >
                    {theme === 'dark' && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    )}
                  </div>
                </div>

                {/* System (Auto) Option */}
                <div 
                  onClick={() => {
                    setTheme('system');
                    localStorage.setItem('theme', 'system');
                    applyTheme('system');
                    toast.success('Theme changed to System (Auto) mode');
                  }}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                  style={{ 
                    backgroundColor: theme === 'system' ? 'var(--color-primary)' : 'var(--color-background)',
                    border: `2px solid ${theme === 'system' ? 'var(--color-primary)' : 'var(--color-border)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative" style={{ width: '24px', height: '24px' }}>
                      <Sun 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          top: '0', 
                          left: '0',
                          color: theme === 'system' ? 'white' : 'var(--color-text-secondary)' 
                        }} 
                      />
                      <Moon 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          bottom: '0', 
                          right: '0',
                          color: theme === 'system' ? 'white' : 'var(--color-text-secondary)' 
                        }} 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: theme === 'system' ? 'white' : 'var(--color-text-primary)' }}>
                        System (Auto)
                      </h3>
                      <p className="text-sm" style={{ color: theme === 'system' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                        Ikuti pengaturan browser
                      </p>
                    </div>
                  </div>
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: theme === 'system' ? 'white' : 'var(--color-border)',
                      backgroundColor: theme === 'system' ? 'white' : 'transparent'
                    }}
                  >
                    {theme === 'system' && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Settings Card */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <User className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Admin Profile
                  </h2>
                </div>
                {!editMode && (
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white'
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {!editMode ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Username</p>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile?.username}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Full Name</p>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile?.full_name}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Last Updated</p>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {profile?.updated_date ? new Date(profile.updated_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg outline-none transition-all"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px'
                      }}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg outline-none transition-all"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px'
                      }}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Current Password (if changing password)</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg outline-none transition-all"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px'
                      }}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>New Password (optional)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg outline-none transition-all"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px'
                      }}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg outline-none transition-all"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px'
                      }}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'var(--color-primary)', 
                        color: 'white'
                      }}
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={savingProfile}
                      className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'var(--color-surface)', 
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        borderWidth: '1px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Database Management Card */}
            <div className="p-6 rounded-lg shadow-sm lg:col-span-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex items-center mb-4">
                <Database className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Database Management
                </h2>
              </div>
              
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Kelola backup dan restore database sistem POS
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Backup Button */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <Download className="mb-3" size={32} style={{ color: 'var(--color-primary)' }} />
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Backup Database</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Download file script.sql sebagai backup database
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white'
                    }}
                  >
                    <Download size={18} />
                    Download Backup
                  </button>
                </div>

                {/* Reset to Default Button */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <RotateCcw className="mb-3" size={32} style={{ color: '#ef4444' }} />
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Reset to Default</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Reset database ke kondisi awal dengan dummy data
                  </p>
                  <button
                    onClick={handleResetDatabase}
                    disabled={resetting}
                    className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#ef4444', 
                      color: 'white'
                    }}
                  >
                    <RotateCcw size={18} />
                    {resetting ? 'Resetting...' : 'Reset Database'}
                  </button>
                </div>

                {/* Restore from File Button */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <Upload className="mb-3" size={32} style={{ color: '#f59e0b' }} />
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Restore from File</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Upload file backup .sql untuk restore database
                  </p>
                  <button
                    onClick={handleRestoreFromFile}
                    disabled={restoring}
                    className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#f59e0b', 
                      color: 'white'
                    }}
                  >
                    <Upload size={18} />
                    {restoring ? 'Restoring...' : 'Upload & Restore'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sql"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Return & Refund Policies Card */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex items-center mb-4">
                <FileText className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Return & Refund Policies
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Kebijakan Pengembalian</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <li>Pengembalian barang dapat dilakukan dalam 7 hari setelah pembelian</li>
                    <li>Barang harus dalam kondisi asli dan belum dibuka/digunakan</li>
                    <li>Menyertakan bukti pembelian (invoice/struk)</li>
                    <li>Pengembalian hanya untuk barang yang rusak atau cacat produksi</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Kebijakan Refund</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <li>Refund akan diproses dalam 3-5 hari kerja</li>
                    <li>Refund dikembalikan melalui metode pembayaran yang sama</li>
                    <li>Biaya pengiriman tidak dapat di-refund</li>
                    <li>Produk promo/diskon tidak dapat di-refund</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex items-center mb-4">
                <CreditCard className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Payment Methods
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Cash</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pembayaran tunai</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    Active
                  </span>
                </div>
                
                <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>QR Code</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>QRIS (GoPay, OVO, Dana, ShopeePay)</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    Active
                  </span>
                </div>
                
                <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>E-Money</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Kartu E-Money (Flazz, e-Toll, TapCash)</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    Active
                  </span>
                </div>
                
                <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Transfer Bank</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Transfer ke rekening sekolah</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Settings;
