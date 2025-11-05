import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import {
  getDiscountsAPI,
  createDiscountAPI,
  updateDiscountAPI,
  deleteDiscountAPI,
  getDiscountStatsAPI,
} from '../../api';
import { Plus, Edit2, Trash2, Percent, Tag, TrendingUp, X, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

interface Discount {
  discount_id: number;
  discount_code: string;
  description: string;
  discount_percent: number;
  min_purchase: number;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  discount_type: 'percentage' | 'fixed';
  status: 'active' | 'expired' | 'upcoming' | 'limit_reached';
  created_by_name: string;
  updated_by_name: string;
  created_date: string;
  updated_date: string;
}

interface DiscountStats {
  total_discounts: number;
  active_discounts: number;
  expired_discounts: number;
  limit_reached: number;
  total_usage: number;
}

function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [stats, setStats] = useState<DiscountStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<{ id: number; code: string } | null>(null);
  const [formData, setFormData] = useState({
    discount_code: '',
    description: '',
    discount_percent: '',
    min_purchase: '',
    max_discount: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    discount_type: 'percentage'
  });

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [discountsRes, statsRes] = await Promise.all([
        getDiscountsAPI(),
        getDiscountStatsAPI()
      ]);

      if (discountsRes.success) {
        setDiscounts(discountsRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat data diskon');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit', discount?: Discount) => {
    setModalMode(mode);
    if (mode === 'edit' && discount) {
      setSelectedDiscount(discount);
      setFormData({
        discount_code: discount.discount_code,
        description: discount.description || '',
        discount_percent: discount.discount_percent.toString(),
        min_purchase: discount.min_purchase.toString(),
        max_discount: discount.max_discount ? discount.max_discount.toString() : '',
        start_date: discount.start_date.split('T')[0],
        end_date: discount.end_date.split('T')[0],
        usage_limit: discount.usage_limit ? discount.usage_limit.toString() : '',
        discount_type: discount.discount_type
      });
    } else {
      setSelectedDiscount(null);
      setFormData({
        discount_code: '',
        description: '',
        discount_percent: '',
        min_purchase: '0',
        max_discount: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        discount_type: 'percentage'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDiscount(null);
    setFormData({
      discount_code: '',
      description: '',
      discount_percent: '',
      min_purchase: '0',
      max_discount: '',
      start_date: '',
      end_date: '',
      usage_limit: '',
      discount_type: 'percentage'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.discount_code.trim()) {
      toast.error('Kode diskon harus diisi');
      return;
    }

    if (!formData.discount_percent || parseFloat(formData.discount_percent) <= 0) {
      toast.error('Persentase/nilai diskon harus lebih dari 0');
      return;
    }

    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_percent) > 100) {
      toast.error('Persentase diskon maksimal 100%');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Tanggal mulai dan tanggal berakhir harus diisi');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('Tanggal berakhir harus setelah tanggal mulai');
      return;
    }

    try {
      const payload = {
        discount_code: formData.discount_code.trim(),
        description: formData.description.trim(),
        discount_percent: parseFloat(formData.discount_percent),
        min_purchase: parseInt(formData.min_purchase) || 0,
        max_discount: formData.max_discount ? parseInt(formData.max_discount) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        discount_type: formData.discount_type
      };

      if (modalMode === 'edit' && selectedDiscount) {
        const res = await updateDiscountAPI(selectedDiscount.discount_id, payload);
        if (res.success) {
          toast.success('Diskon berhasil diperbarui');
          fetchData();
          handleCloseModal();
        }
      } else {
        const res = await createDiscountAPI(payload);
        if (res.success) {
          toast.success('Diskon berhasil ditambahkan');
          fetchData();
          handleCloseModal();
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan diskon');
    }
  };

  const handleOpenDeleteModal = (id: number, code: string) => {
    setDiscountToDelete({ id, code });
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDiscountToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!discountToDelete) return;

    try {
      const res = await deleteDiscountAPI(discountToDelete.id);
      if (res.success) {
        toast.success('Diskon berhasil dihapus');
        fetchData();
        handleCloseDeleteModal();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus diskon');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', color: 'var(--color-success)' },
      expired: { label: 'Kadaluarsa', color: 'var(--color-danger)' },
      upcoming: { label: 'Akan Datang', color: 'var(--color-info)' },
      limit_reached: { label: 'Limit Tercapai', color: 'var(--color-warning)' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span
        className="px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
               style={{ borderColor: 'var(--color-primary)' }}></div>
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
              Discount Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Kelola diskon dan promosi untuk produk Anda
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Diskon
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.total_discounts || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(1, 159, 99, 0.1)' }}
                  >
                    <Tag size={24} style={{ color: 'var(--color-success)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Aktif
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.active_discounts || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  >
                    <TrendingUp size={24} style={{ color: 'var(--color-success)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Kadaluarsa
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.expired_discounts || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  >
                    <Clock size={24} style={{ color: 'var(--color-danger)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Limit Tercapai
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.limit_reached || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                  >
                    <Percent size={24} style={{ color: 'var(--color-warning)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Penggunaan
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.total_usage || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <Calendar size={24} style={{ color: 'var(--color-info)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              <Plus size={20} />
              Tambah Diskon
            </button>
          </div>

          {/* Discounts Table */}
          <div
            className="rounded-lg border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-background)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Kode Diskon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Min. Pembelian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Periode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Penggunaan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        Belum ada data diskon
                      </td>
                    </tr>
                  ) : (
                    discounts.map((discount) => (
                      <tr key={discount.discount_id}
                          style={{ borderColor: 'var(--color-border)' }}>
                        <td className="px-6 py-4">
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {discount.discount_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm max-w-xs truncate"
                               style={{ color: 'var(--color-text-secondary)' }}>
                            {discount.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-background)',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            {discount.discount_type === 'percentage' ? 'Persentase' : 'Fixed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {discount.discount_type === 'percentage'
                              ? `${discount.discount_percent}%`
                              : formatCurrency(discount.discount_percent)
                            }
                          </div>
                          {discount.max_discount && discount.discount_type === 'percentage' && (
                            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              Max: {formatCurrency(discount.max_discount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(discount.min_purchase)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {formatDate(discount.start_date)}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            s/d {formatDate(discount.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {discount.used_count}
                            {discount.usage_limit && ` / ${discount.usage_limit}`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(discount.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal('edit', discount)}
                              className="p-2 rounded-lg border transition-colors"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)'
                              }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(discount.discount_id, discount.discount_code)}
                              className="p-2 rounded-lg border transition-colors"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-danger)',
                                color: 'var(--color-danger)'
                              }}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseModal}
        >
          <div
            className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {modalMode === 'edit' ? 'Edit Diskon' : 'Tambah Diskon Baru'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kode Diskon */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    Kode Diskon *
                  </label>
                  <input
                    type="text"
                    value={formData.discount_code}
                    onChange={(e) => setFormData({ ...formData, discount_code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="DISKON20"
                    required
                  />
                </div>

                {/* Jenis Diskon */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    Jenis Diskon *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Fixed (Rp)</option>
                  </select>
                </div>

                {/* Nilai Diskon */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    {formData.discount_type === 'percentage' ? 'Persentase (%)' : 'Nilai (Rp)'} *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder={formData.discount_type === 'percentage' ? '20' : '50000'}
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    step={formData.discount_type === 'percentage' ? '0.01' : '1'}
                    required
                  />
                </div>

                {/* Min Pembelian */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    Min. Pembelian (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>

                {/* Max Diskon (only for percentage) */}
                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-2"
                           style={{ color: 'var(--color-text-primary)' }}>
                      Max. Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="100000"
                      min="0"
                      step="1"
                    />
                  </div>
                )}

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    Limit Penggunaan
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Tidak terbatas"
                    min="0"
                    step="1"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--color-text-primary)' }}>
                    Tanggal Berakhir *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2"
                       style={{ color: 'var(--color-text-primary)' }}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Deskripsi diskon (opsional)"
                  rows={3}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg border font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                >
                  {modalMode === 'edit' ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && discountToDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseDeleteModal}
        >
          <div
            className="rounded-lg shadow-xl max-w-md w-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-danger)' }}>
                Konfirmasi Hapus
              </h2>
              <button
                onClick={handleCloseDeleteModal}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <Trash2 size={24} style={{ color: 'var(--color-danger)' }} />
                </div>
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Hapus diskon <span className="font-bold">{discountToDelete.code}</span>?
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-end gap-3 p-6 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-danger)',
                  color: 'white'
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Discounts;
