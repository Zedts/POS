import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import PriceHistoryModal from '../../components/PriceHistoryModal';
import {
  getProductsAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
  getCategoriesAPI,
  uploadImageAPI
} from '../../api';
import { toast } from 'react-toastify';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  History,
  Upload,
  X,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';

interface Product {
  id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  qty: number;
  supplier: string;
  price: number;
  picture_url: string | null;
  status: 'kadaluarsa' | 'tidak';
  exp_date: string | null;
  created_date: string;
  updated_date: string;
  created_by_name: string;
}

interface Category {
  id: number;
  category_name: string;
}

function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductIdForHistory, setSelectedProductIdForHistory] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    qty: '',
    supplier: '',
    price: '',
    picture_url: '',
    status: 'tidak',
    exp_date: ''
  });

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        getProductsAPI(),
        getCategoriesAPI()
      ]);

      if (productsRes.success) {
        setProducts(productsRes.data);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setFormData({
        product_name: product.product_name,
        category_id: product.category_id.toString(),
        qty: product.qty.toString(),
        supplier: product.supplier || '',
        price: product.price.toString(),
        picture_url: product.picture_url || '',
        status: product.status,
        exp_date: product.exp_date ? new Date(product.exp_date).toISOString().split('T')[0] : ''
      });
      // Set preview untuk edit mode
      if (product.picture_url) {
        const previewUrl = product.picture_url.startsWith('http') 
          ? product.picture_url 
          : `http://172.11.7.76:3000${product.picture_url}`;
        setImagePreview(previewUrl);
      }
      setSelectedFile(null);
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setFormData({
        product_name: '',
        category_id: '',
        qty: '',
        supplier: '',
        price: '',
        picture_url: '',
        status: 'tidak',
        exp_date: ''
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedProduct(null);
    setImagePreview(null);
    setUploadMode('file');
    setSelectedFile(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar! Maksimal 5MB');
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar!');
      return;
    }

    // Preview langsung menggunakan FileReader (TIDAK UPLOAD ke server)
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simpan file object untuk diupload nanti saat submit form
    setSelectedFile(file);
  };

  const handleImageUrl = (url: string) => {
    setFormData({ ...formData, picture_url: url });
    // Preview langsung dari URL
    if (url && url.startsWith('http')) {
      setImagePreview(url);
    } else if (!url) {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name || !formData.category_id || !formData.price) {
      toast.error('Mohon lengkapi data produk');
      return;
    }

    try {
      let pictureUrl = formData.picture_url;

      // Upload file ke server HANYA saat submit form
      if (selectedFile) {
        const uploadRes = await uploadImageAPI(selectedFile);
        if (uploadRes.success) {
          pictureUrl = uploadRes.data.fileUrl;
        } else {
          toast.error('Gagal upload gambar');
          return;
        }
      }

      const data = {
        ...formData,
        picture_url: pictureUrl,
        category_id: parseInt(formData.category_id),
        qty: parseInt(formData.qty) || 0,
        price: parseInt(formData.price),
        exp_date: formData.exp_date || null
      };

      if (editMode && selectedProduct) {
        const res = await updateProductAPI(selectedProduct.id, data);
        if (res.success) {
          toast.success('Produk berhasil diupdate');
          handleCloseModal();
          fetchData();
        }
      } else {
        const res = await createProductAPI(data);
        if (res.success) {
          toast.success('Produk berhasil ditambahkan');
          handleCloseModal();
          fetchData();
        }
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal menyimpan produk');
    }
  };

  const handleOpenDeleteModal = (id: number, name: string) => {
    setProductToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const res = await deleteProductAPI(productToDelete.id);
      if (res.success) {
        toast.success('Produk berhasil dihapus');
        fetchData();
        handleCloseDeleteModal();
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal menghapus produk');
    }
  };

  const handleViewPriceHistory = (productId: number) => {
    setSelectedProductIdForHistory(productId);
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

  const lowStockCount = products.filter(p => p.qty <= 10).length;
  const expiredCount = products.filter(p => p.status === 'kadaluarsa' || (p.exp_date && new Date(p.exp_date) <= new Date())).length;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Products Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Kelola semua produk di sistem POS
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Produk</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{products.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Stok Menipis</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{lowStockCount}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Calendar className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Kadaluarsa</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{expiredCount}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Kategori</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{categories.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Cari produk atau supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>

              {/* Add Button */}
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Plus className="w-5 h-5" />
                Tambah Produk
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-background)' }}>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Gambar</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Nama Produk</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Kategori</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Stok</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Harga</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Tidak ada produk ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <td className="px-4 py-3">
                          {product.picture_url ? (
                            <img
                              src={product.picture_url.startsWith('http') ? product.picture_url : `http://172.11.7.76:3000${product.picture_url}`}
                              alt={product.product_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                              <ImageIcon className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{product.product_name}</p>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{product.supplier}</p>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{product.category_name}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${product.qty <= 10 ? 'text-red-600' : ''}`} style={product.qty > 10 ? { color: 'var(--color-text-primary)' } : {}}>
                            {product.qty}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                          Rp {product.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: product.status === 'kadaluarsa' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                              color: product.status === 'kadaluarsa' ? '#dc2626' : '#16a34a'
                            }}
                          >
                            {product.status === 'kadaluarsa' ? 'Kadaluarsa' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewPriceHistory(product.id)}
                              className="p-1 rounded hover:bg-opacity-10 hover:bg-blue-600"
                              title="Lihat Riwayat Harga"
                            >
                              <History className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="p-1 rounded hover:bg-opacity-10 hover:bg-green-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(product.id, product.product_name)}
                              className="p-1 rounded hover:bg-opacity-10 hover:bg-red-600"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {editMode ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h2>
                <button onClick={handleCloseModal} className="p-1 hover:opacity-70">
                  <X className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Kategori *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>

                {/* Qty & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Stok
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Harga *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                {/* Status & Exp Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'kadaluarsa' | 'tidak' })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="tidak">Normal</option>
                      <option value="kadaluarsa">Kadaluarsa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Tanggal Kadaluarsa
                    </label>
                    <input
                      type="date"
                      value={formData.exp_date}
                      onChange={(e) => setFormData({ ...formData, exp_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Gambar Produk
                  </label>
                  
                  {/* Upload Mode Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode('file');
                        // Reset saat ganti mode jika belum ada gambar tersimpan
                        if (!formData.picture_url) {
                          setImagePreview(null);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${uploadMode === 'file' ? 'border-blue-500' : ''}`}
                      style={{
                        backgroundColor: uploadMode === 'file' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-background)',
                        borderColor: uploadMode === 'file' ? '#3b82f6' : 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode('url');
                        // Reset saat ganti mode jika belum ada gambar tersimpan
                        if (!formData.picture_url) {
                          setImagePreview(null);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${uploadMode === 'url' ? 'border-blue-500' : ''}`}
                      style={{
                        backgroundColor: uploadMode === 'url' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-background)',
                        borderColor: uploadMode === 'url' ? '#3b82f6' : 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Dari URL
                    </button>
                  </div>

                  {/* File Upload */}
                  {uploadMode === 'file' && (
                    <div className="mb-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Maksimal ukuran file: 5MB. Format: JPG, PNG, GIF
                      </p>
                    </div>
                  )}

                  {/* URL Input */}
                  {uploadMode === 'url' && (
                    <div className="mb-3">
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.picture_url}
                        onChange={(e) => handleImageUrl(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Masukkan URL gambar dari internet
                      </p>
                    </div>
                  )}

                  {/* Image Preview - Muncul setelah file dipilih atau URL diisi */}
                  {imagePreview && (
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Preview Gambar:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, picture_url: '' });
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Hapus gambar"
                        >
                          <X className="w-3 h-3" />
                          Hapus
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-auto max-h-64 object-contain rounded-lg border" 
                          style={{ borderColor: 'var(--color-border)' }}
                          onError={() => {
                            toast.error('Gagal memuat gambar. Periksa URL atau file Anda.');
                            setImagePreview(null);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {editMode ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {selectedProductIdForHistory && (
        <PriceHistoryModal
          productId={selectedProductIdForHistory}
          onClose={() => setSelectedProductIdForHistory(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
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
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--color-danger)' }}>
                Konfirmasi Hapus
              </h3>
              <button
                onClick={handleCloseDeleteModal}
                className="p-1 rounded hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Trash2 size={24} style={{ color: 'var(--color-danger)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-base mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Apakah Anda yakin ingin menghapus produk <span className="font-semibold">"{productToDelete.name}"</span>?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 rounded border font-medium transition-all hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)' 
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded border font-medium transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-danger)',
                    color: 'var(--color-danger)'
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Products;
