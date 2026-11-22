import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StatusBayar, StatusProses, StatusTransaksi } from '@/Components/StatusBadge';
import { formatJumlah, formatRupiah, formatTanggal, formatTanggalWaktu } from '@/utils/format';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function TransaksiShow({ transaksi, ringkasan }) {
    const pelanggan = transaksi.pelanggan;
    const items = transaksi.detail_pakaian || [];
    const pembayaran = transaksi.pembayaran || [];
    const riwayat = transaksi.riwayat_status_proses || [];

    const totalHarga = Number(transaksi.total_harga) || 0;
    const potonganVoucher = Number(ringkasan?.potongan_voucher) || 0;
    const totalKompensasi = Number(transaksi.total_kompensasi) || 0;
    const totalDibayar = Number(ringkasan?.total_dibayar) || 0;
    const sisaTagihan = Number(transaksi.sisa_tagihan) || 0;

    const [modalPenyesuaianOpen, setModalPenyesuaianOpen] = useState(false);
    const [modalBatalOpen, setModalBatalOpen] = useState(false);
    const [modalPelunasanOpen, setModalPelunasanOpen] = useState(false);

    // Form Penyesuaian Timbang Ulang
    const formPenyesuaian = useForm({
        items: items.map((it) => ({
            id: it.id,
            nama_layanan: it.jenis_layanan?.nama_layanan || 'Layanan',
            satuan_hitung: it.jenis_layanan?.satuan_hitung || 'Berat_Kg',
            harga_saat_transaksi: Number(it.harga_saat_transaksi) || 0,
            berat_atau_jumlah: it.berat_atau_jumlah,
        })),
        catatan: '',
    });

    const handleSimpanPenyesuaian = (e) => {
        e.preventDefault();
        formPenyesuaian.post(route('kasir.transaksi.penyesuaian', transaksi.id), {
            onSuccess: () => setModalPenyesuaianOpen(false),
        });
    };

    // Form Pembatalan
    const formBatal = useForm({
        alasan_batal: '',
    });

    const handleSimpanBatal = (e) => {
        e.preventDefault();
        formBatal.post(route('kasir.transaksi.batalkan', transaksi.id), {
            onSuccess: () => setModalBatalOpen(false),
        });
    };

    // Form Pelunasan / Serah Terima
    const formPelunasan = useForm({
        jenis_aksi: sisaTagihan > 0 ? 'pelunasan' : 'serah_terima',
        nominal: sisaTagihan,
        metode_pembayaran: 'Tunai',
        catatan: '',
        serahkan_cucian: transaksi.status_proses_terkini === 'Selesai',
    });

    const handleSimpanPelunasan = (e) => {
        e.preventDefault();
        formPelunasan.post(route('kasir.transaksi.pelunasan', transaksi.id), {
            onSuccess: () => setModalPelunasanOpen(false),
        });
    };

    // Persentase Biaya Batal
    const hitungPersenBatal = () => {
        switch (transaksi.status_proses_terkini) {
            case 'Diterima':
                return 0;
            case 'Dicuci':
                return 50;
            case 'Dikeringkan':
                return 75;
            default:
                return null;
        }
    };
    const persenBatal = hitungPersenBatal();
    const biayaBatalEstimasi = persenBatal !== null ? Math.round((totalHarga * persenBatal) / 100) : null;

    const bolehTimbangUlang = transaksi.status_transaksi === 'Aktif' && transaksi.status_proses_terkini === 'Diterima';
    const bolehBatal = transaksi.status_transaksi === 'Aktif' && persenBatal !== null;
    const siapDiserahkan = transaksi.status_proses_terkini === 'Selesai' && transaksi.status_transaksi === 'Aktif';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-black text-[#134E4A]">{transaksi.no_nota}</span>
                            <StatusTransaksi status={transaksi.status_transaksi} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">
                            Diterima pada {formatTanggalWaktu(transaksi.tanggal_terima)} oleh kasir {transaksi.petugas?.nama_petugas || 'Petugas'}.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('kasir.transaksi.index')}
                            className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            Daftar Nota
                        </Link>
                        <Link
                            href={route('kasir.transaksi.cetak', { transaksi: transaksi.id, format: 'thermal' })}
                            className="inline-flex min-h-[40px] items-center rounded-lg border border-[#0D9488] bg-white px-3 text-xs font-bold text-[#0D9488] transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            Cetak Struk (80mm)
                        </Link>
                        <Link
                            href={route('kasir.transaksi.cetak', { transaksi: transaksi.id, format: 'a5' })}
                            className="inline-flex min-h-[40px] items-center rounded-lg bg-[#0D9488] px-3.5 text-xs font-bold text-white transition hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                        >
                            Cetak Invoice (A5)
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Nota ${transaksi.no_nota}`} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Informasi Status Utama */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-teal-100 bg-white p-4">
                        <div className="text-xs font-semibold text-slate-500">Tahap Produksi Terkini</div>
                        <div className="mt-2 flex items-center gap-2">
                            <StatusProses status={transaksi.status_proses_terkini} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-100 bg-white p-4">
                        <div className="text-xs font-semibold text-slate-500">Status Pembayaran</div>
                        <div className="mt-2 flex items-center gap-2">
                            <StatusBayar status={transaksi.status_bayar} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-200 bg-[#F6FBF9] p-4">
                        <div className="text-xs font-bold text-[#134E4A]">Sisa Tagihan</div>
                        <div className="mt-1 text-2xl font-black tabular-nums text-[#134E4A]">
                            {formatRupiah(sisaTagihan)}
                        </div>
                    </div>
                </div>

                {/* Bilah Aksi Cepat Kasir (Tahap 8) */}
                {transaksi.status_transaksi === 'Aktif' && (
                    <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-[#134E4A]">Panel Operasional Transaksi Kasir</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Kelola penyesuaian timbang ulang, pembatalan pesanan berbiaya proporsional, atau pelunasan sisa tagihan.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {bolehTimbangUlang && (
                                    <button
                                        type="button"
                                        onClick={() => setModalPenyesuaianOpen(true)}
                                        className="inline-flex min-h-[42px] items-center rounded-lg border border-teal-600 bg-white px-3.5 text-xs font-bold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] cursor-pointer"
                                    >
                                        Timbang Ulang
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setModalPelunasanOpen(true)}
                                    className="inline-flex min-h-[42px] items-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] cursor-pointer"
                                >
                                    {sisaTagihan > 0 ? 'Catat Pelunasan' : 'Serah Terima Cucian'}
                                </button>

                                {bolehBatal && (
                                    <button
                                        type="button"
                                        onClick={() => setModalBatalOpen(true)}
                                        className="inline-flex min-h-[42px] items-center rounded-lg border border-red-200 bg-red-50/50 px-3.5 text-xs font-bold text-red-600 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                                    >
                                        Batalkan Nota
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Profil Pelanggan & Catatan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-teal-100 bg-white p-5">
                        <h2 className="text-sm font-bold text-[#134E4A]">Informasi Pelanggan</h2>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Nama Pelanggan</span>
                                <span className="font-bold text-slate-900">{pelanggan?.nama}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Kode Pelanggan</span>
                                <span className="font-mono font-semibold text-teal-800">{pelanggan?.kode_pelanggan}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">No. Telepon / WhatsApp</span>
                                <span className="font-medium text-slate-800">{pelanggan?.no_telepon}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Fasilitas Bayar Tempo</span>
                                <span className={`font-semibold ${pelanggan?.hak_bayar_belakangan ? 'text-emerald-700' : 'text-slate-500'}`}>
                                    {pelanggan?.hak_bayar_belakangan ? 'Diizinkan' : 'Tidak Diizinkan'}
                                </span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-500">Alamat Antar</span>
                                <span className="text-right font-medium text-slate-800">{pelanggan?.alamat || 'Tidak ada alamat'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-100 bg-white p-5">
                        <h2 className="text-sm font-bold text-[#134E4A]">Catatan Khusus Cucian</h2>
                        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-4 text-xs text-amber-950">
                            {transaksi.catatan_khusus ? (
                                <p className="leading-relaxed">{transaksi.catatan_khusus}</p>
                            ) : (
                                <p className="italic text-slate-400">Tidak ada instruksi khusus untuk cucian ini.</p>
                            )}
                        </div>

                        {transaksi.voucher && (
                            <div className="mt-4 flex items-center justify-between rounded-lg border border-teal-200 bg-[#F6FBF9] p-3 text-xs">
                                <div>
                                    <div className="font-bold text-[#134E4A]">Voucher Promo Digunakan</div>
                                    <div className="font-mono text-slate-600">{transaksi.voucher.nomor_voucher}</div>
                                </div>
                                <span className="font-black text-[#0D9488]">
                                    - {formatRupiah(potonganVoucher)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rincian Item Pakaian */}
                <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
                    <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                        <h2 className="text-sm font-bold text-[#134E4A]">Rincian Layanan & Pakaian</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3 text-left">Jenis Layanan</th>
                                    <th className="px-5 py-3 text-left">Daftar Pakaian</th>
                                    <th className="px-5 py-3 text-right">Kuantitas / Berat</th>
                                    <th className="px-5 py-3 text-right">Harga Saat Transaksi</th>
                                    <th className="px-5 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-[#134E4A]">{item.jenis_layanan?.nama_layanan}</div>
                                            <span className="text-[11px] text-slate-500">{item.jenis_layanan?.kecepatan}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600">
                                            {item.daftar_pakaian || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold">
                                            {formatJumlah(item.berat_atau_jumlah, item.jenis_layanan?.satuan_hitung)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                                            {formatRupiah(item.harga_saat_transaksi)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold tabular-nums text-[#134E4A]">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t border-teal-100 bg-[#F6FBF9] font-bold text-slate-800">
                                <tr>
                                    <td colSpan="4" className="px-5 py-2 text-right">Total Tagihan Bruto:</td>
                                    <td className="px-5 py-2 text-right tabular-nums">{formatRupiah(totalHarga)}</td>
                                </tr>
                                {potonganVoucher > 0 && (
                                    <tr className="text-teal-700">
                                        <td colSpan="4" className="px-5 py-2 text-right">Potongan Voucher:</td>
                                        <td className="px-5 py-2 text-right tabular-nums">- {formatRupiah(potonganVoucher)}</td>
                                    </tr>
                                )}
                                {totalKompensasi > 0 && (
                                    <tr className="text-red-600">
                                        <td colSpan="4" className="px-5 py-2 text-right">Kompensasi Kerusakan:</td>
                                        <td className="px-5 py-2 text-right tabular-nums">- {formatRupiah(totalKompensasi)}</td>
                                    </tr>
                                )}
                                {totalDibayar > 0 && (
                                    <tr className="text-slate-600">
                                        <td colSpan="4" className="px-5 py-2 text-right">Total Telah Dibayar:</td>
                                        <td className="px-5 py-2 text-right tabular-nums">- {formatRupiah(totalDibayar)}</td>
                                    </tr>
                                )}
                                <tr className="border-t border-teal-200 text-[#134E4A]">
                                    <td colSpan="4" className="px-5 py-3 text-right">Sisa Tagihan Akhir:</td>
                                    <td className="px-5 py-3 text-right text-base font-black tabular-nums">{formatRupiah(sisaTagihan)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Riwayat Pembayaran & Riwayat Tahap Produksi */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Riwayat Pembayaran */}
                    <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
                        <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                            <h2 className="text-sm font-bold text-[#134E4A]">Riwayat Pembayaran Uang Kas</h2>
                        </div>
                        {pembayaran.length > 0 ? (
                            <ul className="divide-y divide-slate-100 p-4 space-y-2">
                                {pembayaran.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between py-2 text-xs">
                                        <div>
                                            <span className="font-bold text-slate-800">
                                                {p.jenis === 'UangMuka' ? 'Uang Muka (DP)' : 'Pelunasan'} ({p.metode})
                                            </span>
                                            <div className="text-slate-500">
                                                {formatTanggalWaktu(p.tanggal_bayar)} · Kasir: {p.petugas?.nama_petugas || 'Kasir'}
                                            </div>
                                            {p.catatan && <div className="text-[11px] text-slate-400 mt-0.5">{p.catatan}</div>}
                                        </div>
                                        <span className="text-sm font-black tabular-nums text-teal-800">
                                            {formatRupiah(p.nominal)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-6 text-center text-xs text-slate-500">
                                Belum ada pembayaran tercatat untuk nota ini.
                            </div>
                        )}
                    </div>

                    {/* Riwayat Status Proses */}
                    <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
                        <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                            <h2 className="text-sm font-bold text-[#134E4A]">Jejak Riwayat Tahap Produksi & Operasional</h2>
                        </div>
                        {riwayat.length > 0 ? (
                            <ol className="divide-y divide-slate-100 p-4 space-y-2">
                                {riwayat.map((r) => (
                                    <li key={r.id} className="flex items-start justify-between py-2 text-xs">
                                        <div className="flex items-start gap-2">
                                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#0D9488]" />
                                            <div>
                                                <span className="font-bold text-slate-800">{r.tahap}</span>
                                                {r.catatan && <p className="text-[11px] text-slate-600 mt-0.5">{r.catatan}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right text-slate-500 flex-shrink-0">
                                            <div>{formatTanggalWaktu(r.waktu_update)}</div>
                                            <div className="text-[11px] text-slate-400">Oleh: {r.petugas?.nama_petugas || 'Staf'}</div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="p-6 text-center text-xs text-slate-500">
                                Belum ada log tahapan produksi.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Penyesuaian Timbang Ulang */}
            {modalPenyesuaianOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-[#134E4A]">Penyesuaian Timbang Ulang Pakaian</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Perbarui berat aktual atau kuantitas pakaian. Subtotal dan sisa tagihan akan dihitung ulang secara otomatis.
                        </p>

                        <form onSubmit={handleSimpanPenyesuaian} className="mt-4 space-y-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {formPenyesuaian.data.items.map((it, idx) => (
                                    <div key={it.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                            <span>{it.nama_layanan}</span>
                                            <span className="text-slate-500 font-normal">
                                                @ {formatRupiah(it.harga_saat_transaksi)}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <input
                                                type="number"
                                                step={it.satuan_hitung === 'Jumlah_Pcs' ? '1' : '0.01'}
                                                min="0.1"
                                                value={it.berat_atau_jumlah}
                                                onChange={(e) => {
                                                    const updated = [...formPenyesuaian.data.items];
                                                    updated[idx].berat_atau_jumlah = e.target.value;
                                                    formPenyesuaian.setData('items', updated);
                                                }}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                                required
                                            />
                                            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                                                {it.satuan_hitung === 'Jumlah_Pcs' ? 'Pcs' : 'Kg'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">Catatan Penyesuaian (Opsional)</label>
                                <input
                                    type="text"
                                    value={formPenyesuaian.data.catatan}
                                    onChange={(e) => formPenyesuaian.setData('catatan', e.target.value)}
                                    placeholder="Alasan timbang ulang..."
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalPenyesuaianOpen(false)}
                                    className="min-h-[40px] rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formPenyesuaian.processing}
                                    className="min-h-[40px] rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A] disabled:opacity-50 cursor-pointer"
                                >
                                    {formPenyesuaian.processing ? 'Menyimpan...' : 'Simpan Timbang Ulang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Batalkan Nota */}
            {modalBatalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-red-700">Batalkan Nota Transaksi</h3>
                        <p className="mt-1 text-xs text-slate-600">
                            Cucian saat ini berada pada tahap <strong>{transaksi.status_proses_terkini}</strong>.
                        </p>

                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                            <div className="font-bold">Ketentuan Biaya Pembatalan Proporsional:</div>
                            <div className="mt-1 flex justify-between">
                                <span>Persentase Biaya ({transaksi.status_proses_terkini}):</span>
                                <span className="font-bold">{persenBatal}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estimasi Biaya Pembatalan:</span>
                                <span className="font-black text-red-700">{formatRupiah(biayaBatalEstimasi)}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSimpanBatal} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">Alasan Pembatalan (Wajib)</label>
                                <textarea
                                    rows="3"
                                    value={formBatal.data.alasan_batal}
                                    onChange={(e) => formBatal.setData('alasan_batal', e.target.value)}
                                    placeholder="Tulis alasan pelanggan atau kasir membatalkan nota..."
                                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    required
                                />
                                {formBatal.errors.alasan_batal && (
                                    <p className="text-[11px] text-red-600 mt-1">{formBatal.errors.alasan_batal}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalBatalOpen(false)}
                                    className="min-h-[40px] rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={formBatal.processing}
                                    className="min-h-[40px] rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {formBatal.processing ? 'Memproses...' : 'Konfirmasi Batal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Pelunasan / Serah Terima Cucian */}
            {modalPelunasanOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-[#134E4A]">Pelunasan & Serah Terima Cucian</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Sisa tagihan nota: <strong className="text-teal-900 font-bold">{formatRupiah(sisaTagihan)}</strong>
                        </p>

                        <form onSubmit={handleSimpanPelunasan} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">Tindakan</label>
                                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => formPelunasan.setData('jenis_aksi', 'pelunasan')}
                                        className={`min-h-[38px] rounded-lg border px-3 font-bold transition cursor-pointer ${
                                            formPelunasan.data.jenis_aksi === 'pelunasan'
                                                ? 'border-[#0D9488] bg-teal-50 text-teal-800'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        Bayar Lunas
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!pelanggan?.hak_bayar_belakangan}
                                        onClick={() => formPelunasan.setData('jenis_aksi', 'tempo')}
                                        className={`min-h-[38px] rounded-lg border px-3 font-bold transition cursor-pointer ${
                                            formPelunasan.data.jenis_aksi === 'tempo'
                                                ? 'border-purple-600 bg-purple-50 text-purple-800'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                    >
                                        Gunakan Tempo
                                    </button>
                                </div>
                                {!pelanggan?.hak_bayar_belakangan && (
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Pelanggan belum memiliki izin fasilitas bayar tempo.
                                    </p>
                                )}
                            </div>

                            {formPelunasan.data.jenis_aksi === 'pelunasan' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">Nominal Pelunasan (Rp)</label>
                                        <input
                                            type="number"
                                            value={formPelunasan.data.nominal}
                                            onChange={(e) => formPelunasan.setData('nominal', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">Metode Pembayaran</label>
                                        <select
                                            value={formPelunasan.data.metode_pembayaran}
                                            onChange={(e) => formPelunasan.setData('metode_pembayaran', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                        >
                                            <option value="Tunai">Tunai (Cash)</option>
                                            <option value="QRIS">QRIS / E-Wallet</option>
                                            <option value="Transfer">Transfer Bank</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">Catatan Pelunasan (Opsional)</label>
                                <input
                                    type="text"
                                    value={formPelunasan.data.catatan}
                                    onChange={(e) => formPelunasan.setData('catatan', e.target.value)}
                                    placeholder="Keterangan tambahan..."
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                />
                            </div>

                            {transaksi.status_proses_terkini === 'Selesai' && (
                                <div className="rounded-lg border border-teal-200 bg-[#F6FBF9] p-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formPelunasan.data.serahkan_cucian}
                                            onChange={(e) => formPelunasan.setData('serahkan_cucian', e.target.checked)}
                                            className="rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                                        />
                                        <span className="text-xs font-bold text-[#134E4A]">
                                            Sekaligus serahkan cucian ke pelanggan (Tandai Selesai)
                                        </span>
                                    </label>
                                    <p className="text-[11px] text-slate-500 mt-1 pl-6">
                                        Cucian di bagian produksi sudah selesai dan siap diambil pelanggan.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalPelunasanOpen(false)}
                                    className="min-h-[40px] rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formPelunasan.processing}
                                    className="min-h-[40px] rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A] disabled:opacity-50 cursor-pointer"
                                >
                                    {formPelunasan.processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
