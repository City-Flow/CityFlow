import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthFormCard } from '../components/AuthFormCard'

describe('AuthFormCard', () => {
  it('muestra el título y el formulario', () => {
    render(
      <AuthFormCard title="Login" subtitle="Accede" onSubmit={() => {}}>
        <input data-testid="email" />
      </AuthFormCard>
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByTestId('email')).toBeInTheDocument()
  })

  it('muestra el error cuando existe', () => {
    render(
      <AuthFormCard title="Login" error="Credenciales inválidas" onSubmit={() => {}}>
        <input />
      </AuthFormCard>
    )
    expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument()
  })

  it('llama a onSubmit al enviar', async () => {
    const mockSubmit = vi.fn((e) => e.preventDefault())
    render(
      <AuthFormCard title="Login" onSubmit={mockSubmit}>
        <input />
      </AuthFormCard>
    )
    await userEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(mockSubmit).toHaveBeenCalledTimes(1)
  })
})