import { IconPin, IconSearch } from '@/Components/LineIcons';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: -7.7705, lng: 110.3775 }; // Sleman / Yogyakarta

const TITIK_AREA_CEPAT = [
    { label: 'Kaliurang KM 5', lat: -7.7568, lng: 110.3806, alamat: 'Jl. Kaliurang KM 5, Depok, Sleman, Yogyakarta' },
    { label: 'Gejayan / Condongcatur', lat: -7.7676, lng: 110.3935, alamat: 'Jl. Affandi Gejayan, Condongcatur, Depok, Sleman' },
    { label: 'Palagan Ngaglik', lat: -7.7342, lng: 110.3741, alamat: 'Jl. Palagan Tentara Pelajar, Ngaglik, Sleman' },
    { label: 'Kalasan Sleman', lat: -7.7719, lng: 110.4658, alamat: 'Perum Candi Indah, Kalasan, Sleman, Yogyakarta' },
];

export function extractCoordsFromAddress(alamat = '') {
    const match = String(alamat).match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (!match) return null;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
}

export function buildGoogleMapsUrl(alamat = '') {
    const coords = extractCoordsFromAddress(alamat);
    if (coords) {
        return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamat || '')}`;
}

function formatAddressWithCoords(baseAddress, lat, lng) {
    const cleanBase = String(baseAddress || '')
        .replace(/\s*\[Titik Maps:\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\]/gi, '')
        .trim();
    const coordTag = `[Titik Maps: ${lat.toFixed(5)}, ${lng.toFixed(5)}]`;
    return cleanBase ? `${cleanBase} ${coordTag}` : coordTag;
}

export default function LocationMapPicker({ value = '', onChange }) {
    const existingCoords = extractCoordsFromAddress(value);
    const [coords, setCoords] = useState(existingCoords || DEFAULT_CENTER);
    const [mapOpen, setMapOpen] = useState(true);
    const [queryLokasi, setQueryLokasi] = useState('');
    const [sedangMencari, setSedangMencari] = useState(false);
    const [statusPeta, setStatusPeta] = useState('Klik langsung pada peta atau pilih titik area untuk menyematkan koordinat kurir.');

    const mapContainerRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markerRef = useRef(null);
    const valueRef = useRef(value);
    valueRef.current = value;

    const terapkanTitik = async (lat, lng, alamatOtomatis = null) => {
        const nextCoords = { lat: Number(lat), lng: Number(lng) };
        setCoords(nextCoords);

        if (leafletMapRef.current && markerRef.current) {
            markerRef.current.setLatLng([nextCoords.lat, nextCoords.lng]);
            leafletMapRef.current.panTo([nextCoords.lat, nextCoords.lng]);
        }

        if (alamatOtomatis) {
            onChange(formatAddressWithCoords(alamatOtomatis, nextCoords.lat, nextCoords.lng));
            setStatusPeta(`Titik lokasi terpilih (${nextCoords.lat.toFixed(5)}, ${nextCoords.lng.toFixed(5)})`);
            return;
        }

        // Update segera dengan koordinat, lalu coba ambil nama jalan dari OpenStreetMap Nominatim
        onChange(formatAddressWithCoords(valueRef.current, nextCoords.lat, nextCoords.lng));
        setStatusPeta(`Mengambil nama jalan di titik (${nextCoords.lat.toFixed(5)}, ${nextCoords.lng.toFixed(5)})...`);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextCoords.lat}&lon=${nextCoords.lng}`,
                { headers: { 'Accept-Language': 'id' } },
            );
            if (res.ok) {
                const data = await res.json();
                if (data?.display_name) {
                    const ringkas = data.display_name.split(',').slice(0, 4).join(',').trim();
                    onChange(formatAddressWithCoords(ringkas, nextCoords.lat, nextCoords.lng));
                    setStatusPeta(`Titik Maps tersimpan: ${ringkas}`);
                    return;
                }
            }
        } catch {
            // Fallback offline tetap menyimpan koordinat pada alamat
        }
        setStatusPeta(`Titik Maps tersimpan (${nextCoords.lat.toFixed(5)}, ${nextCoords.lng.toFixed(5)})`);
    };

    const cariLokasiDiPeta = async () => {
        const q = queryLokasi.trim();
        if (!q) return;
        setSedangMencari(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`,
                { headers: { 'Accept-Language': 'id' } },
            );
            if (res.ok) {
                const list = await res.json();
                if (list && list.length > 0) {
                    const item = list[0];
                    const ringkas = item.display_name.split(',').slice(0, 4).join(',').trim();
                    await terapkanTitik(parseFloat(item.lat), parseFloat(item.lon), ringkas);
                } else {
                    setStatusPeta('Lokasi tidak ditemukan. Silakan klik langsung titik pada peta.');
                }
            }
        } catch {
            setStatusPeta('Pencarian peta membutuhkan internet. Anda tetap bisa memilih tombol titik area di bawah.');
        } finally {
            setSedangMencari(false);
        }
    };

    const gunakanLokasiSaatIni = () => {
        if (!navigator.geolocation) {
            setStatusPeta('Browser tidak mendukung GPS otomatis. Silakan klik titik pada peta.');
            return;
        }
        setStatusPeta('Mendeteksi titik GPS perangkat...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                terapkanTitik(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setStatusPeta('Izin GPS tidak diberikan. Silakan klik langsung titik pada peta.');
            },
        );
    };

    // Muat Leaflet.js & CSS secara dinamis untuk peta interaktif OpenStreetMap
    useEffect(() => {
        if (!mapOpen || typeof window === 'undefined') return;

        let cancelled = false;

        const initLeaflet = () => {
            if (cancelled || !window.L || !mapContainerRef.current) return;
            if (leafletMapRef.current) {
                window.setTimeout(() => leafletMapRef.current?.invalidateSize(), 150);
                return;
            }

            const L = window.L;
            const start = extractCoordsFromAddress(valueRef.current) || coords || DEFAULT_CENTER;
            const map = L.map(mapContainerRef.current).setView([start.lat, start.lng], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap',
            }).addTo(map);

            const customIcon = L.divIcon({
                className: 'cleanwash-map-pin',
                html: `<div style="width:28px;height:28px;border-radius:9999px;background:#0D9488;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">●</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });

            const marker = L.marker([start.lat, start.lng], {
                draggable: true,
                icon: customIcon,
            }).addTo(map);

            map.on('click', (e) => {
                terapkanTitik(e.latlng.lat, e.latlng.lng);
            });

            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                terapkanTitik(pos.lat, pos.lng);
            });

            leafletMapRef.current = map;
            markerRef.current = marker;

            window.setTimeout(() => map.invalidateSize(), 200);
        };

        if (!document.getElementById('leaflet-css-cdn')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css-cdn';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        if (window.L) {
            initLeaflet();
        } else {
            let script = document.getElementById('leaflet-js-cdn');
            if (!script) {
                script = document.createElement('script');
                script.id = 'leaflet-js-cdn';
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.async = true;
                document.body.appendChild(script);
            }
            script.addEventListener('load', initLeaflet);
            return () => {
                cancelled = true;
                script?.removeEventListener('load', initLeaflet);
            };
        }

        return () => {
            cancelled = true;
        };
    }, [mapOpen]);

    return (
        <div className="mt-2 rounded-xl border border-teal-200 bg-[#F6FBF9] p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#134E4A]">
                    <IconPin className="h-4 w-4 text-[#0D9488]" />
                    <span>Pilih Titik Lokasi Pengantaran (Terhubung ke Maps Kurir)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={gunakanLokasiSaatIni}
                        className="rounded-lg border border-teal-300 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0D9488] hover:bg-[#CCFBF1] hover:text-[#134E4A] transition cursor-pointer"
                    >
                        Titik GPS Saat Ini
                    </button>
                    <button
                        type="button"
                        onClick={() => setMapOpen((prev) => !prev)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        {mapOpen ? 'Sembunyikan Peta' : 'Buka Peta'}
                    </button>
                </div>
            </div>

            {mapOpen && (
                <>
                    {/* Bar Cari Lokasi di Peta */}
                    <div className="flex gap-1.5">
                        <div className="relative flex-1">
                            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={queryLokasi}
                                onChange={(e) => setQueryLokasi(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        cariLokasiDiPeta();
                                    }
                                }}
                                placeholder="Cari jalan, kelurahan, atau kampus di peta..."
                                className="block w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-800 focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={cariLokasiDiPeta}
                            disabled={sedangMencari}
                            className="rounded-lg bg-[#0D9488] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#134E4A] disabled:opacity-50 cursor-pointer"
                        >
                            {sedangMencari ? 'Mencari...' : 'Cari Peta'}
                        </button>
                    </div>

                    {/* Kanvas Peta Interaktif OpenStreetMap */}
                    <div
                        ref={mapContainerRef}
                        className="h-44 w-full overflow-hidden rounded-lg border border-teal-200 bg-teal-50/40"
                    />

                    {/* Pintasan Area Cepat */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500">Titik Cepat:</span>
                        {TITIK_AREA_CEPAT.map((area) => (
                            <button
                                key={area.label}
                                type="button"
                                onClick={() => terapkanTitik(area.lat, area.lng, area.alamat)}
                                className="rounded-md border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#134E4A] hover:bg-[#CCFBF1] transition cursor-pointer"
                            >
                                {area.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="truncate">{statusPeta}</span>
                        <a
                            href={buildGoogleMapsUrl(value || `${coords.lat},${coords.lng}`)}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 font-bold text-[#0D9488] hover:underline ml-2"
                        >
                            Tes Buka Google Maps ↗
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
