import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global de Leaflet (para que no falle en JSDOM)
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => null,
    CircleMarker: ({ children }) => <div data-testid="circle-marker">{children}</div>,
    Popup: ({ children }) => <div>{children}</div>,
    useMap: () => ({ setView: vi.fn() }),
}))