import { render, screen } from '@testing-library/react'
import { AirChart } from '../components/AirChart'

describe('AirChart', () => {
  it('muestra mensaje cuando no hay datos', () => {
    render(<AirChart data={null} />)
    expect(screen.getByText(/Selecciona un distrito/i)).toBeInTheDocument()
  })

  it('renderiza el gráfico cuando hay datos', () => {
    const mockData = {
      district_name: 'Ciutat Vella',
      historical_data: [
        { time: '01/11', no2: 45, pm10: 30 },
        { time: '02/11', no2: 50, pm10: 35 },
      ],
      predictions: [
        { time: '03/11', predicted_no2: 48, predicted_pm10: 33 },
      ],
    }
    render(<AirChart data={mockData} reduction={0} />)
    expect(screen.getByText(/Calidad del Aire/i)).toBeInTheDocument()
    expect(screen.getByText(/Ciutat Vella/i)).toBeInTheDocument()
  })

  it('muestra el aviso de simulación cuando reduction > 0', () => {
    const mockData = {
      district_name: 'Eixample',
      historical_data: [{ time: '01/11', no2: 45, pm10: 30 }],
      predictions: [],
    }
    render(<AirChart data={mockData} reduction={20} />)
    expect(screen.getByText(/Simulación: -20%/i)).toBeInTheDocument()
  })
})