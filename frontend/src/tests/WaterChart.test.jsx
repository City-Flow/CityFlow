import { render, screen } from '@testing-library/react'
import { WaterChart } from '../components/WaterChart'

describe('WaterChart', () => {
  it('muestra mensaje cuando no hay datos', () => {
    render(<WaterChart data={null} />)
    expect(screen.getByText(/Selecciona un distrito/i)).toBeInTheDocument()
  })

  it('renderiza el gráfico cuando hay datos', () => {
    const mockData = {
      district_name: 'Gràcia',
      historical_data: [
        { time: '2023', consumption: 1200 },
        { time: '2024', consumption: 1250 },
      ],
      predictions: [],
    }
    render(<WaterChart data={mockData} />)
    expect(screen.getByText(/Consumo de Agua/i)).toBeInTheDocument()
    expect(screen.getByText(/Gràcia/i)).toBeInTheDocument()
  })
})