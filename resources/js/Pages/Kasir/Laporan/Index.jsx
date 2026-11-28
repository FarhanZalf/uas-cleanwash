import { IconPrinter } from '@/Components/LineIcons';
import NotaDetailModal from '@/Components/NotaDetailModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '@/utils/format';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function LaporanIndex({ ringkasanKeuangan, bukuPiutang, operasional, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [selectedNotaId, setSelectedNotaId] = useState(null);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('kasir.laporan.index'),
            { start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const daftarPiutang = bukuPiutang.daftar || [];
    const volumeLayanan = operasional.volume_layanan || [];
    const selectedNota = daftarPiutang.find((n) => n.id === selectedNotaId) || null;

    const totalPendapatan = Number(ringkasanKeuangan.total_pendapatan) || 0;
    const totalPiutang = Number(bukuPiutang.total_piutang) || 0;
    const totalOmzet =
        Number(ringkasanKeuangan.total_omzet) || totalPendapatan + totalPiutang;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3 print:hidden">
                    <h1 className="text-lg font-bold text-[#134E4A]">
                        Laporan Keuangan
                    </h1>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-teal-200 bg-white px-3.5 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            <IconPrinter className="h-4 w-4 text-[#0D9488]" />
                            <span>Cetak PDF</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Keuangan" />

            {/* Print Header */}
            <div className="hidden print:block mb-6 border-b border-slate-300 pb-4 text-center">
                <h1 className="text-2xl font-black text-slate-900">CLEANWASH SMART LAUNDRY</h1>
                <p className="text-xs text-slate-600 mt-1">
                    Laporan Keuangan, Tagihan Belum Lunas & Volume Operasional
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                    Periode: {formatTanggal(startDate)} s.d. {formatTanggal(endDate)} · Dicetak pada: {formatTanggalWaktu(new Date())}
                </p>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Form Filter Rentang Tanggal */}
                <div className="rounded-xl border border-teal-200/80 bg-white p-4 print:hidden">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-3 text-xs">
                        <div className="flex-1">
                            <label className="block font-bold text-[#134E4A]">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block font-bold text-[#134E4A]">Tanggal Selesai</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="min-h-[38px] rounded-lg bg-[#0D9488] px-5 font-bold text-white hover:bg-[#134E4A] transition cursor-pointer"
                        >
                            Terapkan Periode
                        </button>
                    </form>
                </div>

                {/* 3 Kartu Inti Laporan Keuangan */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-teal-200/80 bg-white p-5">
                        <div className="text-xs font-bold text-slate-600">
                            Total Nilai Transaksi (Omzet)
                        </div>
                        <div className="mt-2 text-2xl font-black text-[#134E4A] tabular-nums">
                            {formatRupiah(totalOmzet)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Nilai keseluruhan tagihan nota aktif & selesai
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-200 bg-[#F6FBF9] p-5">
                        <div className="text-xs font-bold text-[#134E4A]">
                            Pendapatan Sudah Diterima
                        </div>
                        <div className="mt-2 text-2xl font-black text-[#0D9488] tabular-nums">
                            {formatRupiah(totalPendapatan)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600">
                            Uang yang sudah masuk (Lunas: {formatRupiah(ringkasanKeuangan.total_pelunasan || 0)} · Cicilan DP: {formatRupiah(ringkasanKeuangan.total_uang_muka || 0)})
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                        <div className="text-xs font-bold text-rose-800">
                            Sisa Belum Dibayar (Piutang)
                        </div>
                        <div className="mt-2 text-2xl font-black text-rose-700 tabular-nums">
                            {formatRupiah(totalPiutang)}
                        </div>
                        <div className="mt-1 text-[11px] text-rose-700/80">
                            Total sisa tagihan dari {daftarPiutang.length} nota belum lunas
                        </div>
                    </div>
                </div>

                {/* Daftar Tagihan Belum Lunas (Buku Piutang) */}
                <div className="overflow-hidden rounded-xl border border-teal-200/80 bg-white">
                    <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3.5 flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-[#134E4A]">
                            Daftar Tagihan Belum Lunas (Piutang)
                        </h2>
                        <div className="text-sm font-black text-rose-700 tabular-nums">
                            Total Sisa: {formatRupiah(totalPiutang)}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-white font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th className="px-5 py-3 text-left">No. Nota</th>
                                    <th className="px-5 py-3 text-left">Pelanggan</th>
                                    <th className="px-5 py-3 text-left">Tanggal Terima</th>
                                    <th className="px-5 py-3 text-center">Jenis Tagihan</th>
                                    <th className="px-5 py-3 text-right">Total Tagihan</th>
                                    <th className="px-5 py-3 text-right">Sudah Dibayar</th>
                                    <th className="px-5 py-3 text-right">Sisa Belum Dibayar</th>
                                    <th className="px-5 py-3 text-right print:hidden">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {daftarPiutang.length > 0 ? (
                                    daftarPiutang.map((nota) => {
                                        const totalNota = Number(nota.total_harga) || 0;
                                        const sisaNota = Number(nota.sisa_tagihan) || 0;
                                        const sudahDibayar = Math.max(totalNota - sisaNota, 0);

                                        return (
                                            <tr key={nota.id} className="hover:bg-[#F6FBF9]">
                                                <td className="px-5 py-3 font-mono font-bold text-[#134E4A]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedNotaId(nota.id)}
                                                        className="hover:text-[#0D9488] hover:underline cursor-pointer"
                                                    >
                                                        {nota.no_nota}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-bold text-slate-900">{nota.pelanggan?.nama}</div>
                                                    <div className="text-slate-600 text-[11px]">{nota.pelanggan?.no_telepon}</div>
                                                </td>
                                                <td className="px-5 py-3 text-slate-600">
                                                    {formatTanggal(nota.tanggal_terima)}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                                            nota.status_bayar === 'Tempo'
                                                                ? 'bg-rose-100 text-rose-800'
                                                                : 'bg-amber-100 text-amber-900'
                                                        }`}
                                                    >
                                                        {nota.status_bayar === 'DP' ? 'Kurang Bayar (DP)' : nota.status_bayar}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-800">
                                                    {formatRupiah(totalNota)}
                                                </td>
                                                <td className="px-5 py-3 text-right tabular-nums font-bold text-[#0D9488]">
                                                    {formatRupiah(sudahDibayar)}
                                                </td>
                                                <td className="px-5 py-3 text-right tabular-nums font-black text-rose-700">
                                                    {formatRupiah(sisaNota)}
                                                </td>
                                                <td className="px-5 py-3 text-right print:hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedNotaId(nota.id)}
                                                        className="inline-flex min-h-[34px] items-center rounded-lg border border-teal-600 bg-white px-3 text-xs font-bold text-teal-700 hover:bg-teal-50 cursor-pointer"
                                                    >
                                                        Lihat & Pelunasan
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-slate-400">
                                            Tidak ada piutang tertunggak. Seluruh transaksi telah lunas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rekapitulasi Operasional Cucian & Volume Layanan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-teal-200/80 bg-white p-5 space-y-4">
                        <h3 className="text-sm font-bold text-[#134E4A]">
                            Ringkasan Status Nota & Kompensasi
                        </h3>

                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                            <div className="rounded-lg bg-[#F6FBF9] border border-teal-100 p-3">
                                <div className="text-slate-600 font-semibold">Nota Aktif</div>
                                <div className="text-xl font-black text-[#134E4A] mt-1 tabular-nums">{operasional.aktif}</div>
                            </div>
                            <div className="rounded-lg bg-[#CCFBF1]/50 border border-teal-200 p-3">
                                <div className="text-[#134E4A] font-semibold">Nota Selesai</div>
                                <div className="text-xl font-black text-[#0D9488] mt-1 tabular-nums">{operasional.selesai}</div>
                            </div>
                            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                                <div className="text-rose-700 font-semibold">Nota Batal</div>
                                <div className="text-xl font-black text-rose-800 mt-1 tabular-nums">{operasional.batal}</div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-amber-950">Kompensasi Kerusakan Pakaian</div>
                                    <div className="text-[11px] text-amber-800 mt-0.5">
                                        {operasional.jumlah_insiden} laporan insiden tercatat
                                    </div>
                                </div>
                                <div className="text-base font-black text-rose-700 tabular-nums">
                                    - {formatRupiah(operasional.total_kompensasi)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-200/80 bg-white overflow-hidden">
                        <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                            <h3 className="text-sm font-bold text-[#134E4A]">Volume Cucian per Layanan</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                <thead className="bg-white font-bold text-[#134E4A] border-b border-teal-100">
                                    <tr>
                                        <th className="px-5 py-2.5 text-left">Jenis Layanan</th>
                                        <th className="px-5 py-2.5 text-right">Volume</th>
                                        <th className="px-5 py-2.5 text-right">Nilai Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800">
                                    {volumeLayanan.length > 0 ? (
                                        volumeLayanan.map((vl, idx) => (
                                            <tr key={idx} className="hover:bg-[#F6FBF9]">
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

            <NotaDetailModal
                show={Boolean(selectedNota)}
                transaksi={selectedNota}
                onClose={() => setSelectedNotaId(null)}
            />
        </AuthenticatedLayout>
    );
}
