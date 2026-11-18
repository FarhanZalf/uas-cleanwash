import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 sm:p-6">
            <div className="w-full max-w-md text-center mb-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-2xl shadow-lg shadow-blue-500/30 mb-3">
                    CW
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">CleanWash Laundry</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Sistem Informasi Operasional & Manajemen Laundry</p>
            </div>

            <div className="w-full overflow-hidden bg-white px-6 py-6 shadow-xl shadow-slate-200/50 sm:max-w-md rounded-2xl border border-slate-200">
                {children}
            </div>

            <div className="w-full max-w-md mt-6 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} CleanWash System &bull; UAS Sistem Informasi
            </div>
        </div>
    );
}
