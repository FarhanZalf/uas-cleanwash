import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const displayName = user?.nama_petugas || user?.name || 'Petugas';
    const isKasir = user?.peran === 'Kasir';

    const menuOperasional = [
        { label: 'Dashboard Kasir', routeName: 'kasir.dashboard', icon: '📊' },
        { label: 'Transaksi Laundry', routeName: 'kasir.transaksi.index', activePrefix: 'kasir.transaksi.*', icon: '🧾' },
        { label: 'Pengantaran Kurir', routeName: 'kasir.pengantaran.index', activePrefix: 'kasir.pengantaran.*', icon: '🛵' },
    ];

    const menuMaster = [
        { label: 'Data Pelanggan', routeName: 'kasir.pelanggan.index', activePrefix: 'kasir.pelanggan.*', icon: '👥' },
        { label: 'Jenis Layanan', routeName: 'kasir.layanan.index', activePrefix: 'kasir.layanan.*', icon: '🧺' },
        { label: 'Voucher Promo', routeName: 'kasir.voucher.index', activePrefix: 'kasir.voucher.*', icon: '🎟️' },
        { label: 'Akun Petugas', routeName: 'kasir.petugas.index', activePrefix: 'kasir.petugas.*', icon: '🛡️' },
    ];

    const menuKeuangan = [
        { label: 'Rekap Laporan & Piutang', routeName: 'kasir.laporan.index', activePrefix: 'kasir.laporan.*', icon: '📈' },
    ];

    return (
        <div className="min-h-screen bg-[#F6FBF9] text-slate-800 antialiased flex flex-col lg:flex-row">
            {/* ========================================================= */}
            {/* SIDEBAR KIRI KHUSUS ROLE KASIR / ADMIN */}
            {/* ========================================================= */}
            {isKasir && (
                <>
                    {/* Mobile Backdrop Overlay */}
                    {sidebarOpen && (
                        <div
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
                        />
                    )}

                    {/* Left Sidebar Container */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-teal-100 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        {/* Top: Logo & Brand */}
                        <div>
                            <div className="h-16 px-5 border-b border-teal-100 flex items-center justify-between">
                                <Link href={route('kasir.dashboard')} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white font-black text-lg shadow-sm">
                                        CW
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-extrabold text-[#134E4A] leading-tight tracking-tight">
                                            CleanWash
                                        </span>
                                        <span className="text-[10px] text-teal-700/80 font-bold uppercase tracking-wider">
                                            Laundry ERP
                                        </span>
                                    </div>
                                </Link>

                                {/* Close Button on Mobile */}
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* User Profile Mini Bar */}
                            <div className="px-5 py-3.5 bg-[#F6FBF9] border-b border-teal-50 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-teal-100 text-[#134E4A] font-bold text-xs flex items-center justify-center">
                                    {displayName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">{displayName}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-semibold text-teal-700 uppercase">Kasir & Admin</span>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Menu Groups */}
                            <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-270px)]">
                                {/* Group 1: Operasional */}
                                <div>
                                    <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                        Operasional Gerai
                                    </span>
                                    <ul className="mt-1.5 space-y-1">
                                        {menuOperasional.map((item) => {
                                            const active = item.activePrefix
                                                ? route().current(item.activePrefix)
                                                : route().current(item.routeName);
                                            return (
                                                <li key={item.routeName}>
                                                    <Link
                                                        href={route(item.routeName)}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                            active
                                                                ? 'bg-[#0D9488] text-white shadow-xs'
                                                                : 'text-slate-700 hover:bg-teal-50 hover:text-[#0D9488]'
                                                        }`}
                                                    >
                                                        <span className="text-base">{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* Group 2: Master Data */}
                                <div>
                                    <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                        Data Master
                                    </span>
                                    <ul className="mt-1.5 space-y-1">
                                        {menuMaster.map((item) => {
                                            const active = item.activePrefix
                                                ? route().current(item.activePrefix)
                                                : route().current(item.routeName);
                                            return (
                                                <li key={item.routeName}>
                                                    <Link
                                                        href={route(item.routeName)}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                            active
                                                                ? 'bg-[#0D9488] text-white shadow-xs'
                                                                : 'text-slate-700 hover:bg-teal-50 hover:text-[#0D9488]'
                                                        }`}
                                                    >
                                                        <span className="text-base">{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* Group 3: Keuangan */}
                                <div>
                                    <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                        Laporan & Piutang
                                    </span>
                                    <ul className="mt-1.5 space-y-1">
                                        {menuKeuangan.map((item) => {
                                            const active = item.activePrefix
                                                ? route().current(item.activePrefix)
                                                : route().current(item.routeName);
                                            return (
                                                <li key={item.routeName}>
                                                    <Link
                                                        href={route(item.routeName)}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                            active
                                                                ? 'bg-[#0D9488] text-white shadow-xs'
                                                                : 'text-slate-700 hover:bg-teal-50 hover:text-[#0D9488]'
                                                        }`}
                                                    >
                                                        <span className="text-base">{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </nav>
                        </div>

                        {/* Bottom: Buka Tab Role Lain & Logout */}
                        <div className="p-3 border-t border-teal-100 bg-[#F6FBF9]/60 space-y-2">
                            {/* Widget Demo Multi-Tab 1 Role */}
                            <div className="rounded-xl border border-teal-200 bg-white p-2.5 shadow-2xs">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-teal-800 mb-1.5">
                                    Buka Role Lain (Tab Baru):
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                    <a
                                        href={route('demo-login', 'Produksi')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-1.5 px-2 text-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 text-[11px] transition cursor-pointer"
                                    >
                                        ⚙️ Produksi ↗
                                    </a>
                                    <a
                                        href={route('demo-login', 'Antar')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-1.5 px-2 text-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 text-[11px] transition cursor-pointer"
                                    >
                                        🛵 Kurir ↗
                                    </a>
                                </div>
                            </div>

                            <Link
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                                🚪 Keluar Sistem
                            </Link>
                        </div>
                    </aside>
                </>
            )}

            {/* ========================================================= */}
            {/* KONTEN UTAMA DENGAN DUKUNGAN SIDEBAR */}
            {/* ========================================================= */}
            <div className={`flex-1 flex flex-col min-w-0 ${isKasir ? 'lg:pl-64' : ''}`}>
                {/* Topbar Header */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-teal-100/80 shadow-2xs">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile Hamburger Button for Kasir */}
                            {isKasir && (
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
                                    aria-label="Buka Menu"
                                >
                                    ☰
                                </button>
                            )}

                            {/* Brand Logo for Non-Kasir Roles */}
                            {!isKasir && (
                                <Link href="/dashboard" className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-xl bg-[#0D9488] flex items-center justify-center text-white font-black text-sm">
                                        CW
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-extrabold text-[#134E4A] leading-tight">
                                            CleanWash
                                        </span>
                                        <span className="text-[10px] text-teal-700 font-bold uppercase">
                                            {user?.peran === 'Produksi' ? 'Modul Produksi' : 'Modul Kurir Antar'}
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {/* Header Slot (Breadcrumb / Title) */}
                            {header && (
                                <div className="hidden sm:block">
                                    {header}
                                </div>
                            )}
                        </div>

                        {/* Topbar Right Actions */}
                        <div className="flex items-center gap-2.5">
                            {/* Link Tab Cepat untuk Produksi dan Antar */}
                            {!isKasir && (
                                <div className="hidden sm:flex items-center gap-1.5 text-xs">
                                    <a
                                        href={route('demo-login', 'Kasir')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-1 px-2.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 font-bold hover:bg-teal-100 cursor-pointer text-[11px]"
                                    >
                                        👤 Tab Kasir ↗
                                    </a>
                                    {user?.peran === 'Produksi' && (
                                        <a
                                            href={route('demo-login', 'Antar')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="py-1 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer text-[11px]"
                                        >
                                            🛵 Tab Kurir ↗
                                        </a>
                                    )}
                                    {user?.peran === 'Antar' && (
                                        <a
                                            href={route('demo-login', 'Produksi')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="py-1 px-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 cursor-pointer text-[11px]"
                                        >
                                            ⚙️ Tab Produksi ↗
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Role Badge */}
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-teal-50 text-[#134E4A] border-teal-200">
                                {user?.peran}
                            </span>

                            {/* User Dropdown for Non-Kasir */}
                            {!isKasir && (
                                <Link
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    className="p-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                    Keluar
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Header Subtitle */}
                    {header && (
                        <div className="sm:hidden px-4 pb-3 border-t border-slate-100 pt-2">
                            {header}
                        </div>
                    )}
                </header>

                {/* Flash Messages (Alert Banners) */}
                {flash?.success && (
                    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold shadow-2xs">
                            <div className="flex items-center gap-2">
                                <span className="text-teal-600 font-bold">✓ Sukses:</span>
                                <span>{flash.success}</span>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold shadow-2xs">
                            <div className="flex items-center gap-2">
                                <span className="text-rose-600 font-bold">✕ Galat:</span>
                                <span>{flash.error}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Page Content */}
                <main className="flex-1 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
