import AutopilotDemo, { startAutopilotDemo } from '@/Components/AutopilotDemo';
import { IconReceipt, IconTruck, IconWasher } from '@/Components/LineIcons';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-white text-[#134E4A] flex flex-col lg:grid lg:grid-cols-12">
            <AutopilotDemo />
            {/* Panel Kiri: Full Background Hijau dengan Desain CleanWash */}
            <aside className="bg-[#134E4A] text-white px-6 py-8 sm:px-12 lg:col-span-6 xl:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-teal-900">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#134E4A]">
                        <IconWasher className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="block text-xl font-extrabold tracking-tight text-white">
                            CleanWash
                        </span>
                        <span className="block text-xs font-medium text-[#CCFBF1]">
                            Smart Laundry System
                        </span>
                    </div>
                </div>

                <div className="my-10 lg:my-0 max-w-lg space-y-6">
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => startAutopilotDemo('Auth/Login')}
                            title="Klik atau tekan Alt+D untuk menjalankan Autopilot Live Demo"
                            className="inline-block rounded-md bg-[#0D9488] px-2.5 py-1 text-xs font-bold text-white transition hover:bg-teal-500 cursor-pointer"
                        >
                            Sistem Operasional Terpadu
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                            Manajemen Kasir, Produksi, dan Pengantaran Laundry
                        </h1>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="flex items-center gap-3.5 rounded-xl border border-teal-800 bg-[#0f3f3c] px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CCFBF1] text-[#134E4A]">
                                <IconReceipt className="h-4 w-4" />
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-white">Kasir / Admin</div>
                                <div className="text-teal-200 mt-0.5">Transaksi nota, data master, dan laporan</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-xl border border-teal-800 bg-[#0f3f3c] px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CCFBF1] text-[#134E4A]">
                                <IconWasher className="h-4 w-4" />
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-white">Petugas Laundry</div>
                                <div className="text-teal-200 mt-0.5">Antrean tahapan cuci dan kompensasi</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-xl border border-teal-800 bg-[#0f3f3c] px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CCFBF1] text-[#134E4A]">
                                <IconTruck className="h-4 w-4" />
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-white">Kurir</div>
                                <div className="text-teal-200 mt-0.5">Jadwal kloter dan status pengantaran</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-teal-200/80">
                    CleanWash Laundry Management
                </div>
            </aside>

            {/* Panel Kanan: Area Form Login Putih */}
            <main className="flex-1 lg:col-span-6 xl:col-span-5 flex items-center justify-center bg-white px-6 py-10 sm:px-12">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </main>
        </div>
    );
}
