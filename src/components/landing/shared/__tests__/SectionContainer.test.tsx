import { render, screen } from '@testing-library/react'
import { SectionContainer } from '../SectionContainer'

describe('SectionContainer', () => {
  it('renders children correctly', () => {
    render(
      <SectionContainer>
        <div>Test content</div>
      </SectionContainer>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies default padding', () => {
    render(
      <SectionContainer>
        <div>Content</div>
      </SectionContainer>
    )
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('py-16', 'px-4')
  })

  it('applies sm padding variant', () => {
    render(
      <SectionContainer padding="sm">
        <div>Content</div>
      </SectionContainer>
    )
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('py-8', 'px-4')
  })

  it('applies lg padding variant', () => {
    render(
      <SectionContainer padding="lg">
        <div>Content</div>
      </SectionContainer>
    )
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('py-24', 'px-4')
  })

  it('applies xl padding variant', () => {
    render(
      <SectionContainer padding="xl">
        <div>Content</div>
      </SectionContainer>
    )
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('py-32', 'px-4')
  })

  it('applies custom className', () => {
    render(
      <SectionContainer className="custom-class">
        <div>Content</div>
      </SectionContainer>
    )
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('applies id attribute', () => {
    render(
      <SectionContainer id="test-section">
        <div>Content</div>
      </SectionContainer>
    )
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveAttribute('id', 'test-section')
  })
})
