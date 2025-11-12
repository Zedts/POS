import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, BarChart3, Users, Package, TrendingUp, Shield, Zap } from 'lucide-react';
import AuthModal from './components/AuthModal';
import { isSessionValid, getUserRole } from './utils/auth';

function Dashboard() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (isSessionValid()) {
      const role = getUserRole();
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthSuccess = (role: string, userData: unknown) => {
    console.log('Login Success:', role, userData);
    setAuthModalOpen(false);
    
    // Redirect based on role
    if (role === 'admin') {
      window.location.href = '/admin/home';
    } else if (role === 'employee') {
      window.location.href = '/employee/home';
    } else if (role === 'customer') {
      window.location.href = '/customer/home';
    }
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleButtonClick = () => {
    if (userRole === 'admin') {
      window.location.href = '/admin/home';
    } else if (userRole === 'employee') {
      window.location.href = '/employee/home';
    } else if (userRole === 'customer') {
      window.location.href = '/customer/home';
    } else {
      openAuthModal('login');
    }
  };

  const getButtonText = () => {
    if (userRole === 'admin') {
      return 'Admin';
    } else if (userRole === 'employee') {
      return 'Employee';
    } else if (userRole === 'customer') {
      return 'Customer';
    }
    return 'Mulai';
  };

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Sistem Kasir Digital",
      description: "Interface kasir yang intuitif untuk memproses transaksi dengan cepat. Mendukung berbagai metode pembayaran (Tunai & QR Code)"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Manajemen Produk",
      description: "Kelola produk, kategori, stok, dan harga dengan mudah. Notifikasi otomatis untuk stok menipis dan produk kadaluarsa"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Manajemen Siswa & Customer",
      description: "Sistem role-based access untuk Admin, Employee (Siswa), dan Customer dengan dashboard masing-masing"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Laporan & Analisis",
      description: "Dashboard analytics real-time dengan grafik penjualan, produk terlaris, dan performa per kategori"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Sistem Diskon",
      description: "Kelola diskon dengan mudah. Atur persentase, periode berlaku, minimum pembelian, dan batasan penggunaan"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Audit Log System",
      description: "Catat semua aktivitas CRUD sistem untuk transparansi dan keamanan data bisnis Anda"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Built for Education",
      description: "Dikembangkan khusus untuk lingkungan sekolah dengan sistem role Siswa sebagai Employee dan Customer"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Open Source Ready",
      description: "Kode bersih, terstruktur, dan siap untuk pengembangan lebih lanjut dengan dokumentasi lengkap"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Modern Tech Stack",
      description: "React + TypeScript, Node.js + Express, SQL Server dengan UI/UX yang responsif dan modern"
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />

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
              <button 
                onClick={handleButtonClick}
                className="text-white px-6 py-2.5 rounded-lg transition-all hover:shadow-lg" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {getButtonText()}
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
                <button 
                  onClick={handleButtonClick}
                  className="text-white px-6 py-2.5 rounded-lg transition-all" 
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {getButtonText()}
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
                🎓 Sistem POS untuk Sekolah SMK
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Point of Sale System{' '}
              <span style={{ color: 'var(--color-primary)' }}>Professional</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Platform POS lengkap dengan dashboard Admin, Employee (Siswa), dan Customer. Dilengkapi sistem manajemen produk, transaksi, diskon, laporan, dan audit log untuk pengelolaan kantin atau koperasi sekolah
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleButtonClick}
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-xl transform hover:-translate-y-0.5" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {userRole ? (
                  userRole === 'admin' ? 'Dashboard Admin' : 
                  userRole === 'employee' ? 'Dashboard Employee' : 
                  'Dashboard Customer'
                ) : 'Login Sekarang'}
              </button>
              {!userRole && (
                <button 
                  onClick={() => openAuthModal('register')}
                  className="border-2 px-8 py-4 rounded-lg text-lg font-semibold transition-all" 
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Daftar Customer
                </button>
              )}
            </div>
            <p className="mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {userRole ? `✨ Selamat datang kembali, ${
                userRole === 'admin' ? 'Admin' : 
                userRole === 'employee' ? 'Employee' : 
                'Customer'
              }!` : 'React + TypeScript • Node.js + Express • SQL Server'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>3</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>User Roles</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Admin, Employee, Customer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>15+</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Fitur Lengkap</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Dashboard & Management</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>100%</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Responsive</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Mobile & Desktop</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>SQL</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Database</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Microsoft SQL Server</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Fitur Lengkap Sistem POS
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Semua yang dibutuhkan untuk mengelola kantin atau koperasi sekolah secara digital dan profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border transition-all hover:shadow-lg"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" 
                  style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
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
              Keunggulan Sistem Ini
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Dibuat dengan teknologi modern dan best practices development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {benefit.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
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
              Akses Dashboard by Role
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Sistem dengan 3 jenis akses pengguna yang berbeda sesuai kebutuhan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin Role */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  <Shield className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Admin</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pengelola Sistem</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Kelola Products & Kategori</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Kelola Diskon & Promo</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Kelola Data Siswa/Employee</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Lihat Semua Transaksi & Invoice</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Laporan & Analytics Dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Audit Log & Settings</span>
                </li>
              </ul>
              <button 
                onClick={() => openAuthModal('login')}
                className="w-full border-2 py-3 rounded-lg font-semibold transition-all" 
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Login Admin
              </button>
            </div>

            {/* Employee Role */}
            <div className="text-white p-6 rounded-lg transform scale-105 shadow-2xl relative" style={{ backgroundColor: 'var(--color-primary)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                Kasir Utama
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Employee</h3>
                <p className="text-sm text-white/80">Siswa/Kasir</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Sistem Kasir/POS Interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Proses Transaksi Penjualan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Cari Customer untuk Transaksi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Input Discount Code</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Generate Invoice</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span>Edit Profile & Password</span>
                </li>
              </ul>
              <button 
                onClick={() => openAuthModal('login')}
                className="w-full bg-white py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all" 
                style={{ color: 'var(--color-primary)' }}
              >
                Login Employee
              </button>
            </div>

            {/* Customer Role */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  <ShoppingCart className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Customer</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pembeli/Siswa</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Lihat Produk Terlaris</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Lihat & Copy Kode Diskon Aktif</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Riwayat Transaksi Pribadi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Detail Pembelian & Invoice</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Filter & Search History</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Edit Profile & Password</span>
                </li>
              </ul>
              <button 
                onClick={() => openAuthModal('register')}
                className="w-full border-2 py-3 rounded-lg font-semibold transition-all" 
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Daftar Customer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Mencoba Sistem POS ini?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Login dengan role yang sesuai atau daftar sebagai Customer untuk melihat fitur lengkapnya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => openAuthModal('login')}
              className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-0.5" 
              style={{ color: 'var(--color-primary)' }}
            >
              Login
            </button>
            <button 
              onClick={() => openAuthModal('register')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white transition-all hover:shadow-xl transform hover:-translate-y-0.5"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              Daftar Customer
            </button>
          </div>
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
              <p className="text-gray-400 leading-relaxed">
                Sistem Point of Sale lengkap untuk pengelolaan kantin atau koperasi sekolah SMK
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Teknologi</h4>
              <ul className="space-y-2 text-gray-400">
                <li>React + TypeScript</li>
                <li>Node.js + Express</li>
                <li>SQL Server</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Fitur Utama</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard Multi-Role</li>
                <li>Sistem Kasir POS</li>
                <li>Manajemen Produk</li>
                <li>Laporan & Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">User Roles</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Admin (Pengelola)</li>
                <li>Employee (Kasir/Siswa)</li>
                <li>Customer (Pembeli/Siswa)</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 POS Pro - School Point of Sale System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;