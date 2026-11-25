import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function JenisLayananIndex({ layanan, availableTahapan }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    const defaultTahapan = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'];

    // Form Tambah Layanan
    const createForm = useForm({
        kode_layanan: '',
        nama_layanan: '',
        kecepatan: 'Reguler',
        satuan_hitung: 'Berat_Kg',
        tahapan_proses: defaultTahapan,
        harga_satuan: '',
    });

    // Form Edit Layanan
    const editForm = useForm({
        kode_layanan: '',
        nama_layanan: '',
        kecepatan: 'Reguler',
        satuan_hitung: 'Berat_Kg',
        tahapan_proses: defaultTahapan,
        harga_satuan: '',
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number || 0);
    };

    const toggleTahap = (form, tahap) => {
        const current = [...form.data.tahapan_proses];
        // 'Diterima' dan 'Selesai' selalu wajib ada
        if (tahap === 'Diterima' || tahap === 'Selesai') return;

        if (current.includes(tahap)) {
            form.setData('tahapan_proses', current.filter((t) => t !== tahap));
        } else {
            // Urutkan kembali sesuai urutan standar
            const ordered = availableTahapan.filter((t) => current.includes(t) || t === tahap);
            form.setData('tahapan_proses', ordered);
        }
    };

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('kasir.layanan.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            kode_layanan: item.kode_layanan,
            nama_layanan: item.nama_layanan,
            kecepatan: item.kecepatan,
            satuan_hitung: item.satuan_hitung,
            tahapan_proses: Array.isArray(item.tahapan_proses) ? item.tahapan_proses : JSON.parse(item.tahapan_proses || '[]'),
            harga_satuan: item.harga_satuan,
        });
        editForm.clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('kasir.layanan.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const submitDelete = () => {
        if (!deletingItem) return;
        router.delete(route('kasir.layanan.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg font-bold text-[#134E4A]">
                        Jenis Layanan
                    </h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex min-h-[40px] items-center justify-center px-4 bg-[#0D9488] hover:bg-[#134E4A] text-white text-xs font-bold rounded-lg transition"
                    >
                        + Tambah Layanan
                    </button>
                </div>
            }
        >
            <Head title="Jenis Layanan" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="bg-white rounded-xl border border-teal-200/80 overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-[#F6FBF9] text-[11px] uppercase font-bold text-[#134E4A] border-b border-teal-100">
                                <tr>
                                    <th className="px-5 py-3.5">Kode</th>
                                    <th className="px-5 py-3.5">Nama Layanan</th>
                                    <th className="px-5 py-3.5">Kecepatan</th>
                                    <th className="px-5 py-3.5">Satuan</th>
                                    <th className="px-5 py-3.5">Tarif Satuan</th>
                                    <th className="px-5 py-3.5">Tahapan Pengerjaan</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-50">
                                {layanan && layanan.length > 0 ? (
                                    layanan.map((item) => {
                                        const tahapan = Array.isArray(item.tahapan_proses)
                                            ? item.tahapan_proses
                                            : JSON.parse(item.tahapan_proses || '[]');

                                        return (
                                            <tr key={item.id} className="hover:bg-teal-50/30 transition">
                                                <td className="px-5 py-3.5 font-mono font-bold text-teal-700">{item.kode_layanan}</td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800">{item.nama_layanan}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                        item.kecepatan === 'Express'
                                                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                                                            : 'bg-teal-50 text-teal-700 border-teal-200'
                                                    }`}>
                                                        {item.kecepatan}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 font-medium text-slate-600">
                                                    {item.satuan_hitung === 'Berat_Kg' ? 'Per Kilogram (Kg)' : 'Per Satuan (Pcs)'}
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-teal-800">
                                                    {formatRupiah(item.harga_satuan)}
                                                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                                                        /{item.satuan_hitung === 'Berat_Kg' ? 'Kg' : 'Pcs'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {tahapan.map((t, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-teal-200 text-teal-900 rounded-md"
                                                            >
                                                                {idx + 1}. {t}
                                                            </span>
                                                        ))}
                                                    </div>
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
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                                            Belum ada jenis layanan yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Layanan */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Tambah Master Jenis Layanan</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tentukan tarif dan alur proses produksi.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kode Layanan</label>
                            <input
                                type="text"
                                value={createForm.data.kode_layanan}
                                onChange={(e) => createForm.setData('kode_layanan', e.target.value)}
                                placeholder="Misal: LYN-CKR"
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold"
                                required
                            />
                            {createForm.errors.kode_layanan && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.kode_layanan}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kecepatan</label>
                            <select
                                value={createForm.data.kecepatan}
                                onChange={(e) => createForm.setData('kecepatan', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                <option value="Reguler">Reguler</option>
                                <option value="Express">Express</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Layanan</label>
                        <input
                            type="text"
                            value={createForm.data.nama_layanan}
                            onChange={(e) => createForm.setData('nama_layanan', e.target.value)}
                            placeholder="Contoh: Cuci Kering Reguler"
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {createForm.errors.nama_layanan && (
                            <p className="text-xs text-rose-600 mt-1">{createForm.errors.nama_layanan}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Hitung</label>
                            <select
                                value={createForm.data.satuan_hitung}
                                onChange={(e) => createForm.setData('satuan_hitung', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                <option value="Berat_Kg">Berat (Kg)</option>
                                <option value="Jumlah_Pcs">Jumlah (Pcs)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                            <input
                                type="number"
                                min="0"
                                step="500"
                                value={createForm.data.harga_satuan}
                                onChange={(e) => createForm.setData('harga_satuan', e.target.value)}
                                placeholder="Contoh: 10000"
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold text-teal-800"
                                required
                            />
                            {createForm.errors.harga_satuan && (
                                <p className="text-xs text-rose-600 mt-1">{createForm.errors.harga_satuan}</p>
                            )}
                        </div>
                    </div>

                    {/* PILIHAN TAHAPAN PROSES PRODUKSI */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tahapan Proses Berlaku (Klik untuk aktifkan/nonaktifkan):
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 bg-[#F6FBF9] rounded-xl border border-teal-200/80">
                            {availableTahapan.map((tahap) => {
                                const isChecked = createForm.data.tahapan_proses.includes(tahap);
                                const isFixed = tahap === 'Diterima' || tahap === 'Selesai';

                                return (
                                    <button
                                        type="button"
                                        key={tahap}
                                        disabled={isFixed}
                                        onClick={() => toggleTahap(createForm, tahap)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                            isChecked
                                                ? 'bg-[#0D9488] text-white shadow-xs'
                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
                                        } ${isFixed ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <span>{isChecked ? '✓' : '+'}</span>
                                        <span>{tahap}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Layanan seperti Cuci Sepatu atau Karpet umumnya dapat melewati tahap <em>Disetrika</em>.
                        </p>
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
                            {createForm.processing ? 'Menyimpan...' : 'Simpan Layanan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ubah Layanan */}
            <Modal show={Boolean(editingItem)} onClose={() => setEditingItem(null)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <div className="border-b border-teal-100 pb-3">
                        <h3 className="text-base font-black text-[#134E4A]">Ubah Master Jenis Layanan</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Perbarui tarif dan alur tahapan proses.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kode Layanan</label>
                            <input
                                type="text"
                                value={editForm.data.kode_layanan}
                                onChange={(e) => editForm.setData('kode_layanan', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-mono font-bold"
                                required
                            />
                            {editForm.errors.kode_layanan && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.kode_layanan}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Kecepatan</label>
                            <select
                                value={editForm.data.kecepatan}
                                onChange={(e) => editForm.setData('kecepatan', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                <option value="Reguler">Reguler</option>
                                <option value="Express">Express</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nama Layanan</label>
                        <input
                            type="text"
                            value={editForm.data.nama_layanan}
                            onChange={(e) => editForm.setData('nama_layanan', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                            required
                        />
                        {editForm.errors.nama_layanan && (
                            <p className="text-xs text-rose-600 mt-1">{editForm.errors.nama_layanan}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Hitung</label>
                            <select
                                value={editForm.data.satuan_hitung}
                                onChange={(e) => editForm.setData('satuan_hitung', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold"
                            >
                                <option value="Berat_Kg">Berat (Kg)</option>
                                <option value="Jumlah_Pcs">Jumlah (Pcs)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                            <input
                                type="number"
                                min="0"
                                step="500"
                                value={editForm.data.harga_satuan}
                                onChange={(e) => editForm.setData('harga_satuan', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488] font-bold text-teal-800"
                                required
                            />
                            {editForm.errors.harga_satuan && (
                                <p className="text-xs text-rose-600 mt-1">{editForm.errors.harga_satuan}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tahapan Proses Berlaku:
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 bg-[#F6FBF9] rounded-xl border border-teal-200/80">
                            {availableTahapan.map((tahap) => {
                                const isChecked = editForm.data.tahapan_proses.includes(tahap);
                                const isFixed = tahap === 'Diterima' || tahap === 'Selesai';

                                return (
                                    <button
                                        type="button"
                                        key={tahap}
                                        disabled={isFixed}
                                        onClick={() => toggleTahap(editForm, tahap)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                            isChecked
                                                ? 'bg-[#0D9488] text-white shadow-xs'
                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
                                        } ${isFixed ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <span>{isChecked ? '✓' : '+'}</span>
                                        <span>{tahap}</span>
                                    </button>
                                );
                            })}
                        </div>
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
                        <h3 className="text-base font-bold text-slate-800">Hapus Jenis Layanan?</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Anda akan menghapus master layanan <strong className="text-slate-700">{deletingItem?.nama_layanan}</strong> ({deletingItem?.kode_layanan}).
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
