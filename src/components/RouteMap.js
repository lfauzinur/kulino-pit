'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RouteMap({ route, hoveredPoint }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: route.center,
      zoom: route.zoom,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // OpenStreetMap tile layer (same style as reference site)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Draw the route polyline
    const polyline = L.polyline(route.coordinates, {
      color: route.color,
      weight: 5,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map);

    // Start marker (green circle with bike icon)
    const startIcon = L.divIcon({
      className: 'route-marker-start',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#27ae60;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:18px;line-height:1;">🚴</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker(route.coordinates[0], { icon: startIcon })
      .addTo(map)
      .bindPopup('<b>Start</b>');

    // End marker (red circle) — only if route doesn't loop back
    const last = route.coordinates[route.coordinates.length - 1];
    const first = route.coordinates[0];
    const isLoop = Math.abs(first[0] - last[0]) < 0.001 && Math.abs(first[1] - last[1]) < 0.001;

    if (!isLoop) {
      const endIcon = L.divIcon({
        className: 'route-marker-end',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#e74c3c;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker(last, { icon: endIcon })
        .addTo(map)
        .bindPopup('<b>Finish</b>');
    }

    // Meeting point marker
    const meetingIcon = L.divIcon({
      className: 'route-marker-meeting',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:white;border:2px solid ${route.color};box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:16px;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker(route.center, { icon: meetingIcon })
      .addTo(map)
      .bindPopup(`<b>Meeting Point</b><br/>${route.meetingPoint}`);

    // Fit map to route bounds
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [route]);

  // Handle hovered elevation point — show bike icon on map
  useEffect(() => {
    if (!mapInstance.current) return;

    if (hoveredPoint) {
      if (!markerRef.current) {
        const bikeIcon = L.divIcon({
          className: 'route-marker-bike',
          html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${route.color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🚴</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        markerRef.current = L.marker(hoveredPoint, { icon: bikeIcon }).addTo(mapInstance.current);
      } else {
        markerRef.current.setLatLng(hoveredPoint);
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [hoveredPoint, route.color]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
}
