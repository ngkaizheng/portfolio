import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders hero name and contact info', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByText(/kaizheng\.tech@gmail\.com/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Johor, Malaysia/).length).toBeGreaterThan(0)
  })

  it('exposes canonical resume download link', () => {
    render(<App />)
    const resumeLinks = screen.getAllByRole('link', { name: /Download Resume/i })
    expect(resumeLinks.length).toBeGreaterThan(0)
    for (const link of resumeLinks) {
      expect(link).toHaveAttribute('href', '/resume/NgKaiZheng_Resume.pdf')
      expect(link).toHaveAttribute('download')
    }
  })

  it('renders education section', () => {
    render(<App />)
    expect(screen.getAllByText(/Bachelor of Computer Science/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Universiti Teknologi Malaysia/i).length).toBeGreaterThan(0)
  })

  it('renders skills section', () => {
    render(<App />)
    expect(screen.getAllByText(/Languages/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Backend/).length).toBeGreaterThan(0)
  })
})
