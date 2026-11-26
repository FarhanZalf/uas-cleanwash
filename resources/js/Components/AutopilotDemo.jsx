import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const STORAGE_ACTIVE = 'cleanwash_autopilot_active';
const STORAGE_STEP = 'cleanwash_autopilot_step';
const STORAGE_NOTA_ID = 'cleanwash_autopilot_nota_id';

function highlightElement(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const prevTransition = el.style.transition;
    const prevBoxShadow = el.style.boxShadow;
    el.style.transition = 'box-shadow 0.25s ease';
    el.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.38)';
    window.setTimeout(() => {
        el.style.boxShadow = prevBoxShadow;
        el.style.transition = prevTransition;
    }, 1200);
}

export function startAutopilotDemo(currentComponent, userRole) {
    sessionStorage.setItem(STORAGE_ACTIVE, '1');
    sessionStorage.setItem(STORAGE_STEP, 'login_kasir');
    sessionStorage.removeItem(STORAGE_NOTA_ID);

    if (currentComponent !== 'Auth/Login') {
        router.post(route('logout'), { role: userRole });
    } else {
        window.dispatchEvent(new CustomEvent('cleanwash:autopilot-start'));
    }
}

export function stopAutopilotDemo() {
    sessionStorage.removeItem(STORAGE_ACTIVE);
    sessionStorage.removeItem(STORAGE_STEP);
    sessionStorage.removeItem(STORAGE_NOTA_ID);
}

