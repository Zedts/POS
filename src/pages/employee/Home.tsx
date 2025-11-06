import { useEffect, useState, useRef } from 'react';
import { isSessionValid, clearSession, getUserData } from '../../utils/auth';
import { 
  getProductsAPI, 
  getCategoriesListAPI, 
  validateDiscountCodeAPI,
  createOrderAPI,
  createInvoiceAPI,
  updateStudentProfileAPI,
  updateStudentPasswordAPI
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
  Tag,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'react-toastify';
import crypto from 'crypto-js';

interface Product {
  id: number;
  product_name: string;
  unit_price: number;
  qty: number;
  image_url: string;
  category_id: number;
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

  // Product detail modal state
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalQty, setDetailModalQty] = useState(1);

  // Clear cart confirmation modal state
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsAPI(selectedCategory || undefined);
      const productsData = response.data || [];
      
      // Filter out products with invalid data
      const validProducts = productsData.filter((p: Product) => 
        p.product_name && 
        p.unit_price !== undefined && 
        p.unit_price !== null
      );
      
      setProducts(validProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system if no saved preference
      setTheme('system');
      applyTheme('system');
    }
  };

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    // If system, detect from browser preference
    let actualTheme: 'light' | 'dark';
    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = selectedTheme;
    }
    
    if (actualTheme === 'dark') {
      root.style.setProperty('--color-primary', '#019f63');
      root.style.setProperty('--color-primary-dark', '#1F2937');
      root.style.setProperty('--color-text-primary', '#F9FAFB');
      root.style.setProperty('--color-text-secondary', '#a4e6cc');
      root.style.setProperty('--color-background', '#111827');
      root.style.setProperty('--color-surface', '#1F2937');
      root.style.setProperty('--color-border', '#374151');
      root.style.colorScheme = 'dark';
    } else {
      root.style.setProperty('--color-primary', '#019f63');
      root.style.setProperty('--color-primary-light', '#DDF6ED');
      root.style.setProperty('--color-text-primary', '#1F2937');
      root.style.setProperty('--color-text-secondary', '#4B5563');
      root.style.setProperty('--color-background', '#FFFFFF');
      root.style.setProperty('--color-surface', '#F8F9FA');
      root.style.setProperty('--color-border', '#E5E7EB');
      root.style.colorScheme = 'light';
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
    try {
      const savedCart = localStorage.getItem('pos_cart');
      if (savedCart && savedCart !== '[]') {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('pos_cart');
    }

    fetchProducts();
    fetchCategories();
    loadTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      // Only apply if user is using system theme
      if (savedTheme === 'system' || !savedTheme) {
        applyTheme('system');
      }
    };
    
    // Add listener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
    
    // Cleanup listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
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
    // Save cart to localStorage whenever it changes (but not on initial empty state)
    if (cart.length > 0) {
      localStorage.setItem('pos_cart', JSON.stringify(cart));
    } else {
      // If cart is empty, remove from localStorage
      localStorage.removeItem('pos_cart');
    }
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

  const handleSaveProfile = async () => {
    try {
      // Validation
      if (!editFullName.trim()) {
        toast.error('Nama lengkap tidak boleh kosong');
        return;
      }

      if (!editPhone.trim()) {
        toast.error('Nomor HP tidak boleh kosong');
        return;
      }

      if (!editAddress.trim()) {
        toast.error('Alamat tidak boleh kosong');
        return;
      }

      // Validate password if user wants to change it
      if (editCurrentPassword || editNewPassword || editConfirmPassword) {
        if (!editCurrentPassword) {
          toast.error('Masukkan password saat ini untuk mengubah password');
          return;
        }

        if (!editNewPassword) {
          toast.error('Masukkan password baru');
          return;
        }

        if (editNewPassword.length < 6) {
          toast.error('Password baru minimal 6 karakter');
          return;
        }

        if (editNewPassword !== editConfirmPassword) {
          toast.error('Konfirmasi password tidak sesuai');
          return;
        }

        // Hash passwords with MD5
        const oldPasswordHash = crypto.MD5(editCurrentPassword).toString();
        const newPasswordHash = crypto.MD5(editNewPassword).toString();

        // Update password first
        await updateStudentPasswordAPI(userData.id, oldPasswordHash, newPasswordHash);
        toast.success('Password berhasil diubah');
      }

      // Update profile
      const profileData = {
        full_name: editFullName,
        phone: editPhone,
        address: editAddress
      };

      await updateStudentProfileAPI(userData.id, profileData);

      // Update localStorage userData
      const updatedUserData = {
        ...userData,
        full_name: editFullName,
        phone: editPhone,
        address: editAddress
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      toast.success('Profil berhasil diperbarui');
      setEditProfileModalOpen(false);

      // Reset password fields
      setEditCurrentPassword('');
      setEditNewPassword('');
      setEditConfirmPassword('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui profil';
      toast.error(errorMessage);
    }
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalQty(1);
    setProductDetailModalOpen(true);
  };

  const closeProductDetail = () => {
    setProductDetailModalOpen(false);
    setSelectedProduct(null);
    setDetailModalQty(1);
  };

  const addToCartFromDetail = () => {
    if (!selectedProduct) return;

    // Validate product data
    if (!selectedProduct.unit_price || selectedProduct.unit_price <= 0) {
      toast.error('Produk tidak valid atau harga tidak tersedia');
      return;
    }

    if (selectedProduct.qty <= 0) {
      toast.error('Stok produk habis');
      return;
    }

    if (detailModalQty > selectedProduct.qty) {
      toast.error('Jumlah melebihi stok tersedia');
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProduct.id);
    
    if (existingItem) {
      const newQty = existingItem.qty + detailModalQty;
      if (newQty > selectedProduct.qty) {
        toast.error('Jumlah melebihi stok tersedia');
        return;
      }
      updateCartQty(selectedProduct.id, newQty);
    } else {
      const newItem: CartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.product_name || 'Produk',
        productPicture: selectedProduct.image_url || '',
        price: selectedProduct.unit_price,
        qty: detailModalQty,
        stock: selectedProduct.qty
      };
      setCart([...cart, newItem]);
    }

    toast.success(`${selectedProduct.product_name} (${detailModalQty}) ditambahkan ke keranjang`);
    closeProductDetail();
  };

  const addToCart = (product: Product) => {
    // Validate product data
    if (!product || !product.unit_price || product.unit_price <= 0) {
      toast.error('Produk tidak valid atau harga tidak tersedia');
      return;
    }

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
        productName: product.product_name || 'Produk',
        productPicture: product.image_url || '',
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
    
    setShowClearCartModal(true);
  };

  const handleConfirmClearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
    setDiscountCode('');
    setCashReceived('');
    setShowClearCartModal(false);
    toast.info('Keranjang dikosongkan');
  };

  const handleCloseClearCartModal = () => {
    setShowClearCartModal(false);
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
    return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
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
        employeeId: Number(userData.id),
        orderTotal: Number(calculateSubtotal().toFixed(2)),
        balance: Number(calculateTotal().toFixed(2)),
        ...(appliedDiscount?.code && { discountCode: appliedDiscount.code })
      };

      const orderItems = cart.map(item => ({
        productId: Number(item.productId),
        productName: item.productName || 'Produk',
        productPicture: item.productPicture || '',
        qty: Number(item.qty),
        price: Number(item.price.toFixed(2))
      }));

      console.log('Sending order data:', { orderData, orderItems }); // Debug log

      const orderResponse = await createOrderAPI(orderData, orderItems);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Gagal membuat order');
      }

      // Create invoice
      const invoiceData = {
        orderNumber: orderResponse.data.orderNumber,
        orderTotal: Number(calculateSubtotal().toFixed(2)),
        discountCode: appliedDiscount?.code,
        discountPercent: appliedDiscount?.discountPercent || 0,
        balance: Number(calculateTotal().toFixed(2)),
        paidBy: paymentMethod === 'cash' ? 'cash' : 'qr',
        verifiedBy: Number(userData.id),
        mobileEmployee: userData.phone || ''
      };

      console.log('Sending invoice data:', invoiceData); // Debug log

      const invoiceResponse = await createInvoiceAPI(invoiceData);
      
      if (!invoiceResponse.success) {
        throw new Error(invoiceResponse.message || 'Gagal membuat invoice');
      }

      toast.success('Transaksi berhasil!');
      
      // Open receipt in new tab
      printReceipt(invoiceResponse.data.invoiceNumber, orderResponse.data.orderNumber);
      
      // Clear cart and reset form (localStorage will be cleared automatically by useEffect)
      setCart([]);
      setAppliedDiscount(null);
      setDiscountCode('');
      setCashReceived('');
      setPaymentMethod('cash');
      
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

  const filteredProducts = products.filter(product => {
    // Filter by search query
    const matchesSearch = product.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    
    // Ensure product has valid data
    const hasValidData = product.unit_price !== undefined && product.unit_price !== null;
    
    return matchesSearch && matchesCategory && hasValidData;
  });

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
                      className="rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-lg"
                      style={{ 
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div 
                        className="aspect-square bg-gray-200 relative cursor-pointer"
                        onClick={() => openProductDetail(product)}
                      >
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
                          className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer"
                          style={{ color: 'var(--color-text-primary)' }}
                          onClick={() => openProductDetail(product)}
                        >
                          {product.product_name}
                        </h3>
                        <p 
                          className="font-bold mb-2"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Rp {(product.unit_price || 0).toLocaleString('id-ID')}
                        </p>
                        <p 
                          className="text-xs mb-2"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          Stok: {product.qty || 0}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
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
                            Rp {(item.price || 0).toLocaleString('id-ID')}
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
                          Rp {((item.price || 0) * (item.qty || 0)).toLocaleString('id-ID')}
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
                  NISN <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={userData?.nisn || '-'}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border outline-none cursor-not-allowed opacity-60"
                  style={{ 
                    backgroundColor: 'var(--color-surface-dark)',
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Username <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={editUsername}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border outline-none cursor-not-allowed opacity-60"
                  style={{ 
                    backgroundColor: 'var(--color-surface-dark)',
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Nama Lengkap <span style={{ color: '#ef4444', fontSize: '12px' }}>*</span>
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
                  Kelas <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={editClass}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border outline-none cursor-not-allowed opacity-60"
                  style={{ 
                    backgroundColor: 'var(--color-surface-dark)',
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Jurusan <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={editMajor}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border outline-none cursor-not-allowed opacity-60"
                  style={{ 
                    backgroundColor: 'var(--color-surface-dark)',
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  No. Telepon <span style={{ color: '#ef4444', fontSize: '12px' }}>*</span>
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
                  Alamat <span style={{ color: '#ef4444', fontSize: '12px' }}>*</span>
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
              {/* Light Mode Option */}
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

              {/* Dark Mode Option */}
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

              {/* System (Auto) Option */}
              <div 
                onClick={() => {
                  setTheme('system');
                  localStorage.setItem('theme', 'system');
                  applyTheme('system');
                  toast.success('Theme changed to System (Auto) mode');
                }}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: theme === 'system' ? 'var(--color-primary)' : 'var(--color-background)',
                  border: `2px solid ${theme === 'system' ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative" style={{ width: '24px', height: '24px' }}>
                    <Sun 
                      size={16} 
                      style={{ 
                        position: 'absolute', 
                        top: '0', 
                        left: '0',
                        color: theme === 'system' ? 'white' : 'var(--color-text-secondary)' 
                      }} 
                    />
                    <Moon 
                      size={16} 
                      style={{ 
                        position: 'absolute', 
                        bottom: '0', 
                        right: '0',
                        color: theme === 'system' ? 'white' : 'var(--color-text-secondary)' 
                      }} 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: theme === 'system' ? 'white' : 'var(--color-text-primary)' }}>
                      System (Auto)
                    </h3>
                    <p className="text-sm" style={{ color: theme === 'system' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                      Ikuti pengaturan browser
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

      {/* Product Detail Modal */}
      {productDetailModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closeProductDetail}
        >
          <div
            className="rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Detail Produk
              </h2>
              <button
                onClick={closeProductDetail}
                className="p-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                <img
                  src={selectedProduct.image_url || 'https://via.placeholder.com/400'}
                  alt={selectedProduct.product_name}
                  className="w-full h-full object-cover"
                />
                {selectedProduct.qty <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">HABIS</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {selectedProduct.product_name}
                </h3>

                <p 
                  className="text-3xl font-bold mb-4"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Rp {(selectedProduct.unit_price || 0).toLocaleString('id-ID')}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Stok Tersedia:</span>
                    <span 
                      className="font-semibold"
                      style={{ color: selectedProduct.qty > 10 ? '#10b981' : selectedProduct.qty > 0 ? '#f59e0b' : '#ef4444' }}
                    >
                      {selectedProduct.qty || 0} unit
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Kategori:</span>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {categories.find(c => c.id === selectedProduct.category_id)?.category_name || '-'}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                {selectedProduct.qty > 0 && (
                  <div className="mb-6">
                    <label 
                      className="block mb-2 font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Jumlah
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDetailModalQty(Math.max(1, detailModalQty - 1))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all"
                        style={{ 
                          backgroundColor: 'var(--color-surface-dark)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.qty}
                        value={detailModalQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setDetailModalQty(Math.max(1, Math.min(val, selectedProduct.qty)));
                        }}
                        className="w-20 text-center px-4 py-2 rounded-lg border outline-none font-semibold"
                        style={{ 
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text-primary)',
                          borderColor: 'var(--color-border)'
                        }}
                      />
                      <button
                        onClick={() => setDetailModalQty(Math.min(selectedProduct.qty, detailModalQty + 1))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all"
                        style={{ 
                          backgroundColor: 'var(--color-surface-dark)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtotal */}
                {selectedProduct.qty > 0 && (
                  <div 
                    className="p-4 rounded-lg mb-6"
                    style={{ backgroundColor: 'var(--color-surface-dark)' }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                      <span 
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Rp {((selectedProduct.unit_price || 0) * detailModalQty).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={closeProductDetail}
                    className="flex-1 py-3 rounded-lg font-semibold"
                    style={{ backgroundColor: 'var(--color-surface-dark)', color: 'var(--color-text-primary)' }}
                  >
                    Tutup
                  </button>
                  <button
                    onClick={addToCartFromDetail}
                    disabled={selectedProduct.qty <= 0}
                    className="flex-1 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: selectedProduct.qty <= 0 ? '#ccc' : 'var(--color-primary)',
                      color: '#fff'
                    }}
                  >
                    {selectedProduct.qty <= 0 ? 'Stok Habis' : '+ KERANJANG'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
          onClick={handleCloseClearCartModal}
        >
          <div
            className="rounded-lg shadow-xl max-w-md w-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Konfirmasi Kosongkan Keranjang
              </h3>
              <button
                onClick={handleCloseClearCartModal}
                className="p-1 rounded hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Trash2 size={24} style={{ color: '#ef4444' }} />
                </div>
                <div className="flex-1">
                  <p className="text-base mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Apakah Anda yakin ingin membatalkan belanja dan mengosongkan keranjang?
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Semua item dalam keranjang ({cart.length} item) akan dihapus dan tidak dapat dikembalikan.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseClearCartModal}
                  className="px-4 py-2 rounded border font-medium transition-all hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)' 
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearCart}
                  className="px-4 py-2 rounded border font-medium transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    color: '#fff'
                  }}
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeHome;
