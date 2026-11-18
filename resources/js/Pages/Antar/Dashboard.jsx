import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AntarDashboard({ jadwalAktif, tugasHariIni }) {
    const statusAntarBadge = {
        Menunggu: 'bg-slate-100 text-slate-700 border-slate-200',
        Diambil: 'bg-blue-100 text-blue-800 border-blue-200',
        DalamPerjalanan: 'bg-amber-100 text-amber-800 border-amber-200',
        Diterima: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        Gagal: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-slate-800">
                            Tugas Pengantaran Kurir
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Antarmuka responsif lapangan untuk kurir pengantaran pakaian.
                        </p>
                    </div>
                    <div>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Peran: Petugas Antar
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Pengantaran" />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
                {/* Ringkasan Status Kurir */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tugas Pengantaran Hari Ini</div>
                        <div className="text-2xl font-black text-slate-800 mt-1">{tugasHariIni?.length || 0} Paket Nota</div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
                        🛵
                    </div>
                </div>

                {/* Daftar Nota Antaran */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">Daftar Antaran Aktif</h3>

                    {tugasHariIni && tugasHariIni.length > 0 ? (
                        tugasHariIni.map((tugas) => {
                            const nota = tugas.transaksi_laundry;
                            const plg = nota?.pelanggan;

                            return (
                                <div
                                    key={tugas.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-sm text-blue-600">
                                            {nota?.no_nota}
                                        </span>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusAntarBadge[tugas.status_antar] || ''}`}>
                                            {tugas.status_antar}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-base font-bold text-slate-800">{plg?.nama}</h4>
                                        <div className="mt-1 flex items-center text-xs text-slate-500 gap-2">
                                            <span>📞 {plg?.no_telepon}</span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            📍 <span className="font-medium">Alamat:</span> {plg?.alamat || 'Tidak ada alamat lengkap'}
                                        </p>
                                    </div>

                                    {/* Action Buttons for Field Courier */}
                                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition text-center shadow-sm"
                                        >
                                            ✓ Tandai Diterima
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition text-center border border-rose-200"
                                        >
                                            ✕ Gagal Antar
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                            <span className="text-3xl block mb-2">📦</span>
                            Belum ada jadwal paket antaran yang ditugaskan ke Anda saat ini.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
