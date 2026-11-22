const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function formatRupiah(nilai) {
    return rupiah.format(Number(nilai) || 0);
}

export function formatTanggalWaktu(iso) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatTanggal(iso) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(iso));
}

export function labelSatuan(satuanHitung) {
    return satuanHitung === 'Jumlah_Pcs' ? 'pcs' : 'kg';
}

export function formatJumlah(nilai, satuanHitung) {
    const angka = Number(nilai || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    return `${angka} ${labelSatuan(satuanHitung)}`;
}

export const LABEL_STATUS_BAYAR = {
    Belum: 'Belum bayar',
    DP: 'Uang muka',
    Lunas: 'Lunas',
    Tempo: 'Tempo',
};
