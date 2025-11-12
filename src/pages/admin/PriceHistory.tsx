import { useEffect, useState } from 'react';
import { Search, Filter, FileDown, TrendingUp, Calendar } from 'lucide-react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import PriceHistoryModal from '../../components/PriceHistoryModal';
import { getAllProductsWithPriceHistoryAPI, getCategoriesListAPI } from '../../api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
  id: number;
  product_name: string;
  picture_url: string;
  current_price: number;
  category_id: number;
  category_name: string;
  last_updated: string | null;
  total_changes: number;
}

interface Category {
  id: number;
  category_name: string;
}

function PriceHistory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }

    const fetchCategoriesAndProducts = async () => {
      await fetchCategories();
      await fetchProducts();
    };
    
    fetchCategoriesAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesListAPI();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters: { search?: string; categoryId?: number; startDate?: string; endDate?: string } = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory) filters.categoryId = parseInt(selectedCategory);
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      const response = await getAllProductsWithPriceHistoryAPI(filters);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchProducts(), 100);
  };

  const handleApplyDateFilter = () => {
    setShowDateModal(false);
    fetchProducts();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Riwayat Harga Produk', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    doc.text(`Total Produk: ${products.length}`, 14, 34);
    
    if (searchQuery) {
      doc.text(`Filter: ${searchQuery}`, 14, 40);
    }
    if (selectedCategory) {
      const cat = categories.find(c => c.id === parseInt(selectedCategory));
      doc.text(`Kategori: ${cat?.category_name || '-'}`, 14, 46);
    }

    autoTable(doc, {
      startY: selectedCategory || searchQuery ? 50 : 42,
      head: [['Produk', 'Kategori', 'Harga Saat Ini', 'Total Perubahan', 'Last Updated']],
      body: products.map(product => [
        product.product_name,
        product.category_name,
        formatCurrency(product.current_price),
        String(product.total_changes),
        formatDate(product.last_updated)
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [1, 159, 99] }
    });

    doc.save(`price_history_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF berhasil diexport!');
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Riwayat Harga Produk
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Pantau perubahan harga produk dari waktu ke waktu
            </p>
          </div>

          {/* Filters */}
          <div 
            className="p-6 rounded-lg border mb-6"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>

              {/* Date Range Button */}
              <button
                onClick={() => setShowDateModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: startDate && endDate ? 'var(--color-primary)' : 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: startDate && endDate ? 'white' : 'var(--color-text-primary)'
                }}
              >
                <Calendar size={20} />
                {startDate && endDate ? 'Tanggal Terpilih' : 'Filter Tanggal'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                <Filter size={18} />
                Terapkan Filter
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Reset
              </button>
              <button
                onClick={handleExportPDF}
                disabled={products.length === 0}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ml-auto"
                style={{ 
                  backgroundColor: products.length === 0 ? 'var(--color-border)' : 'var(--color-success)', 
                  color: 'white',
                  opacity: products.length === 0 ? 0.5 : 1,
                  cursor: products.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <FileDown size={18} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
            </div>
          ) : products.length === 0 ? (
            <div 
              className="p-12 rounded-lg border text-center"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <TrendingUp size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-secondary)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Tidak ada data produk ditemukan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div
                  key={product.id}
                  className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100">
                    {product.picture_url ? (
                      <img
                        src={product.picture_url.startsWith('http') ? product.picture_url : `http://172.11.10.44:3000${product.picture_url}`}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                        <TrendingUp size={48} style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                      {product.product_name}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {product.category_name}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Harga Saat Ini:
                        </span>
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          {formatCurrency(product.current_price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Total Perubahan:
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {product.total_changes}x
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Last Updated:
                        </span>
                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {formatDate(product.last_updated)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProductId(product.id)}
                      className="w-full py-2 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                    >
                      Lihat Riwayat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Modal */}
      {showDateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowDateModal(false)}
        >
          <div 
            className="rounded-lg p-6 w-full max-w-md"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Filter Rentang Tanggal
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyDateFilter}
                disabled={!startDate || !endDate}
                className="flex-1 py-2 rounded-lg font-medium"
                style={{ 
                  backgroundColor: !startDate || !endDate ? 'var(--color-border)' : 'var(--color-primary)', 
                  color: 'white',
                  opacity: !startDate || !endDate ? 0.5 : 1,
                  cursor: !startDate || !endDate ? 'not-allowed' : 'pointer'
                }}
              >
                Terapkan
              </button>
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setShowDateModal(false);
                }}
                className="flex-1 py-2 rounded-lg border font-medium"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {selectedProductId && (
        <PriceHistoryModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </AdminLayout>
  );
}

export default PriceHistory;
