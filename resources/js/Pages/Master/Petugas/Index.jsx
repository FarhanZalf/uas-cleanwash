import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const PILIHAN_PERAN = [
    { value: 'Kasir', label: 'Kasir / Admin' },
    { value: 'Produksi', label: 'Petugas Laundry' },
    { value: 'Antar', label: 'Kurir' },
];

export default function PetugasIndex({ petugas, filters }) {
    const currentUser = usePage().props.auth.user;
    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    const createForm = useForm({
        kode_petugas: '',
        nama_petugas: '',
        email: '',
        password: '',
        peran: 'Kasir',
    });

    const editForm = useForm({
        kode_petugas: '',
        nama_petugas: '',
        email: '',
        password: '',
        peran: 'Kasir',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kasir.petugas.index'), { search }, { preserveState: true });
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('kasir.petugas.index'), {}, { preserveState: true });
    };

    const handleInlineRoleChange = (item, peranBaru) => {
        if (!peranBaru || peranBaru === item.peran) return;
        router.put(
            route('kasir.petugas.update', item.id),
            {
                kode_petugas: item.kode_petugas,
                nama_petugas: item.nama_petugas,
                email: item.email,
                peran: peranBaru,
            },
            { preserveScroll: true },
        );
    };

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('kasir.petugas.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            kode_petugas: item.kode_petugas,
            nama_petugas: item.nama_petugas,
            email: item.email,
            password: '',
            peran: item.peran,
        });
        editForm.clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('kasir.petugas.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const submitDelete = () => {
        if (!deletingItem) return;
        router.delete(route('kasir.petugas.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg font-bold text-[#134E4A]">Akun Petugas</h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex min-h-[40px] items-center justify-center px-4 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg transition"
                    >
                        + Tambah Petugas
                    </button>
                </div>
            }
        >
            <Head title="Akun Petugas" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-teal-200/80 flex items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode, peran, atau email..."
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] px-3.5 py-2"
                        />
                        <button
                            type="submit"
                            className="min-h-[38px] px-4 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg transition"
                        >
                            Cari
                        </button>
                        {filters?.search && (
                            <button
                                type="button"
                                onClick={handleResetSearch}
                                className="min-h-[38px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                            >
                                Reset
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-xl border border-teal-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-[#F6FBF9] text-[11px] uppercase font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th className="px-5 py-3.5">Kode</th>
                                    <th className="px-5 py-3.5">Jabatan / Nama</th>
                                    <th className="px-5 py-3.5">Email</th>
                                    <th className="px-5 py-3.5">Status Peran</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-100/70">
                                {petugas?.data && petugas.data.length > 0 ? (
                                    petugas.data.map((item) => {
                                        const isCurrent = item.id === currentUser?.id;

                                        return (
                                            <tr key={item.id} className="hover:bg-[#F6FBF9] transition">
                                                <td className="px-5 py-3.5 font-mono font-bold text-[#134E4A]">
                                                    {item.kode_petugas}
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800">
                                                    {item.nama_petugas}
                                                </td>
                                                <td className="px-5 py-3.5 font-medium text-slate-600">{item.email}</td>
                                                <td className="px-5 py-3.5">
                                                    <select
                                                        aria-label={`Ubah peran ${item.nama_petugas}`}
                                                        value={item.peran}
                                                        onChange={(e) => handleInlineRoleChange(item, e.target.value)}
                                                        className="rounded-lg border border-teal-200 bg-[#F6FBF9] px-2.5 py-1.5 text-xs font-bold text-[#134E4A] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                                    >
                                                        {PILIHAN_PERAN.map((p) => (
                                                            <option key={p.value} value={p.value}>
                                                                {p.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="px-3 py-1.5 text-xs font-bold text-[#134E4A] bg-[#CCFBF1] hover:bg-teal-200 rounded-lg transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingItem(item)}
                                                        disabled={isCurrent}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                                            isCurrent
                                                                ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                                                                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                                            Data petugas tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Petugas */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#134E4A] border-b border-teal-100 pb-3">
                        Tambah Petugas
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#134E4A] mb-1">Kode</label>
                            <input
                                type="text"
                                value={createForm.data.kode_petugas}
                                onChange={(e) => createForm.setData('kode_petugas', e.target.value.toUpperCase())}
                                placeholder="PTG-004"
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold uppercase"
                                required
                            />
                            {createForm.errors.kode_petugas && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.kode_petugas}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#134E4A] mb-1">Peran</label>
                            <select
                                value={createForm.data.peran}
                                onChange={(e) => createForm.setData('peran', e.target.value)}
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                {PILIHAN_PERAN.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#134E4A] mb-1">Jabatan / Nama</label>
                        <input
                            type="text"
                            value={createForm.data.nama_petugas}
                            onChange={(e) => createForm.setData('nama_petugas', e.target.value)}
                            placeholder="Petugas Laundry"
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.nama_petugas && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.nama_petugas}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#134E4A] mb-1">Email</label>
                        <input
                            type="email"
                            value={createForm.data.email}
                            onChange={(e) => createForm.setData('email', e.target.value)}
                            placeholder="petugas@cleanwash.local"
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.email && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#134E4A] mb-1">Kata Sandi</label>
                        <input
                            type="password"
                            value={createForm.data.password}
                            onChange={(e) => createForm.setData('password', e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.password && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.password}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-teal-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="px-4 py-2 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg"
                        >
                            {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ubah Petugas */}
            <Modal show={!!editingItem} onClose={() => setEditingItem(null)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#134E4A] border-b border-teal-100 pb-3">
                        Edit Petugas ({editingItem?.kode_petugas})
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#134E4A] mb-1">Kode</label>
                            <input
                                type="text"
                                value={editForm.data.kode_petugas}
                                onChange={(e) => editForm.setData('kode_petugas', e.target.value.toUpperCase())}
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold uppercase"
                                required
                            />
                            {editForm.errors.kode_petugas && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.kode_petugas}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#134E4A] mb-1">Peran</label>
                            <select
                                value={editForm.data.peran}
                                onChange={(e) => editForm.setData('peran', e.target.value)}
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                {PILIHAN_PERAN.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#134E4A] mb-1">Jabatan / Nama</label>
                        <input
                            type="text"
                            value={editForm.data.nama_petugas}
                            onChange={(e) => editForm.setData('nama_petugas', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.nama_petugas && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.nama_petugas}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#134E4A] mb-1">Email</label>
                        <input
                            type="email"
                            value={editForm.data.email}
                            onChange={(e) => editForm.setData('email', e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.email && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#134E4A] mb-1">Kata Sandi Baru (Opsional)</label>
                        <input
                            type="password"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            placeholder="Kosongkan jika tidak diubah"
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                        />
                        {editForm.errors.password && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.password}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-teal-100">
                        <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-4 py-2 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg"
                        >
                            {editForm.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal show={!!deletingItem} onClose={() => setDeletingItem(null)} maxWidth="sm">
                <div className="p-6 text-center space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Hapus Akun Petugas?</h3>
                    <p className="text-xs text-slate-600">
                        Hapus <strong>{deletingItem?.nama_petugas}</strong> ({deletingItem?.kode_petugas})?
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setDeletingItem(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={submitDelete}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
