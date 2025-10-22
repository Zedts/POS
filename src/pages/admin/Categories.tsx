import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import {
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  getCategoryStatsAPI,
  getProductsByCategoryAPI,
} from '../../api';
import { Plus, Edit2, Trash2, Package, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';

interface Category {
  id: number;
  category_name: string;
}

interface CategoryStats {
  id: number;
  category_name: string;
  product_count: number;
  total_stock: number;
  avg_price: number;
  min_price: number;
  max_price: number;
}

interface Product {
  id: number;
  product_name: string;
  qty: number;
  price: number;
  supplier: string;
  picture_url: string;
  status: string;
  exp_date: string;
  category_name: string;
}

function Categories() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ category_name: '' });
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<{ [key: number]: Product[] }>({});
  const [loadingProducts, setLoadingProducts] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoryStatsAPI();
      if (response.success) {
        setCategories(response.data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit', category?: Category) => {
    setModalMode(mode);
    if (mode === 'edit' && category) {
      setSelectedCategory(category);
      setFormData({ category_name: category.category_name });
    } else {
      setSelectedCategory(null);
      setFormData({ category_name: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({ category_name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_name.trim()) {
      toast.error('Nama kategori harus diisi');
      return;
    }

    try {
      if (modalMode === 'add') {
        const response = await createCategoryAPI(formData);
        if (response.success) {
          toast.success('Kategori berhasil ditambahkan');
          fetchCategories();
          handleCloseModal();
        }
      } else if (modalMode === 'edit' && selectedCategory) {
        const response = await updateCategoryAPI(selectedCategory.id, formData);
        if (response.success) {
          toast.success('Kategori berhasil diperbarui');
          fetchCategories();
          handleCloseModal();
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await deleteCategoryAPI(id);
      if (response.success) {
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus kategori');
    }
  };

  const toggleExpandCategory = async (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      if (!categoryProducts[categoryId]) {
        try {
          setLoadingProducts({ ...loadingProducts, [categoryId]: true });
          const response = await getProductsByCategoryAPI(categoryId);
          if (response.success) {
            setCategoryProducts({ ...categoryProducts, [categoryId]: response.data });
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error('Gagal memuat produk kategori');
        } finally {
          setLoadingProducts({ ...loadingProducts, [categoryId]: false });
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Category Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Kelola kategori produk dan lihat statistik
            </p>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={() => handleOpenModal('add')}
              className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              <Plus size={20} />
              Tambah Kategori
            </button>
          </div>

          {/* Categories Table */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            {loading ? (
              <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Memuat data...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Belum ada kategori
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Nama Kategori
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Jumlah Produk
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Total Stok
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Harga Rata-rata
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Rentang Harga
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, index) => (
                      <>
                        <tr
                          key={category.id}
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-background)',
                          }}
                          className="hover:opacity-90 transition-opacity"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleExpandCategory(category.id)}
                                className="p-1 rounded hover:bg-opacity-20 transition-colors"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                              >
                                {expandedCategory === category.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {category.category_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Package size={16} style={{ color: 'var(--color-primary)' }} />
                              <span style={{ color: 'var(--color-text-primary)' }}>{category.product_count}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
                              <span style={{ color: 'var(--color-text-primary)' }}>{category.total_stock}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(category.avg_price)}
                          </td>
                          <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            <div className="text-sm">
                              {formatCurrency(category.min_price)} - {formatCurrency(category.max_price)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenModal('edit', category)}
                                className="p-2 rounded hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id, category.category_name)}
                                className="p-2 rounded hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedCategory === category.id && (
                          <tr style={{ backgroundColor: 'var(--color-background)' }}>
                            <td colSpan={6} className="px-4 py-4">
                              <div className="pl-8">
                                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                  Daftar Produk dalam Kategori "{category.category_name}"
                                </h4>
                                {loadingProducts[category.id] ? (
                                  <p style={{ color: 'var(--color-text-secondary)' }}>Memuat produk...</p>
                                ) : categoryProducts[category.id]?.length === 0 ? (
                                  <p style={{ color: 'var(--color-text-secondary)' }}>Belum ada produk dalam kategori ini</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categoryProducts[category.id]?.map((product) => (
                                      <div
                                        key={product.id}
                                        className="p-3 rounded border"
                                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                                      >
                                        <div className="flex gap-3">
                                          {product.picture_url && (
                                            <img
                                              src={product.picture_url}
                                              alt={product.product_name}
                                              className="w-16 h-16 object-cover rounded"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                              {product.product_name}
                                            </h5>
                                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                              Stok: {product.qty}
                                            </p>
                                            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                                              {formatCurrency(product.price)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Total Kategori
              </h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {categories.length}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Total Produk
              </h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                {categories.reduce((sum, cat) => sum + cat.product_count, 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Total Stok
              </h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                {categories.reduce((sum, cat) => sum + cat.total_stock, 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Kategori Terbesar
              </h3>
              <p className="text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {categories.length > 0 ? categories.reduce((prev, current) => prev.product_count > current.product_count ? prev : current).category_name : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleCloseModal}
        >
          <div
            className="rounded-lg shadow-xl max-w-md w-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {modalMode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Nama Kategori <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ category_name: e.target.value })}
                  className="w-full px-3 py-2 rounded border outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="Contoh: Makanan Ringan"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  {modalMode === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Categories;
