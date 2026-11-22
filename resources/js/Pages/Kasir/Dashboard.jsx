import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function KasirDashboard({ stats, transaksiTerbaru }) {
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number || 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold leading-tight text-[#134E4A]">
                            Meja Kerja Kasir & Administrasi
                        </h2>
                        <p className="text-xs text-slate-500">
                            Pencatatan transaksi, penerimaan pembayaran, dan monitoring tagihan tempo.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Kasir" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pelanggan</span>
                            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 text-lg">👥</span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-[#134E4A]">{stats?.totalPelanggan || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Pelanggan terdaftar di sistem</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaksi Aktif</span>
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 text-lg">🧺</span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-slate-800">{stats?.transaksiAktif || 0}</div>
                        <div className="text-xs text-amber-600 font-medium mt-1">Sedang dalam proses / antrean</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tagihan Tempo</span>
                            <span className="p-2 rounded-xl bg-rose-50 text-rose-700 text-lg">⏳</span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-rose-600">{stats?.transaksiTempo || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Pakaian diambil belum lunas</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaksi Selesai</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-lg">✅</span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-emerald-600">{stats?.transaksiSelesai || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Cucian tuntas & lunas</div>
                    </div>
                </div>

                {/* Modul Aksi Cepat Kasir */}
                <div className="bg-gradient-to-r from-[#0D9488] to-[#134E4A] rounded-2xl p-6 text-white shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold">Operasional Kasir Siap Digunakan</h3>
                            <p className="text-teal-100 text-xs mt-1">
                                Kelola transaksi multi-layanan, snapshot harga, voucher promo, hingga pengantaran kurir.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={route('kasir.transaksi.create')}
                                className="px-4 py-2.5 bg-white text-[#0D9488] hover:bg-teal-50 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                            >
                                + Buat Nota Transaksi Baru
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabel Transaksi Terbaru */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800">Transaksi Terbaru</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Daftar nota cucian yang baru masuk ke sistem</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5">No. Nota</th>
                                    <th className="px-5 py-3.5">Pelanggan</th>
                                    <th className="px-5 py-3.5">Status Proses</th>
                                    <th className="px-5 py-3.5">Status Bayar</th>
                                    <th className="px-5 py-3.5 text-right">Sisa Tagihan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transaksiTerbaru && transaksiTerbaru.length > 0 ? (
                                    transaksiTerbaru.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-5 py-4 font-mono font-bold text-blue-600">{t.no_nota}</td>
                                            <td className="px-5 py-4 font-medium text-slate-800">{t.pelanggan?.nama}</td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                                    {t.status_proses_terkini}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                    t.status_bayar === 'Lunas' ? 'bg-emerald-100 text-emerald-800' :
                                                    t.status_bayar === 'Tempo' ? 'bg-rose-100 text-rose-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {t.status_bayar}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right font-bold text-slate-800">
                                                {formatRupiah(t.sisa_tagihan)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                                            Belum ada transaksi tercatat. Mulai buat nota cucian pertama Anda!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
