import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function VoucherIndex({ vouchers, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    const createForm = useForm({
        nomor_voucher: '',
        nilai_potongan: '',
        masa_berlaku: '',
        status_terpakai: false,
    });

    const editForm = useForm({
        nomor_voucher: '',
        nilai_potongan: '',
        masa_berlaku: '',
        status_terpakai: false,
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number || 0);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kasir.voucher.index'), { search }, { preserveState: true });
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('kasir.voucher.index'), {}, { preserveState: true });
    };

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('kasir.voucher.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            nomor_voucher: item.nomor_voucher,
            nilai_potongan: item.nilai_potongan,
            masa_berlaku: item.masa_berlaku?.split('T')[0] || item.masa_berlaku,
            status_terpakai: Boolean(item.status_terpakai),
        });
        editForm.clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('kasir.voucher.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const submitDelete = () => {
        if (!deletingItem) return;
        router.delete(route('kasir.voucher.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg font-bold text-[#134E4A]">
                        Voucher Promo
                    </h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex min-h-[40px] items-center justify-center px-4 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg transition"
                    >
                        + Buat Voucher
                    </button>
                </div>
            }
        >
            <Head title="Master Voucher Promo" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Voucher</span>
                        <div className="text-xl font-black text-slate-800 mt-1">{stats?.total || 0}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Tersedia Digunakan</span>
                        <div className="text-xl font-black text-teal-700 mt-1">{stats?.tersedia || 0}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sudah Terpakai</span>
                        <div className="text-xl font-black text-slate-700 mt-1">{stats?.terpakai || 0}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Kadaluarsa</span>
                        <div className="text-xl font-black text-rose-600 mt-1">{stats?.kadaluarsa || 0}</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs flex items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan kode voucher promo..."
                            className="w-full text-xs rounded-xl border-slate-200 focus:border-[#0D9488] focus:ring-[#0D9488] px-3.5 py-2 uppercase font-mono"
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
                                    <th className="px-5 py-3.5">Kode Voucher</th>
                                    <th className="px-5 py-3.5">Nilai Potongan</th>
                                    <th className="px-5 py-3.5">Masa Berlaku</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Nota Pengguna</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-50">
                                {vouchers?.data && vouchers.data.length > 0 ? (
                                    vouchers.data.map((item) => {
                                        const isExpired = new Date(item.masa_berlaku) < new Date();

                                        return (
                                            <tr key={item.id} className="hover:bg-teal-50/30 transition">
                                                <td className="px-5 py-3.5 font-mono font-bold text-teal-700">
                                                    {item.nomor_voucher}
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800">
                                                    {formatRupiah(item.nilai_potongan)}
                                                </td>
                                                <td className="px-5 py-3.5 font-medium text-slate-600">
                                                    {new Date(item.masa_berlaku).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {item.status_terpakai ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                            Sudah Terpakai
                                                        </span>
                                                    ) : isExpired ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Kadaluarsa
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#CCFBF1] text-[#134E4A] border border-teal-200">
                                                            Tersedia
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-xs">
                                                    {item.transaksi_laundry?.no_nota ? (
                                                        <span className="font-bold text-[#134E4A]">
                                                            {item.transaksi_laundry.no_nota}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
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
                                                        disabled={item.status_terpakai}
                                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                                            item.status_terpakai
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
                                            Belum ada voucher promo yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {vouchers?.links && vouchers.links.length > 3 && (
                        <div className="p-4 border-t border-teal-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {vouchers.from || 0} - {vouchers.to || 0} dari {vouchers.total} voucher
                            </span>
                            <div className="flex gap-1">
                                {vouchers.links.map((link, idx) => (
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

            {/* Modal Tambah Voucher */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Buat Voucher Promo Baru</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Kode voucher berlaku untuk satu kali pemakaian.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor / Kode Voucher</label>
                        <input
                            type="text"
                            value={createForm.data.nomor_voucher}
                            onChange={(e) => createForm.setData('nomor_voucher', e.target.value.toUpperCase())}
                            placeholder="Contoh: CW-HEMAT10K"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold uppercase"
                            required
                        />
                        {createForm.errors.nomor_voucher && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.nomor_voucher}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Potongan (Rp)</label>
                            <input
                                type="number"
                                min="500"
                                step="500"
                                value={createForm.data.nilai_potongan}
                                onChange={(e) => createForm.setData('nilai_potongan', e.target.value)}
                                placeholder="Contoh: 10000"
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold text-teal-800"
                                required
                            />
                            {createForm.errors.nilai_potongan && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.nilai_potongan}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Masa Berlaku</label>
                            <input
                                type="date"
                                value={createForm.data.masa_berlaku}
                                onChange={(e) => createForm.setData('masa_berlaku', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                                required
                            />
                            {createForm.errors.masa_berlaku && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.masa_berlaku}</p>
                            )}
                        </div>
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
                            {createForm.processing ? 'Menyimpan...' : 'Simpan Voucher'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ubah Voucher */}
            <Modal show={Boolean(editingItem)} onClose={() => setEditingItem(null)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Ubah Voucher Promo</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Perbarui potongan harga atau masa berlaku.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor / Kode Voucher</label>
                        <input
                            type="text"
                            value={editForm.data.nomor_voucher}
                            onChange={(e) => editForm.setData('nomor_voucher', e.target.value.toUpperCase())}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold uppercase"
                            required
                        />
                        {editForm.errors.nomor_voucher && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.nomor_voucher}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Potongan (Rp)</label>
                            <input
                                type="number"
                                min="500"
                                step="500"
                                value={editForm.data.nilai_potongan}
                                onChange={(e) => editForm.setData('nilai_potongan', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold text-teal-800"
                                required
                            />
                            {editForm.errors.nilai_potongan && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.nilai_potongan}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Masa Berlaku</label>
                            <input
                                type="date"
                                value={editForm.data.masa_berlaku}
                                onChange={(e) => editForm.setData('masa_berlaku', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                                required
                            />
                            {editForm.errors.masa_berlaku && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.masa_berlaku}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#F6FBF9] p-3 rounded-xl border border-teal-200/80">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.data.status_terpakai}
                                onChange={(e) => editForm.setData('status_terpakai', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span className="text-xs font-bold text-slate-700">
                                Tandai Voucher Sudah Terpakai
                            </span>
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
                        <h3 className="text-base font-bold text-slate-800">Hapus Voucher Promo?</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Anda akan menghapus voucher <strong className="text-slate-700">{deletingItem?.nomor_voucher}</strong>.
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
