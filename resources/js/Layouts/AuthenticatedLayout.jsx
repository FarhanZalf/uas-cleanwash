import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const displayName = user?.nama_petugas || user?.name || 'Petugas';
    const roleBadgeColor = {
        Kasir: 'bg-teal-50 text-teal-800 border-teal-200',
        Produksi: 'bg-amber-50 text-amber-800 border-amber-200',
        Antar: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    }[user?.peran] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
        <div className="min-h-screen bg-[#F6FBF9] text-slate-800 antialiased">
            {/* Top Navigation Bar */}
            <nav className="border-b border-teal-100/80 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            {/* Brand Logo */}
                            <Link href="/dashboard" className="flex items-center space-x-3 group">
                                <div className="h-10 w-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-[#134E4A] transition-colors">
                                    CW
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-extrabold text-[#134E4A] leading-tight tracking-tight">
                                        CleanWash
                                    </span>
                                    <span className="text-[11px] text-teal-700/70 font-semibold tracking-wider uppercase">
                                        Laundry Eco-Care
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Navigation Links */}
                            <div className="hidden lg:-my-px lg:ms-8 lg:flex lg:space-x-1">
                                {user?.peran === 'Kasir' && (
                                    <>
                                        <NavLink
                                            href={route('kasir.dashboard')}
                                            active={route().current('kasir.dashboard')}
                                            className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                        >
                                            Dashboard
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.pelanggan.index')}
                                            active={route().current('kasir.pelanggan.*')}
                                            className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                        >
                                            Pelanggan
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.layanan.index')}
                                            active={route().current('kasir.layanan.*')}
                                            className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                        >
                                            Jenis Layanan
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.voucher.index')}
                                            active={route().current('kasir.voucher.*')}
                                            className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                        >
                                            Voucher
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.petugas.index')}
                                            active={route().current('kasir.petugas.*')}
                                            className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                        >
                                            Petugas
                                        </NavLink>
                                    </>
                                )}

                                {user?.peran === 'Produksi' && (
                                    <NavLink
                                        href={route('produksi.dashboard')}
                                        active={route().current('produksi.dashboard')}
                                        className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                    >
                                        Papan Antrean Produksi
                                    </NavLink>
                                )}

                                {user?.peran === 'Antar' && (
                                    <NavLink
                                        href={route('antar.dashboard')}
                                        active={route().current('antar.dashboard')}
                                        className="px-3 py-2 text-xs font-bold rounded-lg transition"
                                    >
                                        Tugas Pengantaran
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* Right Profile & Badge */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center space-x-3">
                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${roleBadgeColor}`}>
                                {user?.peran}
                            </span>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-lg">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg border border-teal-200/80 bg-white px-3 py-1.5 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1]/30 transition"
                                            >
                                                <span>{displayName}</span>
                                                <svg
                                                    className="-me-0.5 ms-2 h-3.5 w-3.5 text-teal-600"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                                            ID: <span className="font-mono font-bold text-teal-800">{user?.kode_petugas}</span>
                                        </div>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-rose-600 font-semibold"
                                        >
                                            Keluar Sistem
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger Button for Mobile */}
                        <div className="-me-2 flex items-center lg:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-teal-800 hover:bg-teal-50 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' lg:hidden border-t border-teal-100 bg-white'}>
                    <div className="space-y-1 px-3 py-2">
                        {user?.peran === 'Kasir' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('kasir.dashboard')}
                                    active={route().current('kasir.dashboard')}
                                >
                                    Dashboard
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('kasir.pelanggan.index')}
                                    active={route().current('kasir.pelanggan.*')}
                                >
                                    Data Pelanggan
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('kasir.layanan.index')}
                                    active={route().current('kasir.layanan.*')}
                                >
                                    Jenis Layanan
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('kasir.voucher.index')}
                                    active={route().current('kasir.voucher.*')}
                                >
                                    Voucher Promo
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('kasir.petugas.index')}
                                    active={route().current('kasir.petugas.*')}
                                >
                                    Akun Petugas
                                </ResponsiveNavLink>
                            </>
                        )}
                        {user?.peran === 'Produksi' && (
                            <ResponsiveNavLink
                                href={route('produksi.dashboard')}
                                active={route().current('produksi.dashboard')}
                            >
                                Papan Produksi
                            </ResponsiveNavLink>
                        )}
                        {user?.peran === 'Antar' && (
                            <ResponsiveNavLink
                                href={route('antar.dashboard')}
                                active={route().current('antar.dashboard')}
                            >
                                Tugas Pengantaran
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-teal-100 pb-3 pt-3 px-4 bg-teal-50/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-slate-800">{displayName}</div>
                                <div className="text-xs text-slate-500">{user?.email}</div>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${roleBadgeColor}`}>
                                {user?.peran}
                            </span>
                        </div>
                        <div className="mt-3">
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-rose-600 font-bold">
                                Keluar Sistem
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Flash Messages (Alert Banners) */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                {flash?.success && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-medium shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-teal-600 font-bold">✓ Sukses:</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-rose-600 font-bold">✕ Peringatan:</span>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}
            </div>

            {header && (
                <header className="bg-white border-b border-teal-100/70 mt-3">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-6">{children}</main>
        </div>
    );
}
