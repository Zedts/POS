import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { getCustomerOrderDetailsAPI } from '../api';
import { toast } from 'react-toastify';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  orderNumber: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_picture: string;
  qty_product: number;
  price_product: number;
  status: string;
}

interface OrderDetail {
  order_number: string;
  order_date: string;
  order_total: number;
  balance: number;
  discount_code: string | null;
  discount_percent: number | null;
  discount_type: string | null;
  discount_description: string | null;
  status: string;
  employee_name: string;
  employee_nisn: string;
  employee_class: string;
  employee_major: string;
  invoice_status: string | null;
  paid_by: string | null;
  items: OrderItem[];
}

function OrderDetailModal({ isOpen, onClose, customerId, orderNumber }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomerOrderDetailsAPI(customerId, orderNumber);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error(response.message || 'Gagal memuat detail order');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast.error('Gagal memuat detail order');
    } finally {
      setLoading(false);
    }
  }, [customerId, orderNumber]);

  useEffect(() => {
    if (isOpen && customerId && orderNumber) {
      fetchOrderDetail();
    }
  }, [isOpen, customerId, orderNumber, fetchOrderDetail]);

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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Detail Transaksi
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
              Memuat detail transaksi...
            </p>
          </div>
        ) : order ? (
          <>
            {/* Order Info */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p 
                    className="text-sm mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Nomor Order
                  </p>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {order.order_number}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Tanggal Transaksi
                  </p>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {formatDate(order.order_date)}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Status Order
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div>
                  <p 
                    className="text-sm mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Metode Pembayaran
                  </p>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {getPaymentMethodLabel(order.paid_by)}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <p 
                className="text-sm mb-2 font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Dilayani Oleh
              </p>
              <p 
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {order.employee_name}
              </p>
              <p 
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {order.employee_nisn} • {order.employee_class} {order.employee_major}
              </p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Produk yang Dibeli
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg flex items-center gap-4"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_picture || 'https://via.placeholder.com/100?text=No+Image'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p 
                        className="font-semibold mb-1"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {index + 1}. {item.product_name}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {item.qty_product} x {formatCurrency(item.price_product)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p 
                        className="text-lg font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {formatCurrency(item.qty_product * item.price_product)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div 
              className="p-4 rounded-lg space-y-3"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span 
                  className="font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {formatCurrency(order.order_total)}
                </span>
              </div>

              {order.discount_code && (
                <>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: '#dcfce7' }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: '#166534' }}
                      >
                        Kode Diskon: {order.discount_code}
                      </span>
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: '#166534' }}
                      >
                        {order.discount_percent}%
                      </span>
                    </div>
                    <p 
                      className="text-xs"
                      style={{ color: '#15803d' }}
                    >
                      {order.discount_description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      Diskon ({order.discount_percent}%)
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: '#10b981' }}
                    >
                      - {formatCurrency(order.order_total - order.balance)}
                    </span>
                  </div>
                </>
              )}

              <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between items-center">
                  <span 
                    className="text-xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Total
                  </span>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {formatCurrency(order.balance)}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Detail transaksi tidak ditemukan
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

export default OrderDetailModal;
