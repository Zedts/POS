import { useEffect, useState, useRef } from 'react';
import { isSessionValid, clearSession, getUserData } from '../../utils/auth';
import { 
  getProductsAPI, 
  getCategoriesListAPI, 
  validateDiscountCodeAPI,
  createOrderAPI,
  createInvoiceAPI
} from '../../api';
import { 
  ShoppingCart, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  Camera,
  Tag
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  product_name: string;
  unit_price: number;
  qty: number;
  image_url: string;
  category_id: number;
  barcode: string;
}

interface Category {
  id: number;
  category_name: string;
}

interface CartItem {
  productId: number;
  productName: string;
  productPicture: string;
  price: number;
  qty: number;
  stock: number;
}

interface DiscountInfo {
  code: string;
  description: string;
  discountPercent: number;
  discountType: string;
}

function EmployeeHome() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [cartMobileOpen, setCartMobileOpen] = useState(false);
  
  // Discount state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  // Profile edit state
  const [editUsername, setEditUsername] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsAPI(selectedCategory || undefined);
      setProducts(response.data || []);
    } catch {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesListAPI();
      setCategories(response.data || []);
    } catch {
      toast.error('Gagal memuat kategori');
    }
  };

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      window.location.href = '/';
      return;
    }

    const user = getUserData();
    setUserData(user);
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('pos_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Close profile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleLogout = () => {
    clearSession();
    localStorage.removeItem('pos_cart');
    window.location.href = '/';
  };

  const handleEditProfile = () => {
    setEditUsername(userData?.username || '');
    setEditFullName(userData?.full_name || '');
    setEditPhone(userData?.phone || '');
    setEditAddress(userData?.address || '');
    setEditClass(userData?.class || '');
    setEditMajor(userData?.major || '');
    setEditCurrentPassword('');
    setEditNewPassword('');
    setEditConfirmPassword('');
    setEditProfileModalOpen(true);
    setProfileMenuOpen(false);
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update API
    toast.info('Fitur update profile akan segera tersedia');
    setEditProfileModalOpen(false);
  };

  const addToCart = (product: Product) => {
    if (product.qty <= 0) {
      toast.error('Stok produk habis');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.qty >= product.qty) {
        toast.error('Jumlah melebihi stok tersedia');
        return;
      }
      updateCartQty(product.id, existingItem.qty + 1);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.product_name,
        productPicture: product.image_url,
        price: product.unit_price,
        qty: 1,
        stock: product.qty
      };
      setCart([...cart, newItem]);
      toast.success(`${product.product_name} ditambahkan ke keranjang`);
    }
  };

  const updateCartQty = (productId: number, newQty: number) => {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.stock) {
      toast.error('Jumlah melebihi stok tersedia');
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId ? { ...item, qty: newQty } : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.info('Item dihapus dari keranjang');
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('Yakin ingin membatalkan belanja dan mengosongkan keranjang?')) {
      setCart([]);
      setAppliedDiscount(null);
      setDiscountCode('');
      setCashReceived('');
      toast.info('Keranjang dikosongkan');
    }
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Masukkan kode diskon');
      return;
    }

    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }

    try {
      setApplyingDiscount(true);
      const response = await validateDiscountCodeAPI(discountCode, calculateSubtotal());
      
      if (response.success && response.data.valid) {
        setAppliedDiscount({
          code: discountCode,
          description: response.data.discount.description,
          discountPercent: response.data.discount.discount_percent,
          discountType: response.data.discount.discount_type
        });
        toast.success('Kode diskon berhasil diterapkan');
      } else {
        toast.error(response.data?.message || 'Kode diskon tidak valid');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memvalidasi kode diskon';
      toast.error(errorMessage);
    } finally {
      setApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    toast.info('Diskon dihapus');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    return (subtotal * appliedDiscount.discountPercent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateChange = () => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(cashReceived) || 0;
    const total = calculateTotal();
    return Math.max(0, received - total);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }

    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived) || 0;
      const total = calculateTotal();
      
      if (received < total) {
        toast.error('Uang yang diterima kurang dari total');
        return;
      }
    }

    if (!userData?.id) {
      toast.error('Data user tidak valid');
      return;
    }

    try {
      setProcessing(true);

      // Create order
      const orderData = {
        employeeId: userData.id,
        orderTotal: calculateSubtotal(),
        balance: calculateTotal(),
        discountCode: appliedDiscount?.code
      };

      const orderItems = cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productPicture: item.productPicture,
        qty: item.qty,
        price: item.price
      }));

      const orderResponse = await createOrderAPI(orderData, orderItems);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Gagal membuat order');
      }

      // Create invoice
      const invoiceData = {
        orderNumber: orderResponse.data.orderNumber,
        orderTotal: calculateSubtotal(),
        discountCode: appliedDiscount?.code,
        discountPercent: appliedDiscount?.discountPercent || 0,
        balance: calculateTotal(),
        paidBy: paymentMethod === 'cash' ? 'Tunai' : 'QRIS',
        verifiedBy: userData.id,
        mobileEmployee: userData.phone
      };

      const invoiceResponse = await createInvoiceAPI(invoiceData);
      
      if (!invoiceResponse.success) {
        throw new Error(invoiceResponse.message || 'Gagal membuat invoice');
      }

      toast.success('Transaksi berhasil!');
      
      // Open receipt in new tab
      printReceipt(invoiceResponse.data.invoiceNumber, orderResponse.data.orderNumber);
      
      // Clear cart and reset form
      setCart([]);
      setAppliedDiscount(null);
      setDiscountCode('');
      setCashReceived('');
      setPaymentMethod('cash');
      localStorage.removeItem('pos_cart');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memproses transaksi';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = (invoiceNumber: string, orderNumber: string) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast.error('Gagal membuka jendela cetak');
      return;
    }

    const receiptHTML = generateReceiptHTML(invoiceNumber, orderNumber);
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  const generateReceiptHTML = (invoiceNumber: string, orderNumber: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let itemsHTML = '';
    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      itemsHTML += `
        <tr>
          <td style="padding: 4px 0; border-bottom: 1px dashed #ccc;">${item.productName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; border-bottom: 1px dashed #ccc;">
            ${item.qty} x Rp ${item.price.toLocaleString('id-ID')}
            <span style="float: right;">Rp ${subtotal.toLocaleString('id-ID')}</span>
          </td>
        </tr>
      `;
    });

    // Generate QR code data if payment method is QR
    let qrCodeHTML = '';
    if (paymentMethod === 'qr') {
      const qrData = `INV-${invoiceNumber}-TOTAL-${calculateTotal()}-${Date.now()}`;
      qrCodeHTML = `
        <div style="text-align: center; margin: 10px 0; padding: 10px; border: 1px dashed #000;">
          <p style="margin: 5px 0; font-size: 10px; font-weight: bold;">SCAN QR CODE UNTUK PEMBAYARAN</p>
          <div style="margin: 10px auto; width: 150px; height: 150px; border: 2px solid #000; display: flex; align-items: center; justify-center: center; background: #fff;">
            <p style="font-size: 8px; text-align: center; padding: 10px;">${qrData}</p>
          </div>
          <p style="margin: 5px 0; font-size: 8px;">Total: Rp ${calculateTotal().toLocaleString('id-ID')}</p>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Struk - ${invoiceNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            width: 80mm;
            margin: 0;
            padding: 10mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
          }
          h1, h2, h3 {
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .info {
            margin: 10px 0;
            font-size: 10px;
          }
          .items {
            width: 100%;
            margin: 10px 0;
          }
          .total {
            margin-top: 10px;
            border-top: 2px solid #000;
            padding-top: 10px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>POS PRO</h2>
          <p>Sistem Point of Sale</p>
        </div>
        
        <div class="info">
          <table style="width: 100%; font-size: 10px;">
            <tr>
              <td>Invoice</td>
              <td>: ${invoiceNumber}</td>
            </tr>
            <tr>
              <td>Order</td>
              <td>: ${orderNumber}</td>
            </tr>
            <tr>
              <td>Tanggal</td>
              <td>: ${dateStr}</td>
            </tr>
            <tr>
              <td>Waktu</td>
              <td>: ${timeStr}</td>
            </tr>
            <tr>
              <td>Kasir</td>
              <td>: ${userData?.full_name || '-'}</td>
            </tr>
          </table>
        </div>
        
        <table class="items">
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="total">
          <table style="width: 100%;">
            <tr>
              <td>Subtotal</td>
              <td style="text-align: right;">Rp ${calculateSubtotal().toLocaleString('id-ID')}</td>
            </tr>
            ${appliedDiscount ? `
            <tr>
              <td>Diskon (${appliedDiscount.discountPercent}%)</td>
              <td style="text-align: right;">- Rp ${calculateDiscount().toLocaleString('id-ID')}</td>
            </tr>
            ` : ''}
            <tr style="font-size: 14px;">
              <td><strong>TOTAL</strong></td>
              <td style="text-align: right;"><strong>Rp ${calculateTotal().toLocaleString('id-ID')}</strong></td>
            </tr>
            ${paymentMethod === 'cash' ? `
            <tr>
              <td>Tunai</td>
              <td style="text-align: right;">Rp ${parseFloat(cashReceived || '0').toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Kembali</td>
              <td style="text-align: right;">Rp ${calculateChange().toLocaleString('id-ID')}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        ${qrCodeHTML}
        
        <div class="footer">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
        </div>
      </body>
      </html>
    `;
  };

  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                POS System
              </h1>
              <span className="hidden sm:block text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {userData?.full_name || 'Employee'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Cart Button */}
              <button
                onClick={() => setCartMobileOpen(!cartMobileOpen)}
                className="lg:hidden relative p-2 rounded-lg transition-all"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff'
                }}
              >
                {cartMobileOpen ? <X size={24} /> : <ShoppingCart size={24} />}
                {cart.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                    style={{ backgroundColor: '#ef4444', color: '#fff' }}
                  >
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ 
                    backgroundColor: 'var(--color-surface-dark)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <User size={20} />
                  <span className="hidden sm:inline">Profile</span>
                </button>

                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <button
                      onClick={handleEditProfile}
                      className="w-full flex items-center gap-2 px-4 py-3 transition-all hover:shadow-md"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                    >
                      <User size={18} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setSettingsModalOpen(true);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 transition-all hover:shadow-md"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                    >
                      <SettingsIcon size={18} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 transition-all hover:shadow-md"
                      style={{ 
                        color: '#ef4444',
                        backgroundColor: 'var(--color-surface)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Products Panel - Left Side */}
          <div className="lg:col-span-8">
            <div 
              className="rounded-lg shadow-md p-4"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search 
                    className="absolute left-3 top-1/2 -translate-y-1/2" 
                    size={20} 
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>

                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 rounded-lg border outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>

                {/* Barcode Scanner Button (Display Only) */}
                <button
                  className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-surface-dark)',
                    color: 'var(--color-text-primary)'
                  }}
                  onClick={() => toast.info('Fitur scan barcode akan segera tersedia')}
                >
                  <Camera size={20} />
                  <span className="hidden sm:inline">Scan</span>
                </button>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-lg cursor-pointer"
                      style={{ 
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div className="aspect-square bg-gray-200 relative">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/300'}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                        {product.qty <= 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold">HABIS</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 
                          className="font-semibold text-sm mb-1 line-clamp-2"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {product.product_name}
                        </h3>
                        <p 
                          className="font-bold mb-2"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Rp {product.unit_price.toLocaleString('id-ID')}
                        </p>
                        <p 
                          className="text-xs mb-2"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          Stok: {product.qty}
                        </p>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.qty <= 0}
                          className="w-full py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: product.qty <= 0 ? '#ccc' : 'var(--color-primary)',
                            color: '#fff'
                          }}
                        >
                          + KERANJANG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Tidak ada produk ditemukan
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Panel - Right Side (Desktop) */}
          <div className={`lg:col-span-4 ${cartMobileOpen ? 'block' : 'hidden lg:block'}`}>
            <div 
              className="rounded-lg shadow-md p-4 sticky top-24"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <ShoppingCart size={24} />
                  Keranjang
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm px-3 py-1 rounded-lg transition-all"
                    style={{ 
                      backgroundColor: '#ef4444',
                      color: '#fff'
                    }}
                  >
                    Batalkan
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <p 
                    className="text-center py-10"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Keranjang kosong
                  </p>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={item.productId}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p 
                            className="font-semibold text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {index + 1}. {item.productName}
                          </p>
                          <p 
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 rounded-lg transition-all"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQty(item.productId, item.qty - 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-surface-dark)' }}
                          >
                            <Minus size={16} />
                          </button>
                          <span 
                            className="w-12 text-center font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.productId, item.qty + 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-surface-dark)' }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <p 
                          className="font-bold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Rp {(item.price * item.qty).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount Section */}
              {cart.length > 0 && (
                <div className="mb-4 pb-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag 
                          className="absolute left-3 top-1/2 -translate-y-1/2" 
                          size={18} 
                          style={{ color: 'var(--color-text-secondary)' }}
                        />
                        <input
                          type="text"
                          placeholder="Kode diskon"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
                          style={{ 
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border)'
                          }}
                        />
                      </div>
                      <button
                        onClick={applyDiscount}
                        disabled={applyingDiscount}
                        className="px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                        style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                      >
                        {applyingDiscount ? 'Cek...' : 'Terapkan'}
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="p-3 rounded-lg flex items-start justify-between"
                      style={{ backgroundColor: '#dcfce7' }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: '#166534' }}>
                          {appliedDiscount.code}
                        </p>
                        <p className="text-xs" style={{ color: '#15803d' }}>
                          {appliedDiscount.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#15803d' }}>
                          Diskon {appliedDiscount.discountPercent}%
                        </p>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="p-1"
                        style={{ color: '#ef4444' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              {cart.length > 0 && (
                <>
                  <div className="space-y-2 mb-4 pb-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        Rp {calculateSubtotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          Diskon ({appliedDiscount.discountPercent}%)
                        </span>
                        <span style={{ color: '#10b981' }}>
                          - Rp {calculateDiscount().toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: 'var(--color-text-primary)' }}>Total</span>
                      <span style={{ color: 'var(--color-primary)' }}>
                        Rp {calculateTotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <p 
                      className="text-sm font-semibold mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Metode Pembayaran
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          paymentMethod === 'cash' ? 'ring-2' : ''
                        }`}
                        style={{
                          backgroundColor: paymentMethod === 'cash' ? 'var(--color-primary)' : 'var(--color-surface-dark)',
                          color: paymentMethod === 'cash' ? '#fff' : 'var(--color-text-primary)',
                          ['--tw-ring-color' as string]: 'var(--color-primary)'
                        } as React.CSSProperties}
                      >
                        Tunai
                      </button>
                      <button
                        onClick={() => setPaymentMethod('qr')}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          paymentMethod === 'qr' ? 'ring-2' : ''
                        }`}
                        style={{
                          backgroundColor: paymentMethod === 'qr' ? 'var(--color-primary)' : 'var(--color-surface-dark)',
                          color: paymentMethod === 'qr' ? '#fff' : 'var(--color-text-primary)',
                          ['--tw-ring-color' as string]: 'var(--color-primary)'
                        } as React.CSSProperties}
                      >
                        QR Code
                      </button>
                    </div>
                  </div>

                  {/* Cash Input */}
                  {paymentMethod === 'cash' && (
                    <div className="mb-4">
                      <p 
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Uang Diterima
                      </p>
                      <input
                        type="number"
                        placeholder="0"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border outline-none"
                        style={{ 
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text-primary)',
                          borderColor: 'var(--color-border)'
                        }}
                      />
                      {cashReceived && parseFloat(cashReceived) >= calculateTotal() && (
                        <p 
                          className="text-sm mt-2"
                          style={{ color: '#10b981' }}
                        >
                          Kembalian: Rp {calculateChange().toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* QR Info */}
                  {paymentMethod === 'qr' && (
                    <div 
                      className="mb-4 p-3 rounded-lg text-center"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        QR Code akan ditampilkan pada struk pembayaran
                      </p>
                    </div>
                  )}

                  {/* Process Button */}
                  <button
                    onClick={handlePayment}
                    disabled={processing || (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < calculateTotal())}
                    className="w-full py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                  >
                    {processing ? 'Memproses...' : 'Proses Pembayaran'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editProfileModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setEditProfileModalOpen(false)}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Edit Profile
              </h2>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="p-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  No. Telepon
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Alamat
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border outline-none resize-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Kelas
                </label>
                <input
                  type="text"
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Jurusan
                </label>
                <input
                  type="text"
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Ubah Password (Opsional)
                </p>
                
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Password saat ini"
                    value={editCurrentPassword}
                    onChange={(e) => setEditCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Password baru"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setEditProfileModalOpen(false)}
                  className="flex-1 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: 'var(--color-surface-dark)', color: 'var(--color-text-primary)' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
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
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Settings
              </h2>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center py-10">
              <SettingsIcon size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto' }} />
              <p 
                className="mt-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Fitur settings akan segera tersedia
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeHome;
