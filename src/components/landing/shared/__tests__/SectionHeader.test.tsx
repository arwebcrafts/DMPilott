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

  it('renders with lg size', () => {
    render(<SectionHeader title="Title" size="lg" />)
    const title = screen.getByText('Title')
    expect(title).toHaveClass('text-4xl')
  })

  it('renders with sm size', () => {
    render(<SectionHeader title="Title" size="sm" />)
    const title = screen.getByText('Title')
    expect(title).toHaveClass('text-2xl')
  })
})
