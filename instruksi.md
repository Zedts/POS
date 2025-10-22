### Ini adalah fitur dari masing masing halaman, coba kamu kembangkan dari masing masing halaman dan pastikan kamu menggunakan desain dan struktur secara konsisten, kerjakan 1 per 1

1. Home (Dashboard)
Halaman utama untuk ringkasan data penting:
- Total transaksi hari ini & bulan ini (gunakan line chart dari "npm i chart.js" serta gunakan juga chart donat)
- Total pendapatan
- Jumlah stok tersisa (produk hampir habis)
- Total siswa aktif (yang bertugas POS)
- Grafik penjualan per minggu / per kategori
- Daftar order terbaru
- Produk terlaris dan diskon yang sedang aktif
- (fungsi analitik ringan untuk membantu admin memantau kinerja harian dan kebutuhan restock produk)

---

2. Products Management
Halaman untuk menampilkan dan mengelola semua produk di POS:
- Tambah, edit, dan hapus produk (proses crud)
- Upload / ubah gambar produk, untuk uploads memakai file import dari device user pastikan di simpan di folder uploads, untuk link url di simpan di database! (pastikan bisa upload dari storage dia, dan bisa upload dari link url, serta pastikan untu uploadnya itu nanti dia akan mengupload file ke folder uploads, setelah dari situ, pastikan nama file yang di upload sudah di fix agar bisa di tampilkan, dan ketika sudah upload pastikan ada previewnya juga. Serta ketika dalam proses delete pastikan file yang ada di folder uploads juga ikut di hapus ya!, begitupun untuk yang di database di sesuaikan saja)
- Filter produk berdasarkan kategori  
- Kolom stok dan harga saat ini  
- Tombol **“View Price History”** per produk (terhubung ke `product_price_history`)  
- Notifikasi otomatis untuk stok minimum dan produk kadaluarsa  
- Admin hanya melakukan kontrol dan input awal — operasional dilakukan oleh siswa/employee POS  

---

# SEKARANG KERJAKAN CATEGORY MANAGEMENT
3. Category Management
Halaman untuk manajemen kategori produk:
- Tambah, edit, dan hapus kategori  
- Lihat daftar produk per kategori  
- Statistik jumlah produk dalam tiap kategori  

---

4. Discount Management
Halaman untuk mengatur program diskon aktif:
- Tambah, edit, dan hapus diskon  
- Atur masa berlaku (**start_date**, **end_date**)  
- Atur jenis diskon (**percentage** atau **fixed**)  
- Kolom **usage_limit** dan **used_count**  
- Status otomatis: aktif/tidak aktif berdasarkan tanggal  

---

5. Order & Sales Management
Halaman untuk memantau aktivitas transaksi siswa POS:
- Daftar semua order yang telah dibuat siswa (terhubung ke tabel `orders`)  
- Filter berdasarkan rentang tanggal, siswa, dan status order (**pending**, **complete**, **refunded**)  
- Detail order menampilkan daftar item dari `order_details`  
- Fitur **Export ke Excel / PDF** untuk laporan transaksi  

---

6. Invoice Management
Halaman monitoring semua invoice yang sudah dibuat:
- Daftar invoice berdasarkan **invoice_status** (diproses, berhasil, gagal)  
- Tampilkan total, diskon, dan metode pembayaran (**paid_by**)  
- Fitur **“View Receipt”** untuk cetak invoice  
- Relasi langsung dengan `orders` untuk keperluan audit  

---

7. Student Management
Halaman untuk manajemen data siswa sebagai operator POS:
- Daftar seluruh siswa aktif  
- Lihat transaksi yang dibuat (relasi ke `orders`)  
- Status siswa: aktif / tidak aktif  
- Edit profil siswa (alamat, jurusan, kelas)  
- Statistik kontribusi penjualan per siswa  

---

8. Report Center (Laporan & Statistik)
Pusat laporan keuangan dan aktivitas POS:
- Laporan Penjualan Harian / Mingguan / Bulanan  
- Laporan Produk Terlaris  
- Laporan Penggunaan Diskon  
- Laporan Stok Barang dan Kadaluarsa  
- Laporan Pendapatan Per Kelas / Siswa  
- Semua laporan dapat diexport ke **Excel / PDF**  

---

9. Price History
Halaman untuk menampilkan riwayat harga dari tabel `product_price_history`:
- Riwayat perubahan harga per produk (kapan diubah, oleh siapa)  
- Komparasi harga lama dan harga baru  
- Grafik tren perubahan harga per produk  

---

10. Settings (Pengaturan Sistem)
Halaman untuk konfigurasi dasar sistem POS:
- Edit profil admin (username, password)  
- Atur format tanggal & waktu  
- Atur logo sekolah, nama sistem, dan informasi footer  
- Fitur **Backup / Restore Database** (opsional)  
- Kelola **Return & Refund Policies**  
- Manajemen metode pembayaran (cash, QR, e-money, dll)  

---

11. Audit Logs (Opsional tapi Direkomendasikan)
Fitur keamanan tambahan untuk pencatatan aktivitas sistem:
- Menyimpan semua aktivitas penting (produk ditambah, dihapus, harga diubah, diskon dibuat, dll.)  
- Menampilkan siapa (admin/siswa), kapan, dan aksi apa yang dilakukan  
- Filter berdasarkan entitas: produk, diskon, siswa, order  

# PENTING!!!
``` Pastikan tampilannya itu responsive dengan menggunakan desain secara konsisten seperti yang sudah ada dan pastikan juga tidak ada double code atau duplicate code serta pastikan lakukan sesuai perintah tanpa ada inisiatif sendiri! Serta PASTIKAN menggunakan data asli dari database tidak menggunakan data dummy ```