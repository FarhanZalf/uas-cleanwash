import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '@/utils/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function LaporanIndex({ ringkasanKeuangan, bukuPiutang, operasional, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('kasir.laporan.index'),
            { start_date: startDate, end_date: endDate },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const daftarPiutang = bukuPiutang.daftar || [];
    const volumeLayanan = operasional.volume_layanan || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-[#134E4A]">
                            Rekapitulasi Laporan Keuangan & Piutang
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Ikhtisar arus kas pembayaran, buku piutang tempo, dan volume operasional laundry.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#0D9488] bg-teal-50 px-3.5 text-xs font-bold text-[#0D9488] hover:bg-teal-100 transition cursor-pointer"
                        >
                            <span>🖨️</span> Cetak Laporan (PDF)
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Keuangan & Piutang" />

            {/* Print Header */}
            <div className="hidden print:block mb-6 border-b border-slate-300 pb-4 text-center">
                <h1 className="text-2xl font-black text-slate-900">CLEANWASH SMART LAUNDRY</h1>
                <p className="text-xs text-slate-600 mt-1">
                    Laporan Rekapitulasi Keuangan, Buku Piutang & Performa Operasional
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                    Periode: {formatTanggal(startDate)} s.d. {formatTanggal(endDate)} · Dicetak pada: {formatTanggalWaktu(new Date())}
                </p>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Form Filter Rentang Tanggal */}
                <div className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm print:hidden">
                    <form onSubmit={handleFilter} className="flex flex-col md:flex-row md:items-end gap-3 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700">Tanggal Selesai</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="min-h-[38px] rounded-lg bg-[#0D9488] px-4 font-bold text-white hover:bg-[#134E4A] transition cursor-pointer"
                            >
                                Terapkan Periode
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 1: Ringkasan Finansial Arus Kas Masuk */}
                <div>
                    <h3 className="text-sm font-bold text-[#134E4A] mb-3">1. Rekapitulasi Arus Kas Masuk (Omzet Masuk)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-teal-200 bg-[#F6FBF9] p-5">
                            <div className="text-xs font-bold text-[#134E4A]">Total Penerimaan Kas</div>
                            <div className="mt-2 text-2xl font-black text-[#134E4A] tabular-nums">
                                {formatRupiah(ringkasanKeuangan.total_pendapatan)}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">Uang masuk tercatat dari kasir</div>
                        </div>

                        <div className="rounded-xl border border-teal-100 bg-white p-5">
                            <div className="text-xs font-semibold text-slate-500">Penerimaan Uang Muka (DP)</div>
                            <div className="mt-2 text-xl font-bold text-slate-800 tabular-nums">
                                {formatRupiah(ringkasanKeuangan.total_uang_muka || 0)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">Uang muka saat nota dibuat</div>
                        </div>

                        <div className="rounded-xl border border-teal-100 bg-white p-5">
                            <div className="text-xs font-semibold text-slate-500">Penerimaan Pelunasan</div>
                            <div className="mt-2 text-xl font-bold text-teal-700 tabular-nums">
                                {formatRupiah(ringkasanKeuangan.total_pelunasan || 0)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">Pelunasan nota cucian</div>
                        </div>

                        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                            <div className="text-xs font-semibold text-rose-800">Total Piutang Berjalan</div>
                            <div className="mt-2 text-xl font-black text-rose-700 tabular-nums">
                                {formatRupiah(bukuPiutang.total_piutang || 0)}
                            </div>
                            <div className="text-[11px] text-rose-600 mt-1">Tagihan tempo & sisa belum lunas</div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Buku Piutang Tagihan Tempo & Belum Lunas */}
                <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
                    <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-bold text-[#134E4A]">
                                2. Buku Piutang Usaha (Tagihan Tempo & Belum Lunas)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Daftar transaksi aktif yang belum diselesaikan pembayarannya oleh pelanggan.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-semibold text-slate-500">Total Piutang Tertunggak:</div>
                            <div className="text-base font-black text-red-700 tabular-nums">
                                {formatRupiah(bukuPiutang.total_piutang)}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3 text-left">No. Nota</th>
                                    <th className="px-5 py-3 text-left">Pelanggan</th>
                                    <th className="px-5 py-3 text-left">Tanggal Terima</th>
                                    <th className="px-5 py-3 text-right">Total Tagihan</th>
                                    <th className="px-5 py-3 text-right">Sisa Piutang</th>
                                    <th className="px-5 py-3 text-center">Status Bayar</th>
                                    <th className="px-5 py-3 text-right print:hidden">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {daftarPiutang.length > 0 ? (
                                    daftarPiutang.map((nota) => (
                                        <tr key={nota.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3 font-mono font-bold text-teal-800">
                                                {nota.no_nota}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-bold text-slate-900">{nota.pelanggan?.nama}</div>
                                                <div className="text-slate-500 text-[11px]">📞 {nota.pelanggan?.no_telepon}</div>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {formatTanggal(nota.tanggal_terima)}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums font-medium">
                                                {formatRupiah(nota.total_harga)}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums font-black text-red-700">
                                                {formatRupiah(nota.sisa_tagihan)}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                    nota.status_bayar === 'Tempo'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-amber-100 text-amber-900'
                                                }`}>
                                                    {nota.status_bayar}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right print:hidden">
                                                <Link
                                                    href={route('kasir.transaksi.show', nota.id)}
                                                    className="inline-flex items-center rounded-lg border border-teal-600 bg-white px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50 cursor-pointer"
                                                >
                                                    Pelunasan
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-slate-400">
                                            Tidak ada piutang tertunggak. Seluruh transaksi telah lunas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 3: Rekapitulasi Operasional Cucian & Kompensasi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ringkasan Status Transaksi & Insiden */}
                    <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-[#134E4A]">
                            3. Performa Siklus Nota & Kompensasi Insiden
                        </h3>

                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                                <div className="text-slate-500">Nota Aktif</div>
                                <div className="text-xl font-bold text-[#134E4A] mt-1">{operasional.aktif}</div>
                            </div>
                            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                                <div className="text-emerald-700 font-semibold">Nota Selesai</div>
                                <div className="text-xl font-bold text-emerald-800 mt-1">{operasional.selesai}</div>
                            </div>
                            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                                <div className="text-rose-700 font-semibold">Nota Batal</div>
                                <div className="text-xl font-bold text-rose-800 mt-1">{operasional.batal}</div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-amber-950">Kompensasi Kerusakan Pakaian</div>
                                    <div className="text-[11px] text-amber-800 mt-0.5">
                                        Tercatat {operasional.jumlah_insiden} laporan insiden pakaian rusak/hilang
                                    </div>
                                </div>
                                <div className="text-base font-black text-red-700 tabular-nums">
                                    - {formatRupiah(operasional.total_kompensasi)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Volume Cucian per Jenis Layanan */}
                    <div className="rounded-xl border border-teal-100 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                            <h3 className="text-sm font-bold text-[#134E4A]">Volume Cucian per Layanan</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-600">
                                    <tr>
                                        <th className="px-5 py-2.5 text-left">Jenis Layanan</th>
                                        <th className="px-5 py-2.5 text-right">Volume</th>
                                        <th className="px-5 py-2.5 text-right">Omzet Bruto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800">
                                    {volumeLayanan.length > 0 ? (
                                        volumeLayanan.map((vl, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60">
                                                <td className="px-5 py-2.5 font-semibold text-slate-900">
                                                    {vl.nama_layanan}
                                                </td>
                                                <td className="px-5 py-2.5 text-right font-mono font-bold text-teal-800">
                                                    {vl.total_volume} {vl.satuan}
                                                </td>
                                                <td className="px-5 py-2.5 text-right tabular-nums font-bold text-slate-800">
                                                    {formatRupiah(vl.total_omzet)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-slate-400">
                                                Belum ada volume cucian pada periode ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
