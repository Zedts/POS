import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import { 
  getStudentsAPI, 
  getStudentByIdAPI, 
  getStudentTransactionsAPI, 
  getStudentStatsAPI, 
  updateStudentAPI, 
  toggleStudentStatusAPI 
} from '../../api/index';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Edit, 
  X 
} from 'lucide-react';

interface Student {
  id: number;
  nisn: string;
  username: string;
  full_name: string;
  phone: string;
  address: string;
  class: 'X' | 'XI' | 'XII';
  major: 'RPL' | 'DKV1' | 'DKV2' | 'BR' | 'MP' | 'AK';
  is_active: boolean;
  created_date: string;
  updated_date: string;
  total_transactions: number;
  total_revenue: number;
}

interface StudentStats {
  total_students: number;
  active_students: number;
  inactive_students: number;
  today_transactions: number;
  today_revenue: number;
  month_transactions: number;
}

interface StudentDetail extends Student {
  statistics: {
    total_transactions: number;
    total_revenue: number;
    today_transactions: number;
    today_revenue: number;
    month_transactions: number;
    month_revenue: number;
  };
}

interface Transaction {
  order_number: string;
  order_date: string;
  order_total: number;
  order_status: 'pending' | 'complete' | 'refunded';
  discount_code: string | null;
  invoice_status: 'diproses' | 'berhasil' | 'gagal' | null;
  paid_by: 'cash' | 'qr' | null;
}

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [studentTransactions, setStudentTransactions] = useState<Transaction[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    class: '',
    major: '',
    status: '',
    search: ''
  });
  const [searchDebounce, setSearchDebounce] = useState('');

  // Edit form
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    class: '',
    major: ''
  });

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    fetchData();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Fetch data when filters change
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.class, filters.major, filters.status, filters.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([
        getStudentsAPI(),
        getStudentStatsAPI()
      ]);
      setStudents(studentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudentsAPI(filters);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal memuat data siswa');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const [studentData, transactions] = await Promise.all([
        getStudentByIdAPI(id),
        getStudentTransactionsAPI(id)
      ]);
      setSelectedStudent(studentData);
      setStudentTransactions(transactions);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Gagal memuat detail siswa');
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStudent(null);
    setStudentTransactions([]);
  };

  const handleOpenEditModal = (student: Student | StudentDetail) => {
    setEditForm({
      full_name: student.full_name,
      phone: student.phone,
      address: student.address,
      class: student.class,
      major: student.major
    });
    setSelectedStudent(student as StudentDetail);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    setEditForm({
      full_name: '',
      phone: '',
      address: '',
      class: '',
      major: ''
    });
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      await updateStudentAPI(selectedStudent.id, editForm);
      toast.success('Data siswa berhasil diupdate');
      handleCloseEditModal();
      handleCloseDetailModal();
      fetchData();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Gagal mengupdate data siswa');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleStudentStatusAPI(id);
      toast.success(`Status siswa berhasil diubah menjadi ${currentStatus ? 'Tidak Aktif' : 'Aktif'}`);
      fetchData();
      if (selectedStudent && selectedStudent.id === id) {
        handleCloseDetailModal();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Gagal mengubah status siswa');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span 
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            color: 'var(--color-success)' 
          }}
        >
          <UserCheck size={14} />
          Aktif
        </span>
      );
    }
    return (
      <span 
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
        style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--color-danger)' 
        }}
      >
        <UserX size={14} />
        Tidak Aktif
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'var(--color-warning)' },
      complete: { label: 'Complete', color: 'var(--color-success)' },
      refunded: { label: 'Refunded', color: 'var(--color-danger)' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span 
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        style={{ 
          backgroundColor: `${config.color}20`, 
          color: config.color 
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return 'Rp 0';
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return 'Rp 0';
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Student Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Kelola data siswa sebagai operator POS
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* Total Students */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(1, 159, 99, 0.1)'
                }}>
                  <Users size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.total_students || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Total Siswa
                  </p>
                </div>
              </div>
            </div>

            {/* Active Students */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)'
                }}>
                  <UserCheck size={24} style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.active_students || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Siswa Aktif
                  </p>
                </div>
              </div>
            </div>

            {/* Inactive Students */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }}>
                  <UserX size={24} style={{ color: 'var(--color-danger)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.inactive_students || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Tidak Aktif
                  </p>
                </div>
              </div>
            </div>

            {/* Today Transactions */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }}>
                  <ShoppingCart size={24} style={{ color: 'var(--color-info)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.today_transactions || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Transaksi Hari Ini
                  </p>
                </div>
              </div>
            </div>

            {/* Today Revenue */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(1, 159, 99, 0.1)'
                }}>
                  <DollarSign size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatCurrency(stats?.today_revenue || 0).replace('Rp', '').trim()}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Pendapatan Hari Ini
                  </p>
                </div>
              </div>
            </div>

            {/* Month Transactions */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)'
                }}>
                  <TrendingUp size={24} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.month_transactions || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Transaksi Bulan Ini
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Cari Siswa
                </label>
                <input
                  type="text"
                  placeholder="Cari NISN atau Nama..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* Filter Class */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Kelas
                </label>
                <select
                  value={filters.class}
                  onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Kelas</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>

              {/* Filter Major */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Jurusan
                </label>
                <select
                  value={filters.major}
                  onChange={(e) => setFilters(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Jurusan</option>
                  <option value="RPL">RPL</option>
                  <option value="DKV1">DKV1</option>
                  <option value="DKV2">DKV2</option>
                  <option value="BR">BR</option>
                  <option value="MP">MP</option>
                  <option value="AK">AK</option>
                </select>
              </div>

              {/* Filter Status */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-background)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      NISN
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Kelas / Jurusan
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Total Transaksi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Total Pendapatan
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        Tidak ada data siswa
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} style={{ backgroundColor: 'var(--color-surface)' }}>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {student.nisn}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {student.full_name}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {student.class} / {student.major}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {student.phone || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {truncateText(student.address)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(student.is_active)}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={student.is_active}
                                onChange={() => handleToggleStatus(student.id, student.is_active)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {student.total_transactions}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                          {formatCurrency(student.total_revenue)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(student.id)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ 
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--color-info)'
                              }}
                              title="View Detail"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(student)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ 
                                backgroundColor: 'rgba(1, 159, 99, 0.1)',
                                color: 'var(--color-primary)'
                              }}
                              title="Edit Profile"
                            >
                              <Edit size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseDetailModal}
        >
          <div 
            className="rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Detail Siswa
              </h2>
              <button
                onClick={handleCloseDetailModal}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Student Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Informasi Siswa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    NISN
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.nisn}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Nama Lengkap
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.full_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Kelas
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.class}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Jurusan
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.major}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Phone
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.phone || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedStudent.is_active)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Address
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.address || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Statistik Kontribusi
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Total Transaksi
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.statistics?.total_transactions || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Total Pendapatan
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(selectedStudent.statistics?.total_revenue || 0).replace('Rp', '').trim()}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Transaksi Hari Ini
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.statistics?.today_transactions || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Pendapatan Hari Ini
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(selectedStudent.statistics?.today_revenue || 0).replace('Rp', '').trim()}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Transaksi Bulan Ini
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStudent.statistics?.month_transactions || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Pendapatan Bulan Ini
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(selectedStudent.statistics?.month_revenue || 0).replace('Rp', '').trim()}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Riwayat Transaksi
              </h3>
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--color-background)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Order Number
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                      {studentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Belum ada transaksi
                          </td>
                        </tr>
                      ) : (
                        studentTransactions.map((transaction) => (
                          <tr key={transaction.order_number}>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {transaction.order_number}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {formatDate(transaction.order_date)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                              {formatCurrency(transaction.order_total)}
                            </td>
                            <td className="px-4 py-3">
                              {getOrderStatusBadge(transaction.order_status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  handleOpenEditModal(selectedStudent);
                  setShowDetailModal(false);
                }}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Edit Profile
              </button>
              <button
                onClick={handleCloseDetailModal}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseEditModal}
        >
          <div 
            className="rounded-lg p-6 max-w-2xl w-full mx-4"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Edit Profile Siswa
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Kelas
                  </label>
                  <select
                    value={editForm.class}
                    onChange={(e) => setEditForm(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Jurusan
                  </label>
                  <select
                    value={editForm.major}
                    onChange={(e) => setEditForm(prev => ({ ...prev, major: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
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
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStudent}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Students;
