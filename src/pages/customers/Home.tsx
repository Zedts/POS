import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Tag, ShoppingBag, ChevronRight } from 'lucide-react';
import CustomerLayout from '../../components/CustomerLayout';
import ProductDetailModal from '../../components/ProductDetailModal';
import OrderDetailModal from '../../components/OrderDetailModal';
import { 
  getTopSellingProductsAPI, 
  getActiveDiscountsAPI, 
  getCustomerOrdersAPI 
} from '../../api';
import { getUserData } from '../../utils/auth';
import { toast } from 'react-toastify';

interface TopProduct {
  id: number;
  product_name: string;
  product_picture: string;
  product_price: number;
  total_qty_sold: number;
}

interface Discount {
  discount_code: string;
  discount_description: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
}

interface Order {
  order_number: string;
  order_date: string;
  order_total: number;
  balance: number;
  status: string;
  items_count: number;
}

interface UserData {
  id: number;
  full_name: string;
  class: string;
  major: string;
  nisn: string;
  username: string;
  phone: string;
  address: string;
}

function CustomerHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const data = getUserData() as UserData | null;
    setUserData(data);
    
    if (data?.id) {
      fetchData(data.id);
    }
  }, []);

  const fetchData = async (customerId: number) => {
    try {
      setLoading(true);
      
      const [productsRes, discountsRes, ordersRes] = await Promise.all([
        getTopSellingProductsAPI(),
        getActiveDiscountsAPI(),
        getCustomerOrdersAPI(customerId)
      ]);

      if (productsRes.success) {
        setTopProducts(productsRes.data.slice(0, 8));
      }

      if (discountsRes.success) {
        setDiscounts(discountsRes.data);
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setProductModalOpen(true);
  };

  const handleOrderClick = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setOrderModalOpen(true);
  };

  const handleCopyDiscount = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kode diskon berhasil disalin!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      'pending': { bg: '#fef3c7', text: '#92400e', label: 'Menunggu' },
      'complete': { bg: '#dcfce7', text: '#166534', label: 'Selesai' },
      'refunded': { bg: '#fee2e2', text: '#991b1b', label: 'Dikembalikan' }
    };
    
    const config = statusConfig[status] || { bg: '#f3f4f6', text: '#1f2937', label: status };
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-6 py-8">
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
              Memuat data...
            </p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Selamat Datang, {userData?.full_name || 'Customer'}!
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {userData?.class} {userData?.major}
          </p>
        </div>

        {/* Top Products Card - Full Width */}
        <div 
          className="rounded-lg p-6 mb-6 border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <TrendingUp className="w-5 h-5" />
              Produk Terlaris
            </h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp 
                className="w-12 h-12 mx-auto mb-3" 
                style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} 
              />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Belum ada produk terlaris
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={product.product_picture || 'https://via.placeholder.com/100?text=No+Image'}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                  </div>
                  <p 
                    className="font-semibold mb-1 line-clamp-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {product.product_name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Terjual: {product.total_qty_sold} unit
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Grid for Discounts & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Discounts Card */}
          <div 
            className="rounded-lg p-6 border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Tag className="w-5 h-5" />
                Diskon Aktif
              </h2>
              <button
                onClick={() => navigate('/customer/discounts')}
                className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {discounts.length === 0 ? (
              <div className="text-center py-8">
                <Tag 
                  className="w-12 h-12 mx-auto mb-3" 
                  style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} 
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Belum ada diskon aktif
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {discounts.slice(0, 3).map((discount) => (
                  <div
                    key={discount.discount_code}
                    onClick={() => handleCopyDiscount(discount.discount_code)}
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="font-mono font-bold text-lg"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {discount.discount_code}
                      </span>
                      <span
                        className="text-sm font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white'
                        }}
                      >
                        {discount.discount_percent}%
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {discount.discount_description}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Valid: {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History Card */}
          <div 
            className="rounded-lg p-6 border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <ShoppingBag className="w-5 h-5" />
                Riwayat Transaksi
              </h2>
              <button
                onClick={() => navigate('/customer/history')}
                className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag 
                  className="w-12 h-12 mx-auto mb-3" 
                  style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} 
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Belum ada transaksi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.order_number}
                    onClick={() => handleOrderClick(order.order_number)}
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatDate(order.order_date)}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {order.items_count} item
                      </p>
                      <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(order.balance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {productModalOpen && selectedProductId && (
        <ProductDetailModal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          productId={selectedProductId}
        />
      )}

      {/* Order Detail Modal */}
      {orderModalOpen && userData && (
        <OrderDetailModal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          customerId={userData.id}
          orderNumber={selectedOrderNumber}
        />
      )}
    </CustomerLayout>
  );
}

export default CustomerHome;
