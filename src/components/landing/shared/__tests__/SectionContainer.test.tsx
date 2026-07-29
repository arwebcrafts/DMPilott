import { render, screen } from '@testing-library/react'
import { SectionContainer } from '../SectionContainer'

// SectionContainer renders <section> (variant/padding/id/className) wrapping an
// inner <div> that carries the max-width and horizontal padding.
const sectionFor = (text: string) => screen.getByText(text).closest('section')

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
    expect(sectionFor('Content')).toHaveClass('py-16', 'md:py-24')
  })

  it('applies sm padding variant', () => {
    render(
      <SectionContainer padding="sm">
        <div>Content</div>
      </SectionContainer>
    )
    expect(sectionFor('Content')).toHaveClass('py-10', 'md:py-14')
  })

  it('applies md padding variant', () => {
    render(
      <SectionContainer padding="md">
        <div>Content</div>
      </SectionContainer>
    )
    expect(sectionFor('Content')).toHaveClass('py-14', 'md:py-20')
  })

  it('applies lg padding variant', () => {
    render(
      <SectionContainer padding="lg">
        <div>Content</div>
      </SectionContainer>
    )
    expect(sectionFor('Content')).toHaveClass('py-16', 'md:py-24')
  })

  it('applies horizontal padding to the inner wrapper', () => {
    render(
      <SectionContainer>
        <div>Content</div>
      </SectionContainer>
    )
    expect(screen.getByText('Content').parentElement).toHaveClass('px-4', 'mx-auto')
  })

  it('applies the max width variant', () => {
    render(
      <SectionContainer maxWidth="md">
        <div>Content</div>
      </SectionContainer>
    )
    expect(screen.getByText('Content').parentElement).toHaveClass('max-w-4xl')
  })

  it('applies custom className', () => {
    render(
      <SectionContainer className="custom-class">
        <div>Content</div>
      </SectionContainer>
    )
    expect(sectionFor('Content')).toHaveClass('custom-class')
  })

  it('applies id attribute', () => {
    render(
      <SectionContainer id="test-section">
        <div>Content</div>
      </SectionContainer>
    )
    expect(sectionFor('Content')).toHaveAttribute('id', 'test-section')
  })
})
