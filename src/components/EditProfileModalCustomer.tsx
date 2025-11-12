import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateCustomerProfileAPI } from '../api';
import { toast } from 'react-toastify';

interface EditProfileModalCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  initialData: {
    username: string;
    full_name: string;
    phone: string;
    address: string;
    class: string;
    major: string;
  };
  onSuccess: () => void;
}

function EditProfileModalCustomer({ 
  isOpen, 
  onClose, 
  customerId, 
  initialData,
  onSuccess 
}: EditProfileModalCustomerProps) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [studentClass, setStudentClass] = useState('X');
  const [major, setMajor] = useState('RPL');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(initialData.username);
      setFullName(initialData.full_name);
      setPhone(initialData.phone);
      setAddress(initialData.address);
      setStudentClass(initialData.class);
      setMajor(initialData.major);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    // Validation
    if (!username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }

    if (!phone.trim()) {
      toast.error('Nomor telepon wajib diisi');
      return;
    }

    if (!address.trim()) {
      toast.error('Alamat wajib diisi');
      return;
    }

    // Password validation
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error('Masukkan password saat ini untuk mengubah password');
        return;
      }

      if (!newPassword) {
        toast.error('Masukkan password baru');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Password baru minimal 6 karakter');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Konfirmasi password tidak cocok');
        return;
      }
    }

    try {
      setSaving(true);

      const profileData: {
        username: string;
        full_name: string;
        phone: string;
        address: string;
        class: string;
        major: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        username: username.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        class: studentClass,
        major: major
      };

      // Include password fields if user wants to change password
      if (currentPassword && newPassword) {
        profileData.currentPassword = currentPassword;
        profileData.newPassword = newPassword;
      }

      const response = await updateCustomerProfileAPI(customerId, profileData);

      if (response.success) {
        toast.success('Profil berhasil diperbarui');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(initialData.username);
    setFullName(initialData.full_name);
    setPhone(initialData.phone);
    setAddress(initialData.address);
    setStudentClass(initialData.class);
    setMajor(initialData.major);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleCancel}
    >
      <div
        className="rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Edit Profile
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Username <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="Masukkan username"
            />
          </div>

          {/* Full Name */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Nama Lengkap <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Phone */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Nomor Telepon <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="Masukkan nomor telepon"
            />
          </div>

          {/* Address */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Alamat <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border outline-none resize-none"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          {/* Class */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Kelas <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
            </select>
          </div>

          {/* Major */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Jurusan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <option value="RPL">RPL</option>
              <option value="DKV1">DKV1</option>
              <option value="DKV2">DKV2</option>
              <option value="BR">BR</option>
              <option value="MP">MP</option>
              <option value="AK">AK</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <p 
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Ubah Password (Opsional)
            </p>

            {/* Current Password */}
            <div className="mb-4">
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password Saat Ini
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)'
                }}
                placeholder="Masukkan password saat ini"
              />
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)'
                }}
                placeholder="Masukkan password baru"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)'
                }}
                placeholder="Konfirmasi password baru"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--color-surface-dark)', 
              color: 'var(--color-text-primary)' 
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModalCustomer;
