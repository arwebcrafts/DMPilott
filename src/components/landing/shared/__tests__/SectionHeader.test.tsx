import { render, screen } from '@testing-library/react'
import { SectionHeader } from '../SectionHeader'

describe('SectionHeader', () => {
  it('renders with title', () => {
    render(<SectionHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders with subtitle', () => {
    render(<SectionHeader title="Title" subtitle="Subtitle" />)
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(<SectionHeader title="Title" description="Description" />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders with badge', () => {
    render(<SectionHeader title="Title" badge="New" />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders with center alignment', () => {
    render(<SectionHeader title="Title" align="center" />)
    const header = screen.getByText('Title').parentElement
    expect(header).toHaveClass('text-center')
  })

  it('renders with left alignment', () => {
    render(<SectionHeader title="Title" align="left" />)
    const header = screen.getByText('Title').parentElement
    expect(header).toHaveClass('text-left')
  })

  // Title sizing is driven by an inline `clamp()` font-size rather than a
  // Tailwind text-* class, so assert on the resolved style.
  it('renders with lg size', () => {
    render(<SectionHeader title="Title" size="lg" />)
    expect(screen.getByText('Title')).toHaveStyle({ fontSize: 'clamp(2rem, 5vw, 4rem)' })
  })

  it('renders with sm size', () => {
    render(<SectionHeader title="Title" size="sm" />)
    expect(screen.getByText('Title')).toHaveStyle({ fontSize: 'clamp(1.25rem, 3vw, 2.5rem)' })
  })

  it('renders the title as a heading', () => {
    render(<SectionHeader title="Title" />)
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
  })
})
