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

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Products Card */}
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                <TrendingUp size={24} />
              </div>
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Produk Terlaris
              </h2>
            </div>

            <div className="space-y-3 mb-4">
              {topProducts.length === 0 ? (
                <p 
                  className="text-center py-8"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Belum ada produk terlaris
                </p>
              ) : (
                topProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-opacity-50 transition-all"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-semibold truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {product.product_name}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {product.total_qty_sold} terjual
                      </p>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Discounts Card */}
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
              >
                <Tag size={24} />
              </div>
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Diskon Aktif
              </h2>
            </div>

            <div className="space-y-3 mb-4">
              {discounts.length === 0 ? (
                <p 
                  className="text-center py-8"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Belum ada diskon aktif
                </p>
              ) : (
                discounts.map((discount) => (
                  <div
                    key={discount.discount_code}
                    onClick={() => handleCopyDiscount(discount.discount_code)}
                    className="p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all"
                    style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p 
                        className="font-bold text-lg"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {discount.discount_code}
                      </p>
                      <span 
                        className="px-2 py-1 rounded-full text-sm font-bold"
                        style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                      >
                        {discount.discount_percent}%
                      </span>
                    </div>
                    <p 
                      className="text-sm mb-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {discount.discount_description}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Valid: {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
                    </p>
                    <p 
                      className="text-xs mt-2 italic"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Klik untuk salin kode
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/customer/discounts')}
              className="w-full py-2 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Lihat Semua Diskon
            </button>
          </div>

          {/* Transaction History Card */}
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: '#f59e0b', color: 'white' }}
              >
                <ShoppingBag size={24} />
              </div>
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Riwayat Transaksi
              </h2>
            </div>

            <div className="space-y-3 mb-4">
              {recentOrders.length === 0 ? (
                <p 
                  className="text-center py-8"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Belum ada transaksi
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.order_number}
                    onClick={() => handleOrderClick(order.order_number)}
                    className="p-4 rounded-lg cursor-pointer hover:bg-opacity-50 transition-all"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p 
                          className="font-semibold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {order.order_number}
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {formatDate(order.order_date)}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {order.items_count} item
                      </p>
                      <p 
                        className="font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {formatCurrency(order.balance)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/customer/history')}
              className="w-full py-2 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Lihat Semua Transaksi
            </button>
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
