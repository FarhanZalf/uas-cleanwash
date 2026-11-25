import {
    IconCheck,
    IconClose,
    IconDashboard,
    IconLogout,
    IconMenu,
    IconReceipt,
    IconReport,
    IconShield,
    IconTicket,
    IconTruck,
    IconUsers,
    IconWasher,
} from '@/Components/LineIcons';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const displayName = user?.nama_petugas || user?.name || 'Petugas';
    const isKasir = user?.peran === 'Kasir';

    useEffect(() => {
        if (!sidebarOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [sidebarOpen]);

    const menuOperasional = [
        { label: 'Dashboard Kasir', routeName: 'kasir.dashboard', Icon: IconDashboard },
        { label: 'Transaksi Laundry', routeName: 'kasir.transaksi.index', activePrefix: 'kasir.transaksi.*', Icon: IconReceipt },
        { label: 'Pengantaran Kurir', routeName: 'kasir.pengantaran.index', activePrefix: 'kasir.pengantaran.*', Icon: IconTruck },
    ];

    const menuMaster = [
        { label: 'Data Pelanggan', routeName: 'kasir.pelanggan.index', activePrefix: 'kasir.pelanggan.*', Icon: IconUsers },
        { label: 'Jenis Layanan', routeName: 'kasir.layanan.index', activePrefix: 'kasir.layanan.*', Icon: IconWasher },
        { label: 'Voucher Promo', routeName: 'kasir.voucher.index', activePrefix: 'kasir.voucher.*', Icon: IconTicket },
        { label: 'Akun Petugas', routeName: 'kasir.petugas.index', activePrefix: 'kasir.petugas.*', Icon: IconShield },
    ];

    const menuKeuangan = [
        { label: 'Rekap Laporan & Piutang', routeName: 'kasir.laporan.index', activePrefix: 'kasir.laporan.*', Icon: IconReport },
    ];

    const renderNavGroup = (groupTitle, items) => (
        <div>
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {groupTitle}
            </span>
            <ul className="mt-1.5 space-y-1">
                {items.map((item) => {
                    const active = item.activePrefix
                        ? route().current(item.activePrefix)
                        : route().current(item.routeName);
                    const ItemIcon = item.Icon;
                    return (
                        <li key={item.routeName}>
                            <Link
                                href={route(item.routeName)}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                className={`flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                                    active
                                        ? 'border-l-2 border-[#0D9488] bg-[#CCFBF1] text-[#134E4A]'
                                        : 'text-slate-700 hover:bg-[#F6FBF9] hover:text-[#134E4A]'
                                }`}
                            >
                                <ItemIcon className={`h-4 w-4 shrink-0 ${active ? 'text-[#134E4A]' : 'text-[#0D9488]'}`} />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F6FBF9] text-slate-800 antialiased flex flex-col lg:flex-row">
            {/* Sidebar Kiri untuk Kasir & Admin */}
            {isKasir && (
                <>
                    {sidebarOpen && (
                        <div
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden print:hidden"
                        />
                    )}

                    <aside
                        aria-label="Navigasi utama kasir"
                        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-teal-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 print:hidden ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div>
                            <div className="h-16 px-5 border-b border-teal-100 flex items-center justify-between">
                                <Link
                                    href={route('kasir.dashboard')}
                                    className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                >
                                    <div className="h-9 w-9 rounded-lg border border-teal-200 bg-[#CCFBF1] flex items-center justify-center text-[#134E4A]">
                                        <IconWasher className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-[#134E4A] leading-tight">
                                            CleanWash
                                        </span>
                                        <span className="text-[11px] text-slate-600 font-medium">
                                            Manajemen Laundry
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    aria-label="Tutup menu navigasi"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-[#F6FBF9] hover:text-[#134E4A] lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                >
                                    <IconClose className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Profil Petugas Aktif */}
                            <div className="px-5 py-3.5 bg-[#F6FBF9] border-b border-teal-100 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full border border-teal-200 bg-[#CCFBF1] text-[#134E4A] font-bold text-xs flex items-center justify-center">
                                    {displayName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-[#134E4A] truncate">{displayName}</div>
                                    <div className="text-[11px] font-medium text-slate-600">Peran: Kasir & Admin</div>
                                </div>
                            </div>

                            {/* Grup Menu */}
                            <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-280px)]" aria-label="Menu Kasir">
                                {renderNavGroup('Operasional Gerai', menuOperasional)}
                                {renderNavGroup('Data Master', menuMaster)}
                                {renderNavGroup('Laporan & Piutang', menuKeuangan)}
                            </nav>
                        </div>

                        {/* Bawah: Pintasan Multi-Tab & Keluar */}
                        <div className="p-3 border-t border-teal-100 bg-[#F6FBF9] space-y-2">
                            <div className="rounded-lg border border-teal-200/80 bg-white p-2.5">
                                <span className="block text-[11px] font-bold text-[#134E4A] mb-1.5">
                                    Buka Peran Lain (Tab Baru):
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                    <a
                                        href={route('demo-login', 'Produksi')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-2 text-xs font-bold text-[#134E4A] transition hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                    >
                                        <IconWasher className="h-3.5 w-3.5 text-[#0D9488]" />
                                        <span>Produksi</span>
                                    </a>
                                    <a
                                        href={route('demo-login', 'Antar')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-2 text-xs font-bold text-[#134E4A] transition hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                    >
                                        <IconTruck className="h-3.5 w-3.5 text-[#0D9488]" />
                                        <span>Kurir</span>
                                    </a>
                                </div>
                            </div>

                            <Link
                                method="post"
                                href={route('logout')}
                                data={{ role: user?.peran }}
                                as="button"
                                className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            >
                                <IconLogout className="h-4 w-4" />
                                <span>Keluar Sistem</span>
                            </Link>
                        </div>
                    </aside>
                </>
            )}

            {/* Konten Utama */}
            <div className={`flex-1 flex flex-col min-w-0 ${isKasir ? 'lg:pl-64' : ''}`}>
                <header className="sticky top-0 z-30 bg-white border-b border-teal-200/80 print:hidden">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {isKasir && (
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    aria-expanded={sidebarOpen}
                                    aria-label="Buka menu navigasi"
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                >
                                    <IconMenu className="h-4 w-4" />
                                    <span>Menu</span>
                                </button>
                            )}

                            {!isKasir && (
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                >
                                    <div className="h-9 w-9 rounded-lg border border-teal-200 bg-[#CCFBF1] flex items-center justify-center text-[#134E4A]">
                                        <IconWasher className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-[#134E4A] leading-tight">
                                            CleanWash
                                        </span>
                                        <span className="text-[11px] text-slate-600 font-medium">
                                            {user?.peran === 'Produksi' ? 'Modul Produksi' : 'Modul Kurir Antar'}
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {header && (
                                <div className="hidden sm:block">
                                    {header}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5">
                            {!isKasir && (
                                <div className="hidden sm:flex items-center gap-1.5 text-xs">
                                    <a
                                        href={route('demo-login', 'Kasir')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                    >
                                        <IconReceipt className="h-3.5 w-3.5 text-[#0D9488]" />
                                        <span>Tab Kasir</span>
                                    </a>
                                    {user?.peran === 'Produksi' && (
                                        <a
                                            href={route('demo-login', 'Antar')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                        >
                                            <IconTruck className="h-3.5 w-3.5 text-[#0D9488]" />
                                            <span>Tab Kurir</span>
                                        </a>
                                    )}
                                    {user?.peran === 'Antar' && (
                                        <a
                                            href={route('demo-login', 'Produksi')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                        >
                                            <IconWasher className="h-3.5 w-3.5 text-[#0D9488]" />
                                            <span>Tab Produksi</span>
                                        </a>
                                    )}
                                </div>
                            )}

                            <span className="px-2.5 py-1 text-xs font-bold rounded-md border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                {user?.peran}
                            </span>

                            {!isKasir && (
                                <Link
                                    method="post"
                                    href={route('logout')}
                                    data={{ role: user?.peran }}
                                    as="button"
                                    className="inline-flex min-h-[38px] items-center gap-1.5 px-3 text-xs font-bold text-rose-700 border border-rose-200 bg-white hover:bg-rose-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                >
                                    <IconLogout className="h-3.5 w-3.5" />
                                    <span>Keluar</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {header && (
                        <div className="sm:hidden px-4 pb-3 border-t border-teal-100 pt-2">
                            {header}
                        </div>
                    )}
                </header>

                {/* Pesan Notifikasi Flash */}
                {flash?.success && (
                    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-4 print:hidden" role="status">
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#CCFBF1]/70 border border-teal-300 text-[#134E4A] text-xs font-bold">
                            <IconCheck className="h-4 w-4 shrink-0 text-[#0D9488]" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-4 print:hidden" role="alert">
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                            <IconClose className="h-4 w-4 shrink-0 text-rose-700" />
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                <main className="flex-1 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
