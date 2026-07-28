import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'

describe('StatCard', () => {
  it('renders with value and label', () => {
    render(<StatCard value="100" label="Users" />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(
      <StatCard
        value="100"
        label="Users"
        icon={<span data-testid="test-icon">Icon</span>}
      />
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <StatCard
        value="100"
        label="Users"
        description="Active users"
      />
    )
    expect(screen.getByText('Active users')).toBeInTheDocument()
  })

  it('renders with positive trend', () => {
    render(
      <StatCard
        value="100"
        label="Users"
        trend="up"
        trendValue="+10%"
      />
    )
    expect(screen.getByText('+10%')).toBeInTheDocument()
  })

  it('renders with negative trend', () => {
    render(
      <StatCard
        value="100"
        label="Users"
        trend="down"
        trendValue="-10%"
      />
    )
    expect(screen.getByText('-10%')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <StatCard
        value="100"
        label="Users"
        className="custom-class"
      />
    )
    // className lands on the outer card, not the inline value/trend row.
    const card = screen.getByText('100').closest('.custom-class')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('p-6', 'border')
  })
})
