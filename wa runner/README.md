# WA Number Runner — MVP

Aplikasi Android sederhana untuk mengelola daftar nomor WhatsApp, membuka chat/halaman nomor melalui WhatsApp atau browser, dan mencatat status secara manual.

## Fitur
- Dashboard statistik.
- Tambah nomor manual.
- Import TXT/CSV (satu nomor per baris; format internasional disarankan).
- Cari nomor.
- Buka WhatsApp melalui tautan `https://wa.me/`.
- Tandai status: Menunggu, Terverifikasi, atau Perlu ditinjau.
- Riwayat perubahan.
- Ekspor cadangan JSON.
- Penyimpanan lokal melalui SharedPreferences Android.

## Batasan dan keamanan
MVP ini **tidak** mengotomatisasi login, membaca OTP/SMS, mengekstrak kode verifikasi, mendeteksi status akun dari layar WhatsApp, atau mencoba nomor lain ketika terjadi limit/blokir. Status dicatat oleh pengguna secara manual. Gunakan hanya nomor milik sendiri atau nomor yang penggunaannya telah mendapat izin pemiliknya. Jangan gunakan aplikasi untuk menghindari pembatasan WhatsApp.

## Membuka project
1. Ekstrak ZIP.
2. Buka folder `WA-Number-Runner` melalui Android Studio.
3. Pastikan Android SDK Platform 35 terpasang.
4. Gunakan JDK 17.
5. Tunggu Gradle Sync selesai.
6. Pilih **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

APK debug biasanya tersedia di:
`app/build/outputs/apk/debug/app-debug.apk`

## Teknologi
- Kotlin
- Android WebView
- HTML, CSS, JavaScript
- JSON lokal (SharedPreferences)
- minSdk 23 / targetSdk 35

## Catatan pengembangan
Untuk versi produksi, pertimbangkan mengganti penyimpanan JSON di SharedPreferences dengan file internal terenkripsi atau database lokal, menambahkan validasi nomor yang lebih kuat, serta pengujian pada beberapa versi Android.


## Build APK langsung via GitHub (tanpa PC)
Project menyertakan workflow GitHub Actions di `.github/workflows/android-build.yml`.

1. Buat repository GitHub baru, misalnya `wa-number-runner`.
2. Upload seluruh isi folder project tersebut, termasuk folder `.github`.
3. Buka tab **Actions** di repository.
4. Pilih workflow **Build WA Number Runner APK**, lalu tekan **Run workflow**. Push ke branch `main` juga akan memicu build otomatis.
5. Setelah job selesai, buka hasil run dan unduh artifact **WA-Number-Runner-debug**.
6. Ekstrak ZIP artifact di HP, lalu install `app-debug.apk`. Izinkan instalasi dari sumber tersebut jika Android memintanya.

Jangan bagikan password atau token GitHub kepada siapa pun. APK debug cocok untuk uji coba pribadi, bukan distribusi produksi.
