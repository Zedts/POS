import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import { getDashboardDataAPI } from '../../api';
import AdminLayout from './AdminLayout';
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp,
  AlertCircle,
  Tag
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface StatsCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

interface RecentOrder {
  orderNumber: string;
  date: string;
  employee: string;
  total: string;
  status: string;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: string;
}

interface ActiveDiscount {
  code: string;
  description: string;
  percent: number;
  endDate: string;
}

function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsCard[]>([
    {
      title: 'Total Transaksi Hari Ini',
      value: '0',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'var(--color-primary)',
      trend: '+0%'
    },
    {
      title: 'Total Pendapatan',
      value: 'Rp 0',
      icon: <DollarSign className="w-6 h-6" />,
      color: '#10b981',
      trend: '+0%'
    },
    {
      title: 'Stok Tersisa',
      value: '0',
      icon: <Package className="w-6 h-6" />,
      color: '#f59e0b',
      trend: '0 produk'
    },
    {
      title: 'Siswa Aktif',
      value: '0',
      icon: <Users className="w-6 h-6" />,
      color: '#6366f1',
      trend: 'bertugas'
    }
  ]);

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activeDiscounts, setActiveDiscounts] = useState<ActiveDiscount[]>([]);
  
  // Chart options with dynamic theme colors
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim(),
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
        }
      }
    }
  });

  const getDoughnutOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
          font: {
            size: 11
          },
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim(),
        borderWidth: 1
      }
    }
  });
  
  const [salesChartData, setSalesChartData] = useState({
    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    datasets: [
      {
        label: 'Penjualan Minggu Ini',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  });
  const [categoryChartData, setCategoryChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 0
      }
    ]
  });

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardDataAPI();
        
        if (response.success && response.data) {
          const data = response.data;

          // Update stats
          setStats([
            {
              title: 'Total Transaksi Hari Ini',
              value: data.stats.todayTransactions.toString(),
              icon: <ShoppingCart className="w-6 h-6" />,
              color: 'rgb(34, 197, 94)',
              trend: `${data.stats.monthTransactions} bulan ini`
            },
            {
              title: 'Total Pendapatan',
              value: `Rp ${new Intl.NumberFormat('id-ID').format(data.stats.todayRevenue)}`,
              icon: <DollarSign className="w-6 h-6" />,
              color: 'rgb(59, 130, 246)',
              trend: `Rp ${new Intl.NumberFormat('id-ID').format(data.stats.monthRevenue)} bulan ini`
            },
            {
              title: 'Stok Menipis',
              value: data.stats.lowStockCount.toString(),
              icon: <Package className="w-6 h-6" />,
              color: 'rgb(249, 115, 22)',
              trend: 'produk'
            },
            {
              title: 'Siswa Aktif',
              value: data.stats.activeStudents.toString(),
              icon: <Users className="w-6 h-6" />,
              color: 'rgb(168, 85, 247)',
              trend: 'bertugas'
            }
          ]);

          // Update weekly sales chart
          if (data.weeklySales && data.weeklySales.length > 0) {
            const days = data.weeklySales.map((item: { day_name: string }) => item.day_name);
            const totals = data.weeklySales.map((item: { total: number }) => item.total);
            
            setSalesChartData({
              labels: days,
              datasets: [
                {
                  label: 'Penjualan Minggu Ini',
                  data: totals,
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            });
          }

          // Update category chart
          if (data.salesByCategory && data.salesByCategory.length > 0) {
            const categories = data.salesByCategory.map((item: { category_name: string }) => item.category_name);
            const totals = data.salesByCategory.map((item: { total: number }) => item.total);
            
            setCategoryChartData({
              labels: categories,
              datasets: [
                {
                  data: totals,
                  backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(249, 115, 22)',
                    'rgb(168, 85, 247)',
                    'rgb(236, 72, 153)',
                    'rgb(20, 184, 166)',
                    'rgb(251, 146, 60)'
                  ],
                  borderWidth: 0
                }
              ]
            });
          }

          // Update recent orders
          if (data.recentOrders && data.recentOrders.length > 0) {
            const formattedOrders = data.recentOrders.map((order: {
              order_number: string;
              order_date: string;
              order_total: number;
              employee_name: string;
              status: string;
            }) => ({
              orderNumber: order.order_number,
              date: new Date(order.order_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              employee: order.employee_name,
              total: `Rp ${new Intl.NumberFormat('id-ID').format(order.order_total)}`,
              status: order.status
            }));
            setRecentOrders(formattedOrders);
          }

          // Update top products
          if (data.topProducts && data.topProducts.length > 0) {
            const formattedProducts = data.topProducts.map((product: {
              product_name: string;
              total_sold: number;
              total_revenue: number;
            }) => ({
              name: product.product_name,
              sold: product.total_sold,
              revenue: `Rp ${new Intl.NumberFormat('id-ID').format(product.total_revenue)}`
            }));
            setTopProducts(formattedProducts);
          }

          // Update active discounts
          if (data.activeDiscounts && data.activeDiscounts.length > 0) {
            const formattedDiscounts = data.activeDiscounts.map((discount: {
              discount_code: string;
              description: string;
              discount_percent: number;
              end_date: string;
            }) => ({
              code: discount.discount_code,
              description: discount.description,
              percent: discount.discount_percent,
              endDate: new Date(discount.end_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })
            }));
            setActiveDiscounts(formattedDiscounts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Memuat data dashboard...</p>
          </div>
        </div>
      ) : (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Ringkasan data penting sistem POS
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <span
                      className="text-sm font-semibold flex items-center gap-1"
                      style={{ color: stat.color }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <h3 className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Line Chart - Sales per Week */}
            <div
              className="lg:col-span-2 p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Grafik Penjualan Per Minggu
              </h2>
              <div style={{ height: '300px' }}>
                <Line data={salesChartData} options={getChartOptions()} />
              </div>
            </div>

            {/* Doughnut Chart - Sales per Category */}
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Penjualan Per Kategori
              </h2>
              <div style={{ height: '300px' }}>
                <Doughnut data={categoryChartData} options={getDoughnutOptions()} />
              </div>
            </div>
          </div>

          {/* Recent Orders & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Orders */}
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <ShoppingCart className="w-5 h-5" />
                Order Terbaru
              </h2>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-secondary)' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Belum ada order hari ini
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {order.orderNumber}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: order.status === 'complete' ? '#10b98120' : '#f59e0b20',
                            color: order.status === 'complete' ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {order.employee} • {order.date}
                      </p>
                      <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {order.total}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <TrendingUp className="w-5 h-5" />
                Produk Terlaris
              </h2>
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-secondary)' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Belum ada data penjualan
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {product.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Terjual: {product.sold} unit
                          </p>
                        </div>
                        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                          {product.revenue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Discounts */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Tag className="w-5 h-5" />
              Diskon Aktif
            </h2>
            {activeDiscounts.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-secondary)' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Tidak ada diskon yang aktif saat ini
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDiscounts.map((discount, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="font-mono font-bold text-lg"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {discount.code}
                      </span>
                      <span
                        className="text-sm font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white'
                        }}
                      >
                        {discount.percent}%
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {discount.description}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Berlaku hingga: {discount.endDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
}

export default AdminHome;
