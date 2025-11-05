import { useEffect, useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getPriceHistoryByProductAPI } from '../api';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceHistory {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  change_reason: string | null;
  changed_at: string;
  changed_by: number;
  changed_by_name: string;
}

interface Product {
  id: number;
  product_name: string;
  picture_url: string;
  current_price: number;
  category_name: string;
}

interface PriceHistoryModalProps {
  productId: number;
  onClose: () => void;
}

function PriceHistoryModal({ productId, onClose }: PriceHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPriceHistoryByProductAPI(productId);
        if (response.success) {
          setProduct(response.data.product);
          setHistory(response.data.history);
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(err.message || 'Gagal mengambil data riwayat harga');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = {
    labels: [...history].reverse().map(item => new Date(item.changed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Harga',
        data: [...history].reverse().map(item => item.new_price),
        borderColor: 'rgba(1, 159, 99, 1)',
        backgroundColor: 'rgba(1, 159, 99, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: { parsed: { y: number | null } }) {
            return formatCurrency(context.parsed.y || 0);
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: string | number) {
            return formatCurrency(Number(value));
          }
        }
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-4">
            {product && product.picture_url && (
              <img
                src={product.picture_url.startsWith('http') ? product.picture_url : `http://192.168.1.138:3000${product.picture_url}`}
                alt={product.product_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Riwayat Harga Produk
              </h2>
              {product && (
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {product.product_name} • {product.category_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
              <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
              <p>Belum ada riwayat perubahan harga untuk produk ini</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Price Card */}
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Harga Saat Ini
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(product?.current_price || 0)}
                </p>
              </div>

              {/* Chart */}
              {history.length > 0 && (
                <div 
                  className="p-6 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Tren Perubahan Harga
                  </h3>
                  <div className="h-64">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {/* History Table */}
              <div 
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--color-background)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Harga Lama
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          →
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Harga Baru
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Alasan
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Diubah Oleh
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr 
                          key={item.id}
                          className="border-t"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {formatDate(item.changed_at)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm line-through" style={{ color: 'var(--color-text-secondary)' }}>
                            {formatCurrency(item.old_price)}
                          </td>
                          <td className="px-4 py-3 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                            →
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: item.new_price > item.old_price ? 'var(--color-error)' : 'var(--color-success)' }}>
                            {formatCurrency(item.new_price)}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {item.change_reason || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.changed_by_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PriceHistoryModal;
