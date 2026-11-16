import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { caseStudies, projects, skillCategories } from './data/content'

describe('App', () => {
  it('renders hero name and contact info', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Ng Kai Zheng' })).toBeInTheDocument()
    expect(screen.getAllByText(/kaizheng\.tech@gmail\.com/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Johor, Malaysia/).length).toBeGreaterThan(0)
  })

  it('exposes canonical resume download link', () => {
    render(<App />)
    const resumeLinks = screen.getAllByRole('link', { name: /Download Resume/i })
    expect(resumeLinks.length).toBeGreaterThan(0)
    for (const link of resumeLinks) {
      expect(link).toHaveAttribute('href', `${import.meta.env.BASE_URL}resume/NgKaiZheng_Resume.pdf`)
      expect(link).toHaveAttribute('download')
    }
  })

  it('renders every experience case study', () => {
    render(<App />)
    for (const study of caseStudies) {
      expect(screen.getByRole('heading', { level: 3, name: study.title })).toBeInTheDocument()
    }
    expect(screen.getByText('AIO Synergy Sdn Bhd')).toBeInTheDocument()
  })

  it('renders projects with labelled architecture diagrams', () => {
    render(<App />)
    for (const project of projects) {
      expect(screen.getByRole('img', { name: new RegExp(`^${project.name} architecture`) })).toBeInTheDocument()
    }
  })

  it('renders education section', () => {
    render(<App />)
    expect(screen.getAllByText(/Bachelor of Computer Science/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Universiti Teknologi Malaysia/i).length).toBeGreaterThan(0)
  })

  it('renders skills section', () => {
    render(<App />)
    for (const category of skillCategories) {
      expect(screen.getByRole('heading', { level: 3, name: category.name })).toBeInTheDocument()
    }
  })
})
