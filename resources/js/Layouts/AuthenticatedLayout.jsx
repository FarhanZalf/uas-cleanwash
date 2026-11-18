import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const displayName = user?.nama_petugas || user?.name || 'Petugas';
    const roleBadgeColor = {
        Kasir: 'bg-blue-100 text-blue-800 border-blue-200',
        Produksi: 'bg-amber-100 text-amber-800 border-amber-200',
        Antar: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    }[user?.peran] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                                    CW
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-800 leading-tight">CleanWash</span>
                                    <span className="text-xs text-slate-500 font-medium">Sistem Laundry</span>
                                </div>
                            </Link>

                            <div className="hidden space-x-6 sm:-my-px sm:ms-10 sm:flex">
                                {user?.peran === 'Kasir' && (
                                    <>
                                        <NavLink
                                            href={route('kasir.dashboard')}
                                            active={route().current('kasir.dashboard')}
                                        >
                                            Dashboard Kasir
                                        </NavLink>
                                    </>
                                )}

                                {user?.peran === 'Produksi' && (
                                    <NavLink
                                        href={route('produksi.dashboard')}
                                        active={route().current('produksi.dashboard')}
                                    >
                                        Papan Produksi
                                    </NavLink>
                                )}

                                {user?.peran === 'Antar' && (
                                    <NavLink
                                        href={route('antar.dashboard')}
                                        active={route().current('antar.dashboard')}
                                    >
                                        Tugas Pengantaran
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center space-x-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${roleBadgeColor}`}>
                                {user?.peran}
                            </span>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none transition"
                                            >
                                                <span>{displayName}</span>
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4 text-slate-400"
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
                                            Kode: <span className="font-semibold text-slate-700">{user?.kode_petugas}</span>
                                        </div>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-red-600 font-medium"
                                        >
                                            Keluar Sistem
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger button for mobile */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none"
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

                {/* Mobile Navigation Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-200 bg-white'}>
                    <div className="space-y-1 pb-3 pt-2">
                        {user?.peran === 'Kasir' && (
                            <ResponsiveNavLink
                                href={route('kasir.dashboard')}
                                active={route().current('kasir.dashboard')}
                            >
                                Dashboard Kasir
                            </ResponsiveNavLink>
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

                    <div className="border-t border-slate-200 pb-3 pt-4 px-4 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-slate-800">{displayName}</div>
                                <div className="text-xs text-slate-500">{user?.email}</div>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${roleBadgeColor}`}>
                                {user?.peran}
                            </span>
                        </div>

                        <div className="mt-3">
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-red-600 font-medium">
                                Keluar Sistem
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-slate-200">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-6">{children}</main>
        </div>
    );
}
