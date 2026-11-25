import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PelangganIndex({ pelanggan, filters, nextKode }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    // Form Tambah Pelanggan
    const createForm = useForm({
        kode_pelanggan: nextKode,
        nama: '',
        no_telepon: '',
        alamat: '',
        hak_bayar_belakangan: false,
    });

    // Form Edit Pelanggan
    const editForm = useForm({
        kode_pelanggan: '',
        nama: '',
        no_telepon: '',
        alamat: '',
        hak_bayar_belakangan: false,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kasir.pelanggan.index'), { search }, { preserveState: true });
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('kasir.pelanggan.index'), {}, { preserveState: true });
    };

    const openCreateModal = () => {
        createForm.reset();
        createForm.setData('kode_pelanggan', nextKode);
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('kasir.pelanggan.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            kode_pelanggan: item.kode_pelanggan,
            nama: item.nama,
            no_telepon: item.no_telepon,
            alamat: item.alamat || '',
            hak_bayar_belakangan: Boolean(item.hak_bayar_belakangan),
        });
        editForm.clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('kasir.pelanggan.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const submitDelete = () => {
        if (!deletingItem) return;
        router.delete(route('kasir.pelanggan.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg font-bold text-[#134E4A]">
                        Pelanggan
                    </h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex min-h-[40px] items-center justify-center px-4 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg transition"
                    >
                        + Tambah Pelanggan
                    </button>
                </div>
            }
        >
            <Head title="Master Pelanggan" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama, kode, atau nomor HP/WA..."
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
                    <div className="text-xs font-semibold text-teal-900 bg-[#CCFBF1]/50 px-3 py-1.5 rounded-lg border border-teal-200/50">
                        Total: {pelanggan?.total || 0} Pelanggan
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-[#F6FBF9] text-[11px] uppercase font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th className="px-5 py-3.5">Kode</th>
                                    <th className="px-5 py-3.5">Nama Lengkap</th>
                                    <th className="px-5 py-3.5">No. Telepon / WA</th>
                                    <th className="px-5 py-3.5">Alamat</th>
                                    <th className="px-5 py-3.5">Fasilitas Tempo</th>
                                    <th className="px-5 py-3.5 text-center">Riwayat</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-50">
                                {pelanggan?.data && pelanggan.data.length > 0 ? (
                                    pelanggan.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-teal-50/30 transition">
                                            <td className="px-5 py-3.5 font-mono font-bold text-teal-700">{item.kode_pelanggan}</td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">{item.nama}</td>
                                            <td className="px-5 py-3.5 font-medium text-slate-600">{item.no_telepon}</td>
                                            <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate" title={item.alamat}>
                                                {item.alamat || '-'}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {item.hak_bayar_belakangan ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#CCFBF1] text-[#134E4A] border border-teal-200">
                                                        Diizinkan Tempo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                        Wajib Lunas
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-slate-100">
                                                    {item.transaksi_laundry_count || 0} nota
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
                                                    className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                                            Tidak ada data pelanggan yang sesuai dengan pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pelanggan?.links && pelanggan.links.length > 3 && (
                        <div className="p-4 border-t border-teal-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {pelanggan.from || 0} - {pelanggan.to || 0} dari {pelanggan.total} data
                            </span>
                            <div className="flex gap-1">
                                {pelanggan.links.map((link, idx) => (
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

            {/* Modal Tambah Pelanggan */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Tambah Pelanggan Baru</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Lengkapi identitas pelanggan laundry.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pelanggan</label>
                        <input
                            type="text"
                            value={createForm.data.kode_pelanggan}
                            onChange={(e) => createForm.setData('kode_pelanggan', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold"
                            required
                        />
                        {createForm.errors.kode_pelanggan && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.kode_pelanggan}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={createForm.data.nama}
                            onChange={(e) => createForm.setData('nama', e.target.value)}
                            placeholder="Contoh: Farhan Zalfanudin"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.nama && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.nama}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                        <input
                            type="text"
                            value={createForm.data.no_telepon}
                            onChange={(e) => createForm.setData('no_telepon', e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.no_telepon && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.no_telepon}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                        <textarea
                            value={createForm.data.alamat}
                            onChange={(e) => createForm.setData('alamat', e.target.value)}
                            rows="2"
                            placeholder="Alamat penjemputan / pengantaran cucian..."
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                        ></textarea>
                        {createForm.errors.alamat && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.alamat}</p>
                        )}
                    </div>

                    {/* SAKLAR HAK BAYAR BELAKANGAN (TEMPO) */}
                    <div className="bg-[#F6FBF9] p-3.5 rounded-xl border border-teal-200/80">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={createForm.data.hak_bayar_belakangan}
                                onChange={(e) => createForm.setData('hak_bayar_belakangan', e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <div>
                                <span className="block text-xs font-bold text-[#134E4A]">
                                    Izin Ambil Pakaian Sebelum Lunas (Hak Tempo)
                                </span>
                                <span className="block text-[11px] text-slate-500 mt-0.5">
                                    Jika diaktifkan, kasir berwenang menyerahkan pakaian yang sudah selesai dicuci dengan status pembayaran tempo/utang.
                                </span>
                            </div>
                        </label>
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
                            {createForm.processing ? 'Menyimpan...' : 'Simpan Pelanggan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ubah Pelanggan */}
            <Modal show={Boolean(editingItem)} onClose={() => setEditingItem(null)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Ubah Data Pelanggan</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Perbarui profil dan fasilitas tempo pelanggan.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pelanggan</label>
                        <input
                            type="text"
                            value={editForm.data.kode_pelanggan}
                            onChange={(e) => editForm.setData('kode_pelanggan', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold"
                            required
                        />
                        {editForm.errors.kode_pelanggan && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.kode_pelanggan}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={editForm.data.nama}
                            onChange={(e) => editForm.setData('nama', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.nama && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.nama}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                        <input
                            type="text"
                            value={editForm.data.no_telepon}
                            onChange={(e) => editForm.setData('no_telepon', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.no_telepon && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.no_telepon}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                        <textarea
                            value={editForm.data.alamat}
                            onChange={(e) => editForm.setData('alamat', e.target.value)}
                            rows="2"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                        ></textarea>
                        {editForm.errors.alamat && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.alamat}</p>
                        )}
                    </div>

                    {/* SAKLAR HAK BAYAR BELAKANGAN (TEMPO) */}
                    <div className="bg-[#F6FBF9] p-3.5 rounded-xl border border-teal-200/80">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.data.hak_bayar_belakangan}
                                onChange={(e) => editForm.setData('hak_bayar_belakangan', e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <div>
                                <span className="block text-xs font-bold text-[#134E4A]">
                                    Izin Ambil Pakaian Sebelum Lunas (Hak Tempo)
                                </span>
                                <span className="block text-[11px] text-slate-500 mt-0.5">
                                    Jika diaktifkan, kasir berwenang menyerahkan pakaian yang sudah selesai dicuci dengan status pembayaran tempo/utang.
                                </span>
                            </div>
                        </label>
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
                        <h3 className="text-base font-bold text-slate-800">Hapus Data Pelanggan?</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Anda akan menghapus data pelanggan <strong className="text-slate-700">{deletingItem?.nama}</strong> ({deletingItem?.kode_pelanggan}). Tindakan ini tidak dapat dibatalkan.
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
