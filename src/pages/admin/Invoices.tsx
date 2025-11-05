import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import AdminLayout from './AdminLayout';
import { getInvoicesAPI, getInvoiceByNumberAPI, getInvoiceStatsAPI } from '../../api';
import { toast } from 'react-toastify';
import { FileText, TrendingUp, Clock, CheckCircle2, XCircle, DollarSign, Eye, Download, X, CreditCard, Smartphone } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_status: 'diproses' | 'berhasil' | 'gagal';
  invoice_date: string;
  order_number: string;
  order_total: number;
  discount_code: string | null;
  discount_percent: number | null;
  balance: number;
  paid_by: 'cash' | 'qr';
  verified_by: number;
  verified_by_name: string;
  verified_by_nisn: string;
  verified_by_class: string;
  verified_by_major: string;
  mobile_employee: string | null;
}

interface InvoiceItem {
  id: number;
  product_id: number;
  product_name: string;
  qty_product: number;
  price_product: number;
}

interface InvoiceWithDetails extends Invoice {
  items: InvoiceItem[];
  discount_description?: string;
  discount_type?: string;
}

interface InvoiceStats {
  total_invoices: number;
  diproses_invoices: number;
  berhasil_invoices: number;
  gagal_invoices: number;
  total_revenue: number;
  today_invoices: number;
  today_revenue: number;
}

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    invoiceNumber: '',
    status: '',
    paidBy: ''
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
      setFilters(prev => ({ ...prev, invoiceNumber: searchDebounce }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Fetch data when filters change
  useEffect(() => {
    if (!loading) {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.invoiceNumber, filters.status, filters.paidBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesData, statsData] = await Promise.all([
        getInvoicesAPI(),
        getInvoiceStatsAPI()
      ]);
      setInvoices(invoicesData);
      setStats(statsData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data invoice');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const invoicesData = await getInvoicesAPI(filters);
      setInvoices(invoicesData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Gagal memuat data invoice');
    }
  };

  const handleViewDetail = async (invoiceNumber: string) => {
    try {
      const invoiceData = await getInvoiceByNumberAPI(invoiceNumber);
      setSelectedInvoice(invoiceData);
      setShowDetailModal(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching invoice detail:', error);
      toast.error('Gagal memuat detail invoice');
    }
  };

  const handleViewReceipt = async (invoiceNumber: string) => {
    try {
      const invoiceData = await getInvoiceByNumberAPI(invoiceNumber);
      setSelectedInvoice(invoiceData);
      setShowReceiptModal(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching invoice detail:', error);
      toast.error('Gagal memuat detail invoice');
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInvoice(null);
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedInvoice(null);
  };

  const handleSelectInvoice = (invoiceNumber: string) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceNumber)) {
        return prev.filter(num => num !== invoiceNumber);
      } else {
        return [...prev, invoiceNumber];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.invoice_number));
    }
  };

  const handlePrintFromDetail = () => {
    if (selectedInvoice) {
      generateInvoicePDF(selectedInvoice);
      toast.success('Invoice berhasil di-generate!');
    }
  };

  const handlePrintFromReceipt = () => {
    if (selectedInvoice) {
      generateInvoicePDF(selectedInvoice);
      toast.success('Invoice berhasil di-download!');
    }
  };

  const handleMultiPrint = async () => {
    if (selectedInvoices.length === 0) {
      toast.error('Pilih minimal 1 invoice');
      return;
    }

    try {
      for (const invoiceNumber of selectedInvoices) {
        const invoiceData = await getInvoiceByNumberAPI(invoiceNumber);
        generateInvoicePDF(invoiceData);
      }
      toast.success(`Berhasil generate ${selectedInvoices.length} invoice!`);
      setSelectedInvoices([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error generating invoices:', error);
      toast.error('Gagal generate invoice');
    }
  };

  const generateInvoicePDF = (invoice: InvoiceWithDetails) => {
    const doc = new jsPDF();
    
    // Colors matching app theme
    const primaryColor: [number, number, number] = [1, 159, 99]; // --color-primary
    const textColor: [number, number, number] = [51, 51, 51];
    
    // Header with Logo Text
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('POS SYSTEM', 105, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Invoice Management', 105, 26, { align: 'center' });
    doc.text('Sistem Kasir Terpadu', 105, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(...textColor);
    
    // Invoice Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 14, 55);
    
    // Invoice Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 14, 65);
    doc.text(`Order Number: ${invoice.order_number}`, 14, 71);
    doc.text(`Date: ${formatDate(invoice.invoice_date)}`, 14, 77);
    
    // Status Badge
    const statusColors = {
      diproses: [255, 193, 7],
      berhasil: [40, 167, 69],
      gagal: [220, 53, 69]
    };
    const statusColor = statusColors[invoice.invoice_status] || [128, 128, 128];
    doc.setFillColor(...statusColor as [number, number, number]);
    doc.roundedRect(14, 82, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.invoice_status.toUpperCase(), 29, 87, { align: 'center' });
    doc.setTextColor(...textColor);
    
    // Verified By Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Verified By:', 140, 65);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.verified_by_name, 140, 71);
    doc.setFont('helvetica', 'normal');
    doc.text(`NISN: ${invoice.verified_by_nisn}`, 140, 77);
    doc.text(`${invoice.verified_by_class} ${invoice.verified_by_major}`, 140, 83);
    
    // Payment Method
    doc.setFontSize(10);
    doc.text('Payment Method:', 140, 95);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.paid_by.toUpperCase(), 140, 101);
    doc.setFont('helvetica', 'normal');
    
    // Items Table
    const tableData = invoice.items.map(item => [
      item.product_name,
      item.qty_product.toString(),
      formatCurrency(item.price_product),
      formatCurrency(item.qty_product * item.price_product)
    ]);
    
    autoTable(doc, {
      startY: 110,
      head: [['Product', 'Qty', 'Price', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });
    
    // Get final Y position after table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Discount if applicable
    let currentY = finalY;
    if (invoice.discount_code) {
      doc.setFontSize(10);
      doc.text('Discount:', 140, currentY);
      doc.text(`${invoice.discount_code}`, 160, currentY);
      currentY += 6;
      if (invoice.discount_percent) {
        doc.text(`-${formatCurrency(invoice.order_total - invoice.balance)}`, 160, currentY, { align: 'right' });
        currentY += 8;
      }
    }
    
    // Totals
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total:', 140, currentY);
    doc.text(formatCurrency(invoice.order_total), 195, currentY, { align: 'right' });
    
    currentY += 8;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Balance:', 140, currentY);
    doc.text(formatCurrency(invoice.balance), 195, currentY, { align: 'right' });
    doc.setTextColor(...textColor);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('Generated by POS System', 105, 285, { align: 'center' });
    
    // Save PDF
    doc.save(`invoice_${invoice.invoice_number}_${Date.now()}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      diproses: {
        icon: Clock,
        label: 'Diproses',
        color: 'var(--color-warning)'
      },
      berhasil: {
        icon: CheckCircle2,
        label: 'Berhasil',
        color: 'var(--color-success)'
      },
      gagal: {
        icon: XCircle,
        label: 'Gagal',
        color: 'var(--color-danger)'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: `${config.color}20`,
        color: config.color
      }}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paidBy: string) => {
    const config = {
      cash: {
        icon: CreditCard,
        label: 'Cash',
        color: 'var(--color-success)'
      },
      qr: {
        icon: Smartphone,
        label: 'QR',
        color: 'var(--color-info)'
      }
    };

    const paymentConfig = config[paidBy as keyof typeof config];
    if (!paymentConfig) return null;

    const Icon = paymentConfig.icon;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: `${paymentConfig.color}20`,
        color: paymentConfig.color
      }}>
        <Icon size={14} />
        {paymentConfig.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    } catch {
      return `Rp ${amount}`;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
          </div>
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
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Invoice Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Kelola dan monitor semua invoice transaksi
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {/* Total Invoice */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(1, 159, 99, 0.1)'
                }}>
                  <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.total_invoices || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Total Invoice
                  </p>
                </div>
              </div>
            </div>

            {/* Diproses */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 193, 7, 0.1)'
                }}>
                  <Clock size={24} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.diproses_invoices || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Diproses
                  </p>
                </div>
              </div>
            </div>

            {/* Berhasil */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)'
                }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.berhasil_invoices || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Berhasil
                  </p>
                </div>
              </div>
            </div>

            {/* Gagal */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)'
                }}>
                  <XCircle size={24} style={{ color: 'var(--color-danger)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.gagal_invoices || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Gagal
                  </p>
                </div>
              </div>
            </div>

            {/* Hari Ini */}
            <div className="p-6 rounded-lg border col-span-1 md:col-span-2 lg:col-span-1" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(13, 110, 253, 0.1)'
                }}>
                  <TrendingUp size={24} style={{ color: 'var(--color-info)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats?.today_invoices || 0}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Hari Ini
                  </p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="p-6 rounded-lg border col-span-1 md:col-span-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(1, 159, 99, 0.1)'
                }}>
                  <DollarSign size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(stats?.total_revenue || 0)}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Total Pendapatan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* Search Invoice Number */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Cari Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="Cari invoice..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="diproses">Diproses</option>
                  <option value="berhasil">Berhasil</option>
                  <option value="gagal">Gagal</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Metode Pembayaran
                </label>
                <select
                  value={filters.paidBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, paidBy: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Metode</option>
                  <option value="cash">Cash</option>
                  <option value="qr">QR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Multi Print Button */}
          {selectedInvoices.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleMultiPrint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                <Download size={20} />
                Generate ({selectedInvoices.length} invoice)
              </button>
            </div>
          )}

          {/* Invoices Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-background)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Invoice Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Verified By
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Payment
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        Tidak ada data invoice
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.invoice_number)}
                            onChange={() => handleSelectInvoice(invoice.invoice_number)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {invoice.invoice_number}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              Order: {invoice.order_number}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                            {formatDate(invoice.invoice_date)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {invoice.verified_by_name}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {invoice.verified_by_class} {invoice.verified_by_major} • {invoice.verified_by_nisn}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {formatCurrency(invoice.balance)}
                            </p>
                            {invoice.discount_code && (
                              <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                                Diskon: {invoice.discount_code}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(invoice.invoice_status)}
                        </td>
                        <td className="px-6 py-4">
                          {getPaymentBadge(invoice.paid_by)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(invoice.invoice_number)}
                              className="p-2 rounded-lg hover:bg-opacity-10"
                              style={{
                                backgroundColor: 'rgba(1, 159, 99, 0.1)',
                                color: 'var(--color-primary)'
                              }}
                              title="View Detail"
                            >
                              <Eye size={18} />
                            </button>
                            {selectedInvoices.length === 0 && (
                              <button
                                onClick={() => handleViewReceipt(invoice.invoice_number)}
                                className="p-2 rounded-lg hover:bg-opacity-10"
                                style={{
                                  backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                  color: 'var(--color-info)'
                                }}
                                title="View Receipt"
                              >
                                <Download size={18} />
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
      {showDetailModal && selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={handleCloseDetailModal}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Detail Invoice
              </h2>
              <button
                onClick={handleCloseDetailModal}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-background)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Invoice Number
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedInvoice.invoice_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Order Number
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedInvoice.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Tanggal
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(selectedInvoice.invoice_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Status
                  </p>
                  {getStatusBadge(selectedInvoice.invoice_status)}
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Verified By
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedInvoice.verified_by_name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedInvoice.verified_by_class} {selectedInvoice.verified_by_major} • {selectedInvoice.verified_by_nisn}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Payment Method
                  </p>
                  {getPaymentBadge(selectedInvoice.paid_by)}
                </div>
                {selectedInvoice.discount_code && (
                  <div className="col-span-2">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      Diskon
                    </p>
                    <p className="font-semibold" style={{ color: 'var(--color-success)' }}>
                      {selectedInvoice.discount_code}
                      {selectedInvoice.discount_description && ` - ${selectedInvoice.discount_description}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Items
                </h3>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-background)' }}>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Produk
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Harga
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                            {item.product_name}
                          </td>
                          <td className="px-4 py-3 text-center" style={{ color: 'var(--color-text-primary)' }}>
                            {item.qty_product}
                          </td>
                          <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(item.price_product)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(item.qty_product * item.price_product)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p style={{ color: 'var(--color-text-secondary)' }}>Total:</p>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatCurrency(selectedInvoice.order_total)}
                  </p>
                </div>
                {selectedInvoice.discount_code && (
                  <div className="flex justify-between items-center">
                    <p style={{ color: 'var(--color-text-secondary)' }}>Diskon:</p>
                    <p className="font-semibold" style={{ color: 'var(--color-success)' }}>
                      -{formatCurrency(selectedInvoice.order_total - selectedInvoice.balance)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2" style={{ borderTop: '2px solid var(--color-border)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Balance:</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(selectedInvoice.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseDetailModal}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Tutup
              </button>
              <button
                onClick={handlePrintFromDetail}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptModal && selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={handleCloseReceiptModal}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Invoice Preview
              </h2>
              <button
                onClick={handleCloseReceiptModal}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-background)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Receipt Preview */}
            <div style={{ padding: '24px' }}>
              <div style={{
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                padding: '32px',
                backgroundColor: 'var(--color-background)'
              }}>
                {/* Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '32px',
                  paddingBottom: '24px',
                  borderBottom: '2px solid var(--color-primary)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 16px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={40} color="white" />
                  </div>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)',
                    marginBottom: '8px'
                  }}>
                    POS SYSTEM
                  </h1>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Professional Invoice Management
                  </p>
                </div>

                {/* Invoice Info */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)',
                    marginBottom: '16px'
                  }}>
                    INVOICE
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Invoice Number:</p>
                      <p style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                        {selectedInvoice.invoice_number}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Order Number:</p>
                      <p style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                        {selectedInvoice.order_number}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Date:</p>
                      <p style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                        {formatDate(selectedInvoice.invoice_date)}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Status:</p>
                      {getStatusBadge(selectedInvoice.invoice_status)}
                    </div>
                  </div>
                </div>

                {/* Verified By */}
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '8px'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                    Verified By:
                  </p>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                    {selectedInvoice.verified_by_name}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    NISN: {selectedInvoice.verified_by_nisn}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    {selectedInvoice.verified_by_class} {selectedInvoice.verified_by_major}
                  </p>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '24px' }}>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <thead>
                      <tr style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white'
                      }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={item.id} style={{
                          backgroundColor: index % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)'
                        }}>
                          <td style={{ padding: '12px', color: 'var(--color-text-primary)' }}>
                            {item.product_name}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
                            {item.qty_product}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--color-text-primary)' }}>
                            {formatCurrency(item.price_product)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                            {formatCurrency(item.qty_product * item.price_product)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div style={{
                  borderTop: '2px solid var(--color-border)',
                  paddingTop: '16px'
                }}>
                  {selectedInvoice.discount_code && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Discount ({selectedInvoice.discount_code}):</p>
                      <p style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                        -{formatCurrency(selectedInvoice.order_total - selectedInvoice.balance)}
                      </p>
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Total:</p>
                    <p style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                      {formatCurrency(selectedInvoice.order_total)}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: 'rgba(1, 159, 99, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: 'var(--color-primary)', fontSize: '18px', fontWeight: 'bold' }}>Balance:</p>
                    <p style={{ color: 'var(--color-primary)', fontSize: '18px', fontWeight: 'bold' }}>
                      {formatCurrency(selectedInvoice.balance)}
                    </p>
                  </div>
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                      Payment Method:
                    </p>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                      {getPaymentBadge(selectedInvoice.paid_by)}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  marginTop: '32px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontStyle: 'italic' }}>
                    Thank you for your business!
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontStyle: 'italic' }}>
                    Generated by POS System
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseReceiptModal}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Batal
              </button>
              <button
                onClick={handlePrintFromReceipt}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Invoices;
