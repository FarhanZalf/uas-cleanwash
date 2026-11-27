import { formatJumlah, formatRupiah, formatTanggal, formatTanggalWaktu } from '@/utils/format';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function TransaksiCetak({ transaksi, ringkasan, format: formatAwal }) {
    const [formatAktif, setFormatAktif] = useState(formatAwal || 'thermal');

    const pelanggan = transaksi.pelanggan;
    const items = transaksi.detail_pakaian || [];
    const pembayaran = transaksi.pembayaran || [];

    const totalHarga = Number(transaksi.total_harga) || 0;
    const potonganVoucher = Number(ringkasan?.potongan_voucher) || 0;
    const totalKompensasi = Number(transaksi.total_kompensasi) || 0;
    const totalDibayar = Number(ringkasan?.total_dibayar) || 0;
    const sisaTagihan = Number(transaksi.sisa_tagihan) || 0;

    const handleCetak = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 antialiased print:bg-white print:p-0">
            <Head title={`Cetak Nota ${transaksi.no_nota}`} />

            {/* Top Toolbar (Disembunyikan saat dicetak browser) */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur print:hidden">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('kasir.transaksi.show', transaksi.id)}
                            className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                        >
                            Kembali ke Detail
                        </Link>
                        <span className="font-mono text-sm font-bold text-[#134E4A]">{transaksi.no_nota}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Pilihan Format */}
                        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setFormatAktif('thermal')}
                                className={`rounded-md px-3 py-1.5 transition ${
                                    formatAktif === 'thermal'
                                        ? 'bg-white font-bold text-[#134E4A] shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Struk Thermal (80mm)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormatAktif('a5')}
                                className={`rounded-md px-3 py-1.5 transition ${
                                    formatAktif === 'a5'
                                        ? 'bg-white font-bold text-[#134E4A] shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Invoice Formal (A5)
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleCetak}
                            className="inline-flex min-h-[40px] items-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                        >
                            Cetak Nota Sekarang
                        </button>
                    </div>
                </div>
            </header>

            {/* Container Print */}
            <main className="mx-auto flex justify-center py-6 print:m-0 print:p-0">
                {formatAktif === 'thermal' ? (
                    /* Format 1: Struk Thermal 80mm */
                    <article
                        aria-label={`Struk Thermal ${transaksi.no_nota}`}
                        className="w-[80mm] max-w-full rounded-md border border-slate-200 bg-white p-4 font-mono text-[11px] leading-tight text-slate-900 shadow-sm print:m-0 print:w-full print:border-none print:p-0 print:shadow-none"
                    >
                        {/* Header Toko */}
                        <div className="text-center">
                            <div className="text-base font-black uppercase tracking-wider text-slate-900">CLEANWASH</div>
                            <div className="text-[10px] text-slate-600">Smart Eco-Care Laundry</div>
                            <div className="mt-1 text-[10px] text-slate-600">Layanan Cuci Kiloan & Satuan Modern</div>
                            <div className="text-[10px] text-slate-600">Telp: 0812-3456-7890</div>
                        </div>

                        <div className="my-2 border-b border-dashed border-slate-400" />

                        {/* Metadata Transaksi */}
                        <div className="space-y-0.5 text-[10px]">
                            <div className="flex justify-between">
                                <span>No. Nota:</span>
                                <span className="font-bold">{transaksi.no_nota}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tanggal:</span>
                                <span>{formatTanggalWaktu(transaksi.tanggal_terima)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kasir:</span>
                                <span>{transaksi.petugas?.nama_petugas || 'Kasir'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pelanggan:</span>
                                <span className="font-bold">{pelanggan?.nama} ({pelanggan?.kode_pelanggan})</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Telepon:</span>
                                <span>{pelanggan?.no_telepon}</span>
                            </div>
                        </div>

                        <div className="my-2 border-b border-dashed border-slate-400" />

                        {/* Daftar Item */}
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={item.id || idx}>
                                    <div className="font-bold text-slate-900">{item.jenis_layanan?.nama_layanan}</div>
                                    <div className="text-[10px] text-slate-600">{item.daftar_pakaian}</div>
                                    <div className="flex justify-between text-[10px]">
                                        <span>
                                            {formatJumlah(item.berat_atau_jumlah, item.jenis_layanan?.satuan_hitung)} x {formatRupiah(item.harga_saat_transaksi)}
                                        </span>
                                        <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="my-2 border-b border-dashed border-slate-400" />

                        {/* Rincian Tagihan */}
                        <div className="space-y-0.5 text-[10px]">
                            <div className="flex justify-between">
                                <span>Total Harga:</span>
                                <span>{formatRupiah(totalHarga)}</span>
                            </div>
                            {potonganVoucher > 0 && (
                                <div className="flex justify-between text-teal-800">
                                    <span>Voucher ({transaksi.voucher?.nomor_voucher}):</span>
                                    <span>-{formatRupiah(potonganVoucher)}</span>
                                </div>
                            )}
                            {totalKompensasi > 0 && (
                                <div className="flex justify-between text-rose-800">
                                    <span>Kompensasi Kerusakan:</span>
                                    <span>-{formatRupiah(totalKompensasi)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-dotted border-slate-300 pt-1 font-bold">
                                <span>Total Tagihan:</span>
                                <span>{formatRupiah(Math.max(totalHarga - potonganVoucher - totalKompensasi, 0))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Dibayar:</span>
                                <span>{formatRupiah(totalDibayar)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-black">
                                <span>SISA TAGIHAN:</span>
                                <span>{formatRupiah(sisaTagihan)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] pt-0.5">
                                <span>Status Bayar:</span>
                                <span className="font-bold uppercase">{transaksi.status_bayar}</span>
                            </div>
                        </div>

                        {transaksi.catatan_khusus && (
                            <>
                                <div className="my-2 border-b border-dashed border-slate-400" />
                                <div className="text-[10px]">
                                    <span className="font-bold">Catatan:</span> {transaksi.catatan_khusus}
                                </div>
                            </>
                        )}

                        <div className="my-2 border-b border-dashed border-slate-400" />

                        {/* Footer Struk */}
                        <div className="text-center text-[10px] leading-normal text-slate-600">
                            <div>Terima kasih atas kepercayaan Anda.</div>
                            <div className="mt-0.5">Simpan nota ini sebagai bukti sah pengambilan cucian.</div>
                            <div className="mt-1 font-bold">CleanWash - Bersih, Wangi, & Rapi</div>
                        </div>
                    </article>
                ) : (
                    /* Format 2: Invoice Formal A5 */
                    <article
                        aria-label={`Invoice A5 ${transaksi.no_nota}`}
                        className="w-[210mm] max-w-full rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-800 shadow-sm print:m-0 print:w-full print:border-none print:p-0 print:shadow-none"
                    >
                        {/* Header Invoice */}
                        <div className="flex items-start justify-between border-b border-teal-100 pb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D9488] font-black text-white">
                                        CW
                                    </div>
                                    <span className="text-xl font-black text-[#134E4A]">CleanWash</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Sistem Manajemen Laundry Terintegrasi · Eco-Care Quality
                                </p>
                            </div>

                            <div className="text-right">
                                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">INVOICE TRANSAKSI</span>
                                <div className="font-mono text-lg font-black text-slate-900">{transaksi.no_nota}</div>
                                <div className="text-xs text-slate-500">{formatTanggalWaktu(transaksi.tanggal_terima)}</div>
                            </div>
                        </div>

                        {/* Pihak Terkait */}
                        <div className="mt-5 grid grid-cols-2 gap-6 rounded-lg border border-slate-100 bg-[#F6FBF9] p-4 text-xs">
                            <div>
                                <span className="font-bold text-[#134E4A]">Diterbitkan Oleh:</span>
                                <div className="mt-1 font-semibold text-slate-800">Gerai CleanWash Pusat</div>
                                <div className="text-slate-600">Petugas Kasir: {transaksi.petugas?.nama_petugas || 'Kasir'}</div>
                                <div className="text-slate-600">WhatsApp CS: 0812-3456-7890</div>
                            </div>
                            <div>
                                <span className="font-bold text-[#134E4A]">Tagihan Kepada:</span>
                                <div className="mt-1 font-semibold text-slate-800">{pelanggan?.nama}</div>
                                <div className="text-slate-600">Kode: {pelanggan?.kode_pelanggan} · Telp: {pelanggan?.no_telepon}</div>
                                <div className="text-slate-600">{pelanggan?.alamat || 'Alamat tidak dicantumkan'}</div>
                            </div>
                        </div>

                        {/* Tabel Layanan */}
                        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                                    <tr>
                                        <th scope="col" className="px-4 py-2.5">No</th>
                                        <th scope="col" className="px-4 py-2.5">Layanan Laundry</th>
                                        <th scope="col" className="px-4 py-2.5">Rincian Item Pakaian</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Kuantitas</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Tarif</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td className="px-4 py-2.5 font-mono text-slate-500">{index + 1}</td>
                                            <td className="px-4 py-2.5 font-bold text-slate-900">
                                                {item.jenis_layanan?.nama_layanan}
                                                <span className="ml-1 text-[10px] font-normal text-slate-500">
                                                    ({item.jenis_layanan?.kecepatan})
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-700">{item.daftar_pakaian}</td>
                                            <td className="px-4 py-2.5 text-right font-medium">
                                                {formatJumlah(item.berat_atau_jumlah, item.jenis_layanan?.satuan_hitung)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                                                {formatRupiah(item.harga_saat_transaksi)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-bold tabular-nums text-slate-900">
                                                {formatRupiah(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Kalkulasi & Tanda Tangan */}
                        <div className="mt-5 grid grid-cols-2 gap-6 items-start">
                            <div className="space-y-3 text-xs">
                                {transaksi.catatan_khusus && (
                                    <div className="rounded-lg border border-slate-200 p-2.5">
                                        <span className="font-bold text-slate-700">Catatan Khusus:</span>
                                        <p className="mt-0.5 text-slate-600">{transaksi.catatan_khusus}</p>
                                    </div>
                                )}
                                <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 leading-normal">
                                    <div className="font-bold text-slate-700 mb-1">Ketentuan Layanan CleanWash:</div>
                                    <div>1. Pengambilan cucian wajib disertai bukti nota fisik / digital ini.</div>
                                    <div>2. Hak bayar tempo berlaku khusus untuk pelanggan yang telah disetujui.</div>
                                    <div>3. Klaim kerusakan / kehilangan wajib dilaporkan maksimal 1x24 jam sejak serah terima.</div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-2">
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Harga Kotor:</span>
                                    <span className="font-semibold text-slate-800">{formatRupiah(totalHarga)}</span>
                                </div>
                                {potonganVoucher > 0 && (
                                    <div className="flex justify-between text-teal-800">
                                        <span>Potongan Voucher Promo:</span>
                                        <span className="font-bold">- {formatRupiah(potonganVoucher)}</span>
                                    </div>
                                )}
                                {totalKompensasi > 0 && (
                                    <div className="flex justify-between text-rose-800">
                                        <span>Kompensasi Kerusakan:</span>
                                        <span className="font-bold">- {formatRupiah(totalKompensasi)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1.5">
                                    <span>Pembayaran Diterima:</span>
                                    <span className="font-semibold text-slate-800">{formatRupiah(totalDibayar)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-[#134E4A] border-t border-teal-200 pt-2">
                                    <span>Sisa Tagihan:</span>
                                    <span className="text-base">{formatRupiah(sisaTagihan)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                    <span>Status Keuangan:</span>
                                    <span className="font-bold uppercase text-slate-800">{transaksi.status_bayar}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tanda Tangan */}
                        <div className="mt-8 grid grid-cols-2 text-center text-xs text-slate-600">
                            <div>
                                <div>Petugas Kasir</div>
                                <div className="mt-12 font-bold text-slate-900 border-b border-slate-300 mx-auto w-36 pb-1">
                                    {transaksi.petugas?.nama_petugas || 'Kasir'}
                                </div>
                            </div>
                            <div>
                                <div>Pelanggan Penerima</div>
                                <div className="mt-12 font-bold text-slate-900 border-b border-slate-300 mx-auto w-36 pb-1">
                                    {pelanggan?.nama || 'Pelanggan'}
                                </div>
                            </div>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}
