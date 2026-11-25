import {
    IconCheck,
    IconClock,
    IconReceipt,
    IconTruck,
    IconUsers,
    IconWasher,
} from '@/Components/LineIcons';
import { StatusBayar, StatusProses } from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import { Head, Link } from '@inertiajs/react';

export default function KasirDashboard({ stats, transaksiTerbaru }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-lg font-bold leading-tight text-[#134E4A]">
                            Meja Kerja Kasir & Administrasi
                        </h1>
                        <p className="text-xs text-slate-600">
                            Pencatatan transaksi cucian, penerimaan pembayaran, dan pemantauan tagihan tempo.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Kasir" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Baris Aksi Utama Kasir */}
                <section
                    aria-label="Pintasan operasional kasir"
                    className="rounded-xl border border-teal-200/80 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="flex items-start gap-3.5">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                            <IconReceipt className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#134E4A]">Loket Penerimaan & Transaksi Cucian</h2>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Buat nota baru dengan penguncian harga otomatis, terapkan voucher promo, atau jadwalkan kloter pengantaran kurir.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href={route('kasir.pengantaran.index')}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-teal-200 bg-[#F6FBF9] px-4 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            <IconTruck className="h-4 w-4 text-[#0D9488]" />
                            <span>Jadwalkan Kurir</span>
                        </Link>
                        <Link
                            href={route('kasir.transaksi.create')}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                        >
                            <span>+ Buat Nota Transaksi Baru</span>
                        </Link>
                    </div>
                </section>

                {/* 4 Kartu Ringkasan Operasional */}
                <section aria-label="Ringkasan metrik operasional" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Total Pelanggan</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                <IconUsers className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold tabular-nums text-[#134E4A]">
                            {stats?.totalPelanggan || 0}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Pelanggan terdaftar di gerai</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Transaksi Aktif</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                                <IconWasher className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold tabular-nums text-[#134E4A]">
                            {stats?.transaksiAktif || 0}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Sedang dalam antrean cuci / setrika</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Tagihan Tempo</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-800">
                                <IconClock className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold tabular-nums text-rose-700">
                            {stats?.transaksiTempo || 0}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Nota bayar belakangan belum lunas</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Transaksi Selesai</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                <IconCheck className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold tabular-nums text-[#0D9488]">
                            {stats?.transaksiSelesai || 0}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Cucian selesai dan lunas</div>
                    </div>
                </section>

                {/* Tabel Transaksi Terbaru */}
                <section aria-labelledby="heading-transaksi-terbaru" className="bg-white rounded-xl border border-teal-200/80 overflow-hidden">
                    <div className="px-5 py-4 border-b border-teal-100 bg-[#F6FBF9] flex items-center justify-between">
                        <div>
                            <h2 id="heading-transaksi-terbaru" className="text-sm font-bold text-[#134E4A]">
                                Transaksi Terbaru
                            </h2>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Daftar nota cucian terkini yang masuk ke sistem
                            </p>
                        </div>
                        <Link
                            href={route('kasir.transaksi.index')}
                            className="inline-flex min-h-[38px] items-center rounded-lg border border-teal-200 bg-white px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            Lihat Semua Nota
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-white text-xs font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th scope="col" className="px-5 py-3.5">No. Nota</th>
                                    <th scope="col" className="px-5 py-3.5">Pelanggan</th>
                                    <th scope="col" className="px-5 py-3.5">Tahap Proses</th>
                                    <th scope="col" className="px-5 py-3.5">Status Bayar</th>
                                    <th scope="col" className="px-5 py-3.5 text-right">Sisa Tagihan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-100/70">
                                {transaksiTerbaru && transaksiTerbaru.length > 0 ? (
                                    transaksiTerbaru.map((t) => (
                                        <tr key={t.id} className="hover:bg-[#F6FBF9] transition">
                                            <td className="px-5 py-3.5">
                                                <Link
                                                    href={route('kasir.transaksi.show', t.id)}
                                                    className="font-mono font-bold text-[#134E4A] hover:text-[#0D9488] underline-offset-4 hover:underline"
                                                >
                                                    {t.no_nota}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">
                                                {t.pelanggan?.nama}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusProses status={t.status_proses_terkini} />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBayar status={t.status_bayar} />
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold tabular-nums text-[#134E4A]">
                                                {formatRupiah(t.sisa_tagihan)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center">
                                            <p className="text-sm font-bold text-[#134E4A]">Belum ada transaksi cucian</p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                Buat nota cucian baru untuk mulai mencatat antrean layanan pelanggan.
                                            </p>
                                            <Link
                                                href={route('kasir.transaksi.create')}
                                                className="mt-3 inline-flex min-h-[40px] items-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A]"
                                            >
                                                + Buat Nota Transaksi Baru
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
