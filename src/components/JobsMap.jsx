import { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const CITY_COORDS = {
  "Sydney":       { lat: -33.8688, lng: 151.2093 },
  "Melbourne":    { lat: -37.8136, lng: 144.9631 },
  "Brisbane":     { lat: -27.4698, lng: 153.0251 },
  "Gold Coast":   { lat: -28.0167, lng: 153.4000 },
  "Cairns":       { lat: -16.9206, lng: 145.7781 },
  "Byron Bay":    { lat: -28.6474, lng: 153.6020 },
  "Perth":        { lat: -31.9505, lng: 115.8605 },
  "Darwin":       { lat: -12.4634, lng: 130.8456 },
  "Adelaide":     { lat: -34.9285, lng: 138.6007 },
  "Hobart":       { lat: -42.8821, lng: 147.3272 },
  "Noosa":        { lat: -26.3900, lng: 153.0900 },
  "Townsville":   { lat: -19.2590, lng: 146.8169 },
  "Airlie Beach": { lat: -20.2700, lng: 148.7200 },
  "Broome":       { lat: -17.9614, lng: 122.2359 },
};

const AU_CENTER = { lat: -25.5, lng: 133.5 };

const MAP_STYLES = [
  { featureType: "water",                   elementType: "geometry.fill",   stylers: [{ color: "#b8d4e8" }] },
  { featureType: "landscape",               elementType: "geometry.fill",   stylers: [{ color: "#f0efe9" }] },
  { featureType: "road",                    elementType: "all",             stylers: [{ visibility: "simplified" }, { saturation: -100 }] },
  { featureType: "road.highway",            elementType: "geometry.fill",   stylers: [{ color: "#e0ddd8" }] },
  { featureType: "road.arterial",           elementType: "geometry.fill",   stylers: [{ color: "#eceae5" }] },
  { featureType: "poi",                     elementType: "all",             stylers: [{ visibility: "off" }] },
  { featureType: "transit",                 elementType: "all",             stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill",   stylers: [{ color: "#8a8a82" }] },
  { featureType: "administrative.locality", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] },
  { featureType: "administrative.country",  elementType: "geometry.stroke",    stylers: [{ color: "#c5b99a" }, { weight: 1.5 }] },
  { featureType: "administrative.province", elementType: "geometry.stroke",    stylers: [{ color: "#d4cec5" }, { weight: 0.8 }] },
];

function makeIcon(count, isSelected) {
  const size = isSelected ? 44 : 36;
  const r    = size / 2;
  const fill = isSelected ? "#D4503A" : "#E8654A";
  const fs   = count > 9 ? 11 : 13;
  const svg  = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${r}" cy="${r}" r="${r - 2}" fill="${fill}" stroke="white" stroke-width="2.5"/>` +
    `<text x="${r}" y="${r + fs * 0.38}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="white" font-family="sans-serif">${count}</text>` +
    `</svg>`
  );
  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new window.google.maps.Size(size, size),
    anchor:     new window.google.maps.Point(r, r),
  };
}

export default function JobsMap({ positionsByCity = {}, selectedCity = null, onSelect }) {
  const [openCity, setOpenCity] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-pairgo",
    googleMapsApiKey: API_KEY,
  });

  const onLoad = useCallback((map) => { mapRef.current = map; }, []);

  const handleMarkerClick = (city) => {
    setOpenCity(city);
    onSelect(city === selectedCity ? null : city);
  };

  // Missing API key
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    return (
      <div style={{ borderRadius: 20, background: "#F0EFE9", border: "1.5px dashed rgba(0,0,0,.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 12, minHeight: 320 }}>
        <div style={{ fontSize: 36 }}>🗺️</div>
        <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Google Maps not configured</div>
        <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", textAlign: "center", maxWidth: 380, lineHeight: 1.65 }}>
          Add your key to <code style={{ background: "rgba(0,0,0,.07)", padding: "2px 6px", borderRadius: 5 }}>.env</code>:
          <br /><br />
          <code style={{ background: "rgba(0,0,0,.07)", padding: "7px 14px", borderRadius: 9, display: "inline-block", fontSize: 12 }}>
            VITE_GOOGLE_MAPS_API_KEY=tu_api_key
          </code>
          <br /><br />
          Enable <strong>Maps JavaScript API</strong> at{" "}
          <span style={{ color: "var(--coral)" }}>console.cloud.google.com</span>
        </div>
      </div>
    );
  }

  // Load error
  if (loadError) {
    return (
      <div style={{ borderRadius: 20, background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 200 }}>
        <div style={{ fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 700, color: "#DC2626" }}>Failed to load Google Maps</div>
        <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "#6B7280" }}>Check your API key and that the Maps JavaScript API is enabled.</div>
      </div>
    );
  }

  // Loading
  if (!isLoaded) {
    return (
      <div style={{ borderRadius: 20, background: "#F0EFE9", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid rgba(0,0,0,.08)", borderTopColor: "var(--coral)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>Loading map…</div>
        </div>
      </div>
    );
  }

  const citiesWithJobs = Object.entries(CITY_COORDS).filter(([city]) => (positionsByCity[city] || 0) > 0);

  return (
    <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,0,0,.06)", boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: 420 }}
        center={AU_CENTER}
        zoom={4}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          minZoom: 3,
          maxZoom: 13,
        }}
        onLoad={onLoad}
        onClick={() => { setOpenCity(null); onSelect(null); }}
      >
        {/* City markers */}
        {citiesWithJobs.map(([city, pos]) => (
          <Marker
            key={city}
            position={pos}
            icon={makeIcon(positionsByCity[city], selectedCity === city)}
            title={`${city} — ${positionsByCity[city]} job${positionsByCity[city] !== 1 ? "s" : ""}`}
            zIndex={selectedCity === city ? 10 : 1}
            onClick={() => handleMarkerClick(city)}
          />
        ))}

        {/* InfoWindow */}
        {openCity && CITY_COORDS[openCity] && (
          <InfoWindow
            position={CITY_COORDS[openCity]}
            onCloseClick={() => setOpenCity(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -22) }}
          >
            <div style={{ padding: "4px 2px", minWidth: 140, fontFamily: "var(--font-b)" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", marginBottom: 5 }}>{openCity}</div>
              <div style={{ fontSize: 12, color: "#E8654A", fontWeight: 700, marginBottom: 10 }}>
                {positionsByCity[openCity]} open position{positionsByCity[openCity] !== 1 ? "s" : ""}
              </div>
              <button
                onClick={() => { onSelect(openCity); setOpenCity(null); }}
                style={{ width: "100%", padding: "7px", borderRadius: 8, background: "#E8654A", color: "#fff", border: "none", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Filter jobs →
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend bar */}
      <div style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,.06)", padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#E8654A", boxShadow: "0 0 0 2px #fff, 0 0 0 3px rgba(232,101,74,.3)" }} />
            <span style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)" }}>Cities with open jobs</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#D4503A", boxShadow: "0 0 0 2px #fff" }} />
            <span style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)" }}>Selected</span>
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)" }}>
          {citiesWithJobs.length} {citiesWithJobs.length !== 1 ? "cities" : "city"} with jobs · click a marker to filter
        </span>
      </div>
    </div>
  );
}
