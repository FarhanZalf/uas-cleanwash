import {
    IconCheck,
    IconClock,
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
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg font-bold text-[#134E4A]">Dashboard Kasir</h1>
                    <Link
                        href={route('kasir.transaksi.create')}
                        className="inline-flex min-h-[40px] items-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                        + Buat Nota Baru
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard Kasir" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 4 Kartu Ringkasan Operasional */}
                <section aria-label="Ringkasan metrik operasional" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Total Pelanggan</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                <IconUsers className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-2.5 text-3xl font-extrabold tabular-nums text-[#134E4A]">
                            {stats?.totalPelanggan || 0}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Transaksi Aktif</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                                <IconWasher className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-2.5 text-3xl font-extrabold tabular-nums text-[#134E4A]">
                            {stats?.transaksiAktif || 0}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Tagihan Tempo</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-800">
                                <IconClock className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-2.5 text-3xl font-extrabold tabular-nums text-rose-700">
                            {stats?.transaksiTempo || 0}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Transaksi Selesai</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                <IconCheck className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-2.5 text-3xl font-extrabold tabular-nums text-[#0D9488]">
                            {stats?.transaksiSelesai || 0}
                        </div>
                    </div>
                </section>

                {/* Tabel Transaksi Terbaru */}
                <section aria-labelledby="heading-transaksi-terbaru" className="bg-white rounded-xl border border-teal-200/80 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-teal-100 bg-[#F6FBF9] flex items-center justify-between">
                        <h2 id="heading-transaksi-terbaru" className="text-sm font-bold text-[#134E4A]">
                            Transaksi Terbaru
                        </h2>
                        <Link
                            href={route('kasir.transaksi.index')}
                            className="inline-flex min-h-[36px] items-center rounded-lg border border-teal-200 bg-white px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-white text-xs font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th scope="col" className="px-5 py-3">No. Nota</th>
                                    <th scope="col" className="px-5 py-3">Pelanggan</th>
                                    <th scope="col" className="px-5 py-3">Tahap</th>
                                    <th scope="col" className="px-5 py-3">Pembayaran</th>
                                    <th scope="col" className="px-5 py-3 text-right">Sisa Tagihan</th>
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
                                        <td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-500">
                                            Belum ada transaksi.
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