export default function AutopilotDemo() {
    const page = usePage();
    const { component, props } = page;
    const timersRef = useRef([]);

    const clearAllTimers = () => {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
    };

    const schedule = (fn, delayMs) => {
        const id = window.setTimeout(fn, delayMs);
        timersRef.current.push(id);
        return id;
    };

    // Global keyboard shortcut: Alt + D starts/stops Autopilot, Escape stops it
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === '1' && sessionStorage.getItem(STORAGE_ACTIVE) !== '1') {
            startAutopilotDemo(component, props?.auth?.user?.peran);
        }

        const onKeyDown = (e) => {
            if (e.altKey && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                if (sessionStorage.getItem(STORAGE_ACTIVE) === '1') {
                    clearAllTimers();
                    stopAutopilotDemo();
                } else {
                    startAutopilotDemo(component, props?.auth?.user?.peran);
                }
            } else if (e.key === 'Escape' && sessionStorage.getItem(STORAGE_ACTIVE) === '1') {
                clearAllTimers();
                stopAutopilotDemo();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [component, props?.auth?.user?.peran]);

    // Step runner on page / props update
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const runStep = () => {
            clearAllTimers();
            if (sessionStorage.getItem(STORAGE_ACTIVE) !== '1') return;

            const step = sessionStorage.getItem(STORAGE_STEP) || 'login_kasir';

            // 1. LOGIN ROLE HELPER
            const runLoginForRole = (roleLabel, nextStep) => {
                schedule(() => {
                    const emailInput = document.getElementById('email');
                    if (emailInput) {
                        highlightElement(emailInput);
                        emailInput.focus();
                        emailInput.click();
                    }
                }, 1400);

                schedule(() => {
                    const options = Array.from(document.querySelectorAll('[role="listbox"] button'));
                    const targetBtn = options.find((btn) => btn.textContent?.includes(roleLabel));
                    if (targetBtn) {
                        highlightElement(targetBtn);
                        targetBtn.click();
                    }
                }, 3400);

                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, nextStep);
                    const submitBtn = document.querySelector('form button[type="submit"]');
                    if (submitBtn) {
                        highlightElement(submitBtn);
                        submitBtn.click();
                    }
                }, 5200);
            };

            if (component === 'Auth/Login') {
                if (step === 'login_kasir') {
                    runLoginForRole('Kasir / Admin', 'kasir_dashboard');
                } else if (step === 'login_produksi') {
                    runLoginForRole('Petugas Laundry', 'produksi_advance');
                } else if (step === 'login_kasir_kloter') {
                    runLoginForRole('Kasir / Admin', 'buka_pengantaran');
                } else if (step === 'login_kurir') {
                    runLoginForRole('Kurir', 'kurir_advance');
                } else if (step === 'login_kasir_akhir') {
                    runLoginForRole('Kasir / Admin', 'buka_laporan');
                }
                return;
            }

            // 2. KASIR DASHBOARD & MASTER DATA TOUR
            if (component === 'Kasir/Dashboard') {
                if (step === 'kasir_dashboard') {
                    schedule(() => {
                        window.scrollTo({ top: 240, behavior: 'smooth' });
                    }, 1600);
                    schedule(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 3200);
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'master_pelanggan');
                        router.visit(route('kasir.pelanggan.index'));
                    }, 4400);
                } else if (step === 'buka_pengantaran') {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'buat_kloter');
                        router.visit(route('kasir.pengantaran.index'));
                    }, 1600);
                } else if (step === 'buka_laporan') {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'laporan_piutang');
                        router.visit(route('kasir.laporan.index'));
                    }, 1600);
                }
                return;
            }

            if (component === 'Master/Pelanggan/Index' && step === 'master_pelanggan') {
                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'master_layanan');
                    router.visit(route('kasir.layanan.index'));
                }, 2400);
                return;
            }

            if (component === 'Master/JenisLayanan/Index' && step === 'master_layanan') {
                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'master_voucher');
                    router.visit(route('kasir.voucher.index'));
                }, 2400);
                return;
            }

            if (component === 'Master/Voucher/Index' && step === 'master_voucher') {
                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'master_petugas');
                    router.visit(route('kasir.petugas.index'));
                }, 2400);
                return;
            }

            if (component === 'Master/Petugas/Index' && step === 'master_petugas') {
                schedule(() => {
                    const firstSelect = document.querySelector('table select');
                    if (firstSelect) {
                        highlightElement(firstSelect);
                        firstSelect.focus();
                    }
                }, 1000);
                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'transaksi_index');
                    router.visit(route('kasir.transaksi.index'));
                }, 2800);
                return;
            }

            // 3. TRANSAKSI LIST & CREATE
            if (component === 'Kasir/Transaksi/Index' && step === 'transaksi_index') {
                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'transaksi_create');
                    router.visit(route('kasir.transaksi.create'));
                }, 2300);
                return;
            }

            if (component === 'Kasir/Transaksi/Create' && step === 'transaksi_create') {
                const daftarPelanggan = props.pelanggan || [];
                const daftarLayanan = props.jenisLayanan || [];
                const targetPelanggan =
                    daftarPelanggan.find((p) => p.hak_bayar_belakangan) || daftarPelanggan[0];
                const targetLayanan =
                    daftarLayanan.find((l) => l.nama_layanan?.toLowerCase().includes('reguler')) ||
                    daftarLayanan[0];

                if (!targetPelanggan || !targetLayanan) {
                    stopAutopilotDemo();
                    return;
                }

                schedule(() => {
                    const customerButtons = Array.from(
                        document.querySelectorAll('ul[aria-label="Hasil pencarian pelanggan"] button'),
                    );
                    const matchBtn = customerButtons.find((b) =>
                        b.textContent?.includes(targetPelanggan.nama),
                    );
                    if (matchBtn) {
                        highlightElement(matchBtn);
                        matchBtn.click();
                    }
                }, 1400);

                schedule(() => {
                    const layananSelect = document.querySelector('select[id$="-layanan"]');
                    if (layananSelect) {
                        highlightElement(layananSelect);
                    }
                }, 3000);

                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'transaksi_timbang_ulang');
                    router.post(route('kasir.transaksi.store'), {
                        pelanggan_id: targetPelanggan.id,
                        catatan_khusus: 'Pisahkan pakaian putih dan lipat rapi',
                        items: [
                            {
                                jenis_layanan_id: targetLayanan.id,
                                berat_atau_jumlah: 3,
                                daftar_pakaian: '4 Kemeja Kerja, 2 Celana Panjang',
                            },
                        ],
                        nomor_voucher: '',
                        metode_bayar: targetPelanggan.hak_bayar_belakangan ? 'Tempo' : 'Belum',
                        nominal_bayar: 0,
                    });
                }, 4600);
                return;
            }

            // 4. TRANSAKSI SHOW (TIMBANG ULANG & PELUNASAN)
            if (component === 'Kasir/Transaksi/Show') {
                const trx = props.transaksi;
                if (trx?.id) {
                    sessionStorage.setItem(STORAGE_NOTA_ID, String(trx.id));
                }

                if (step === 'transaksi_timbang_ulang') {
                    schedule(() => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const timbangBtn = buttons.find((b) =>
                            b.textContent?.includes('Timbang Ulang'),
                        );
                        if (timbangBtn) {
                            highlightElement(timbangBtn);
                            timbangBtn.click();
                        }
                    }, 1800);

                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'transaksi_after_timbang');
                        router.post(route('kasir.transaksi.penyesuaian', trx.id), {
                            items: (trx.detail_pakaian || []).map((it) => ({
                                id: it.id,
                                berat_atau_jumlah: 4,
                            })),
                            catatan: 'Penyesuaian berat timbangan aktual 4 kg',
                        });
                    }, 4200);
                } else if (step === 'transaksi_after_timbang') {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'login_produksi');
                        router.post(route('logout'), { role: 'Kasir' });
                    }, 2800);
                } else if (step === 'pelunasan_nota') {
                    schedule(() => {
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                    }, 1200);

                    schedule(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const pelunasanBtn = buttons.find((b) =>
                            b.textContent?.includes('Catat Pelunasan'),
                        );
                        if (pelunasanBtn) {
                            highlightElement(pelunasanBtn);
                            pelunasanBtn.click();
                        }
                    }, 3000);

                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'buka_cetak');
                        router.post(route('kasir.transaksi.pelunasan', trx.id), {
                            jenis_aksi: 'pelunasan',
                            nominal: Number(trx.sisa_tagihan) || 0,
                            metode_pembayaran: 'QRIS',
                            catatan: 'Pelunasan tagihan tempo via QRIS',
                            serahkan_cucian: false,
                        });
                    }, 5400);
                } else if (step === 'buka_cetak') {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'selesai_cetak');
                        router.visit(
                            route('kasir.transaksi.cetak', {
                                transaksi: trx.id,
                                format: 'a5',
                            }),
                        );
                    }, 2600);
                }
                return;
            }

            // 5. PRODUKSI DASHBOARD (ADVANCE DROPDOWN STAGE BY STAGE)
            if (component === 'Produksi/Dashboard' && step === 'produksi_advance') {
                const antrean = props.antreanCucian || [];
                const targetNotaId = sessionStorage.getItem(STORAGE_NOTA_ID);
                const targetItem =
                    antrean.find((a) => String(a.id) === String(targetNotaId) && a.tahap_berikutnya) ||
                    antrean.find((a) => Boolean(a.tahap_berikutnya));

                if (targetItem && targetItem.tahap_berikutnya) {
                    schedule(() => {
                        const selectEl = document.getElementById(`status-proses-${targetItem.id}`);
                        if (selectEl) {
                            highlightElement(selectEl);
                            selectEl.focus();
                        }
                    }, 1000);

                    schedule(() => {
                        router.post(
                            route('produksi.update-tahap', targetItem.id),
                            { tahap_tujuan: targetItem.tahap_berikutnya },
                            { preserveScroll: true },
                        );
                    }, 2500);
                } else {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'login_kasir_kloter');
                        router.post(route('logout'), { role: 'Produksi' });
                    }, 2600);
                }
                return;
            }

            // 6. KASIR PENGANTARAN (SCHEDULE KLOTER)
            if (component === 'Kasir/Pengantaran/Index' && step === 'buat_kloter') {
                const siapAntar = props.transaksiSiapAntar || [];
                const kurirList = props.kurirList || [];

                schedule(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const buatBtn = buttons.find((b) => b.textContent?.includes('Buat Kloter'));
                    if (buatBtn) {
                        highlightElement(buatBtn);
                        buatBtn.click();
                    }
                }, 1500);

                if (siapAntar.length > 0 && kurirList.length > 0) {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'lihat_kloter');
                        router.post(route('kasir.pengantaran.store'), {
                            petugas_id: kurirList[0].id,
                            tanggal_antar: new Date().toISOString().split('T')[0],
                            transaksi_ids: siapAntar.map((t) => t.id),
                        });
                    }, 3800);
                } else {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'login_kurir');
                        router.post(route('logout'), { role: 'Kasir' });
                    }, 3500);
                }
                return;
            }

            if (component === 'Kasir/Pengantaran/Show' && step === 'lihat_kloter') {
                schedule(() => {
                    sessionStorage.setItem(STORAGE_STEP, 'login_kurir');
                    router.post(route('logout'), { role: 'Kasir' });
                }, 2800);
                return;
            }

            // 7. KURIR ANTAR DASHBOARD (ADVANCE DELIVERY DROPDOWN)
            if (component === 'Antar/Dashboard' && step === 'kurir_advance') {
                const daftar = props.daftarAntaran || [];
                const targetNotaId = sessionStorage.getItem(STORAGE_NOTA_ID);
                const targetItem =
                    daftar.find(
                        (d) =>
                            String(d.transaksi_laundry_id) === String(targetNotaId) &&
                            d.status_antar !== 'Diterima',
                    ) || daftar.find((d) => d.status_antar !== 'Diterima' && d.status_antar !== 'Gagal');

                if (targetItem) {
                    const urutan = {
                        Menunggu: 'Diambil',
                        Diambil: 'DalamPerjalanan',
                        DalamPerjalanan: 'Diterima',
                    };
                    const nextStatus = urutan[targetItem.status_antar] || 'Diterima';

                    schedule(() => {
                        const selectEl = document.getElementById(`status-antar-${targetItem.id}`);
                        if (selectEl) {
                            highlightElement(selectEl);
                            selectEl.focus();
                        }
                    }, 1000);

                    schedule(() => {
                        router.post(
                            route('antar.update-status', targetItem.id),
                            { status_antar: nextStatus },
                            { preserveScroll: true },
                        );
                    }, 2500);
                } else {
                    schedule(() => {
                        sessionStorage.setItem(STORAGE_STEP, 'login_kasir_akhir');
                        router.post(route('logout'), { role: 'Antar' });
                    }, 2800);
                }
                return;
            }

            // 8. LAPORAN & PIUTANG -> PELUNASAN -> CETAK
            if (component === 'Kasir/Laporan/Index' && step === 'laporan_piutang') {
                const piutangList = props.bukuPiutang?.daftar || [];
                const targetNotaId = sessionStorage.getItem(STORAGE_NOTA_ID);
                const targetNota =
                    piutangList.find((p) => String(p.id) === String(targetNotaId)) || piutangList[0];

                schedule(() => {
                    window.scrollTo({ top: 280, behavior: 'smooth' });
                }, 1500);

                schedule(() => {
                    if (targetNota) {
                        sessionStorage.setItem(STORAGE_STEP, 'pelunasan_nota');
                        router.visit(route('kasir.transaksi.show', targetNota.id));
                    } else {
                        stopAutopilotDemo();
                    }
                }, 3800);
                return;
            }

            if (component === 'Kasir/Transaksi/Cetak' && step === 'selesai_cetak') {
                schedule(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const thermalBtn = buttons.find((b) => b.textContent?.includes('Struk Thermal'));
                    if (thermalBtn) {
                        highlightElement(thermalBtn);
                        thermalBtn.click();
                    }
                }, 2600);

                schedule(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const a5Btn = buttons.find((b) => b.textContent?.includes('Invoice Formal'));
                    if (a5Btn) {
                        highlightElement(a5Btn);
                        a5Btn.click();
                    }
                    stopAutopilotDemo();
                }, 5400);
            }
        };

        runStep();
        window.addEventListener('cleanwash:autopilot-start', runStep);
        return () => {
            clearAllTimers();
            window.removeEventListener('cleanwash:autopilot-start', runStep);
        };
    }, [
        component,
        page.url,
        props?.transaksi?.sisa_tagihan,
        props?.transaksi?.detail_pakaian?.[0]?.berat_atau_jumlah,
        JSON.stringify((props?.antreanCucian || []).map((a) => `${a.id}:${a.status_proses_terkini}`)),
        JSON.stringify((props?.daftarAntaran || []).map((d) => `${d.id}:${d.status_antar}`)),
    ]);

    return null;
}
