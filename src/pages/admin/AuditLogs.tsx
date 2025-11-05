import { useEffect, useState } from 'react';
import { isSessionValid, clearSession } from '../../utils/auth';
import { getAuditLogsAPI } from '../../api';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Eye, FileDown, Search, Filter as FilterIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminLayout from './AdminLayout';

interface AuditLog {
  id: number;
  user_id: number;
  user_type: string;
  user_name: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1
  });
  
  // Filters
  const [userType, setUserType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogsAPI({
        userType: userType || undefined,
        entityType: entityType || undefined,
        action: action || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setLogs(response.data);
        setPagination(response.pagination);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal mengambil data audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchLogs();
  };

  const handleClearFilters = () => {
    setUserType('');
    setEntityType('');
    setAction('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchLogs(), 100);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return <Plus className="w-4 h-4" style={{ color: 'var(--color-success)' }} />;
      case 'UPDATE':
        return <Pencil className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4" style={{ color: 'var(--color-error)' }} />;
      default:
        return null;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return 'var(--color-success)';
      case 'UPDATE':
        return 'var(--color-warning)';
      case 'DELETE':
        return 'var(--color-error)';
      default:
        return 'var(--color-text-secondary)';
    }
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Audit Logs', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    doc.text(`Total Logs: ${pagination.total}`, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [['Tanggal', 'User', 'Tipe', 'Entity', 'Action', 'Description']],
      body: logs.map(log => [
        formatDateTime(log.created_at),
        log.user_name,
        log.user_type,
        log.entity_type,
        log.action,
        log.description
      ]),
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fillColor: [1, 159, 99] }
    });

    doc.save(`audit_logs_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF berhasil diexport!');
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className="px-3 py-1 rounded transition-colors"
          style={{
            backgroundColor: i === pagination.page ? 'var(--color-primary)' : 'var(--color-background)',
            color: i === pagination.page ? 'white' : 'var(--color-text-primary)'
          }}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Audit Logs
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Pencatatan aktivitas CRUD sistem untuk monitoring dan keamanan
            </p>
          </div>

          {/* Filters */}
          <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Filter
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Cari (User/Description)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                    placeholder="Cari user atau deskripsi..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Tipe User
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Tipe</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student/Employee</option>
                </select>
              </div>

              {/* Entity Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Entity Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Entity</option>
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                  <option value="discount">Discount</option>
                  <option value="student">Student</option>
                  <option value="order">Order</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">Semua Action</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Terapkan Filter
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 rounded-lg font-medium border transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Reset
              </button>
              <button
                onClick={handleExportPDF}
                disabled={logs.length === 0}
                className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: logs.length === 0 ? 'var(--color-border)' : 'var(--color-success)',
                  color: 'white',
                  opacity: logs.length === 0 ? 0.5 : 1,
                  cursor: logs.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <FileDown size={18} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
                <p>Tidak ada audit logs ditemukan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--color-background)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Tanggal/Waktu
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Tipe User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Entity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Action
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Description
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr 
                          key={log.id}
                          className="border-t"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {formatDateTime(log.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {log.user_name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: log.user_type === 'admin' ? 'rgba(1, 159, 99, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                color: log.user_type === 'admin' ? 'var(--color-success)' : '#3b82f6'
                              }}
                            >
                              {log.user_type === 'admin' ? 'Admin' : 'Student'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                            {log.entity_type}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span style={{ color: getActionColor(log.action), fontWeight: 500 }}>
                                {log.action}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {log.description}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleViewDetail(log)}
                              className="p-2 rounded-lg transition-colors inline-flex items-center gap-1"
                              style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-primary)'
                              }}
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} logs
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Prev
                      </button>
                      {renderPageNumbers()}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Detail Audit Log
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Tanggal/Waktu
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDateTime(selectedLog.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    User
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedLog.user_name} ({selectedLog.user_type === 'admin' ? 'Admin' : 'Student'})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Entity Type
                  </p>
                  <p className="font-medium capitalize" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedLog.entity_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Action
                  </p>
                  <div className="flex items-center gap-2">
                    {getActionIcon(selectedLog.action)}
                    <span className="font-medium" style={{ color: getActionColor(selectedLog.action) }}>
                      {selectedLog.action}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Description
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <p style={{ color: 'var(--color-text-primary)' }}>
                    {selectedLog.description}
                  </p>
                </div>
              </div>

              {/* Old Value */}
              {selectedLog.old_value && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Nilai Lama
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <pre className="text-sm overflow-x-auto" style={{ color: 'var(--color-text-primary)' }}>
                      {JSON.stringify(JSON.parse(selectedLog.old_value), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* New Value */}
              {selectedLog.new_value && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Nilai Baru
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <pre className="text-sm overflow-x-auto" style={{ color: 'var(--color-text-primary)' }}>
                      {JSON.stringify(JSON.parse(selectedLog.new_value), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AuditLogs;
