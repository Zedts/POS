import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { getProductByIdAPI } from '../api';
import { toast } from 'react-toastify';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

interface ProductDetail {
  id: number;
  product_name: string;
  unit_price: number;
  qty: number;
  image_url: string | null;
  category_id: number;
  category_name: string;
  supplier: string;
  status: string;
  exp_date: string | null;
  created_date: string;
  updated_date: string;
}

function ProductDetailModal({ isOpen, onClose, productId }: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductByIdAPI(productId);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        toast.error(response.message || 'Gagal memuat detail produk');
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
      toast.error('Gagal memuat detail produk');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail();
    }
  }, [isOpen, productId, fetchProductDetail]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Detail Produk
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div 
              className="inline-block w-12 h-12 border-4 rounded-full animate-spin"
              style={{ 
                borderColor: 'var(--color-border)',
                borderTopColor: 'var(--color-primary)'
              }}
            ></div>
            <p 
              className="mt-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Memuat detail produk...
            </p>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative">
              <div 
                className="aspect-square rounded-lg overflow-hidden relative"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <img
                  src={product.image_url || 'https://via.placeholder.com/500?text=No+Image'}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/500?text=No+Image';
                  }}
                />
                {product.qty <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">HABIS</span>
                  </div>
                )}
                {product.status === 'kadaluarsa' && (
                  <div className="absolute top-0 right-0 m-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      KADALUARSA
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h3 
                className="text-3xl font-bold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {product.product_name}
              </h3>

              <p 
                className="text-4xl font-bold mb-6"
                style={{ color: 'var(--color-primary)' }}
              >
                {formatCurrency(product.unit_price)}
              </p>

              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Stok Tersedia
                    </span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ 
                        color: product.qty > 10 ? '#10b981' : product.qty > 0 ? '#f59e0b' : '#ef4444'
                      }}
                    >
                      {product.qty} unit
                    </span>
                  </div>
                  {product.qty <= 10 && product.qty > 0 && (
                    <p 
                      className="text-xs"
                      style={{ color: '#f59e0b' }}
                    >
                      ⚠️ Stok hampir habis
                    </p>
                  )}
                  {product.qty <= 0 && (
                    <p 
                      className="text-xs"
                      style={{ color: '#ef4444' }}
                    >
                      ❌ Stok habis
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Kategori
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {product.category_name || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Supplier
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {product.supplier || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Tanggal Kadaluarsa
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ 
                        color: product.status === 'kadaluarsa' ? '#ef4444' : 'var(--color-text-primary)'
                      }}
                    >
                      {formatDate(product.exp_date)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Status
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: product.status === 'tidak' ? '#dcfce7' : '#fee2e2',
                        color: product.status === 'tidak' ? '#166534' : '#991b1b'
                      }}
                    >
                      {product.status === 'tidak' ? 'Layak Jual' : 'Kadaluarsa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Produk tidak ditemukan
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
