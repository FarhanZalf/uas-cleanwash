import { LABEL_STATUS_BAYAR } from '@/utils/format';

const dasar = 'inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold whitespace-nowrap';

const warnaProses = {
    Selesai: 'bg-teal-50 text-teal-800 border-teal-200',
};

const warnaBayar = {
    Belum: 'bg-slate-50 text-slate-700 border-slate-300',
    DP: 'bg-amber-50 text-amber-800 border-amber-200',
    Lunas: 'bg-teal-50 text-teal-800 border-teal-200',
    Tempo: 'bg-rose-50 text-rose-800 border-rose-200',
};

const warnaTransaksi = {
    Aktif: 'bg-slate-50 text-slate-700 border-slate-300',
    Selesai: 'bg-teal-50 text-teal-800 border-teal-200',
    Batal: 'bg-rose-50 text-rose-800 border-rose-200',
};

export function StatusProses({ status }) {
    return (
        <span className={`${dasar} ${warnaProses[status] || 'bg-white text-slate-700 border-slate-300'}`}>
            {status}
        </span>
    );
}

export function StatusBayar({ status }) {
    return <span className={`${dasar} ${warnaBayar[status] || warnaBayar.Belum}`}>{LABEL_STATUS_BAYAR[status] || status}</span>;
}

export function StatusTransaksi({ status }) {
    return <span className={`${dasar} ${warnaTransaksi[status] || warnaTransaksi.Aktif}`}>{status}</span>;
}
