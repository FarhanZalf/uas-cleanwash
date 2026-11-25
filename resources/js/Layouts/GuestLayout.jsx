import { IconWasher } from '@/Components/LineIcons';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6FBF9] px-4 py-8 text-[#134E4A] sm:px-6">
            <header className="mb-6 w-full max-w-md text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                    <IconWasher className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#134E4A]">CleanWash</h1>
                <p className="mt-1 text-xs text-slate-600">
                    Sistem operasional kasir, lantai produksi, dan pengantaran laundry
                </p>
            </header>

            <main className="w-full overflow-hidden rounded-xl border border-teal-200/80 bg-white px-6 py-6 sm:max-w-md">
                {children}
            </main>

            <footer className="mt-6 w-full max-w-md text-center text-xs text-slate-600">
                CleanWash Sistem Informasi Operasional Laundry
            </footer>
        </div>
    );
}
