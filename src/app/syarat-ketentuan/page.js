'use client';

export default function SyaratKetentuanPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-gray-500">Pembaruan Terakhir: 1 Oktober 2026</p>
        </div>

        <div className="prose prose-lg prose-blue max-w-none text-gray-600 bg-white p-8 md:p-12 rounded-3xl shadow-[var(--shadow-card)] border border-gray-100">
          <h2>1. Ketentuan Umum</h2>
          <p>
            Dengan menggunakan layanan penyewaan sepeda Kulino Pit, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Kulino Pit berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.
          </p>

          <h2>2. Persyaratan Penyewa</h2>
          <ul>
            <li>Penyewa harus berusia minimal 17 tahun dan memiliki kartu identitas yang sah (KTP/Paspor/SIM).</li>
            <li>Penyewa wajib menitipkan kartu identitas asli (KTP/SIM/Paspor) sebagai jaminan selama masa sewa berlangsung.</li>
            <li>Penyewa harus dalam kondisi sehat fisik dan mental untuk bersepeda.</li>
          </ul>

          <h2>3. Tanggung Jawab Penyewa</h2>
          <p>
            Selama masa sewa, penyewa bertanggung jawab penuh atas sepeda dan perlengkapan yang disewa. Penyewa wajib:
          </p>
          <ul>
            <li>Menjaga keamanan sepeda dan memastikannya terkunci saat ditinggalkan.</li>
            <li>Menggunakan sepeda sesuai dengan fungsinya (misal: road bike tidak untuk medan off-road berat).</li>
            <li>Mematuhi semua peraturan lalu lintas yang berlaku di wilayah Banyuwangi dan sekitarnya.</li>
            <li>Segera melaporkan jika terjadi kerusakan, kehilangan, atau kecelakaan selama masa sewa.</li>
          </ul>

          <h2>4. Kerusakan dan Kehilangan</h2>
          <p>
            Segala bentuk kerusakan yang terjadi akibat kelalaian penyewa (termasuk goresan pada frame, komponen patah, dll) akan dikenakan biaya perbaikan sesuai dengan harga spare part resmi dan ongkos servis.
          </p>
          <p>
            Apabila terjadi kehilangan sepeda selama masa sewa, penyewa wajib mengganti rugi sebesar harga pasar dari tipe sepeda yang hilang tersebut.
          </p>

          <h2>5. Pengembalian Sepeda</h2>
          <ul>
            <li>Sepeda harus dikembalikan tepat waktu sesuai dengan durasi yang telah disepakati.</li>
            <li>Keterlambatan pengembalian akan dikenakan denda proporsional per jam keterlambatan.</li>
            <li>Sepeda dikembalikan di basecamp Kulino House atau di lokasi pengambilan yang telah disepakati di awal.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
