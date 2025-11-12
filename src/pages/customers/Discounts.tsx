import { useEffect, useState } from 'react';
import { Tag, Calendar, Percent, Copy, Check, Barcode } from 'lucide-react';
import CustomerLayout from '../../components/CustomerLayout';
import { getActiveDiscountsAPI } from '../../api';
import { toast } from 'react-toastify';

interface Discount {
  discount_id: number;
  discount_code: string;
  description: string;
  discount_percent: number;
  min_purchase: number | null;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  discount_type: string;
}

function CustomerDiscounts() {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await getActiveDiscountsAPI();
      
      if (response.success) {
        setDiscounts(response.data);
      } else {
        toast.error('Gagal memuat daftar diskon');
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Gagal memuat daftar diskon');
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

  const handleCopyDiscount = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Kode diskon berhasil disalin!');
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Kadaluarsa';
    if (diffDays === 0) return 'Hari Terakhir';
    if (diffDays === 1) return 'Besok Berakhir';
    return `${diffDays} hari lagi`;
  };

  const getRemainingUsage = (discount: Discount) => {
    if (!discount.usage_limit) return null;
    const remaining = discount.usage_limit - discount.used_count;
    return remaining > 0 ? remaining : 0;
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
              Memuat daftar diskon...
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
              style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
            >
              <Tag size={28} />
            </div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Diskon Aktif
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Temukan diskon terbaik untuk hemat lebih banyak
          </p>
        </div>

        {/* Discounts Info */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {discounts.length} Diskon Tersedia
              </h3>
              <p className="opacity-90">
                Gunakan kode diskon saat checkout untuk mendapatkan potongan harga
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <Tag size={24} />
              <span className="font-bold">Hemat Hingga 50%</span>
            </div>
          </div>
        </div>

        {/* Discounts Grid */}
        {discounts.length === 0 ? (
          <div 
            className="rounded-lg p-12 text-center"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <Tag 
              size={64} 
              className="mx-auto mb-4"
              style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
            />
            <p 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Belum ada diskon aktif
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Diskon akan tersedia segera. Pantau terus halaman ini!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => {
              const remainingUsage = getRemainingUsage(discount);
              const remainingDays = getRemainingDays(discount.end_date);
              const isExpiringSoon = remainingDays.includes('hari lagi') && parseInt(remainingDays) <= 3;
              
              return (
                <div
                  key={discount.discount_id}
                  className="rounded-lg overflow-hidden transition-all hover:shadow-lg"
                  style={{ 
                    backgroundColor: 'var(--color-surface)',
                    border: '2px solid var(--color-border)'
                  }}
                >
                  {/* Discount Header */}
                  <div 
                    className="p-6 relative"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, #00845d 100%)',
                      color: 'white'
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Percent size={28} className="font-bold" />
                        <span className="text-4xl font-bold">
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_percent}%` 
                            : formatCurrency(discount.discount_percent)
                          }
                        </span>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ 
                          backgroundColor: isExpiringSoon ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)',
                          color: isExpiringSoon ? '#78350f' : 'white'
                        }}
                      >
                        {remainingDays}
                      </span>
                    </div>

                    <div 
                      className="p-3 rounded-lg flex items-center justify-between mb-3"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <span className="font-mono font-bold text-xl tracking-wider">
                        {discount.discount_code}
                      </span>
                      <button
                        onClick={() => handleCopyDiscount(discount.discount_code)}
                        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      >
                        {copiedCode === discount.discount_code ? (
                          <Check size={20} />
                        ) : (
                          <Copy size={20} />
                        )}
                      </button>
                    </div>

                    <p className="text-sm opacity-90 line-clamp-2">
                      {discount.description}
                    </p>
                  </div>

                  {/* Discount Body */}
                  <div className="p-6 space-y-4">
                    {/* Minimum Purchase */}
                    {discount.min_purchase && (
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-lg mt-1"
                          style={{ backgroundColor: 'var(--color-background)' }}
                        >
                          <Tag size={18} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div className="flex-1">
                          <p 
                            className="text-sm font-semibold mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            Minimum Pembelian
                          </p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {formatCurrency(discount.min_purchase)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Max Discount */}
                    {discount.max_discount && discount.discount_type === 'percentage' && (
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-lg mt-1"
                          style={{ backgroundColor: 'var(--color-background)' }}
                        >
                          <Percent size={18} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div className="flex-1">
                          <p 
                            className="text-sm font-semibold mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            Maksimal Potongan
                          </p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {formatCurrency(discount.max_discount)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Validity Period */}
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-lg mt-1"
                        style={{ backgroundColor: 'var(--color-background)' }}
                      >
                        <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div className="flex-1">
                        <p 
                          className="text-sm font-semibold mb-1"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Masa Berlaku
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Usage Limit */}
                    {remainingUsage !== null && (
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: remainingUsage > 10 
                            ? 'var(--color-background)' 
                            : '#fee2e2',
                          border: `1px solid ${remainingUsage > 10 
                            ? 'var(--color-border)' 
                            : '#fecaca'}`
                        }}
                      >
                        <p 
                          className="text-sm font-semibold"
                          style={{ 
                            color: remainingUsage > 10 
                              ? 'var(--color-text-primary)' 
                              : '#991b1b'
                          }}
                        >
                          ⚠️ Sisa kuota: {remainingUsage} penggunaan
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Discount Footer */}
                  <div 
                    className="p-4 flex gap-3"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      borderTop: '1px solid var(--color-border)'
                    }}
                  >
                    <button
                      onClick={() => handleCopyDiscount(discount.discount_code)}
                      className="flex-1 py-3 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                    >
                      {copiedCode === discount.discount_code ? (
                        <>
                          <Check size={20} />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy size={20} />
                          Salin Kode
                        </>
                      )}
                    </button>
                    <button
                      disabled
                      className="p-3 rounded-lg transition-all opacity-50 cursor-not-allowed"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)'
                      }}
                      title="Fitur akan segera tersedia"
                    >
                      <Barcode size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        <div 
          className="mt-8 p-6 rounded-lg"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h3 
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            💡 Cara Menggunakan Diskon
          </h3>
          <ul 
            className="space-y-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Salin kode diskon dengan klik tombol "Salin Kode"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Lakukan transaksi di kasir dengan membeli produk</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Berikan kode diskon kepada kasir saat checkout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Nikmati potongan harga sesuai ketentuan diskon yang berlaku</span>
            </li>
          </ul>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerDiscounts;
