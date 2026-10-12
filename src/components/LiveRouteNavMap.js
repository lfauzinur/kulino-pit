'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation2, MapPin, ExternalLink, Crosshair, Layers, Compass, Check } from 'lucide-react';

export default function LiveRouteNavMap({ 
  route, 
  userPosition, 
  reachedCheckpoints = new Set(),
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const checkpointMarkersRef = useRef([]);
  const polylineRef = useRef(null);
  const [mapType, setMapType] = useState('google-roadmap'); // 'google-roadmap' | 'google-satellite' | 'osm'
  const [followUser, setFollowUser] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);

  const checkpoints = useMemo(() => {
    if (!route || !route.checkpoints) return [];
    return route.checkpoints.filter(cp => typeof cp.lat === 'number' && typeof cp.lng === 'number' && cp.lat !== 0 && cp.lng !== 0);
  }, [route]);

  // Construct Google Maps Turn-by-Turn Navigation URL
  const googleMapsUrl = useMemo(() => {
    if (checkpoints.length === 0) return 'https://www.google.com/maps';
    
    // Origin: current GPS if available, else first checkpoint
    const origin = userPosition 
      ? `${userPosition.lat},${userPosition.lng}` 
      : `${checkpoints[0].lat},${checkpoints[0].lng}`;

    // Destination: last checkpoint
    const destination = `${checkpoints[checkpoints.length - 1].lat},${checkpoints[checkpoints.length - 1].lng}`;

    // Waypoints: intermediate checkpoints (up to 9 for Google Maps free directions URL)
    let waypointsParam = '';
    if (checkpoints.length > 2) {
      const intermediate = checkpoints.slice(1, checkpoints.length - 1).slice(0, 8);
      const points = intermediate.map(cp => `${cp.lat},${cp.lng}`).join('|');
      waypointsParam = `&waypoints=${encodeURIComponent(points)}`;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointsParam}&travelmode=bicycling`;
  }, [checkpoints, userPosition]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center: first checkpoint or Banyuwangi center
    const defaultCenter = checkpoints.length > 0 
      ? [checkpoints[0].lat, checkpoints[0].lng] 
      : [-8.2192, 114.3692];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer based on mapType
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing tile layer
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let subdomains = ['0', '1', '2', '3'];

    if (mapType === 'google-satellite') {
      // Google Hybrid (Satellite + Roads/Labels)
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    } else if (mapType === 'osm') {
      // OpenStreetMap
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = ['a', 'b', 'c'];
    } else {
      // Google Maps Standard Roadmap (Default)
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: subdomains,
    }).addTo(map);
  }, [mapType]);

  // Draw Checkpoints and Route Track
  useEffect(() => {
    const map = mapRef.current;
    if (!map || checkpoints.length === 0) return;

    // Clear old checkpoint markers
    checkpointMarkersRef.current.forEach(m => m.remove());
    checkpointMarkersRef.current = [];

    // Clear old polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const routeColor = route.color || '#0284C7';
    const latLngs = checkpoints.map(cp => [cp.lat, cp.lng]);

    // Outer glow casing line
    const casingPolyline = L.polyline(latLngs, {
      color: '#FFFFFF',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Inner vibrant route line
    const polyline = L.polyline(latLngs, {
      color: routeColor,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: route.dashArray || null,
    }).addTo(map);

    polylineRef.current = L.featureGroup([casingPolyline, polyline]);

    // Add Checkpoint Markers
    checkpoints.forEach((cp, idx) => {
      const cpId = cp.id || `cp-${idx}`;
      const isReached = reachedCheckpoints.has(cpId);
      const isStart = idx === 0;
      const isFinish = idx === checkpoints.length - 1;

      const bgColor = isReached ? '#10B981' : isStart ? '#0284C7' : isFinish ? '#E11D48' : routeColor;
      const labelText = isReached ? '✓' : isStart ? 'S' : isFinish ? 'F' : `${idx + 1}`;

      const iconHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${bgColor};
          color: #ffffff;
          font-weight: 900;
          font-size: 13px;
          font-family: system-ui, sans-serif;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: transform 0.2s ease;
        ">
          ${labelText}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-checkpoint-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([cp.lat, cp.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedCheckpoint(cp);
      });

      checkpointMarkersRef.current.push(marker);
    });

    // Fit map bounds to show entire route with comfortable padding
    try {
      const bounds = L.latLngBounds(latLngs);
      if (userPosition) {
        bounds.extend([userPosition.lat, userPosition.lng]);
      }
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } catch (e) { /* ignore */ }
  }, [checkpoints, route.color, reachedCheckpoints]);

  // Update Live User GPS Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userPosition && typeof userPosition.lat === 'number' && typeof userPosition.lng === 'number') {
      const userLatLng = [userPosition.lat, userPosition.lng];

      const userIconHtml = `
        <div style="position: relative; width: 36px; height: 36px;">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.25);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #0284C7;
            border: 3.5px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
          ">
            🚴
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'custom-user-gps-pin',
        html: userIconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
      }

      if (followUser) {
        map.panTo(userLatLng, { animate: true, duration: 0.5 });
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }
  }, [userPosition, followUser]);

  // Center on user position
  const handleRecenterUser = () => {
    const map = mapRef.current;
    if (!map) return;

    if (userPosition && typeof userPosition.lat === 'number' && typeof userPosition.lng === 'number') {
      map.setView([userPosition.lat, userPosition.lng], 16, { animate: true });
      setFollowUser(true);
    } else {
      alert('Sinyal GPS belum terdeteksi. Pastikan izin lokasi (GPS) pada browser/perangkat Anda sudah diaktifkan.');
    }
  };

  // Center on full route
  const handleFitRoute = () => {
    const map = mapRef.current;
    if (!map || checkpoints.length === 0) return;
    setFollowUser(false);
    const bounds = L.latLngBounds(checkpoints.map(cp => [cp.lat, cp.lng]));
    if (userPosition) bounds.extend([userPosition.lat, userPosition.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100 ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-[340px] sm:h-[400px] z-0" />

      {/* Top Floating Badge Bar */}
      <div className="absolute top-3 left-3 right-14 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold shadow-md border border-white/10 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{userPosition ? 'GPS Terhubung' : 'Mencari GPS...'}</span>
          <span className="text-slate-400 font-normal">|</span>
          <span className="text-sky-300 font-extrabold">{checkpoints.length} Checkpoints</span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {/* Recenter & Fit Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={handleRecenterUser}
            className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
              followUser 
                ? 'bg-sky-600 text-white shadow-sky-500/30 ring-2 ring-sky-300' 
                : 'bg-white/95 hover:bg-white text-slate-700 hover:text-sky-600 border border-slate-200'
            }`}
            title="Pusatkan ke Posisi GPS Saya"
          >
            <Crosshair size={14} className={followUser ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Posisi Saya</span>
          </button>

          <button
            onClick={handleFitRoute}
            className="px-3 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-sky-600 text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lihat Keseluruhan Rute"
          >
            <Compass size={14} />
            <span className="hidden sm:inline">Peta Rute</span>
          </button>

          {/* Map Layer Switcher */}
          <button
            onClick={() => setMapType(prev => prev === 'google-roadmap' ? 'google-satellite' : 'google-roadmap')}
            className="px-2.5 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
            title="Ganti Tampilan Satelit / Roadmap"
          >
            <Layers size={14} />
            <span className="text-[10px] font-black uppercase">{mapType === 'google-satellite' ? 'Sat' : 'Map'}</span>
          </button>
        </div>

        {/* Google Maps Direct Turn-by-Turn Navigation Button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          title="Buka Navigasi Suara Langsung di Google Maps"
        >
          <span>Navigasi Google Maps</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Selected Checkpoint Detail Popup Card */}
      {selectedCheckpoint && (
        <div className="absolute top-14 left-3 right-3 sm:left-auto sm:right-3 sm:w-72 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-sky-100 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-[var(--color-primary)] font-black text-xs flex items-center justify-center">
                <MapPin size={15} />
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-black text-xs text-slate-900 leading-tight truncate">{selectedCheckpoint.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{selectedCheckpoint.description || 'Titik checkpoint rute gowes.'}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCheckpoint(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer">
              ✕
            </button>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Lat: {selectedCheckpoint.lat.toFixed(4)}</span>
            <span>Lng: {selectedCheckpoint.lng.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
