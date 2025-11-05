import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import {
  getOrdersAPI,
  getOrderByNumberAPI,
  getOrderStatsAPI,
} from '../../api';
import { 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  Eye,
  Download,
  X,
  FileText,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Order {
  order_number: string;
  order_date: string;
  employee_id: number;
  employee_name: string;
  employee_nisn: string;
  order_total: number;
  balance: number;
  discount_code: string | null;
  status: 'pending' | 'complete' | 'refunded';
}

interface OrderDetail {
  id: number;
  order_number: string;
  product_id: number;
  product_name: string;
  product_picture: string;
  qty_product: number;
  price_product: number;
  status: string;
  verified_by: number | null;
  verified_date: string | null;
  verified_by_name: string | null;
  balance: number;
}

interface OrderWithDetails extends Order {
  items: OrderDetail[];
  discount_description?: string;
  discount_percent?: number;
  discount_type?: string;
  employee_class?: string;
  employee_major?: string;
}

interface OrderStats {
  total_orders: number;
  pending_orders: number;
  complete_orders: number;
  refunded_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [exportFormats, setExportFormats] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeName: '',
    status: ''
  });
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    fetchData();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounce !== filters.employeeName) {
        setFilters(prev => ({ ...prev, employeeName: searchDebounce }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce, filters.employeeName]);

  // Fetch data when filters change
  useEffect(() => {
    if (filters.employeeName !== searchDebounce) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.employeeName, filters.status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        getOrdersAPI(),
        getOrderStatsAPI()
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat data order');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersRes = await getOrdersAPI(filters);
      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat data order');
    }
  };

  const handleViewDetail = async (orderNumber: string) => {
    try {
      const res = await getOrderByNumberAPI(orderNumber);
      if (res.success) {
        setSelectedOrder(res.data);
        setShowDetailModal(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat detail order');
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleSelectOrder = (orderNumber: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderNumber)) {
        return prev.filter(on => on !== orderNumber);
      } else {
        return [...prev, orderNumber];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.order_number));
    }
  };

  const handleOpenExportModal = () => {
    if (selectedOrders.length === 0) {
      toast.error('Pilih minimal 1 order untuk di-export');
      return;
    }
    setShowExportModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setExportFormats([]);
  };

  const handleToggleFormat = (format: string) => {
    setExportFormats(prev => {
      if (prev.includes(format)) {
        return prev.filter(f => f !== format);
      } else {
        return [...prev, format];
      }
    });
  };

  const handleExport = async () => {
    if (exportFormats.length === 0) {
      toast.error('Pilih minimal 1 format export');
      return;
    }

    try {
      const selectedOrdersData = orders.filter(o => selectedOrders.includes(o.order_number));

      for (const format of exportFormats) {
        if (format === 'pdf') {
          await exportToPDF(selectedOrdersData);
        } else if (format === 'excel') {
          await exportToExcel(selectedOrdersData);
        } else if (format === 'receipt') {
          await exportToReceipt(selectedOrdersData);
        }
      }

      toast.success(`Export ${exportFormats.join(', ')} berhasil`);
      handleCloseExportModal();
      setSelectedOrders([]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Gagal melakukan export');
    }
  };

  const exportToPDF = async (ordersData: Order[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Transaksi', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    doc.text(`Total Order: ${ordersData.length}`, 14, 34);

    const tableData = ordersData.map(order => [
      order.order_number,
      formatDate(order.order_date),
      order.employee_name,
      order.status.toUpperCase(),
      formatCurrency(order.order_total)
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Order Number', 'Tanggal', 'Kasir', 'Status', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [1, 159, 99] }
    });

    doc.save(`orders_${Date.now()}.pdf`);
  };

  const exportToExcel = async (ordersData: Order[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      ordersData.map(order => ({
        'Order Number': order.order_number,
        'Tanggal': formatDate(order.order_date),
        'Kasir': order.employee_name,
        'NISN': order.employee_nisn,
        'Status': order.status.toUpperCase(),
        'Kode Diskon': order.discount_code || '-',
        'Total': order.order_total,
        'Balance': order.balance
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `orders_${Date.now()}.xlsx`);
  };

  const exportToReceipt = async (ordersData: Order[]) => {
    const doc = new jsPDF({
      format: [58, 210],
      unit: 'mm'
    });

    let yPos = 10;

    for (let i = 0; i < ordersData.length; i++) {
      const order = ordersData[i];
      
      if (i > 0) {
        doc.addPage();
        yPos = 10;
      }

      doc.setFontSize(10);
      doc.text('== STRUK PEMBELIAN ==', 29, yPos, { align: 'center' });
      yPos += 6;

      doc.setFontSize(8);
      doc.text(`Order: ${order.order_number}`, 4, yPos);
      yPos += 4;
      doc.text(`Tanggal: ${formatDate(order.order_date)}`, 4, yPos);
      yPos += 4;
      doc.text(`Kasir: ${order.employee_name}`, 4, yPos);
      yPos += 4;
      doc.text('------------------------', 4, yPos);
      yPos += 4;

      if (order.discount_code) {
        doc.text(`Diskon: ${order.discount_code}`, 4, yPos);
        yPos += 4;
      }

      doc.setFontSize(9);
      doc.text(`Total: ${formatCurrency(order.order_total)}`, 4, yPos);
      yPos += 4;
      doc.text(`Status: ${order.status.toUpperCase()}`, 4, yPos);
      yPos += 6;
      
      doc.setFontSize(8);
      doc.text('Terima kasih atas', 29, yPos, { align: 'center' });
      yPos += 4;
      doc.text('kunjungan Anda!', 29, yPos, { align: 'center' });
    }

    doc.save(`receipt_${Date.now()}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'var(--color-warning)', Icon: Clock },
      complete: { label: 'Complete', color: 'var(--color-success)', Icon: CheckCircle2 },
      refunded: { label: 'Refunded', color: 'var(--color-danger)', Icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.Icon;

    return (
      <span
        className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        <Icon size={14} />
        {config.label}
      </span>
    );
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
               style={{ borderColor: 'var(--color-primary)' }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Order & Sales Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Pantau aktivitas transaksi siswa POS
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Order
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.total_orders || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(1, 159, 99, 0.1)' }}
                  >
                    <ShoppingCart size={24} style={{ color: 'var(--color-success)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Pending
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.pending_orders || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                  >
                    <Clock size={24} style={{ color: 'var(--color-warning)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Complete
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.complete_orders || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  >
                    <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Refunded
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.refunded_orders || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  >
                    <XCircle size={24} style={{ color: 'var(--color-danger)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border col-span-1 md:col-span-2 lg:col-span-1"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Hari Ini
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.today_orders || 0}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <TrendingUp size={24} style={{ color: 'var(--color-info)' }} />
                  </div>
                </div>
              </div>

              <div
                className="p-6 rounded-lg border col-span-1 md:col-span-2"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Pendapatan
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(stats.total_revenue || 0)}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(1, 159, 99, 0.1)' }}
                  >
                    <DollarSign size={24} style={{ color: 'var(--color-success)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div
            className="p-4 rounded-lg border mb-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2"
                       style={{ color: 'var(--color-text-primary)' }}>
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2"
                       style={{ color: 'var(--color-text-primary)' }}>
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2"
                       style={{ color: 'var(--color-text-primary)' }}>
                  Cari Nama Kasir
                </label>
                <input
                  type="text"
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Nama kasir..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2"
                       style={{ color: 'var(--color-text-primary)' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Button (shown when orders are selected) */}
          {selectedOrders.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleOpenExportModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                <Download size={20} />
                Export ({selectedOrders.length} order)
              </button>
            </div>
          )}

          {/* Orders Table */}
          <div
            className="rounded-lg border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-background)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Kasir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        Belum ada data order
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.order_number}
                          style={{ borderColor: 'var(--color-border)' }}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.order_number)}
                            onChange={() => handleSelectOrder(order.order_number)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {order.order_number}
                          </div>
                          {order.discount_code && (
                            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              Diskon: {order.discount_code}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {formatDate(order.order_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {order.employee_name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            NISN: {order.employee_nisn}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(order.order_total)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(order.order_number)}
                              className="p-2 rounded-lg border transition-colors"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)'
                              }}
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            {selectedOrders.length === 0 && (
                              <button
                                onClick={() => {
                                  setSelectedOrders([order.order_number]);
                                  setTimeout(() => handleOpenExportModal(), 100);
                                }}
                                className="p-2 rounded-lg border transition-colors"
                                style={{
                                  backgroundColor: 'var(--color-surface)',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text-primary)'
                                }}
                                title="Export"
                              >
                                <Download size={16} />
                              </button>
                            )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseDetailModal}
        >
          <div
            className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Detail Order: {selectedOrder.order_number}
              </h2>
              <button
                onClick={handleCloseDetailModal}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Tanggal Order
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(selectedOrder.order_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Kasir
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedOrder.employee_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedOrder.employee_class} - {selectedOrder.employee_major} | NISN: {selectedOrder.employee_nisn}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                {selectedOrder.discount_code && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Kode Diskon
                    </p>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {selectedOrder.discount_code}
                    </p>
                    {selectedOrder.discount_description && (
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {selectedOrder.discount_description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div
                className="rounded-lg border overflow-hidden mb-6"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--color-surface)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        Produk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        Harga
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {item.product_name}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                          {item.qty_product}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(item.price_product)}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(item.qty_product * item.price_product)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2">
                  <div className="flex justify-between mb-2">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total:</span>
                    <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(selectedOrder.order_total)}
                    </span>
                  </div>
                  {selectedOrder.balance !== selectedOrder.order_total && (
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Balance:</span>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {formatCurrency(selectedOrder.balance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex justify-end p-6 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseExportModal}
        >
          <div
            className="rounded-lg shadow-xl max-w-md w-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Pilih Format Export
              </h2>
              <button
                onClick={handleCloseExportModal}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Pilih satu atau lebih format export untuk {selectedOrders.length} order yang dipilih
              </p>

              <div className="space-y-3">
                {/* PDF Option */}
                <button
                  onClick={() => handleToggleFormat('pdf')}
                  className="w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: exportFormats.includes('pdf') 
                      ? 'var(--color-background)' 
                      : 'var(--color-surface)',
                    borderColor: exportFormats.includes('pdf') 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                  <div className="text-left">
                    <div className="font-medium">PDF</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Dokumen A4 lengkap
                    </div>
                  </div>
                </button>

                {/* Excel Option */}
                <button
                  onClick={() => handleToggleFormat('excel')}
                  className="w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: exportFormats.includes('excel') 
                      ? 'var(--color-background)' 
                      : 'var(--color-surface)',
                    borderColor: exportFormats.includes('excel') 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <FileSpreadsheet size={24} style={{ color: 'var(--color-success)' }} />
                  <div className="text-left">
                    <div className="font-medium">Excel</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      File .xlsx untuk analisis
                    </div>
                  </div>
                </button>

                {/* Receipt Option */}
                <button
                  onClick={() => handleToggleFormat('receipt')}
                  className="w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: exportFormats.includes('receipt') 
                      ? 'var(--color-background)' 
                      : 'var(--color-surface)',
                    borderColor: exportFormats.includes('receipt') 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <Receipt size={24} style={{ color: 'var(--color-info)' }} />
                  <div className="text-left">
                    <div className="font-medium">Bon Struk</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Format thermal 58mm
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-end gap-3 p-6 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={handleCloseExportModal}
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
                onClick={handleExport}
                disabled={exportFormats.length === 0}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: exportFormats.length === 0 
                    ? 'var(--color-border)' 
                    : 'var(--color-primary)',
                  color: 'white',
                  cursor: exportFormats.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: exportFormats.length === 0 ? 0.5 : 1
                }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Orders;
