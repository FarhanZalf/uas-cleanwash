import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ProduksiDashboard({ antreanCucian, countPerTahap }) {
    const tahapColors = {
        Diterima: 'border-l-4 border-blue-500 bg-blue-50/30',
        Dicuci: 'border-l-4 border-sky-500 bg-sky-50/30',
        Dikeringkan: 'border-l-4 border-amber-500 bg-amber-50/30',
        Disetrika: 'border-l-4 border-purple-500 bg-purple-50/30',
        Selesai: 'border-l-4 border-emerald-500 bg-emerald-50/30',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-slate-800">
                            Papan Antrean Kerja Produksi
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Pengerjaan fisik cucian, update tahapan proses, dan pencatatan laporan kerusakan pakaian.
                        </p>
                    </div>
                    <div>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Peran: Tim Produksi
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Papan Produksi" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 5 Tahap Ringkasan */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'].map((tahap) => (
                        <div key={tahap} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{tahap}</span>
                            <div className="mt-2 text-2xl font-black text-slate-800">{countPerTahap?.[tahap] || 0}</div>
                            <span className="text-[10px] text-slate-400">antrean nota</span>
                        </div>
                    ))}
                </div>

                {/* Antrean Cucian Aktif */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-800">Daftar Pakaian Siap Dikerjakan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Antrean terurut dari waktu terima pakaian</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                            Total: {antreanCucian?.length || 0} Nota
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {antreanCucian && antreanCucian.length > 0 ? (
                            antreanCucian.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border border-slate-200 shadow-sm transition hover:shadow-md ${tahapColors[item.status_proses_terkini] || ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-sm font-bold text-blue-700">{item.no_nota}</span>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                                            {item.status_proses_terkini}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <div className="text-sm font-semibold text-slate-800">{item.pelanggan?.nama}</div>
                                        {item.catatan_khusus && (
                                            <div className="mt-1 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                                                ⚠️ Catatan: {item.catatan_khusus}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.tanggal_terima).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <button
                                            type="button"
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                                        >
                                            Update Tahap
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400">
                                <span className="text-3xl block mb-2">🎉</span>
                                Tidak ada antrean cucian aktif saat ini. Semua pesanan sudah tuntas!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
