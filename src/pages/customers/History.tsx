import { useEffect, useState } from 'react';
import { Search, Calendar, ShoppingBag, Filter, X } from 'lucide-react';
import CustomerLayout from '../../components/CustomerLayout';
import OrderDetailModal from '../../components/OrderDetailModal';
import { getCustomerOrdersAPI } from '../../api';
import { getUserData } from '../../utils/auth';
import { toast } from 'react-toastify';

interface Order {
  order_number: string;
  order_date: string;
  order_total: number;
  balance: number;
  status: string;
  discount_code: string | null;
  employee_name: string;
  invoice_number: string | null;
  invoice_status: string | null;
  paid_by: string | null;
  total_items: number;
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

function CustomerHistory() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal states
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');

  useEffect(() => {
    const data = getUserData() as UserData | null;
    setUserData(data);
    
    if (data?.id) {
      fetchOrders(data.id);
    }
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, startDate, endDate]);

  const fetchOrders = async (customerId: number) => {
    try {
      setLoading(true);
      const response = await getCustomerOrdersAPI(customerId);
      
      if (response.success) {
        setOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        toast.error('Gagal memuat riwayat transaksi');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Filter by search query (order number or employee name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.employee_name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(order => 
        new Date(order.order_date) >= new Date(startDate)
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => 
        new Date(order.order_date) <= endDateTime
      );
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOrderClick = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setOrderModalOpen(true);
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
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return '-';
    return method === 'cash' ? 'Tunai' : 'QR Code';
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || startDate || endDate;

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
              Memuat riwayat transaksi...
            </p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              <ShoppingBag size={28} />
            </div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Riwayat Transaksi
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Lihat semua transaksi Anda
          </p>
        </div>

        {/* Search & Filter Section */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Cari nomor order atau kasir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="complete">Selesai</option>
                <option value="refunded">Dikembalikan</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <input
                type="date"
                placeholder="Tanggal Mulai"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <input
                type="date"
                placeholder="Tanggal Akhir"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <X size={18} />
                Hapus Filter
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Menampilkan <span className="font-bold">{filteredOrders.length}</span> dari <span className="font-bold">{orders.length}</span> transaksi
          </p>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div 
            className="rounded-lg p-12 text-center"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <ShoppingBag 
              size={64} 
              className="mx-auto mb-4"
              style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
            />
            <p 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {hasActiveFilters ? 'Tidak ada transaksi yang sesuai' : 'Belum ada transaksi'}
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {hasActiveFilters ? 'Coba ubah filter pencarian Anda' : 'Transaksi Anda akan muncul di sini'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.order_number}
                onClick={() => handleOrderClick(order.order_number)}
                className="rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Order Info */}
                  <div>
                    <p 
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Nomor Order
                    </p>
                    <p 
                      className="font-bold text-lg"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {order.order_number}
                    </p>
                    <p 
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {formatDate(order.order_date)}
                    </p>
                  </div>

                  {/* Items & Kasir */}
                  <div>
                    <p 
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Produk & Kasir
                    </p>
                    <p 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {order.total_items} item
                    </p>
                    <p 
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Dilayani: {order.employee_name}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <p 
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Pembayaran
                    </p>
                    <p 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {getPaymentMethodLabel(order.paid_by)}
                    </p>
                    {order.discount_code && (
                      <p 
                        className="text-sm mt-1 font-semibold"
                        style={{ color: '#10b981' }}
                      >
                        Diskon: {order.discount_code}
                      </p>
                    )}
                  </div>

                  {/* Total & Status */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p 
                        className="text-sm mb-1"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Total Pembayaran
                      </p>
                      <p 
                        className="font-bold text-2xl"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {formatCurrency(order.balance)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default CustomerHistory;
