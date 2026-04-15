"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";

const SC01_CENTER: [number, number] = [32.5, -80.2];
const INITIAL_ZOOM = 8;

const districtStyle = {
  color: "#1E3D8C",
  weight: 3,
  opacity: 1,
  fillColor: "#1E3D8C",
  fillOpacity: 0.1,
};

export function DistrictMapLeaflet() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/data/sc01-district.json")
      .then((r) => r.json())
      .then((data) => setGeoData(data as GeoJsonObject))
      .catch(() => {});
  }, []);

  return (
    <MapContainer
      center={SC01_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={6}
      maxZoom={18}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {geoData && (
        <GeoJSON
          data={geoData}
          style={districtStyle}
        />
      )}
    </MapContainer>
  );
}
