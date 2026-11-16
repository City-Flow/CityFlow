import { render, screen, waitFor } from '@testing-library/react'
import { TourismTab } from '../components/TourismTab'
import { vi } from 'vitest'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/tourism/districts/')) {
        return Promise.resolve({
          data: [
            {
              id: 1, district_name: 'Ciutat Vella', latitude: 41.38, longitude: 2.17,
              hut_count: 850, avg_noise_db: 55, status: 'warning',
              variance: '+0.0%', last_updated: '2025-12-31',
            },
          ],
        })
      }
      if (url.includes('/tourism/metrics/')) {
        return Promise.resolve({
          data: { historical_data: [{ year: 2025, total_huts: 850, new_huts: 10 }] },
        })
      }
      return Promise.resolve({ data: [] })
    }),
  },
}))

describe('TourismTab', () => {
  it('muestra los datos del distrito', async () => {
    render(<TourismTab />)
    
    // ✅ Buscamos el número de HUTs, que es único
    await waitFor(() => {
      expect(screen.getByText(/850 HUTs/i)).toBeInTheDocument()
    })
    
    // ✅ Opcional: verificar que aparece el nombre del distrito (al menos una vez)
    const districtNames = screen.getAllByText(/Ciutat Vella/i)
    expect(districtNames.length).toBeGreaterThan(0)
  })
})