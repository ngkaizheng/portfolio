// Showcase view of the shared site content. All facts come from src/data/content.ts.
import {
  caseStudies,
  currentRole,
  education as edu,
  internship,
  marqueeWords,
  profile,
  projects as allProjects,
  resumeHref,
} from '../data/content.ts'

export const identity = {
  name: profile.name,
  role: profile.role,
  stack: profile.roles.slice(1).join(' · '),
  location: profile.location,
  email: profile.email,
  linkedIn: profile.linkedin,
  github: profile.github,
  resumeHref,
  classicHref: import.meta.env.BASE_URL,
}

export const experience = [
  {
    company: currentRole.company,
    role: currentRole.role,
    period: currentRole.period,
    highlights: caseStudies.map((c) => [c.title, c.subtitle] as const),
  },
  {
    company: internship.company,
    role: internship.role,
    period: internship.period,
    highlights: [] as (readonly [string, string])[],
  },
]

export const projects = allProjects.map(({ name, tagline, year, summary, details, tech }) => ({
  name,
  tagline,
  year,
  summary,
  details,
  tech,
}))

export const skills = marqueeWords

export const education = { degree: edu.degree, school: edu.school, cgpa: edu.cgpa }
