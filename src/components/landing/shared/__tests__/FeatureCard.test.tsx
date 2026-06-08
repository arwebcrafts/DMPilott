import { render, screen } from '@testing-library/react'
import { FeatureCard } from '../FeatureCard'

describe('FeatureCard', () => {
  it('renders with icon, title, and description', () => {
    render(
      <FeatureCard
        icon={<span data-testid="test-icon">Icon</span>}
        title="Test Feature"
        description="Test description"
      />
    )
    expect(screen.getByText('Test Feature')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <FeatureCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        className="custom-class"
      />
    )
    const card = screen.getByText('Test').parentElement
    expect(card).toHaveClass('custom-class')
  })
})
