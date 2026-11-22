import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PetugasIndex({ petugas, filters, stats }) {
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

    const roleBadgeColor = {
        Kasir: 'bg-teal-50 text-teal-800 border-teal-200',
        Produksi: 'bg-amber-50 text-amber-800 border-amber-200',
        Antar: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kasir.petugas.index'), { search }, { preserveState: true });
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('kasir.petugas.index'), {}, { preserveState: true });
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-[#134E4A] tracking-tight">
                            Manajemen Akun Petugas Laundry
                        </h2>
                        <p className="text-xs text-teal-800/70 mt-0.5">
                            Kelola akun internal untuk hak akses peran Kasir (Admin), Tim Produksi, dan Petugas Antar.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                        + Tambah Petugas
                    </button>
                </div>
            }
        >
            <Head title="Master Akun Petugas" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Akun Petugas</span>
                        <div className="text-xl font-black text-slate-800 mt-1">{stats?.total || 0}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Peran Kasir / Admin</span>
                        <div className="text-xl font-black text-teal-700 mt-1">{stats?.kasir || 0}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Peran Produksi</span>
                        <div className="text-xl font-black text-amber-700 mt-1">{stats?.produksi || 0}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Peran Antar (Kurir)</span>
                        <div className="text-xl font-black text-emerald-700 mt-1">{stats?.antar || 0}</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs flex items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama, kode petugas, email, atau peran..."
                            className="w-full text-xs rounded-xl border-slate-200 focus:border-[#0D9488] focus:ring-[#0D9488] px-3.5 py-2"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-xl transition"
                        >
                            Cari
                        </button>
                        {filters?.search && (
                            <button
                                type="button"
                                onClick={handleResetSearch}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Reset
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-[#F6FBF9] text-[11px] uppercase font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th className="px-5 py-3.5">Kode</th>
                                    <th className="px-5 py-3.5">Nama Petugas</th>
                                    <th className="px-5 py-3.5">Email Login</th>
                                    <th className="px-5 py-3.5">Peran / Hak Akses</th>
                                    <th className="px-5 py-3.5 text-center">Aktivitas Sistem</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-50">
                                {petugas?.data && petugas.data.length > 0 ? (
                                    petugas.data.map((item) => {
                                        const isCurrent = item.id === currentUser?.id;

                                        return (
                                            <tr key={item.id} className="hover:bg-teal-50/30 transition">
                                                <td className="px-5 py-3.5 font-mono font-bold text-teal-700">
                                                    {item.kode_petugas}
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{item.nama_petugas}</span>
                                                        {isCurrent && (
                                                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-100 text-[#134E4A] font-extrabold">
                                                                (Anda)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 font-medium text-slate-600">{item.email}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadgeColor[item.peran] || ''}`}>
                                                        {item.peran}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                                                        {item.peran === 'Kasir' && `${item.transaksi_laundry_count || 0} nota dibuat`}
                                                        {item.peran === 'Produksi' && `${item.riwayat_status_proses_count || 0} proses log`}
                                                        {item.peran === 'Antar' && `${item.pengantaran_count || 0} kloter antar`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                                                    >
                                                        Ubah
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingItem(item)}
                                                        disabled={isCurrent}
                                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                                            isCurrent
                                                                ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                                                                : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
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
                                        <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                                            Tidak ada data petugas yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {petugas?.links && petugas.links.length > 3 && (
                        <div className="p-4 border-t border-teal-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {petugas.from || 0} - {petugas.to || 0} dari {petugas.total} petugas
                            </span>
                            <div className="flex gap-1">
                                {petugas.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                                            link.active
                                                ? 'bg-[#0D9488] text-white'
                                                : link.url
                                                ? 'bg-slate-50 hover:bg-teal-50 text-slate-700 border border-slate-200'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Petugas */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Tambah Akun Petugas Baru</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Daftarkan akun staf operasional gerai.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kode Petugas</label>
                            <input
                                type="text"
                                value={createForm.data.kode_petugas}
                                onChange={(e) => createForm.setData('kode_petugas', e.target.value.toUpperCase())}
                                placeholder="Contoh: PTG-004"
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold uppercase"
                                required
                            />
                            {createForm.errors.kode_petugas && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.kode_petugas}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Modul</label>
                            <select
                                value={createForm.data.peran}
                                onChange={(e) => createForm.setData('peran', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                <option value="Kasir">Kasir (Admin)</option>
                                <option value="Produksi">Tim Produksi</option>
                                <option value="Antar">Petugas Antar (Kurir)</option>
                            </select>
                            {createForm.errors.peran && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.peran}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Petugas</label>
                        <input
                            type="text"
                            value={createForm.data.nama_petugas}
                            onChange={(e) => createForm.setData('nama_petugas', e.target.value)}
                            placeholder="Contoh: Rizky Kurniawan"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.nama_petugas && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.nama_petugas}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Login</label>
                        <input
                            type="email"
                            value={createForm.data.email}
                            onChange={(e) => createForm.setData('email', e.target.value)}
                            placeholder="Contoh: staf@cleanwash.local"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.email && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
                        <input
                            type="password"
                            value={createForm.data.password}
                            onChange={(e) => createForm.setData('password', e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.password && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.password}</p>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="px-5 py-2 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-xl transition"
                        >
                            {createForm.processing ? 'Menyimpan...' : 'Simpan Petugas'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ubah Petugas */}
            <Modal show={Boolean(editingItem)} onClose={() => setEditingItem(null)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Ubah Akun Petugas</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Perbarui profil atau kata sandi petugas.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kode Petugas</label>
                            <input
                                type="text"
                                value={editForm.data.kode_petugas}
                                onChange={(e) => editForm.setData('kode_petugas', e.target.value.toUpperCase())}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold uppercase"
                                required
                            />
                            {editForm.errors.kode_petugas && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.kode_petugas}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Modul</label>
                            <select
                                value={editForm.data.peran}
                                onChange={(e) => editForm.setData('peran', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                <option value="Kasir">Kasir (Admin)</option>
                                <option value="Produksi">Tim Produksi</option>
                                <option value="Antar">Petugas Antar (Kurir)</option>
                            </select>
                            {editForm.errors.peran && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.peran}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Petugas</label>
                        <input
                            type="text"
                            value={editForm.data.nama_petugas}
                            onChange={(e) => editForm.setData('nama_petugas', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.nama_petugas && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.nama_petugas}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Login</label>
                        <input
                            type="email"
                            value={editForm.data.email}
                            onChange={(e) => editForm.setData('email', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.email && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Ganti Kata Sandi (Kosongkan jika tidak diubah)
                        </label>
                        <input
                            type="password"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            placeholder="Biarkan kosong jika tetap menggunakan kata sandi lama"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                        />
                        {editForm.errors.password && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.password}</p>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-5 py-2 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-xl transition"
                        >
                            {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal show={Boolean(deletingItem)} onClose={() => setDeletingItem(null)} maxWidth="sm">
                <div className="p-6 space-y-4 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
                        ⚠️
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Hapus Akun Petugas?</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Anda akan menghapus akun petugas <strong className="text-slate-700">{deletingItem?.nama_petugas}</strong> ({deletingItem?.kode_petugas}).
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setDeletingItem(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={submitDelete}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
