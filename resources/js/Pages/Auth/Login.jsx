import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { IconCheck, IconReceipt, IconTruck, IconWasher } from '@/Components/LineIcons';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const DAFTAR_AKUN_PERAN = [
    {
        label: 'Kasir / Admin',
        email: 'kasir@cleanwash.local',
        password: 'password',
        role: 'Kasir',
        Icon: IconReceipt,
    },
    {
        label: 'Petugas Laundry',
        email: 'produksi@cleanwash.local',
        password: 'password',
        role: 'Produksi',
        Icon: IconWasher,
    },
    {
        label: 'Kurir',
        email: 'antar@cleanwash.local',
        password: 'password',
        role: 'Antar',
        Icon: IconTruck,
    },
];

export default function Login({ status }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedRoleLabel, setSelectedRoleLabel] = useState('');
    const wrapperRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        role: '',
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const pilihAkunPeran = (akun) => {
        setSelectedRoleLabel(akun.label);
        setData((prev) => ({
            ...prev,
            email: akun.email,
            password: akun.password,
            role: akun.role,
        }));
        setDropdownOpen(false);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk Sistem" />

            <div className="mb-6">
                <h2 className="text-xl font-bold text-[#134E4A]">Masuk Sistem</h2>
            </div>

            {status && (
                <div className="mb-4 rounded-lg border border-teal-200 bg-[#CCFBF1]/60 p-3 text-xs font-semibold text-[#134E4A]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div ref={wrapperRef} className="relative">
                    <InputLabel htmlFor="email" value="Peran / Email Akun" />
                    <div className="relative mt-1">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="off"
                            placeholder="Klik untuk memilih peran akun..."
                            onFocus={() => setDropdownOpen(true)}
                            onClick={() => setDropdownOpen(true)}
                            onChange={(e) => {
                                const val = e.target.value;
                                const match = DAFTAR_AKUN_PERAN.find((a) => a.email === val);
                                setSelectedRoleLabel(match ? match.label : '');
                                setData((prev) => ({
                                    ...prev,
                                    email: val,
                                    role: match ? match.role : '',
                                }));
                            }}
                            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-[#134E4A] focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                        />
                        <button
                            type="button"
                            aria-label="Tampilkan daftar peran"
                            aria-expanded={dropdownOpen}
                            onClick={() => setDropdownOpen((open) => !open)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-[#134E4A]"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {selectedRoleLabel && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-[#CCFBF1]/70 px-2.5 py-1 text-xs font-bold text-[#134E4A]">
                            <IconCheck className="h-3.5 w-3.5 text-[#0D9488]" />
                            <span>Dipilih: {selectedRoleLabel}</span>
                        </div>
                    )}

                    {dropdownOpen && (
                        <ul
                            role="listbox"
                            aria-label="Daftar peran petugas"
                            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-teal-200 bg-white shadow-lg divide-y divide-teal-50"
                        >
                            {DAFTAR_AKUN_PERAN.map((akun) => {
                                const ItemIcon = akun.Icon;
                                const isSelected = data.email === akun.email;
                                return (
                                    <li key={akun.role} role="option" aria-selected={isSelected}>
                                        <button
                                            type="button"
                                            onClick={() => pilihAkunPeran(akun)}
                                            className={`flex w-full items-center justify-between px-3.5 py-3 text-left text-xs transition ${
                                                isSelected
                                                    ? 'bg-[#CCFBF1]/70 font-bold text-[#134E4A]'
                                                    : 'bg-white text-slate-700 hover:bg-[#F6FBF9]'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-200 bg-[#F6FBF9] text-[#0D9488]">
                                                    <ItemIcon className="h-4 w-4" />
                                                </span>
                                                <span>
                                                    <span className="block font-bold text-[#134E4A]">{akun.label}</span>
                                                    <span className="block text-[11px] text-slate-500">{akun.email}</span>
                                                </span>
                                            </span>
                                            {isSelected && <IconCheck className="h-4 w-4 text-[#0D9488]" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

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
                        placeholder="Kata sandi"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label htmlFor="remember-me" className="flex min-h-[44px] items-center">
                        <Checkbox
                            id="remember-me"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-medium text-slate-700">Ingat sesi</span>
                    </label>

                    <PrimaryButton disabled={processing} className="px-6">
                        {processing ? 'Memproses...' : 'Masuk'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
