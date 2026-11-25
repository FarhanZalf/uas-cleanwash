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

const LABEL_PERAN = {
    Kasir: 'Kasir / Admin',
    Produksi: 'Petugas Laundry',
    Antar: 'Kurir',
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isKasir = user?.peran === 'Kasir';
    const labelPeran = LABEL_PERAN[user?.peran] || user?.peran || 'Petugas';

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
        { label: 'Dashboard', routeName: 'kasir.dashboard', Icon: IconDashboard },
        { label: 'Transaksi Laundry', routeName: 'kasir.transaksi.index', activePrefix: 'kasir.transaksi.*', Icon: IconReceipt },
        { label: 'Pengantaran Kurir', routeName: 'kasir.pengantaran.index', activePrefix: 'kasir.pengantaran.*', Icon: IconTruck },
    ];

    const menuMaster = [
        { label: 'Pelanggan', routeName: 'kasir.pelanggan.index', activePrefix: 'kasir.pelanggan.*', Icon: IconUsers },
        { label: 'Jenis Layanan', routeName: 'kasir.layanan.index', activePrefix: 'kasir.layanan.*', Icon: IconWasher },
        { label: 'Voucher', routeName: 'kasir.voucher.index', activePrefix: 'kasir.voucher.*', Icon: IconTicket },
        { label: 'Petugas', routeName: 'kasir.petugas.index', activePrefix: 'kasir.petugas.*', Icon: IconShield },
    ];

    const menuKeuangan = [
        { label: 'Laporan & Piutang', routeName: 'kasir.laporan.index', activePrefix: 'kasir.laporan.*', Icon: IconReport },
    ];

    const renderNavGroup = (groupTitle, items) => (
        <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-teal-200/75">
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
                                className={`flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFBF1] ${
                                    active
                                        ? 'bg-[#CCFBF1] text-[#134E4A]'
                                        : 'text-teal-50/90 hover:bg-[#0D9488]/40 hover:text-white'
                                }`}
                            >
                                <ItemIcon className={`h-4 w-4 shrink-0 ${active ? 'text-[#134E4A]' : 'text-[#CCFBF1]'}`} />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-800 antialiased flex flex-col lg:flex-row">
            {/* Sidebar Kiri Hijau untuk Kasir / Admin */}
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
                        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#134E4A] text-white border-r border-teal-900 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 print:hidden ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div>
                            <div className="h-16 px-5 border-b border-teal-800/80 flex items-center justify-between">
                                <Link
                                    href={route('kasir.dashboard')}
                                    className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFBF1]"
                                >
                                    <div className="h-9 w-9 rounded-lg bg-[#CCFBF1] flex items-center justify-center text-[#134E4A]">
                                        <IconWasher className="h-5 w-5" />
                                    </div>
                                    <span className="text-base font-extrabold text-white tracking-tight">
                                        CleanWash
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    aria-label="Tutup menu navigasi"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-teal-100 hover:bg-[#0D9488]/40 hover:text-white lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFBF1]"
                                >
                                    <IconClose className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Navigasi Utama */}
                            <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]" aria-label="Menu Kasir">
                                {renderNavGroup('Operasional', menuOperasional)}
                                {renderNavGroup('Data Master', menuMaster)}
                                {renderNavGroup('Keuangan', menuKeuangan)}
                            </nav>
                        </div>

                        {/* Bawah: Tombol Keluar */}
                        <div className="p-3 border-t border-teal-800/80 bg-[#0f3f3c]">
                            <Link
                                method="post"
                                href={route('logout')}
                                data={{ role: user?.peran }}
                                as="button"
                                className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-[#134E4A] border border-teal-700 hover:bg-rose-600 hover:border-rose-500 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFBF1]"
                            >
                                <IconLogout className="h-4 w-4" />
                                <span>Keluar</span>
                            </Link>
                        </div>
                    </aside>
                </>
            )}

            {/* Konten Halaman Putih */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white ${isKasir ? 'lg:pl-64' : ''}`}>
                <header className="sticky top-0 z-30 bg-white border-b border-teal-100 print:hidden">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {isKasir && (
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    aria-expanded={sidebarOpen}
                                    aria-label="Buka menu navigasi"
                                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
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
                                    <span className="text-base font-extrabold text-[#134E4A]">
                                        CleanWash
                                    </span>
                                </Link>
                            )}

                            {header && (
                                <div className="hidden sm:block">
                                    {header}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 text-xs font-bold rounded-md border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                {labelPeran}
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
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#CCFBF1]/70 border border-teal-300 text-[#134E4A] text-xs font-bold">
                            <IconCheck className="h-4 w-4 shrink-0 text-[#0D9488]" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-4 print:hidden" role="alert">
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                            <IconClose className="h-4 w-4 shrink-0 text-rose-700" />
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                <main className="flex-1 py-6 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
}
