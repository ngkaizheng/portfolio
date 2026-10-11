import { profile, type InfoPageContent } from '../data/content'
import { ThemeToggle } from '../components/ui'

const base = import.meta.env.BASE_URL
const LINKS = [
  { href: `${base}now/`, label: 'Now' },
  { href: `${base}uses/`, label: 'Uses' },
  { href: `${base}play/`, label: 'Arcade' },
]

export default function InfoPage({ page }: { page: InfoPageContent }) {
  // Owner placeholders never reach the production build.
  const sections = page.sections
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.todo || import.meta.env.DEV) }))
    .filter((s) => s.items.length > 0)

  return (
    <div className="info">
      <header className="info-bar">
        <a className="info-back" href={base}>
          <span aria-hidden="true">&larr;</span> {profile.name}
        </a>
        <nav aria-label="Pages">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} aria-current={l.label === page.title ? 'page' : undefined}>
              {l.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </header>

      <main className="info-main">
        <p className="info-label">
          /{page.title.toLowerCase()} &middot; updated {page.updated}
        </p>
        <h1 className="info-title">{page.title}</h1>
        <p className="info-intro">{page.intro}</p>

        {sections.map((s) => (
          <section className="info-section" key={s.title}>
            <h2>{s.title}</h2>
            <dl>
              {s.items.map((i) => (
                <div key={i.label + i.text} className={i.todo ? 'is-todo' : undefined}>
                  <dt>{i.label}</dt>
                  <dd>{i.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </main>
    </div>
  )
}
