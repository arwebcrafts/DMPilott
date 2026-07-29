import { render, screen } from '@testing-library/react'
import { CTAButton } from '../CTAButton'

describe('CTAButton', () => {
  it('renders with default props', () => {
    render(<CTAButton>Click me</CTAButton>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-slate-900', 'text-white')
  })

  it('renders with variant secondary', () => {
    render(<CTAButton variant="secondary">Secondary</CTAButton>)
    const button = screen.getByRole('button', { name: 'Secondary' })
    expect(button).toHaveClass('bg-gray-100', 'text-gray-900')
  })

  it('renders with variant outline', () => {
    render(<CTAButton variant="outline">Outline</CTAButton>)
    const button = screen.getByRole('button', { name: 'Outline' })
    expect(button).toHaveClass('border-2')
  })

  it('renders with size sm', () => {
    render(<CTAButton size="sm">Small</CTAButton>)
    const button = screen.getByRole('button', { name: 'Small' })
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
  })

  it('renders with size lg', () => {
    render(<CTAButton size="lg">Large</CTAButton>)
    const button = screen.getByRole('button', { name: 'Large' })
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg')
  })

  it('renders with loading state', () => {
    render(<CTAButton isLoading>Loading</CTAButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with disabled state', () => {
    render(<CTAButton disabled>Disabled</CTAButton>)
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
  })

  it('renders as link when href is provided', () => {
    render(<CTAButton href="/test">Link</CTAButton>)
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<CTAButton onClick={handleClick}>Click</CTAButton>)
    const button = screen.getByRole('button', { name: 'Click' })
    button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
