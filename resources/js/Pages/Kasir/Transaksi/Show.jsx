import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StatusBayar, StatusProses, StatusTransaksi } from '@/Components/StatusBadge';
import { formatJumlah, formatRupiah, formatTanggal, formatTanggalWaktu } from '@/utils/format';
import { Head, Link } from '@inertiajs/react';

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
                                <span className="text-xs font-semibold text-slate-700">
                                    {pelanggan?.hak_bayar_belakangan ? 'Diizinkan' : 'Wajib Lunas'}
                                </span>
                            </div>
                            <div className="pt-1">
                                <span className="text-xs text-slate-500">Alamat:</span>
                                <p className="mt-0.5 text-xs text-slate-700">{pelanggan?.alamat || 'Tidak ada alamat tercatat.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-100 bg-white p-5">
                        <h2 className="text-sm font-bold text-[#134E4A]">Catatan Pengerjaan & Voucher</h2>
                        <div className="mt-3 space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-slate-500">Catatan Khusus dari Kasir:</span>
                                <p className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-700">
                                    {transaksi.catatan_khusus || 'Tidak ada catatan khusus pada nota ini.'}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-2">
                                <span className="text-xs text-slate-500">Voucher Terpasang:</span>
                                {transaksi.voucher ? (
                                    <div className="mt-1 flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50/50 p-2 text-xs">
                                        <span className="font-mono font-bold text-teal-900">{transaksi.voucher.nomor_voucher}</span>
                                        <span className="font-semibold text-teal-800">
                                            Potongan {formatRupiah(transaksi.voucher.nilai_potongan)}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-xs text-slate-600">Tidak menggunakan voucher promosi.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabel Rincian Pakaian */}
                <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
                    <div className="border-b border-teal-100 bg-[#F6FBF9] px-5 py-3">
                        <h2 className="text-sm font-bold text-[#134E4A]">Rincian Item Pakaian</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                                <tr>
                                    <th scope="col" className="px-5 py-3">Layanan</th>
                                    <th scope="col" className="px-5 py-3">Rincian Pakaian</th>
                                    <th scope="col" className="px-5 py-3 text-right">Berat / Jumlah</th>
                                    <th scope="col" className="px-5 py-3 text-right">Tarif Snapshot</th>
                                    <th scope="col" className="px-5 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F6FBF9]">
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-slate-800">{item.jenis_layanan?.nama_layanan}</div>
                                            <div className="text-xs text-slate-500">
                                                Layanan {item.jenis_layanan?.kecepatan}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-700">{item.daftar_pakaian}</td>
                                        <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                                            {formatJumlah(item.berat_atau_jumlah, item.jenis_layanan?.satuan_hitung)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                                            {formatRupiah(item.harga_saat_transaksi)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold tabular-nums text-slate-900">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t border-slate-200 bg-slate-50/70 text-xs text-slate-700">
                                <tr>
                                    <td colSpan="4" className="px-5 py-2.5 text-right font-semibold">Total Harga Kotor:</td>
                                    <td className="px-5 py-2.5 text-right font-bold tabular-nums text-slate-900">{formatRupiah(totalHarga)}</td>
                                </tr>
                                {potonganVoucher > 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-2 text-right font-semibold text-teal-800">Potongan Voucher:</td>
                                        <td className="px-5 py-2 text-right font-bold tabular-nums text-teal-800">- {formatRupiah(potonganVoucher)}</td>
                                    </tr>
                                )}
                                {totalKompensasi > 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-2 text-right font-semibold text-rose-800">Total Kompensasi Insiden:</td>
                                        <td className="px-5 py-2 text-right font-bold tabular-nums text-rose-800">- {formatRupiah(totalKompensasi)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="4" className="px-5 py-2 text-right font-semibold">Total Pembayaran Masuk:</td>
                                    <td className="px-5 py-2 text-right font-bold tabular-nums text-slate-900">{formatRupiah(totalDibayar)}</td>
                                </tr>
                                <tr className="border-t border-slate-200 bg-teal-50/40 text-sm font-bold text-[#134E4A]">
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
                                                {p.jenis === 'UangMuka' ? 'Uang Muka (DP)' : 'Pelunasan'}
                                            </span>
                                            <div className="text-slate-500">
                                                {formatTanggalWaktu(p.tanggal_bayar)} · Kasir: {p.petugas?.nama_petugas || 'Kasir'}
                                            </div>
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
                            <h2 className="text-sm font-bold text-[#134E4A]">Jejak Riwayat Tahap Produksi</h2>
                        </div>
                        {riwayat.length > 0 ? (
                            <ol className="divide-y divide-slate-100 p-4 space-y-2">
                                {riwayat.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between py-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-2 w-2 rounded-full bg-[#0D9488]" />
                                            <span className="font-bold text-slate-800">{r.tahap}</span>
                                        </div>
                                        <div className="text-right text-slate-500">
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
        </AuthenticatedLayout>
    );
}
