import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders resume identity and contact facts', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'NG KAI ZHENG' })).toBeInTheDocument()
    expect(screen.getAllByText('kaizheng.tech@gmail.com').length).toBeGreaterThan(0)
    expect(screen.getByText('+60 14-6850705')).toBeInTheDocument()
    expect(screen.getAllByText('Johor, Malaysia').length).toBeGreaterThan(0)
    expect(screen.getAllByText('github.com/ngkaizheng').length).toBeGreaterThan(0)
  })

  it('exposes canonical resume download cta', () => {
    render(<App />)
    const resumeCtas = screen.getAllByRole('link', { name: 'Download Resume' })
    expect(resumeCtas.length).toBeGreaterThan(0)
    for (const resumeCta of resumeCtas) {
      expect(resumeCta).toHaveAttribute('href', '/resume/NgKaiZheng_Resume.pdf')
      expect(resumeCta).toHaveAttribute('download')
    }
  })

  it('renders required experience and project mapping', () => {
    render(<App />)
    expect(screen.getAllByText(/\.NET Developer, Etiqa Insurance and Takaful Sdn Bhd/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Nov 2025 - Present/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Internship Game Developer, AIO SYNERGY SDN BHD/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/June 2024 - Feb 2025/i).length).toBeGreaterThan(0)

    expect(screen.getAllByText(/Pet Appointment System/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/AI-Powered RAG Chat Demo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Blockchain Multiplayer Game/i).length).toBeGreaterThan(0)
  })

  it('shows core stack skills as chips or cards', () => {
    render(<App />)
    expect(screen.getAllByText('C#').length).toBeGreaterThan(0)
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0)
    expect(screen.getAllByText('React').length).toBeGreaterThan(0)
    expect(screen.getAllByText('.NET (Core/8+)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Azure').length).toBeGreaterThan(0)
  })
})
