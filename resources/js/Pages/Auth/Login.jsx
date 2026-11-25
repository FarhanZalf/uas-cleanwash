import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { IconReceipt, IconTruck, IconWasher } from '@/Components/LineIcons';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk Petugas" />

            <div className="mb-5 border-b border-teal-100 pb-4">
                <h2 className="text-base font-bold text-[#134E4A]">Masuk Petugas Gerai</h2>
                <p className="mt-0.5 text-xs text-slate-600">
                    Gunakan akun internal untuk membuka modul Kasir, Produksi, atau Kurir Antar.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg border border-teal-200 bg-[#CCFBF1]/60 p-3 text-xs font-semibold text-[#134E4A]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Petugas" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="kasir@cleanwash.local"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label htmlFor="remember-me" className="flex min-h-[44px] items-center">
                        <Checkbox
                            id="remember-me"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-medium text-slate-700">Ingat sesi saya</span>
                    </label>

                    <PrimaryButton disabled={processing}>
                        {processing ? 'Memproses...' : 'Masuk Sistem'}
                    </PrimaryButton>
                </div>
            </form>

            {/* Akses Demo 1-Klik per Peran */}
            <div className="mt-6 border-t border-teal-100 pt-5">
                <span className="mb-2.5 block text-xs font-bold text-[#134E4A]">
                    Akses Demo Langsung (1 Tab 1 Peran):
                </span>
                <div className="grid grid-cols-3 gap-2">
                    <a
                        href={route('demo-login', 'Kasir')}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-2 text-xs font-bold text-[#134E4A] transition hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                        <IconReceipt className="h-3.5 w-3.5 text-[#0D9488]" />
                        <span>Kasir</span>
                    </a>
                    <a
                        href={route('demo-login', 'Produksi')}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-2 text-xs font-bold text-[#134E4A] transition hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                        <IconWasher className="h-3.5 w-3.5 text-[#0D9488]" />
                        <span>Produksi</span>
                    </a>
                    <a
                        href={route('demo-login', 'Antar')}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-[#F6FBF9] px-2 text-xs font-bold text-[#134E4A] transition hover:bg-[#CCFBF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                        <IconTruck className="h-3.5 w-3.5 text-[#0D9488]" />
                        <span>Kurir</span>
                    </a>
                </div>
            </div>
        </GuestLayout>
    );
}
