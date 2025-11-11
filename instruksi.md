### 1. Tabel Customer (Customer Table)

**Deskripsi:**
- Menyimpan data customer (pembeli), terpisah dari admin, student, dan user lain.
- Memungkinkan setiap customer login untuk melihat histori transaksinya sendiri.
- Terintegrasi dengan tabel orders/invoices sebagai foreign key.

**Struktur Tabel (disarankan untuk MSSQL):**
```sql
CREATE TABLE customer (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL, -- Untuk akses login customer
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);
```

- Foreign key `customer_id` akan digunakan pada tabel transaksi (misal: `orders` atau `invoices`).

### 2. Integrasi dengan Order (Supaya Histori Terlihat di Customer)

**Modifikasi Tabel Orders:**
```sql
ALTER TABLE orders ADD customer_id INT NULL;
ALTER TABLE orders ADD CONSTRAINT FK_orders_customer FOREIGN KEY (customer_id) REFERENCES customer(id);
```

Dengan ini, setiap transaksi/order dapat dihubungkan ke customer tertentu (bisa NULL jika transaksi dilakukan tanpa login customer).

### 3. Rancang Tampilan Home untuk Customer

- **Header:**
  - Tampilkan nama profile customer
  - Tombol edit profile (edit nama, password)
  - Tombol setting theme & tombol logout

- **Main Grid Layout:**
  - **Produk Terlaris Card:**
    - Menampilkan 4-8 produk paling laku
    - Card berisi gambar, nama produk, jumlah terjual
  - **Diskon Card:**
    - Menampilkan diskon aktif (dari tabel `discount`), tampilkan kode/nama, nilai, masa berlaku
    - Tombol "View All" untuk melihat daftar diskon lengkap
  - **History Transaksi Card:**
    - Menampilkan 3-5 transaksi terakhir milik user yang sedang login
    - Card: tanggal, ringkasan barang & total, status transaksi
    - Tombol "View All" membuka halaman daftar transaksi lengkap

> Gunakan layout grid minimal 1 baris 3 kolom yang responsif.

- **FITUR:**
  - Semua card bisa di klik untuk detail lanjut
  - Gunakan komponen reusable yang sudah dipakai di Employee section jika ada (untuk konsistensi desain)
  
  ### 4. Logic pada Proses Transaksi di Employee/Kasir Panel

- Pada panel cart/checkout, terdapat input **Nama Customer** yang autocompletion/search (dropdown hasil dari pencarian nama di tabel `customer`)
- Field Nama Customer **WAJIB DIISI** saat membuat transaksi baru
- Setelah transaksi selesai disimpan, field `customer_id` pada order diisi dengan id customer yang bersangkutan
- Data histori otomatis bisa diambil dan ditampilkan pada home customer sesuai transaksi miliknya

### 5. Halaman Daftar History & Diskon Customer

- Jika user klik "View All" pada history atau diskon:
  - Redirect ke halaman /history atau /discounts sesuai pilihan
  - Tampilkan daftar terurut (histori: berdasarkan waktu terbaru, diskon: berdasarkan masa berlaku dan tanggal mulai)
- Detail transaksi tampil lengkap: waktu, list produk, jumlah, total, status, nama kasir/operator POS