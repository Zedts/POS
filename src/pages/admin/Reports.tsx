import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import {
  getSalesReportAPI,
  getTopProductsAPI,
  getDiscountUsageAPI,
  getStockStatusAPI,
  getStudentRevenueByClassAPI,
  getStudentRevenueByMajorAPI
} from '../../api/index';
import {
  Calendar,
  TrendingUp,
  Package,
  Tag,
  AlertTriangle,
  Users,
  FileDown,
  X
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type DatePreset = 'today' | 'week' | 'month' | 'last30' | 'custom';

interface SalesReport {
  summary: {
    total_transactions: number;
    total_revenue: number;
    average_order_value: number;
  };
  trend: Array<{
    date: string;
    transactions: number;
    revenue: number;
  }>;
}

interface TopProduct {
  id: number;
  product_name: string;
  product_picture: string;
  product_price: number;
  total_qty_sold: number;
  total_revenue: number;
}

interface DiscountUsage {
  discount_code: string;
  discount_description: string;
  discount_type: string;
  discount_percent: number;
  usage_count: number;
  total_discount_amount: number;
  total_revenue_with_discount: number;
}

interface StockStatus {
  low_stock: Array<{
    id: number;
    product_name: string;
    product_picture: string;
    product_stock: number;
    product_price: number;
    category_id: number;
  }>;
  expired: Array<{
    id: number;
    product_name: string;
    product_picture: string;
    product_stock: number;
    expired_date: string;
    product_price: number;
    category_id: number;
  }>;
  out_of_stock: Array<{
    id: number;
    product_name: string;
    product_picture: string;
    product_stock: number;
    product_price: number;
    category_id: number;
  }>;
}

interface StudentRevenue {
  class?: string;
  major?: string;
  total_students: number;
  total_transactions: number;
  total_revenue: number;
  average_order_value: number;
}

function Reports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'discounts' | 'stock' | 'students'>('sales');
  const [datePreset, setDatePreset] = useState<DatePreset>('month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  // Data states
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [topProductsData, setTopProductsData] = useState<TopProduct[]>([]);
  const [discountData, setDiscountData] = useState<DiscountUsage[]>([]);
  const [stockData, setStockData] = useState<StockStatus | null>(null);
  const [revenueByClass, setRevenueByClass] = useState<StudentRevenue[]>([]);
  const [revenueByMajor, setRevenueByMajor] = useState<StudentRevenue[]>([]);

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const start = firstDay.toISOString().split('T')[0];
    const end = lastDay.toISOString().split('T')[0];
    
    setDateRange({ start, end });
    setCustomStartDate(start);
    setCustomEndDate(end);
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sales, products, discounts, stock, revenueClass, revenueMajor] = await Promise.all([
        getSalesReportAPI(dateRange.start, dateRange.end),
        getTopProductsAPI(dateRange.start, dateRange.end),
        getDiscountUsageAPI(dateRange.start, dateRange.end),
        getStockStatusAPI(),
        getStudentRevenueByClassAPI(dateRange.start, dateRange.end),
        getStudentRevenueByMajorAPI(dateRange.start, dateRange.end)
      ]);

      if (sales.success) setSalesData(sales.data);
      if (products.success) setTopProductsData(products.data);
      if (discounts.success) setDiscountData(discounts.data);
      if (stock.success) setStockData(stock.data);
      if (revenueClass.success) setRevenueByClass(revenueClass.data);
      if (revenueMajor.success) setRevenueByMajor(revenueMajor.data);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    
    if (preset === 'custom') {
      setShowCustomModal(true);
      return;
    }

    const now = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = end = now.toISOString().split('T')[0];
        break;
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        start = weekStart.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last30': {
        const last30 = new Date(now);
        last30.setDate(now.getDate() - 30);
        start = last30.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      }
      default:
        return;
    }

    setDateRange({ start, end });
  };

  const handleApplyCustomDate = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('Tanggal mulai dan akhir harus diisi');
      return;
    }

    if (new Date(customStartDate) > new Date(customEndDate)) {
      toast.error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    setDateRange({ start: customStartDate, end: customEndDate });
    setShowCustomModal(false);
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Export functions will be continued in next part...
  
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Report Center
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Pusat laporan keuangan dan aktivitas POS
            </p>
          </div>

          {/* Global Date Filter */}
          <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Periode:
                </span>
              </div>
              
              <select
                value={datePreset}
                onChange={(e) => handlePresetChange(e.target.value as DatePreset)}
                className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="last30">30 Hari Terakhir</option>
                <option value="custom">Custom Range</option>
              </select>

              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ borderBottom: '2px solid var(--color-border)' }}>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sales' ? 'border-b-2' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'sales' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'sales' ? 'white' : 'var(--color-text-primary)',
                borderColor: activeTab === 'sales' ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                Penjualan
              </div>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'products' ? 'border-b-2' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'products' ? 'white' : 'var(--color-text-primary)',
                borderColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <Package size={18} />
                Produk Terlaris
              </div>
            </button>

            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'discounts' ? 'border-b-2' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'discounts' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'discounts' ? 'white' : 'var(--color-text-primary)',
                borderColor: activeTab === 'discounts' ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <Tag size={18} />
                Penggunaan Diskon
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'stock' ? 'border-b-2' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'stock' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'stock' ? 'white' : 'var(--color-text-primary)',
                borderColor: activeTab === 'stock' ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                Stok & Kadaluarsa
              </div>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'students' ? 'border-b-2' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'students' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'students' ? 'white' : 'var(--color-text-primary)',
                borderColor: activeTab === 'students' ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Pendapatan Siswa
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
                  <p style={{ color: 'var(--color-text-secondary)' }}>Loading data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Sales Report Tab */}
                {activeTab === 'sales' && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          Total Transaksi
                        </p>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                          {salesData?.summary.total_transactions || 0}
                        </p>
                      </div>
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          Total Pendapatan
                        </p>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>
                          {formatCurrency(salesData?.summary.total_revenue || 0)}
                        </p>
                      </div>
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          Rata-rata Order
                        </p>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-info)' }}>
                          {formatCurrency(salesData?.summary.average_order_value || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Trend Penjualan
                        </h3>
                        <button
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.text('Sales Report', 14, 15);
                            doc.text(`Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 14, 25);
                            autoTable(doc, {
                              startY: 35,
                              head: [['Date', 'Transactions', 'Revenue']],
                              body: salesData?.trend && salesData.trend.length > 0 
                                ? salesData.trend.map(item => [
                                    formatDate(item.date),
                                    item.transactions,
                                    formatCurrency(item.revenue)
                                  ])
                                : [['No data', '0', 'Rp 0']]
                            });
                            doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
                          }}
                          className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        >
                          <FileDown size={18} />
                          Export PDF
                        </button>
                      </div>
                      <div className="h-80">
                        <Line
                          data={{
                            labels: salesData?.trend && salesData.trend.length > 0
                              ? salesData.trend.map(item => formatDate(item.date))
                              : ['No Data'],
                            datasets: [
                              {
                                label: 'Revenue',
                                data: salesData?.trend && salesData.trend.length > 0
                                  ? salesData.trend.map(item => item.revenue)
                                  : [0],
                                borderColor: 'rgb(1, 159, 99)',
                                backgroundColor: 'rgba(1, 159, 99, 0.1)',
                                fill: true,
                                tension: 0.4
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                      {(!salesData?.trend || salesData.trend.length === 0) && (
                        <p className="text-center mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                          Tidak ada data penjualan untuk periode ini
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Top Products Tab */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    {/* Chart */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Top 5 Produk Terlaris
                        </h3>
                        <button
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.text('Top Products Report', 14, 15);
                            autoTable(doc, {
                              startY: 25,
                              head: [['Product', 'Qty Sold', 'Revenue']],
                              body: topProductsData.length > 0
                                ? topProductsData.map(item => [
                                    item.product_name,
                                    item.total_qty_sold,
                                    formatCurrency(item.total_revenue)
                                  ])
                                : [['No data', '0', 'Rp 0']]
                            });
                            doc.save(`top_products_${new Date().toISOString().split('T')[0]}.pdf`);
                          }}
                          className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        >
                          <FileDown size={18} />
                          Export PDF
                        </button>
                      </div>
                      <div className="h-80">
                        <Bar
                          data={{
                            labels: topProductsData.length > 0
                              ? topProductsData.map(item => item.product_name)
                              : ['No Data'],
                            datasets: [{
                              label: 'Qty Terjual',
                              data: topProductsData.length > 0
                                ? topProductsData.map(item => item.total_qty_sold)
                                : [0],
                              backgroundColor: 'rgba(1, 159, 99, 0.8)'
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false
                          }}
                        />
                      </div>
                      {topProductsData.length === 0 && (
                        <p className="text-center mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                          Tidak ada data produk untuk periode ini
                        </p>
                      )}
                    </div>

                    {/* Products List */}
                    {topProductsData.length > 0 && (
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Detail Produk
                          </h3>
                          <button
                            onClick={() => navigate('/admin/products')}
                            className="px-4 py-2 rounded-lg border font-medium transition-colors"
                            style={{
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            View Detail
                          </button>
                        </div>
                        <div className="space-y-3">
                          {topProductsData.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-4 p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                #{index + 1}
                              </span>
                              {product.product_picture && (
                                <img
                                  src={product.product_picture.startsWith('http') ? product.product_picture : `http://172.11.10.44:3000${product.product_picture}`}
                                  alt={product.product_name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                  {product.product_name}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  Terjual: {product.total_qty_sold} unit
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold" style={{ color: 'var(--color-success)' }}>
                                  {formatCurrency(product.total_revenue)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Discount Usage Tab */}
                {activeTab === 'discounts' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Donut Chart */}
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                          Distribusi Penggunaan Diskon
                        </h3>
                        <div className="h-80">
                          <Doughnut
                            data={{
                              labels: discountData.length > 0
                                ? discountData.map(item => item.discount_code)
                                : ['No Data'],
                              datasets: [{
                                data: discountData.length > 0
                                  ? discountData.map(item => item.usage_count)
                                  : [1],
                                backgroundColor: discountData.length > 0
                                  ? [
                                      'rgba(1, 159, 99, 0.8)',
                                      'rgba(59, 130, 246, 0.8)',
                                      'rgba(245, 158, 11, 0.8)',
                                      'rgba(239, 68, 68, 0.8)',
                                      'rgba(168, 85, 247, 0.8)'
                                    ]
                                  : ['rgba(200, 200, 200, 0.3)']
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false
                            }}
                          />
                        </div>
                        {discountData.length === 0 && (
                          <p className="text-center mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                            Tidak ada penggunaan diskon untuk periode ini
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Ringkasan
                          </h3>
                          <button
                            onClick={() => {
                              const doc = new jsPDF();
                              doc.text('Discount Usage Report', 14, 15);
                              autoTable(doc, {
                                startY: 25,
                                head: [['Code', 'Usage', 'Total Discount']],
                                body: discountData.length > 0
                                  ? discountData.map(item => [
                                      item.discount_code,
                                      item.usage_count,
                                      formatCurrency(item.total_discount_amount)
                                    ])
                                  : [['No data', '0', 'Rp 0']]
                              });
                              doc.save(`discount_usage_${new Date().toISOString().split('T')[0]}.pdf`);
                            }}
                            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                          >
                            <FileDown size={18} />
                            Export
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              Total Diskon Digunakan
                            </p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                              {discountData.reduce((sum, item) => sum + item.usage_count, 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              Total Penghematan
                            </p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-danger)' }}>
                              {formatCurrency(discountData.reduce((sum, item) => sum + item.total_discount_amount, 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    {discountData.length > 0 && (
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Detail Diskon
                          </h3>
                          <button
                            onClick={() => navigate('/admin/discounts')}
                            className="px-4 py-2 rounded-lg border font-medium transition-colors"
                            style={{
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            View Detail
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead style={{ backgroundColor: 'var(--color-background)' }}>
                              <tr>
                                <th className="px-4 py-3 text-left" style={{ color: 'var(--color-text-primary)' }}>Code</th>
                                <th className="px-4 py-3 text-left" style={{ color: 'var(--color-text-primary)' }}>Description</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Usage</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Total Discount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {discountData.map(item => (
                                <tr key={item.discount_code} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-primary)' }}>
                                    {item.discount_code}
                                  </td>
                                  <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.discount_description}
                                  </td>
                                  <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.usage_count}x
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-danger)' }}>
                                    {formatCurrency(item.total_discount_amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status Tab */}
                {activeTab === 'stock' && (
                  <div className="space-y-6">
                    {/* Low Stock */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Stok Rendah ({stockData?.low_stock.length || 0})
                        </h3>
                        <button
                          onClick={() => navigate('/admin/products')}
                          className="px-4 py-2 rounded-lg border font-medium transition-colors"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          View Detail
                        </button>
                      </div>
                      {stockData && stockData.low_stock.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {stockData.low_stock.map(product => (
                            <div key={product.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-warning)' }}>
                              {product.product_picture && (
                                <img
                                  src={product.product_picture.startsWith('http') ? product.product_picture : `http://172.11.10.44:3000${product.product_picture}`}
                                  alt={product.product_name}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                              )}
                              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                {product.product_name}
                              </p>
                              <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
                                Stok: {product.product_stock} unit
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                          <Package size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Tidak ada produk dengan stok rendah</p>
                        </div>
                      )}
                    </div>

                    {/* Expired */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Produk Kadaluarsa ({stockData?.expired.length || 0})
                        </h3>
                        <button
                          onClick={() => navigate('/admin/products')}
                          className="px-4 py-2 rounded-lg border font-medium transition-colors"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          View Detail
                        </button>
                      </div>
                      {stockData && stockData.expired.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {stockData.expired.map(product => (
                            <div key={product.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-danger)' }}>
                              {product.product_picture && (
                                <img
                                  src={product.product_picture.startsWith('http') ? product.product_picture : `http://172.11.10.44:3000${product.product_picture}`}
                                  alt={product.product_name}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                              )}
                              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                {product.product_name}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Expired: {formatDate(product.expired_date)}
                              </p>
                              <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
                                Stok: {product.product_stock} unit
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                          <Package size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Tidak ada produk kadaluarsa</p>
                        </div>
                      )}
                    </div>

                    {/* Out of Stock */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Stok Habis ({stockData?.out_of_stock.length || 0})
                        </h3>
                        <button
                          onClick={() => navigate('/admin/products')}
                          className="px-4 py-2 rounded-lg border font-medium transition-colors"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          View Detail
                        </button>
                      </div>
                      {stockData && stockData.out_of_stock.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {stockData.out_of_stock.map(product => (
                            <div key={product.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                              {product.product_picture && (
                                <img
                                  src={product.product_picture.startsWith('http') ? product.product_picture : `http://172.11.10.44:3000${product.product_picture}`}
                                  alt={product.product_name}
                                  className="w-full h-32 object-cover rounded-lg mb-3 opacity-50"
                                />
                              )}
                              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                {product.product_name}
                              </p>
                              <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
                                Stok: {product.product_stock} unit
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                          <Package size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Semua produk tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Student Revenue Tab */}
                {activeTab === 'students' && (
                  <div className="space-y-6">
                    {/* By Class */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Pendapatan Per Kelas
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const doc = new jsPDF();
                              doc.text('Student Revenue by Class', 14, 15);
                              autoTable(doc, {
                                startY: 25,
                                head: [['Class', 'Students', 'Transactions', 'Revenue']],
                                body: revenueByClass.length > 0
                                  ? revenueByClass.map(item => [
                                      item.class || '-',
                                      String(item.total_students),
                                      String(item.total_transactions || 0),
                                      formatCurrency(item.total_revenue || 0)
                                    ])
                                  : [['No data', '0', '0', 'Rp 0']]
                              });
                              doc.save(`revenue_by_class_${new Date().toISOString().split('T')[0]}.pdf`);
                            }}
                            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                          >
                            <FileDown size={18} />
                            Export
                          </button>
                          <button
                            onClick={() => navigate('/admin/students')}
                            className="px-4 py-2 rounded-lg border font-medium transition-colors"
                            style={{
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            View Detail
                          </button>
                        </div>
                      </div>
                      <div className="h-80 mb-6">
                        <Bar
                          data={{
                            labels: revenueByClass.length > 0
                              ? revenueByClass.map(item => `Kelas ${item.class}`)
                              : ['No Data'],
                            datasets: [{
                              label: 'Total Revenue',
                              data: revenueByClass.length > 0
                                ? revenueByClass.map(item => item.total_revenue || 0)
                                : [0],
                              backgroundColor: 'rgba(1, 159, 99, 0.8)'
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y'
                          }}
                        />
                      </div>
                      {revenueByClass.length === 0 && (
                        <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                          Tidak ada data pendapatan untuk periode ini
                        </p>
                      )}
                      {revenueByClass.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead style={{ backgroundColor: 'var(--color-background)' }}>
                              <tr>
                                <th className="px-4 py-3 text-left" style={{ color: 'var(--color-text-primary)' }}>Kelas</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Siswa</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Transaksi</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Pendapatan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {revenueByClass.map(item => (
                                <tr key={item.class} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-primary)' }}>
                                    Kelas {item.class}
                                  </td>
                                  <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.total_students}
                                  </td>
                                  <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.total_transactions || 0}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-success)' }}>
                                    {formatCurrency(item.total_revenue || 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* By Major */}
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Pendapatan Per Jurusan
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const doc = new jsPDF();
                              doc.text('Student Revenue by Major', 14, 15);
                              autoTable(doc, {
                                startY: 25,
                                head: [['Major', 'Students', 'Transactions', 'Revenue']],
                                body: revenueByMajor.length > 0
                                  ? revenueByMajor.map(item => [
                                      item.major || '-',
                                      String(item.total_students),
                                      String(item.total_transactions || 0),
                                      formatCurrency(item.total_revenue || 0)
                                    ])
                                  : [['No data', '0', '0', 'Rp 0']]
                              });
                              doc.save(`revenue_by_major_${new Date().toISOString().split('T')[0]}.pdf`);
                            }}
                            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                          >
                            <FileDown size={18} />
                            Export
                          </button>
                          <button
                            onClick={() => navigate('/admin/students')}
                            className="px-4 py-2 rounded-lg border font-medium transition-colors"
                            style={{
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            View Detail
                          </button>
                        </div>
                      </div>
                      <div className="h-80 mb-6">
                        <Bar
                          data={{
                            labels: revenueByMajor.length > 0
                              ? revenueByMajor.map(item => item.major)
                              : ['No Data'],
                            datasets: [{
                              label: 'Total Revenue',
                              data: revenueByMajor.length > 0
                                ? revenueByMajor.map(item => item.total_revenue || 0)
                                : [0],
                              backgroundColor: 'rgba(59, 130, 246, 0.8)'
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y'
                          }}
                        />
                      </div>
                      {revenueByMajor.length === 0 && (
                        <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                          Tidak ada data pendapatan untuk periode ini
                        </p>
                      )}
                      {revenueByMajor.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead style={{ backgroundColor: 'var(--color-background)' }}>
                              <tr>
                                <th className="px-4 py-3 text-left" style={{ color: 'var(--color-text-primary)' }}>Jurusan</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Siswa</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Transaksi</th>
                                <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>Pendapatan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {revenueByMajor.map(item => (
                                <tr key={item.major} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-info)' }}>
                                    {item.major}
                                  </td>
                                  <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.total_students}
                                  </td>
                                  <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.total_transactions || 0}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-success)' }}>
                                    {formatCurrency(item.total_revenue || 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={() => setShowCustomModal(false)}
        >
          <div
            className="rounded-lg shadow-xl max-w-md w-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Custom Date Range
              </h2>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
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
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomDate}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Reports;
