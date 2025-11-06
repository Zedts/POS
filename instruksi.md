### Ini adalah fitur dari masing masing halaman, coba kamu kembangkan dari masing masing halaman dan pastikan kamu menggunakan desain dan struktur secara konsisten, kerjakan 1 per 1

# Point of Sale (POS) - Halaman Utama Transaksi
Halaman ini merupakan inti dari sistem POS, di mana siswa melakukan transaksi penjualan harian. Desain dan alur kerjanya mirip dengan interface kasir pada toko ritel modern seperti Indomart atau Alfamart.

---

## Fitur Utama

### A. Panel Produk (Sebelah Kiri)
#### Tampilan Produk
Menampilkan produk dalam bentuk grid card layout yang berisi:
- Gambar produk (`image_url`)
- Nama produk
- Harga (`unit_price`)
- Stok tersedia
- Tombol **+ KERANJANG** untuk menambahkan produk ke keranjang

#### Fitur Pencarian & Filter
- **Search Box:** mencari produk berdasarkan nama  
- **Dropdown Kategori:** memfilter produk berdasarkan `category_id`  
- Grid produk akan **auto-update** setiap kali pencarian atau filter berubah  

#### Fitur Scan QR/Barcode (Opsional, 'Direkomendasikan')
- Input field khusus untuk scan barcode produk  
- Saat barcode di-scan, sistem otomatis mencari produk berdasarkan barcode dari tabel `products`  
- Jika produk ditemukan, item langsung ditambahkan ke keranjang  
- Menggunakan library seperti `react-barcode-scanner` (npm i react-barcode-scanner)

---

### B. Panel Keranjang (Sebelah Kanan)
#### Tabel Keranjang
Menampilkan data dalam bentuk tabel dengan kolom:
- Nomor urut item  
- Nama produk  
- Jumlah (`qty`)  
- Harga per item  
- Subtotal (qty × price)  
- Tombol **Delete** untuk menghapus item individual  

#### Tombol Aksi
- **Hapus Item:** menghapus satu produk dari keranjang  
- **Clear All:** mengosongkan seluruh isi keranjang  
- **Update Qty:** mengubah jumlah item (increment/decrement)

#### Perhitungan Otomatis
- **Subtotal:** total harga semua item  
- **Diskon:** otomatis dikurangi jika ada `discount_code` valid  
- **Total Akhir:** subtotal dikurangi diskon  
- Semua perhitungan berlangsung secara **real-time**

#### Penerapan Diskon
- Input field untuk memasukkan `discount_code`  
- Sistem melakukan validasi:
  - Diskon belum kadaluarsa  
  - `usage_limit` belum tercapai  
- Jika valid, tampilkan persentase/nilai diskon dan update total  
- Jika tidak valid, tampilkan pesan error

---

### C. Metode Pembayaran
#### Pilihan Pembayaran (Dari Kolom `paid_by` di Tabel `invoices`)
1. **Cash (Tunai):**
   - Menampilkan input field untuk "Uang Diterima"
   - Sistem otomatis menghitung **kembalian (uang_diterima - total)**  
2. **QR Code:**
   - Menampilkan informasi bahwa pembayaran dilakukan melalui QR (e-wallet / QRIS)
   - Tidak memerlukan input uang diterima  

#### Tombol Proses Pembayaran
- Validasi bahwa keranjang tidak kosong  
- Jika **Cash:** hitung kembalian  
- Jika **QR:** tampilkan notifikasi bahwa pembayaran QR sedang diproses  
- Setelah validasi, sistem:
  1. Menyimpan data transaksi ke tabel `orders` dan `order_details`
  2. Menghasilkan invoice otomatis
  3. Redirect ke halaman **Cetak Bon**

---

## Database yang Terlibat
- **`products`** – Menyimpan data produk (product_name, price, picture_url, qty, barcode)  
- **`category`** – Menyediakan filter berdasarkan kategori produk  
- **`discounts`** – Validasi kode diskon yang dimasukkan  
- **`orders`** – Menyimpan transaksi utama (order_number, employee_id, order_total, balance, discount_code)  
- **`order_details`** – Menyimpan rincian item per transaksi  
- **`invoices`** – Menghasilkan invoice otomatis (invoice_number, invoice_status, paid_by)

---

## Alur Transaksi
1. Siswa melihat daftar produk pada grid  
2. Siswa memilih produk (klik card atau scan barcode)  
3. Produk ditambahkan ke keranjang  
4. Keranjang terupdate secara real-time  
5. (Opsional) Terapkan diskon dengan memasukkan `discount_code`  
6. Pilih metode pembayaran (Cash / QR)  
7. Tekan tombol **Proses Pembayaran**  
8. Sistem menyimpan transaksi ke database dan membuat invoice otomatis  
9. User diarahkan ke halaman **Cetak Bon** (ukuran sesuai bon struk pada umumnya)

---

# SEKARANG KERJAKAN FITUR STUDENT PROFILE
# Student Profile - Halaman Profil Siswa
Halaman ini digunakan oleh siswa untuk melihat dan mengedit data pribadi mereka sendiri. Fungsinya memastikan bahwa setiap siswa dapat mengelola informasi pribadinya tanpa mengakses data siswa lain.

---

## Fitur yang Ditampilkan

### A. Informasi Profil
Menampilkan data pribadi siswa yang sedang login, meliputi:
- **NISN**
- **Nama Lengkap**
- **Kelas** (X, XI, XII)
- **Jurusan** (RPL, DKV1, DKV2, BR, MP, AK)
- **Nomor HP**
- **Alamat**

Semua data ditampilkan dalam bentuk form yang **read-only secara default**, kecuali ketika mode edit diaktifkan.

---

### B. Tombol Aksi
1. **Edit Profil**  
   - Mengubah form menjadi mode edit.  
   - Field seperti Nama, Nomor HP, dan Alamat dapat diubah.  
   - Setelah disimpan, data langsung diperbarui di database.  

2. **Ubah Password** *(opsional)*  
   - Menampilkan form ubah password dengan input:
     - Password lama
     - Password baru
     - Konfirmasi password baru  
   - Password baru harus di-hash menggunakan **MD5** sebelum disimpan ke database.

---

### C. Keamanan & Batasan
- Siswa **hanya dapat mengedit profil miliknya sendiri** (berdasarkan session login).  
- Validasi dilakukan agar siswa tidak dapat mengubah data milik siswa lain.  
- Password disimpan dalam bentuk **hash MD5** untuk menjaga keamanan data login.

---

## Alur Penggunaan
1. Siswa membuka halaman **Profil Siswa**.  
2. Sistem menampilkan data dari tabel `student` sesuai `student_id` yang sedang login.  
3. Jika siswa menekan tombol **Edit Profil**, form akan berubah ke mode edit.  
4. Setelah melakukan perubahan, siswa menekan **Simpan** untuk memperbarui data.  
5. Jika ingin mengganti password, siswa dapat memilih menu **Ubah Password**.  
6. Setelah perubahan berhasil, sistem menampilkan notifikasi konfirmasi.

---


# PENTING!!!
``` Pastikan tampilannya itu responsive dengan menggunakan desain secara konsisten seperti yang sudah ada dan pastikan juga tidak ada double code atau duplicate code serta pastikan lakukan sesuai perintah tanpa ada inisiatif sendiri! Serta PASTIKAN menggunakan data asli dari database tidak menggunakan data dummy ```