import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, BarChart3, Users, Package, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

function Dashboard() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Penjualan Cepat",
      description: "Proses transaksi yang cepat dan mudah dengan antarmuka intuitif"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Laporan Real-time",
      description: "Monitor performa bisnis Anda dengan laporan lengkap dan real-time"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Manajemen Stok",
      description: "Kelola inventori dengan mudah dan hindari kehabisan stok"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Manajemen Karyawan",
      description: "Atur akses dan monitor kinerja karyawan dengan sistem role"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analisis Penjualan",
      description: "Dapatkan insight mendalam untuk pertumbuhan bisnis"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi Cabang",
      description: "Kelola semua cabang bisnis Anda dalam satu platform"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Efisiensi Maksimal",
      description: "Tingkatkan produktivitas hingga 3x lipat dengan otomasi cerdas"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Keamanan Terjamin",
      description: "Data bisnis Anda aman dengan enkripsi tingkat enterprise"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Support 24/7",
      description: "Tim support kami siap membantu Anda kapan saja"
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-sm shadow-lg' 
          : 'bg-transparent'
      }`} style={isScrolled ? { backgroundColor: 'var(--color-background)', opacity: 0.95 } : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                POS Pro
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="transition-colors" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                Fitur
              </a>
              <a href="#benefits" className="transition-colors" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                Keunggulan
              </a>
              <a href="#pricing" className="transition-colors" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                Harga
              </a>
              <button className="text-white px-6 py-2.5 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                Mulai Gratis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              style={{ color: 'var(--color-text-primary)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex flex-col gap-4">
                <a href="#features" className="transition-colors" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                  Fitur
                </a>
                <a href="#benefits" className="transition-colors" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                  Keunggulan
                </a>
                <a href="#pricing" className="transition-colors" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                  Harga
                </a>
                <button className="text-white px-6 py-2.5 rounded-lg transition-all" style={{ backgroundColor: 'var(--color-primary)' }}>
                  Mulai Gratis
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                Sistem POS #1 di Indonesia
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Kelola Bisnis Anda dengan{' '}
              <span style={{ color: 'var(--color-primary)' }}>Lebih Profesional</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Platform POS all-in-one yang membantu ribuan bisnis meningkatkan penjualan, mengoptimalkan operasional, dan mengembangkan usaha mereka
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-xl transform hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-primary)' }}>
                Coba Gratis 14 Hari
              </button>
              <button className="border-2 px-8 py-4 rounded-lg text-lg font-semibold transition-all" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Lihat Demo
              </button>
            </div>
            <p className="mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Tidak perlu kartu kredit • Setup 5 menit • Support 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>10K+</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Bisnis Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>50M+</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Transaksi/Bulan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>99.9%</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>4.9/5</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Rating Pengguna</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Fitur Lengkap untuk Bisnis Anda
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Semua yang Anda butuhkan untuk menjalankan bisnis modern dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="mb-4" style={{ color: 'var(--color-primary)' }}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Mengapa Memilih POS Pro?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Dipercaya oleh ribuan bisnis di seluruh Indonesia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {benefit.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Pilih Paket yang Tepat
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Harga transparan tanpa biaya tersembunyi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="p-8 rounded-2xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Rp 299K</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>/bulan</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>1 Outlet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Unlimited Transaksi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Laporan Dasar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Support Email</span>
                </li>
              </ul>
              <button className="w-full border-2 py-3 rounded-lg font-semibold transition-all" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Pilih Basic
              </button>
            </div>

            {/* Professional Plan */}
            <div className="text-white p-8 rounded-2xl transform scale-105 shadow-2xl relative" style={{ backgroundColor: 'var(--color-primary)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                Paling Populer
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Rp 599K</span>
                <span className="text-white/80">/bulan</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>5 Outlet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Unlimited Transaksi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Laporan Lengkap</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Multi Cabang</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Support Priority</span>
                </li>
              </ul>
              <button className="w-full bg-white py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all" style={{ color: 'var(--color-primary)' }}>
                Pilih Professional
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Unlimited Outlet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Custom Integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Dedicated Server</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>24/7 Phone Support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Account Manager</span>
                </li>
              </ul>
              <button className="w-full border-2 py-3 rounded-lg font-semibold transition-all" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Hubungi Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Meningkatkan Bisnis Anda?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Bergabunglah dengan ribuan bisnis yang telah mempercayai POS Pro
          </p>
          <button className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-0.5" style={{ color: 'var(--color-primary)' }}>
            Mulai Gratis Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">POS Pro</span>
              </div>
              <p className="text-gray-400">
                Sistem POS profesional untuk bisnis modern
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Fitur</a></li>
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Harga</a></li>
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Tentang Kami</a></li>
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Blog</a></li>
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Karir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Help Center</a></li>
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Kontak</a></li>
                <li><a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>API Docs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 POS Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;