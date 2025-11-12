import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Tag, History, Sun, Moon, User, Settings as SettingsIcon, LogOut, X } from 'lucide-react';
import { gsap } from 'gsap';
import Dock from './Dock';
import StaggeredMenu from './StaggeredMenu';
import EditProfileModalCustomer from './EditProfileModalCustomer';
import { clearSession, getUserData } from '../utils/auth';
import { toast } from 'react-toastify';

interface CustomerLayoutProps {
  children: ReactNode;
}

function CustomerLayout({ children }: CustomerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);

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

  useEffect(() => {
    const data = getUserData();
    setUserData(data);

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    let effectiveTheme = selectedTheme;

    if (selectedTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      root.style.setProperty('--color-background', '#0f172a');
      root.style.setProperty('--color-surface', '#1e293b');
      root.style.setProperty('--color-surface-dark', '#334155');
      root.style.setProperty('--color-primary', '#019f63');
      root.style.setProperty('--color-secondary', '#8b5cf6');
      root.style.setProperty('--color-text-primary', '#f1f5f9');
      root.style.setProperty('--color-text-secondary', '#cbd5e1');
      root.style.setProperty('--color-border', '#475569');
      root.style.setProperty('--color-danger', '#ef4444');
      root.style.setProperty('--color-success', '#10b981');
    } else {
      root.style.setProperty('--color-background', '#f8fafc');
      root.style.setProperty('--color-surface', '#ffffff');
      root.style.setProperty('--color-surface-dark', '#f1f5f9');
      root.style.setProperty('--color-primary', '#019f63');
      root.style.setProperty('--color-secondary', '#8b5cf6');
      root.style.setProperty('--color-text-primary', '#1e293b');
      root.style.setProperty('--color-text-secondary', '#64748b');
      root.style.setProperty('--color-border', '#e2e8f0');
      root.style.setProperty('--color-danger', '#ef4444');
      root.style.setProperty('--color-success', '#10b981');
    }
  };

  const handleLogout = () => {
    clearSession();
    toast.success('Berhasil logout');
    navigate('/');
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

  const handleProfileSuccess = () => {
    const data = getUserData();
    setUserData(data);
  };

  const menuItems = [
    { 
      label: 'Home', 
      ariaLabel: 'Go to Home', 
      link: '/customer/home'
    },
    { 
      label: 'Discounts', 
      ariaLabel: 'View Discounts', 
      link: '/customer/discounts'
    },
    { 
      label: 'History', 
      ariaLabel: 'View History', 
      link: '/customer/history'
    }
  ];

  const dockItems = [
    { 
      icon: <Home size={18} />, 
      label: 'Home', 
      onClick: () => navigate('/customer/home'),
      path: '/customer/home'
    },
    { 
      icon: <Tag size={18} />, 
      label: 'Discounts', 
      onClick: () => navigate('/customer/discounts'),
      path: '/customer/discounts'
    },
    { 
      icon: <History size={18} />, 
      label: 'History', 
      onClick: () => navigate('/customer/history'),
      path: '/customer/history'
    }
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Mobile StaggeredMenu */}
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
        <header 
          className="h-16 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-40"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <h1 
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              POS Customer
            </h1>
            {currentPage && (
              <>
                <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
                <span 
                  className="capitalize"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {currentPage.replace('-', ' ')}
                </span>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <User size={20} />
              <span className="hidden sm:inline font-semibold">
                {userData?.full_name}
              </span>
            </button>

            {profileMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <button
                  onClick={() => {
                    setEditProfileModalOpen(true);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <User size={18} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    setSettingsModalOpen(true);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <SettingsIcon size={18} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
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
                  POS Customer
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
                </p>
              </div>
            </div>
            
            {/* Profile Menu Mobile */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <User size={18} />
                <span className="text-sm font-semibold hidden sm:inline">
                  {userData?.full_name}
                </span>
              </button>

              {profileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <button
                    onClick={() => {
                      setEditProfileModalOpen(true);
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <User size={18} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setSettingsModalOpen(true);
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <SettingsIcon size={18} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                    style={{ color: '#ef4444' }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={isMobile ? 'pb-8 pt-20' : 'pb-32 pt-16'}>
        {children}
      </main>

      {/* Desktop Dock */}
      {!isMobile && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Dock 
            items={dockItems}
            currentPath={location.pathname}
          />
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileModalOpen && userData && (
        <EditProfileModalCustomer
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          customerId={userData.id}
          initialData={{
            username: userData.username,
            full_name: userData.full_name,
            phone: userData.phone,
            address: userData.address,
            class: userData.class,
            major: userData.major
          }}
          onSuccess={handleProfileSuccess}
        />
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setSettingsModalOpen(false)}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {theme === 'light' ? (
                  <Sun className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                ) : theme === 'dark' ? (
                  <Moon className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Sun className="mr-3" size={24} style={{ color: 'var(--color-primary)' }} />
                )}
                <h2 
                  className="text-xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Theme Settings
                </h2>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Pilih tema tampilan aplikasi
            </p>

            <div className="space-y-3">
              {/* Light Mode */}
              <div 
                onClick={() => {
                  setTheme('light');
                  localStorage.setItem('theme', 'light');
                  applyTheme('light');
                  toast.success('Theme changed to Light mode');
                }}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: theme === 'light' ? 'var(--color-primary)' : 'var(--color-background)',
                  border: `2px solid ${theme === 'light' ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <Sun size={24} style={{ color: theme === 'light' ? 'white' : 'var(--color-text-secondary)' }} />
                  <div>
                    <h3 className="font-semibold" style={{ color: theme === 'light' ? 'white' : 'var(--color-text-primary)' }}>
                      Light Mode
                    </h3>
                    <p className="text-sm" style={{ color: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                      Tampilan terang
                    </p>
                  </div>
                </div>
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: theme === 'light' ? 'white' : 'var(--color-border)',
                    backgroundColor: theme === 'light' ? 'white' : 'transparent'
                  }}
                >
                  {theme === 'light' && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  )}
                </div>
              </div>

              {/* Dark Mode */}
              <div 
                onClick={() => {
                  setTheme('dark');
                  localStorage.setItem('theme', 'dark');
                  applyTheme('dark');
                  toast.success('Theme changed to Dark mode');
                }}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-background)',
                  border: `2px solid ${theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <Moon size={24} style={{ color: theme === 'dark' ? 'white' : 'var(--color-text-secondary)' }} />
                  <div>
                    <h3 className="font-semibold" style={{ color: theme === 'dark' ? 'white' : 'var(--color-text-primary)' }}>
                      Dark Mode
                    </h3>
                    <p className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                      Tampilan gelap
                    </p>
                  </div>
                </div>
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: theme === 'dark' ? 'white' : 'var(--color-border)',
                    backgroundColor: theme === 'dark' ? 'white' : 'transparent'
                  }}
                >
                  {theme === 'dark' && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  )}
                </div>
              </div>

              {/* System Mode */}
              <div 
                onClick={() => {
                  setTheme('system');
                  localStorage.setItem('theme', 'system');
                  applyTheme('system');
                  toast.success('Theme changed to System default');
                }}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: theme === 'system' ? 'var(--color-primary)' : 'var(--color-background)',
                  border: `2px solid ${theme === 'system' ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <SettingsIcon size={24} style={{ color: theme === 'system' ? 'white' : 'var(--color-text-secondary)' }} />
                  <div>
                    <h3 className="font-semibold" style={{ color: theme === 'system' ? 'white' : 'var(--color-text-primary)' }}>
                      System
                    </h3>
                    <p className="text-sm" style={{ color: theme === 'system' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                      Mengikuti sistem
                    </p>
                  </div>
                </div>
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: theme === 'system' ? 'white' : 'var(--color-border)',
                    backgroundColor: theme === 'system' ? 'white' : 'transparent'
                  }}
                >
                  {theme === 'system' && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerLayout;
