import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  FolderOpen, 
  Tag, 
  ShoppingCart, 
  FileText, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Settings as SettingsIcon,
  FileSearch
} from 'lucide-react';
import { gsap } from 'gsap';
import Dock from '../../components/Dock';
import StaggeredMenu from '../../components/StaggeredMenu';
import { clearSession } from '../../utils/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'home';
    setCurrentPage(path);
  }, [location]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && iconRef.current && plusHRef.current && plusVRef.current) {
      gsap.set(plusHRef.current, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusVRef.current, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(iconRef.current, { rotate: 0, transformOrigin: '50% 50%' });
    }
  }, [isMobile]);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  const handleToggleMenu = () => {
    const newState = !menuOpen;
    setMenuOpen(newState);

    if (isMobile && iconRef.current && plusHRef.current && plusVRef.current) {
      if (newState) {
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .to(plusHRef.current, { rotate: 45, duration: 0.5 }, 0)
          .to(plusVRef.current, { rotate: -45, duration: 0.5 }, 0);
      } else {
        gsap.timeline({ defaults: { ease: 'power3.inOut' } })
          .to(plusHRef.current, { rotate: 0, duration: 0.35 }, 0)
          .to(plusVRef.current, { rotate: 90, duration: 0.35 }, 0);
      }
    }
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      ariaLabel: 'Go to Dashboard', 
      link: '/admin/home' 
    },
    { 
      label: 'Products', 
      ariaLabel: 'Manage Products', 
      link: '/admin/products' 
    },
    { 
      label: 'Categories', 
      ariaLabel: 'Manage Categories', 
      link: '/admin/categories' 
    },
    { 
      label: 'Discounts', 
      ariaLabel: 'Manage Discounts', 
      link: '/admin/discounts' 
    },
    { 
      label: 'Orders', 
      ariaLabel: 'View Orders', 
      link: '/admin/orders' 
    },
    { 
      label: 'Invoices', 
      ariaLabel: 'View Invoices', 
      link: '/admin/invoices' 
    },
    { 
      label: 'Students', 
      ariaLabel: 'Manage Students', 
      link: '/admin/students' 
    },
    { 
      label: 'Reports', 
      ariaLabel: 'View Reports', 
      link: '/admin/reports' 
    },
    { 
      label: 'Price History', 
      ariaLabel: 'View Price History', 
      link: '/admin/price-history' 
    },
    { 
      label: 'Audit Logs', 
      ariaLabel: 'View Audit Logs', 
      link: '/admin/audit-logs' 
    },
    { 
      label: 'Settings', 
      ariaLabel: 'Go to Settings', 
      link: '/admin/settings' 
    }
  ];

  const dockItems = [
    { 
      icon: <Home size={18} />, 
      label: 'Dashboard', 
      onClick: () => navigate('/admin/home') 
    },
    { 
      icon: <Package size={18} />, 
      label: 'Products', 
      onClick: () => navigate('/admin/products') 
    },
    { 
      icon: <FolderOpen size={18} />, 
      label: 'Categories', 
      onClick: () => navigate('/admin/categories') 
    },
    { 
      icon: <Tag size={18} />, 
      label: 'Discounts', 
      onClick: () => navigate('/admin/discounts') 
    },
    { 
      icon: <ShoppingCart size={18} />, 
      label: 'Orders', 
      onClick: () => navigate('/admin/orders') 
    },
    { 
      icon: <FileText size={18} />, 
      label: 'Invoices', 
      onClick: () => navigate('/admin/invoices') 
    },
    { 
      icon: <Users size={18} />, 
      label: 'Students', 
      onClick: () => navigate('/admin/students') 
    },
    { 
      icon: <BarChart3 size={18} />, 
      label: 'Reports', 
      onClick: () => navigate('/admin/reports') 
    },
    { 
      icon: <TrendingUp size={18} />, 
      label: 'Price History', 
      onClick: () => navigate('/admin/price-history') 
    },
    { 
      icon: <FileSearch size={18} />, 
      label: 'Audit Logs', 
      onClick: () => navigate('/admin/audit-logs') 
    },
    { 
      icon: <SettingsIcon size={18} />, 
      label: 'Settings', 
      onClick: () => navigate('/admin/settings') 
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Mobile Menu */}
      {isMobile && (
        <div className="lg:hidden">
          <StaggeredMenu
            position="left"
            items={menuItems}
            displayItemNumbering={false}
            colors={['var(--color-surface)', 'var(--color-background)']}
            accentColor="var(--color-primary)"
            isFixed={true}
            isOpen={menuOpen}
          />
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <header className="sticky top-0 z-50 border-b" style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                POS Pro Admin
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Logout
            </button>
          </div>
        </header>
      )}

      {/* Mobile Header - Fixed at top with menu button */}
      {isMobile && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[10000] border-b" style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleMenu}
                className="inline-flex items-center justify-center w-10 h-10 bg-transparent border-0 cursor-pointer z-[10001]"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                type="button"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span
                  ref={iconRef}
                  className="relative w-[20px] h-[20px] shrink-0 inline-flex items-center justify-center"
                >
                  <span
                    ref={plusHRef}
                    className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2"
                  />
                  <span
                    ref={plusVRef}
                    className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2"
                  />
                </span>
              </button>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  POS Pro Admin
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-lg text-white text-sm font-semibold transition-all"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={isMobile ? 'pb-8 pt-20' : 'pb-32'}>
        {children}
      </main>

      {/* Desktop Dock Navigation */}
      {!isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Dock 
            items={dockItems}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
          />
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
