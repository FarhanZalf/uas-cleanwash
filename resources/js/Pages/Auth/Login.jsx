import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
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

    const fillAccount = (email, password) => {
        setData((prev) => ({
            ...prev,
            email,
            password,
        }));
    };

    return (
        <GuestLayout>
            <Head title="Login Petugas" />

            <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800">Login Petugas Gerai</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan akun internal untuk mengakses modul Kasir, Produksi, atau Antar.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
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
                        className="mt-1 block w-full rounded-xl border-slate-300"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="contoh: kasir@cleanwash.local"
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
                        className="mt-1 block w-full rounded-xl border-slate-300"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs text-slate-600">Ingat sesi saya</span>
                    </label>

                    <PrimaryButton
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Masuk Sistem'}
                    </PrimaryButton>
                </div>
            </form>

            {/* Tombol Demo Akun Cepat */}
            <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Akun Cepat (Testing Multi-Role):
                </span>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => fillAccount('kasir@cleanwash.local', 'password')}
                        className="py-1.5 px-2 text-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200/60 transition"
                    >
                        👤 Kasir
                    </button>
                    <button
                        type="button"
                        onClick={() => fillAccount('produksi@cleanwash.local', 'password')}
                        className="py-1.5 px-2 text-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200/60 transition"
                    >
                        ⚙️ Produksi
                    </button>
                    <button
                        type="button"
                        onClick={() => fillAccount('antar@cleanwash.local', 'password')}
                        className="py-1.5 px-2 text-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200/60 transition"
                    >
                        🛵 Antar
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}
