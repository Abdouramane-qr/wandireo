import React, { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './GeoMap.css';

export interface GeoMapMarker {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    subtitle?: string;
    onSelect?: () => void;
}

interface GeoMapProps {
    markers: GeoMapMarker[];
    height?: number;
    className?: string;
}

interface LeafletModules {
    L: typeof import('leaflet');
    MapContainer: typeof import('react-leaflet').MapContainer;
    TileLayer: typeof import('react-leaflet').TileLayer;
    Popup: typeof import('react-leaflet').Popup;
    CircleMarker: typeof import('react-leaflet').CircleMarker;
    useMap: typeof import('react-leaflet').useMap;
}

function FitBounds({
    markers,
    useMapHook,
    leaflet,
}: {
    markers: GeoMapMarker[];
    useMapHook: LeafletModules['useMap'];
    leaflet: LeafletModules['L'];
}) {
    const map = useMapHook();

    useEffect(() => {
        if (markers.length === 0) {
            return;
        }

        if (markers.length === 1) {
            map.setView([markers[0].latitude, markers[0].longitude], 12, {
                animate: false,
            });

            return;
        }

        const bounds = leaflet.latLngBounds(
            markers.map(
                (marker) =>
                    [marker.latitude, marker.longitude] as [number, number],
            ),
        );

        map.fitBounds(bounds, {
            padding: [36, 36],
            animate: false,
        });
    }, [leaflet, map, markers]);

    return null;
}

export const GeoMap: React.FC<GeoMapProps> = ({
    markers,
    height = 320,
    className = '',
}) => {
    const [leafletModules, setLeafletModules] = useState<LeafletModules | null>(
        null,
    );

    const center = useMemo<[number, number]>(
        () =>
            markers.length > 0
                ? [markers[0].latitude, markers[0].longitude]
                : [43.7102, 7.262],
        [markers],
    );

    useEffect(() => {
        let isMounted = true;

        void Promise.all([import('leaflet'), import('react-leaflet')]).then(
            ([leaflet, reactLeaflet]) => {
                if (!isMounted) {
                    return;
                }

                setLeafletModules({
                    L: leaflet.default ?? leaflet,
                    MapContainer: reactLeaflet.MapContainer,
                    TileLayer: reactLeaflet.TileLayer,
                    Popup: reactLeaflet.Popup,
                    CircleMarker: reactLeaflet.CircleMarker,
                    useMap: reactLeaflet.useMap,
                });
            },
        );

        return () => {
            isMounted = false;
        };
    }, []);

    if (markers.length === 0) {
        return null;
    }

    if (!leafletModules) {
        return (
            <div
                className={`wdr-geo-map ${className}`.trim()}
                style={{ minHeight: `${height}px` }}
            />
        );
    }

    const { MapContainer, TileLayer, Popup, CircleMarker, useMap, L } =
        leafletModules;

    return (
        <div
            className={`wdr-geo-map ${className}`.trim()}
            style={{ minHeight: `${height}px` }}
        >
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={false}
                className="wdr-geo-map__leaflet"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds markers={markers} useMapHook={useMap} leaflet={L} />
                {markers.map((marker) => (
                    <CircleMarker
                        key={marker.id}
                        center={[marker.latitude, marker.longitude]}
                        radius={10}
                        pathOptions={{
                            color: '#0ea5a4',
                            fillColor: '#f97316',
                            fillOpacity: 0.92,
                            weight: 3,
                        }}
                    >
                        <Popup>
                            <div className="wdr-geo-map__popup">
                                <strong>{marker.title}</strong>
                                {marker.subtitle ? <p>{marker.subtitle}</p> : null}
                                {marker.onSelect ? (
                                    <button
                                        type="button"
                                        className="wdr-geo-map__popup-action"
                                        onClick={marker.onSelect}
                                    >
                                        Voir l&apos;offre
                                    </button>
                                ) : null}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default GeoMap;
