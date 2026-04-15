"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import districtData from "../../public/data/sc01-district.json";

const SC01_CENTER: [number, number] = [32.5, -80.2];
const INITIAL_ZOOM = 8;

const districtStyle = {
  color: "#1E3D8C",
  weight: 3,
  opacity: 1,
  fillColor: "#1E3D8C",
  fillOpacity: 0.1,
  dashArray: undefined,
};

export function DistrictMapLeaflet() {
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
      <GeoJSON
        data={districtData as GeoJsonObject}
        style={districtStyle}
      />
    </MapContainer>
  );
}
