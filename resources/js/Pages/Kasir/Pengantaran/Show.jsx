import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTanggal } from '@/utils/format';
import { Head, Link } from '@inertiajs/react';

export default function PengantaranShow({ pengantaran }) {
    const kurir = pengantaran.petugas;
    const detailList = pengantaran.detail_pengantaran || [];

    const statusBadgeClass = {
        Menunggu: 'bg-slate-100 text-slate-700 border-slate-200',
        Diambil: 'bg-blue-100 text-blue-800 border-blue-200',
        DalamPerjalanan: 'bg-amber-100 text-amber-800 border-amber-200',
        Diterima: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        Gagal: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-black text-[#134E4A]">
                                {pengantaran.kode_pengantaran}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">
                            Kloter tanggal {formatTanggal(pengantaran.tanggal_antar)} untuk kurir {kurir?.nama_petugas}.
                        </p>
                    </div>

                    <Link
                        href={route('kasir.pengantaran.index')}
                        className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                        Kembali ke Daftar Kloter
                    </Link>
                </div>
            }
        >
            <Head title={`Kloter ${pengantaran.kode_pengantaran}`} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Info Kurir & Ringkasan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-teal-100 bg-white p-4">
                        <div className="text-xs font-semibold text-slate-500">Kurir Penanggung Jawab</div>
                        <div className="mt-1 font-bold text-slate-900 text-base">{kurir?.nama_petugas}</div>
                        <div className="text-xs text-slate-500 mt-0.5">📞 {kurir?.no_telepon || '-'}</div>
                    </div>

                    <div className="rounded-xl border border-teal-100 bg-white p-4">
                        <div className="text-xs font-semibold text-slate-500">Tanggal Pelaksanaan</div>
                        <div className="mt-1 font-bold text-[#134E4A] text-base">
                            {formatTanggal(pengantaran.tanggal_antar)}
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-200 bg-[#F6FBF9] p-4">
                        <div className="text-xs font-bold text-[#134E4A]">Total Paket Cucian</div>
                        <div className="mt-1 text-2xl font-black text-[#134E4A]">
                            {detailList.length} Paket
                        </div>
                    </div>
                </div>

                {/* Tabel Rincian Paket */}
                <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
                    <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                        <h2 className="text-sm font-bold text-[#134E4A]">Daftar Paket Nota yang Diantar</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3 text-left">No. Nota</th>
                                    <th className="px-5 py-3 text-left">Pelanggan & Alamat</th>
                                    <th className="px-5 py-3 text-left">Layanan Cucian</th>
                                    <th className="px-5 py-3 text-center">Status Pembayaran</th>
                                    <th className="px-5 py-3 text-center">Status Pengantaran</th>
                                    <th className="px-5 py-3 text-left">Keterangan / Jadwal Ulang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {detailList.map((dtl) => {
                                    const nota = dtl.transaksi_laundry;
                                    const plg = nota?.pelanggan;

                                    return (
                                        <tr key={dtl.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5">
                                                <Link
                                                    href={route('kasir.transaksi.show', nota.id)}
                                                    className="font-mono font-bold text-teal-800 hover:underline"
                                                >
                                                    {nota?.no_nota}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-slate-900">{plg?.nama}</div>
                                                <div className="text-slate-500 mt-0.5">📞 {plg?.no_telepon}</div>
                                                <div className="text-slate-600 text-[11px] mt-1 max-w-xs">
                                                    📍 {plg?.alamat || 'Tidak ada alamat'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <ul className="space-y-1">
                                                    {nota?.detail_pakaian?.map((it) => (
                                                        <li key={it.id} className="text-[11px] text-slate-700">
                                                            • {it.jenis_layanan?.nama_layanan} ({it.berat_atau_jumlah} {it.jenis_layanan?.satuan_hitung === 'Jumlah_Pcs' ? 'Pcs' : 'Kg'})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                    nota?.status_bayar === 'Lunas'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {nota?.status_bayar}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadgeClass[dtl.status_antar] || ''}`}>
                                                    {dtl.status_antar}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">
                                                {dtl.alasan_gagal && (
                                                    <div className="text-red-600 font-semibold text-[11px]">
                                                        Gagal: {dtl.alasan_gagal}
                                                    </div>
                                                )}
                                                {dtl.jadwal_ulang && (
                                                    <div className="text-slate-500 text-[11px] mt-0.5">
                                                        Jadwal Ulang: {formatTanggal(dtl.jadwal_ulang)}
                                                    </div>
                                                )}
                                                {!dtl.alasan_gagal && !dtl.jadwal_ulang && '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
