import { IconClose, IconPrinter } from '@/Components/LineIcons';
import Modal from '@/Components/Modal';
import { StatusBayar, StatusProses, StatusTransaksi } from '@/Components/StatusBadge';
import { formatJumlah, formatRupiah, formatTanggal, formatTanggalWaktu } from '@/utils/format';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function NotaDetailModal({ transaksi, show, onClose }) {
    const [activeSubTab, setActiveSubTab] = useState('rincian');

    const pelanggan = transaksi?.pelanggan;
    const items = transaksi?.detail_pakaian || [];
    const pembayaran = transaksi?.pembayaran || [];
    const riwayat = transaksi?.riwayat_status_proses || [];
    const daftarPengantaran = transaksi?.detail_pengantaran || [];
    const daftarKerusakan = items.flatMap((it) =>
        (it.laporan_kerusakan || []).map((lk) => ({
            ...lk,
            nama_layanan: it.jenis_layanan?.nama_layanan || 'Layanan',
        })),
    );

    const totalHarga = Number(transaksi?.total_harga) || 0;
    const potonganVoucher = transaksi?.voucher
        ? Math.min(Number(transaksi.voucher.nilai_potongan) || 0, totalHarga)
        : 0;
    const totalKompensasi = Number(transaksi?.total_kompensasi) || 0;
    const totalDibayar = pembayaran.reduce((acc, p) => acc + (Number(p.nominal) || 0), 0);
    const sisaTagihan = Number(transaksi?.sisa_tagihan) || 0;

    // Form Timbang Ulang
    const formPenyesuaian = useForm({
        from_modal: true,
        items: [],
        catatan: '',
    });

    // Form Pelunasan / Serah Terima
    const formPelunasan = useForm({
        from_modal: true,
        jenis_aksi: 'pelunasan',
        nominal: 0,
        metode_pembayaran: 'Tunai',
        catatan: '',
        serahkan_cucian: false,
    });

    // Form Batal
    const formBatal = useForm({
        from_modal: true,
        alasan_batal: '',
    });

    useEffect(() => {
        if (!transaksi) return;
        setActiveSubTab('rincian');

        formPenyesuaian.setData({
            from_modal: true,
            items: (transaksi.detail_pakaian || []).map((it) => ({
                id: it.id,
                nama_layanan: it.jenis_layanan?.nama_layanan || 'Layanan',
                satuan_hitung: it.jenis_layanan?.satuan_hitung || 'Berat_Kg',
                harga_saat_transaksi: Number(it.harga_saat_transaksi) || 0,
                berat_atau_jumlah: it.berat_atau_jumlah,
            })),
            catatan: '',
        });

        const sisa = Number(transaksi.sisa_tagihan) || 0;
        formPelunasan.setData({
            from_modal: true,
            jenis_aksi: sisa > 0 ? 'pelunasan' : 'serah_terima',
            nominal: sisa,
            metode_pembayaran: 'Tunai',
            catatan: '',
            serahkan_cucian:
                transaksi.status_proses_terkini === 'Selesai' &&
                transaksi.status_transaksi === 'Aktif',
        });

        formBatal.setData({
            from_modal: true,
            alasan_batal: '',
        });
    }, [transaksi?.id, transaksi?.sisa_tagihan, transaksi?.status_transaksi, transaksi?.total_harga]);

    if (!transaksi) return null;

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
    const biayaBatalEstimasi =
        persenBatal !== null ? Math.round((totalHarga * persenBatal) / 100) : null;

    const bolehTimbangUlang =
        transaksi.status_transaksi === 'Aktif' &&
        transaksi.status_proses_terkini === 'Diterima';
    const bolehBatal = transaksi.status_transaksi === 'Aktif' && persenBatal !== null;
    const bolehPelunasanAtauSerah =
        sisaTagihan > 0 ||
        (transaksi.status_transaksi === 'Aktif' &&
            transaksi.status_proses_terkini === 'Selesai');

    const handleSimpanPenyesuaian = (e) => {
        e.preventDefault();
        formPenyesuaian.post(route('kasir.transaksi.penyesuaian', transaksi.id), {
            preserveScroll: true,
            onSuccess: () => setActiveSubTab('rincian'),
        });
    };

    const handleSimpanPelunasan = (e) => {
        e.preventDefault();
        formPelunasan.post(route('kasir.transaksi.pelunasan', transaksi.id), {
            preserveScroll: true,
            onSuccess: () => setActiveSubTab('rincian'),
        });
    };

    const handleSimpanBatal = (e) => {
        e.preventDefault();
        formBatal.post(route('kasir.transaksi.batalkan', transaksi.id), {
            preserveScroll: true,
            onSuccess: () => setActiveSubTab('rincian'),
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="max-h-[88vh] overflow-y-auto bg-white">
                {/* Header Pop-Up Nota */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-teal-100 bg-[#F6FBF9] px-5 py-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-lg font-black text-[#134E4A]">
                                {transaksi.no_nota}
                            </span>
                            <StatusTransaksi status={transaksi.status_transaksi} />
                            <StatusProses status={transaksi.status_proses_terkini} />
                            <StatusBayar status={transaksi.status_bayar} />
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                            Diterima {formatTanggalWaktu(transaksi.tanggal_terima)} · Pelanggan:{' '}
                            <strong className="text-[#134E4A]">{pelanggan?.nama}</strong> ({pelanggan?.no_telepon})
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup pop-up nota"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-white text-slate-600 hover:bg-[#CCFBF1] hover:text-[#134E4A] transition cursor-pointer"
                    >
                        <IconClose className="h-4 w-4" />
                    </button>
                </div>

                {/* Bar Navigasi Aksi di Dalam Pop-Up */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 bg-white px-5 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('rincian')}
                            className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                                activeSubTab === 'rincian'
                                    ? 'bg-[#134E4A] text-white'
                                    : 'border border-teal-200 bg-[#F6FBF9] text-[#134E4A] hover:bg-[#CCFBF1]'
                            }`}
                        >
                            Rincian Nota
                        </button>

                        {bolehPelunasanAtauSerah && (
                            <button
                                type="button"
                                onClick={() => setActiveSubTab('pelunasan')}
                                className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                                    activeSubTab === 'pelunasan'
                                        ? 'bg-[#0D9488] text-white'
                                        : 'border border-[#0D9488] bg-white text-[#0D9488] hover:bg-teal-50'
                                }`}
                            >
                                {sisaTagihan > 0 ? 'Catat Pelunasan' : 'Serah Terima'}
                            </button>
                        )}

                        {bolehTimbangUlang && (
                            <button
                                type="button"
                                onClick={() => setActiveSubTab('timbang')}
                                className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                                    activeSubTab === 'timbang'
                                        ? 'bg-[#0D9488] text-white'
                                        : 'border border-teal-300 bg-white text-teal-800 hover:bg-teal-50'
                                }`}
                            >
                                Timbang Ulang
                            </button>
                        )}

                        {bolehBatal && (
                            <button
                                type="button"
                                onClick={() => setActiveSubTab('batal')}
                                className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                                    activeSubTab === 'batal'
                                        ? 'bg-rose-600 text-white'
                                        : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                                Batalkan Nota
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Link
                            href={route('kasir.transaksi.cetak', { transaksi: transaksi.id, format: 'thermal' })}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-2.5 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition"
                        >
                            <IconPrinter className="h-3.5 w-3.5 text-[#0D9488]" />
                            <span>Struk 80mm</span>
                        </Link>
                        <Link
                            href={route('kasir.transaksi.cetak', { transaksi: transaksi.id, format: 'a5' })}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#0D9488] px-3 text-xs font-bold text-white hover:bg-[#134E4A] transition"
                        >
                            <IconPrinter className="h-3.5 w-3.5" />
                            <span>Invoice A5</span>
                        </Link>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* TAB 1: RINCIAN NOTA */}
                    {activeSubTab === 'rincian' && (
                        <>
                            {/* 3 Kartu Ringkasan Tagihan */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                    <div className="text-[11px] font-bold text-slate-500">Total Tagihan</div>
                                    <div className="mt-1 text-base font-extrabold tabular-nums text-[#134E4A]">
                                        {formatRupiah(Math.max(totalHarga - potonganVoucher - totalKompensasi, 0))}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                    <div className="text-[11px] font-bold text-slate-500">Sudah Dibayar</div>
                                    <div className="mt-1 text-base font-extrabold tabular-nums text-[#0D9488]">
                                        {formatRupiah(totalDibayar)}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-teal-200 bg-[#F6FBF9] p-3.5">
                                    <div className="text-[11px] font-bold text-[#134E4A]">Sisa Belum Dibayar</div>
                                    <div className="mt-1 text-base font-black tabular-nums text-rose-700">
                                        {formatRupiah(sisaTagihan)}
                                    </div>
                                </div>
                            </div>

                            {/* Alamat & Catatan */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                                <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                    <div className="font-bold text-[#134E4A]">Alamat Pelanggan</div>
                                    <p className="mt-1 text-slate-600 leading-relaxed">
                                        {pelanggan?.alamat || 'Belum ada alamat tercatat'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                    <div className="font-bold text-[#134E4A]">Catatan Khusus Cucian</div>
                                    <p className="mt-1 text-slate-600 leading-relaxed">
                                        {transaksi.catatan_khusus || 'Tidak ada catatan khusus'}
                                    </p>
                                </div>
                            </div>

                            {/* Tabel Rincian Layanan & Pakaian */}
                            <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
                                <table className="min-w-full divide-y divide-slate-100 text-xs">
                                    <thead className="bg-[#F6FBF9] font-bold text-[#134E4A]">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left">Layanan</th>
                                            <th className="px-4 py-2.5 text-left">Rincian Pakaian</th>
                                            <th className="px-4 py-2.5 text-right">Kuantitas</th>
                                            <th className="px-4 py-2.5 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-800">
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2.5 font-bold text-[#134E4A]">
                                                    {item.jenis_layanan?.nama_layanan}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600">
                                                    {item.daftar_pakaian || '-'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                                                    {formatJumlah(item.berat_atau_jumlah, item.jenis_layanan?.satuan_hitung)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-bold tabular-nums text-[#134E4A]">
                                                    {formatRupiah(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Status Pengantaran Kurir & Kompensasi Produksi */}
                            {(daftarPengantaran.length > 0 || daftarKerusakan.length > 0) && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {daftarPengantaran.length > 0 && (
                                        <div className="rounded-xl border border-teal-100 bg-white p-3.5 text-xs">
                                            <div className="font-bold text-[#134E4A] mb-2">Status Pengantaran Kurir</div>
                                            <ul className="divide-y divide-slate-100 space-y-1.5">
                                                {daftarPengantaran.map((dp) => (
                                                    <li key={dp.id} className="flex items-center justify-between pt-1.5 first:pt-0">
                                                        <div>
                                                            <span className="font-mono font-bold text-[#134E4A]">
                                                                {dp.pengantaran?.kode_pengantaran || 'Kloter'}
                                                            </span>
                                                            {dp.alasan_gagal && (
                                                                <div className="text-[11px] text-rose-700 font-semibold">
                                                                    Gagal: {dp.alasan_gagal}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="rounded-md border border-teal-200 bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#134E4A]">
                                                            {dp.status_antar}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {daftarKerusakan.length > 0 && (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-xs">
                                            <div className="font-bold text-rose-900 mb-2">Kompensasi Kerusakan</div>
                                            <ul className="divide-y divide-rose-100 space-y-1.5">
                                                {daftarKerusakan.map((lk) => (
                                                    <li key={lk.id} className="flex items-center justify-between pt-1.5 first:pt-0">
                                                        <div>
                                                            <div className="font-bold text-slate-900">
                                                                {lk.jenis_pakaian_rusak || lk.jenis_pakaian}
                                                            </div>
                                                            <div className="text-[11px] text-slate-600">
                                                                {lk.deskripsi_kerusakan || lk.keterangan}
                                                            </div>
                                                        </div>
                                                        <span className="font-black tabular-nums text-rose-700">
                                                            - {formatRupiah(lk.nominal_kompensasi || lk.nilai_kompensasi)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Riwayat Pembayaran & Log Tahapan */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                                <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                    <div className="font-bold text-[#134E4A] mb-2">Riwayat Pembayaran</div>
                                    {pembayaran.length > 0 ? (
                                        <ul className="divide-y divide-slate-100 space-y-1.5">
                                            {pembayaran.map((p) => (
                                                <li key={p.id} className="flex items-center justify-between pt-1.5 first:pt-0">
                                                    <div>
                                                        <span className="font-bold text-slate-800">
                                                            {p.jenis === 'UangMuka' ? 'Uang Muka (DP)' : 'Pelunasan'}
                                                        </span>
                                                        <div className="text-[11px] text-slate-500">
                                                            {formatTanggalWaktu(p.tanggal_bayar)}
                                                        </div>
                                                    </div>
                                                    <span className="font-extrabold tabular-nums text-[#0D9488]">
                                                        {formatRupiah(p.nominal)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-slate-400">Belum ada pembayaran tercatat.</p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-teal-100 bg-white p-3.5">
                                    <div className="font-bold text-[#134E4A] mb-2">Jejak Tahapan Proses</div>
                                    {riwayat.length > 0 ? (
                                        <ul className="divide-y divide-slate-100 space-y-1.5">
                                            {riwayat.map((r) => (
                                                <li key={r.id} className="flex items-start justify-between pt-1.5 first:pt-0">
                                                    <div>
                                                        <span className="font-bold text-slate-800">{r.tahap}</span>
                                                        {r.catatan && (
                                                            <p className="text-[11px] text-slate-500">{r.catatan}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-slate-500 shrink-0">
                                                        {formatTanggalWaktu(r.waktu_update)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-slate-400">Belum ada log tahapan.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* TAB 2: FORM PELUNASAN / SERAH TERIMA */}
                    {activeSubTab === 'pelunasan' && (
                        <form onSubmit={handleSimpanPelunasan} className="space-y-4 rounded-xl border border-teal-200 bg-[#F6FBF9] p-4">
                            <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                                <h3 className="text-sm font-bold text-[#134E4A]">Pelunasan & Serah Terima Cucian</h3>
                                <span className="text-xs font-bold text-rose-700">
                                    Sisa Tagihan: {formatRupiah(sisaTagihan)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => formPelunasan.setData('jenis_aksi', 'pelunasan')}
                                    className={`min-h-[38px] rounded-lg border px-3 font-bold transition cursor-pointer ${
                                        formPelunasan.data.jenis_aksi === 'pelunasan'
                                            ? 'border-[#0D9488] bg-[#0D9488] text-white'
                                            : 'border-teal-200 bg-white text-[#134E4A]'
                                    }`}
                                >
                                    Bayar Lunas Sekarang
                                </button>
                                <button
                                    type="button"
                                    disabled={!pelanggan?.hak_bayar_belakangan}
                                    onClick={() => formPelunasan.setData('jenis_aksi', 'tempo')}
                                    className={`min-h-[38px] rounded-lg border px-3 font-bold transition cursor-pointer ${
                                        formPelunasan.data.jenis_aksi === 'tempo'
                                            ? 'border-[#0D9488] bg-[#CCFBF1] text-[#134E4A]'
                                            : 'border-slate-200 bg-white text-slate-600 disabled:opacity-40'
                                    }`}
                                >
                                    Gunakan Tempo
                                </button>
                            </div>

                            {formPelunasan.data.jenis_aksi === 'pelunasan' && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                                    <div>
                                        <label className="block font-bold text-[#134E4A] mb-1">Nominal Bayar (Rp)</label>
                                        <input
                                            type="number"
                                            value={formPelunasan.data.nominal}
                                            onChange={(e) => formPelunasan.setData('nominal', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold tabular-nums focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-[#134E4A] mb-1">Metode Pembayaran</label>
                                        <select
                                            value={formPelunasan.data.metode_pembayaran}
                                            onChange={(e) => formPelunasan.setData('metode_pembayaran', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                        >
                                            <option value="Tunai">Tunai (Cash)</option>
                                            <option value="QRIS">QRIS / E-Wallet</option>
                                            <option value="Transfer">Transfer Bank</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {transaksi.status_proses_terkini === 'Selesai' && transaksi.status_transaksi === 'Aktif' && (
                                <label className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white p-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formPelunasan.data.serahkan_cucian}
                                        onChange={(e) => formPelunasan.setData('serahkan_cucian', e.target.checked)}
                                        className="rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                    <span className="text-xs font-bold text-[#134E4A]">
                                        Sekaligus serahkan cucian ke pelanggan (Tandai Transaksi Selesai)
                                    </span>
                                </label>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('rincian')}
                                    className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={formPelunasan.processing}
                                    className="min-h-[38px] rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A]"
                                >
                                    {formPelunasan.processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 3: FORM TIMBANG ULANG */}
                    {activeSubTab === 'timbang' && (
                        <form onSubmit={handleSimpanPenyesuaian} className="space-y-4 rounded-xl border border-teal-200 bg-[#F6FBF9] p-4">
                            <h3 className="text-sm font-bold text-[#134E4A] border-b border-teal-100 pb-2">
                                Penyesuaian Timbang Ulang Pakaian
                            </h3>

                            <div className="space-y-2.5">
                                {formPenyesuaian.data.items.map((it, idx) => (
                                    <div key={it.id} className="rounded-lg border border-teal-100 bg-white p-3 text-xs">
                                        <div className="flex justify-between font-bold text-[#134E4A] mb-1.5">
                                            <span>{it.nama_layanan}</span>
                                            <span>@ {formatRupiah(it.harga_saat_transaksi)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold tabular-nums focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                                required
                                            />
                                            <span className="font-bold text-slate-600">
                                                {it.satuan_hitung === 'Jumlah_Pcs' ? 'Pcs' : 'Kg'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('rincian')}
                                    className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={formPenyesuaian.processing}
                                    className="min-h-[38px] rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A]"
                                >
                                    {formPenyesuaian.processing ? 'Menyimpan...' : 'Simpan Timbang Ulang'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 4: FORM BATALKAN NOTA */}
                    {activeSubTab === 'batal' && (
                        <form onSubmit={handleSimpanBatal} className="space-y-4 rounded-xl border border-rose-200 bg-rose-50/40 p-4 text-xs">
                            <h3 className="text-sm font-bold text-rose-800 border-b border-rose-200 pb-2">
                                Batalkan Nota ({transaksi.no_nota})
                            </h3>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                                <div className="flex justify-between">
                                    <span>Biaya Pembatalan ({transaksi.status_proses_terkini} · {persenBatal}%):</span>
                                    <span className="font-black text-rose-700">{formatRupiah(biayaBatalEstimasi)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Alasan Pembatalan</label>
                                <textarea
                                    rows="2"
                                    value={formBatal.data.alasan_batal}
                                    onChange={(e) => formBatal.setData('alasan_batal', e.target.value)}
                                    placeholder="Tuliskan alasan pembatalan pesanan..."
                                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('rincian')}
                                    className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={formBatal.processing}
                                    className="min-h-[38px] rounded-lg bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700"
                                >
                                    {formBatal.processing ? 'Memproses...' : 'Konfirmasi Batal'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Modal>
    );
}
