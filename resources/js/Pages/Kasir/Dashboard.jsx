import {
    IconCheck,
    IconClock,
    IconReport,
    IconUsers,
    IconWasher,
} from '@/Components/LineIcons';
import NotaDetailModal from '@/Components/NotaDetailModal';
import { StatusBayar, StatusProses } from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function KasirDashboard({ stats, trenPendapatan = [], transaksiTerbaru = [] }) {
    const [selectedNotaId, setSelectedNotaId] = useState(null);
    const selectedNota = transaksiTerbaru.find((t) => t.id === selectedNotaId) || null;

    const maxNominal = Math.max(...trenPendapatan.map((d) => Number(d.nominal) || 0), 1);

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

                {/* Tren Pendapatan 7 Hari Terakhir & Ringkasan Keuangan */}
                {trenPendapatan.length > 0 && (
                    <section
                        aria-labelledby="heading-tren-pendapatan"
                        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                    >
                        {/* Grafik Batang Tren Pendapatan 7 Hari */}
                        <div className="lg:col-span-8 rounded-xl border border-teal-200/80 bg-white overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between border-b border-teal-100 bg-[#F6FBF9] px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                    <IconReport className="h-4 w-4 text-[#0D9488]" />
                                    <h2 id="heading-tren-pendapatan" className="text-sm font-bold text-[#134E4A]">
                                        Tren Pendapatan Masuk (7 Hari Terakhir)
                                    </h2>
                                </div>
                                <span className="text-xs font-extrabold tabular-nums text-[#0D9488]">
                                    Total 7 Hari: {formatRupiah(stats?.pendapatan7Hari || 0)}
                                </span>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-7 gap-2.5 items-end h-44 pt-6">
                                    {trenPendapatan.map((item) => {
                                        const nominal = Number(item.nominal) || 0;
                                        const persenTinggi = nominal > 0 ? Math.max(Math.round((nominal / maxNominal) * 100), 14) : 6;
                                        return (
                                            <div
                                                key={item.tanggal}
                                                className="flex flex-col items-center justify-end h-full group"
                                            >
                                                <span className="mb-1.5 text-[10px] font-bold tabular-nums text-[#134E4A] truncate max-w-full">
                                                    {nominal > 0 ? `${Math.round(nominal / 1000)}rb` : '0'}
                                                </span>
                                                <div className="w-full max-w-[44px] h-28 bg-[#F6FBF9] rounded-lg border border-teal-100 flex items-end p-1">
                                                    <div
                                                        style={{ height: `${persenTinggi}%` }}
                                                        title={`${item.label}: ${formatRupiah(nominal)}`}
                                                        className={`w-full rounded-md transition-all ${
                                                            nominal > 0
                                                                ? 'bg-[#0D9488] group-hover:bg-[#134E4A]'
                                                                : 'bg-slate-200'
                                                        }`}
                                                    />
                                                </div>
                                                <span className="mt-2 text-xs font-bold text-[#134E4A]">
                                                    {item.hari}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-500">
                                                    {item.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Keuangan Cepat */}
                        <div className="lg:col-span-4 rounded-xl border border-teal-200/80 bg-white overflow-hidden flex flex-col justify-between">
                            <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3.5">
                                <h2 className="text-sm font-bold text-[#134E4A]">Ringkasan Keuangan</h2>
                            </div>

                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="rounded-xl border border-teal-100 bg-[#F6FBF9] p-3.5">
                                        <span className="text-xs font-semibold text-slate-600">
                                            Pendapatan Masuk Hari Ini
                                        </span>
                                        <div className="mt-1 text-xl font-black tabular-nums text-[#0D9488]">
                                            {formatRupiah(stats?.pendapatanHariIni || 0)}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                        <span className="text-xs font-semibold text-slate-600">
                                            Total Nilai Transaksi (Omzet)
                                        </span>
                                        <div className="mt-1 text-lg font-extrabold tabular-nums text-[#134E4A]">
                                            {formatRupiah(stats?.totalOmzet || 0)}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                                        <span className="text-xs font-semibold text-rose-800">
                                            Sisa Belum Dibayar (Piutang)
                                        </span>
                                        <div className="mt-1 text-lg font-black tabular-nums text-rose-700">
                                            {formatRupiah(stats?.totalPiutang || 0)}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={route('kasir.laporan.index')}
                                    className="inline-flex min-h-[40px] w-full items-center justify-center rounded-lg border border-teal-200 bg-[#CCFBF1]/70 px-4 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition"
                                >
                                    Buka Laporan Keuangan
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

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
                                    <th scope="col" className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-100/70">
                                {transaksiTerbaru && transaksiTerbaru.length > 0 ? (
                                    transaksiTerbaru.map((t) => (
                                        <tr key={t.id} className="hover:bg-[#F6FBF9] transition">
                                            <td className="px-5 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedNotaId(t.id)}
                                                    className="font-mono font-bold text-[#134E4A] hover:text-[#0D9488] underline-offset-4 hover:underline cursor-pointer"
                                                >
                                                    {t.no_nota}
                                                </button>
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
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedNotaId(t.id)}
                                                    className="inline-flex min-h-[34px] items-center rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#0D9488] hover:bg-[#CCFBF1] hover:text-[#134E4A] transition cursor-pointer"
                                                >
                                                    Lihat Nota
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-8 text-center text-xs text-slate-500">
                                            Belum ada transaksi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <NotaDetailModal
                show={Boolean(selectedNota)}
                transaksi={selectedNota}
                onClose={() => setSelectedNotaId(null)}
            />
        </AuthenticatedLayout>
    );
}
