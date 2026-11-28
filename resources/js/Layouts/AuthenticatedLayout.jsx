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
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const LABEL_PERAN = {
    Kasir: 'Kasir / Admin',
    Produksi: 'Petugas Laundry',
    Antar: 'Kurir',
};

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const { auth, flash, countPerTahap, filters, counts, activeTab } = page.props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isReloadingRef = useRef(false);

    const peran = user?.peran || 'Kasir';
    const isKasir = peran === 'Kasir';
    const isProduksi = peran === 'Produksi';
    const isAntar = peran === 'Antar';
    const labelPeran = LABEL_PERAN[peran] || peran || 'Petugas';

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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const canSafelyReload = () => {
            if (document.visibilityState !== 'visible') return false;
            if (isReloadingRef.current) return false;
            if (route().current('kasir.transaksi.create')) return false;
            if (document.querySelector('[role="dialog"], .fixed.inset-0.z-50')) return false;
            const activeTag = document.activeElement?.tagName;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return false;
            return true;
        };

        const triggerSilentReload = () => {
            if (!canSafelyReload()) return;
            isReloadingRef.current = true;
            router.reload({
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    isReloadingRef.current = false;
                },
            });
        };

        let channel = null;
        if ('BroadcastChannel' in window) {
            channel = new BroadcastChannel('cleanwash_realtime_sync');
            channel.onmessage = (event) => {
                if (event.data?.type === 'SYNC') {
                    triggerSilentReload();
                }
            };
        }

        const intervalId = window.setInterval(triggerSilentReload, 5000);

        return () => {
            window.clearInterval(intervalId);
            if (channel) {
                channel.close();
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
        if (!flash?.success) return;

        const channel = new BroadcastChannel('cleanwash_realtime_sync');
        channel.postMessage({ type: 'SYNC', timestamp: Date.now() });
        channel.close();
    }, [flash?.success]);

    // Menu Sidebar Kasir / Admin
    const menuOperasional = [
        { label: 'Dashboard', href: route('kasir.dashboard'), active: route().current('kasir.dashboard'), Icon: IconDashboard },
        { label: 'Transaksi Laundry', href: route('kasir.transaksi.index'), active: route().current('kasir.transaksi.*'), Icon: IconReceipt },
        { label: 'Pengantaran Kurir', href: route('kasir.pengantaran.index'), active: route().current('kasir.pengantaran.*'), Icon: IconTruck },
        { label: 'Laporan Keuangan', href: route('kasir.laporan.index'), active: route().current('kasir.laporan.*'), Icon: IconReport },
    ];

    const menuMaster = [
        { label: 'Pelanggan', href: route('kasir.pelanggan.index'), active: route().current('kasir.pelanggan.*'), Icon: IconUsers },
        { label: 'Jenis Layanan', href: route('kasir.layanan.index'), active: route().current('kasir.layanan.*'), Icon: IconWasher },
        { label: 'Voucher', href: route('kasir.voucher.index'), active: route().current('kasir.voucher.*'), Icon: IconTicket },
        { label: 'Petugas', href: route('kasir.petugas.index'), active: route().current('kasir.petugas.*'), Icon: IconShield },
    ];

    // Menu Sidebar Petugas Laundry (Produksi)
    const tahapAktif = filters?.tahap || '';
    const prioritasAktif = filters?.prioritas || '';
    const totalAntreanAktif =
        (Number(countPerTahap?.Diterima) || 0) +
        (Number(countPerTahap?.Dicuci) || 0) +
        (Number(countPerTahap?.Dikeringkan) || 0) +
        (Number(countPerTahap?.Disetrika) || 0);

    const menuProduksiTahap = [
        {
            label: 'Semua Antrean',
            href: route('produksi.dashboard', { prioritas: prioritasAktif || undefined }),
            active: route().current('produksi.dashboard') && tahapAktif === '',
            badge: totalAntreanAktif,
            Icon: IconDashboard,
        },
        {
            label: 'Tahap Diterima',
            href: route('produksi.dashboard', { tahap: 'Diterima', prioritas: prioritasAktif || undefined }),
            active: tahapAktif === 'Diterima',
            badge: countPerTahap?.Diterima ?? 0,
            Icon: IconReceipt,
        },
        {
            label: 'Tahap Dicuci',
            href: route('produksi.dashboard', { tahap: 'Dicuci', prioritas: prioritasAktif || undefined }),
            active: tahapAktif === 'Dicuci',
            badge: countPerTahap?.Dicuci ?? 0,
            Icon: IconWasher,
        },
        {
            label: 'Tahap Dikeringkan',
            href: route('produksi.dashboard', { tahap: 'Dikeringkan', prioritas: prioritasAktif || undefined }),
            active: tahapAktif === 'Dikeringkan',
            badge: countPerTahap?.Dikeringkan ?? 0,
            Icon: IconWasher,
        },
        {
            label: 'Tahap Disetrika',
            href: route('produksi.dashboard', { tahap: 'Disetrika', prioritas: prioritasAktif || undefined }),
            active: tahapAktif === 'Disetrika',
            badge: countPerTahap?.Disetrika ?? 0,
            Icon: IconWasher,
        },
        {
            label: 'Selesai Proses',
            href: route('produksi.dashboard', { tahap: 'Selesai', prioritas: prioritasAktif || undefined }),
            active: tahapAktif === 'Selesai',
            badge: countPerTahap?.Selesai ?? 0,
            Icon: IconCheck,
        },
    ];

    const menuProduksiPrioritas = [
        {
            label: 'Semua Prioritas',
            href: route('produksi.dashboard', { tahap: tahapAktif || undefined }),
            active: prioritasAktif === '',
            Icon: IconTicket,
        },
        {
            label: 'Prioritas Express',
            href: route('produksi.dashboard', { tahap: tahapAktif || undefined, prioritas: 'Express' }),
            active: prioritasAktif === 'Express',
            Icon: IconTicket,
        },
        {
            label: 'Prioritas Reguler',
            href: route('produksi.dashboard', { tahap: tahapAktif || undefined, prioritas: 'Reguler' }),
            active: prioritasAktif === 'Reguler',
            Icon: IconTicket,
        },
    ];

    // Menu Sidebar Kurir (Antar)
    const tabKurirAktif = activeTab || 'semua';
    const menuKurir = [
        {
            label: 'Semua Pengantaran',
            href: route('antar.dashboard', { tab: 'semua' }),
            active: tabKurirAktif === 'semua',
            badge: counts?.total ?? 0,
            Icon: IconDashboard,
        },
        {
            label: 'Jadwal Hari Ini',
            href: route('antar.dashboard', { tab: 'hari_ini' }),
            active: tabKurirAktif === 'hari_ini',
            badge: counts?.hari_ini ?? 0,
            Icon: IconReceipt,
        },
        {
            label: 'Sedang Diantar',
            href: route('antar.dashboard', { tab: 'aktif' }),
            active: tabKurirAktif === 'aktif',
            badge: counts?.aktif ?? 0,
            Icon: IconTruck,
        },
        {
            label: 'Sudah Diterima',
            href: route('antar.dashboard', { tab: 'selesai' }),
            active: tabKurirAktif === 'selesai',
            badge: counts?.diterima ?? 0,
            Icon: IconCheck,
        },
        {
            label: 'Gagal Antar',
            href: route('antar.dashboard', { tab: 'gagal' }),
            active: tabKurirAktif === 'gagal',
            badge: counts?.gagal ?? 0,
            Icon: IconReport,
        },
    ];

    const renderNavGroup = (groupTitle, items) => (
        <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-teal-200/75">
                {groupTitle}
            </span>
            <ul className="mt-1.5 space-y-1">
                {items.map((item) => {
                    const ItemIcon = item.Icon;
                    const hasBadge = item.badge !== undefined && item.badge !== null;
                    return (
                        <li key={item.label}>
                            <Link
                                href={item.href}
                                prefetch
                                onClick={() => setSidebarOpen(false)}
                                aria-current={item.active ? 'page' : undefined}
                                className={`flex min-h-[42px] items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFBF1] ${
                                    item.active
                                        ? 'bg-[#CCFBF1] text-[#134E4A]'
                                        : 'text-teal-50/90 hover:bg-[#0D9488]/40 hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <ItemIcon className={`h-4 w-4 shrink-0 ${item.active ? 'text-[#134E4A]' : 'text-[#CCFBF1]'}`} />
                                    <span className="truncate">{item.label}</span>
                                </span>
                                {hasBadge && (
                                    <span
                                        className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
                                            item.active
                                                ? 'bg-[#134E4A] text-[#CCFBF1]'
                                                : 'bg-[#0f3f3c] text-teal-100 border border-teal-700/80'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    const homeHref = isKasir
        ? route('kasir.dashboard')
        : isProduksi
          ? route('produksi.dashboard')
          : route('antar.dashboard');

    return (
        <div className="min-h-screen bg-white text-slate-800 antialiased flex flex-col lg:flex-row">
            {/* Backdrop Mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden print:hidden"
                />
            )}

            {/* Sidebar Kiri Hijau untuk Semua Peran (Kasir / Admin, Petugas Laundry, Kurir) */}
            <aside
                aria-label={`Navigasi utama ${labelPeran}`}
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#134E4A] text-white border-r border-teal-900 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 print:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="h-16 px-5 border-b border-teal-800/80 flex items-center justify-between">
                        <Link
                            href={homeHref}
                            className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFBF1]"
                        >
                            <div className="h-9 w-9 rounded-lg bg-[#CCFBF1] flex items-center justify-center text-[#134E4A]">
                                <IconWasher className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-base font-extrabold text-white tracking-tight leading-none">
                                    CleanWash
                                </span>
                                <span className="block text-[11px] font-semibold text-[#CCFBF1] mt-1">
                                    {labelPeran}
                                </span>
                            </div>
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

                    {/* Navigasi Sesuai Peran */}
                    <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]" aria-label={`Menu ${labelPeran}`}>
                        {isKasir && (
                            <>
                                {renderNavGroup('Operasional', menuOperasional)}
                                {renderNavGroup('Data Master', menuMaster)}
                            </>
                        )}

                        {isProduksi && (
                            <>
                                {renderNavGroup('Tahapan Cucian', menuProduksiTahap)}
                                {renderNavGroup('Filter Prioritas', menuProduksiPrioritas)}
                            </>
                        )}

                        {isAntar && (
                            <>
                                {renderNavGroup('Tugas Pengantaran', menuKurir)}
                            </>
                        )}
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

            {/* Konten Halaman Putih */}
            <div className="flex-1 flex flex-col min-w-0 bg-white lg:pl-64">
                <header className="sticky top-0 z-30 bg-white border-b border-teal-100 print:hidden">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
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

                            {header && (
                                <div className="hidden sm:block min-w-0 flex-1">
                                    {header}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md border border-teal-200 bg-[#F6FBF9] text-[#0D9488]"
                                title="Sinkronisasi otomatis lintas peran aktif"
                            >
                                <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
                                <span>Realtime</span>
                            </span>
                            <span className="px-3 py-1 text-xs font-bold rounded-md border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                {labelPeran}
                            </span>
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
