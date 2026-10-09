import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type {
  CodeShowcase,
  CompareShowcase,
  FlowsShowcase,
  ModulesShowcase,
  PipelineShowcase,
  Project,
  Showcase,
} from '../data/content'
import { pad, useInView } from '../lib/hooks'
import { hasFinePointer } from '../lib/env'

// Architecture animations. Loops only run while the figure is on screen
// (`is-live`); one-shot reveals key off `is-seen`.

const vars = (v: Record<string, string | number>) => v as CSSProperties

function liveClass(seen: boolean, visible: boolean) {
  return `${seen ? ' is-seen' : ''}${visible ? ' is-live' : ''}`
}

/* ─── Case-study figures ─────────────────────────────────── */

function Pipeline({ stages }: PipelineShowcase) {
  return (
    <div className="pipe" style={vars({ '--n': stages.length })}>
      <div className="pipe-track" aria-hidden="true">
        <i className="pipe-packet" />
      </div>
      <ol className="pipe-nodes">
        {stages.map((stage, i) => (
          <li key={stage} style={vars({ '--i': i })}>
            <span className="pipe-step">{pad(i + 1)}</span>
            {stage}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Timeline({ before, after, improvement }: CompareShowcase) {
  // One cell per day: two weeks before, one week after.
  const rows = [
    { ...before, days: 14, after: false },
    { ...after, days: 7, after: true },
  ]
  return (
    <div className="tl">
      {rows.map((row) => (
        <div className={`tl-row${row.after ? ' is-after' : ''}`} key={row.label}>
          <p className="tl-label">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <em>{row.sublabel}</em>
          </p>
          <div className="tl-bar" aria-hidden="true">
            {Array.from({ length: row.days }, (_, i) => (
              <i key={i} style={vars({ '--i': i })} />
            ))}
          </div>
        </div>
      ))}
      <p className="fig-stamp">{improvement}</p>
    </div>
  )
}

function SplitDeploy({ before, after, improvement }: CompareShowcase) {
  return (
    <div className="sd">
      <div className="sd-col">
        <p className="sd-head">
          <span>{before.label}</span>
          <strong>{before.value}</strong>
        </p>
        <div className="sd-mono" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </div>
        <p className="sd-sub">{before.sublabel}</p>
      </div>
      <span className="sd-arrow" aria-hidden="true">
        &rarr;
      </span>
      <div className="sd-col is-after">
        <p className="sd-head">
          <span>{after.label}</span>
          <strong>{after.value}</strong>
        </p>
        <div className="sd-mods" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={vars({ '--i': i })} />
          ))}
        </div>
        <p className="sd-sub">{after.sublabel}</p>
      </div>
      <p className="fig-stamp">{improvement}</p>
    </div>
  )
}

function Flows({ flows }: FlowsShowcase) {
  return (
    <div className="flows">
      {flows.map((flow) => (
        <div className={`flow flow-${flow.name.toLowerCase()}`} key={flow.name}>
          <p className="flow-name">{flow.name}</p>
          {flow.name === 'Sequential' && (
            <div className="flow-seq" style={vars({ '--n': flow.steps.length })}>
              <div className="flow-track" aria-hidden="true">
                <i className="flow-packet" />
              </div>
              <ol>
                {flow.steps.map((step, i) => (
                  <li key={step} style={vars({ '--i': i })}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {flow.name === 'Parallel' && (
            <div className="flow-par">
              <span className="flow-fork" aria-hidden="true" />
              <ol>
                {flow.steps.map((step) => (
                  <li key={step}>
                    <span className="flow-lane" aria-hidden="true">
                      <i className="flow-packet" />
                    </span>
                    <span className="flow-node">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {flow.name === 'Percentage' && (
            <div className="flow-pct">
              <div className="flow-meter" aria-hidden="true">
                <i />
                <span className="flow-threshold" />
              </div>
              <ol>
                {flow.steps.map((step, i) => (
                  <li key={step} className={i === flow.steps.length - 1 ? 'flow-node flow-target' : 'flow-meta'}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Modules({ modules, team, timeline }: ModulesShowcase) {
  return (
    <div className="mods">
      <div className="mods-grid">
        {modules.map((m, i) => (
          <div className="mod" key={m.name} style={vars({ '--i': i })}>
            <p className="mod-name">{m.name}</p>
            <ol className="mod-scope">
              {m.scope.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <span className="mod-stamp">Delivered</span>
            <i className="mod-scan" aria-hidden="true" />
          </div>
        ))}
      </div>
      <dl className="mods-foot">
        <div>
          <dt>Team</dt>
          <dd>{team}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{timeline}</dd>
        </div>
      </dl>
    </div>
  )
}

function highlight(line: string): ReactNode[] {
  return line.split(/(\/\/.*$|"[^"]*"|'[^']*'|\btrue\b|\bfalse\b)/g).map((part, i) => {
    if (!part) return null
    let cls = ''
    if (part.startsWith('//')) cls = 'tk-c'
    else if (part.startsWith('"') || part.startsWith("'")) cls = 'tk-s'
    else if (part === 'true' || part === 'false') cls = 'tk-b'
    return cls ? (
      <span className={cls} key={i}>
        {part}
      </span>
    ) : (
      part
    )
  })
}

function CodePane({ label, source }: { label: string; source: string }) {
  return (
    <div className={`code-pane is-${label}`}>
      <p className="code-tab">{label}</p>
      <pre>
        <code>
          {source.split('\n').map((line, i) => (
            <span className="code-line" key={i} style={vars({ '--i': i })}>
              {highlight(line)}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

function Code({ before, after }: CodeShowcase) {
  return (
    <div className="code">
      <CodePane label="before" source={before} />
      <CodePane label="after" source={after} />
    </div>
  )
}

function renderShowcase(showcase: Showcase) {
  switch (showcase.type) {
    case 'pipeline':
      return <Pipeline {...showcase} />
    case 'compare':
      return showcase.variant === 'timeline' ? <Timeline {...showcase} /> : <SplitDeploy {...showcase} />
    case 'flows':
      return <Flows {...showcase} />
    case 'modules':
      return <Modules {...showcase} />
    case 'code':
      return <Code {...showcase} />
  }
}

export function ShowcaseFigure({ showcase, index }: { showcase: Showcase; index: number }) {
  const [ref, { seen, visible }] = useInView<HTMLElement>('0px')
  return (
    <figure ref={ref} className={`fig fig-${showcase.type}${liveClass(seen, visible)}`}>
      <figcaption className="fig-caption">
        <span>fig.{pad(index + 1)}</span>
        {showcase.title}
      </figcaption>
      <div className="fig-body">{renderShowcase(showcase)}</div>
      {showcase.type === 'pipeline' && <p className="fig-note">{showcase.description}</p>}
    </figure>
  )
}

/* ─── Project blueprints ─────────────────────────────────── */

const CHAR_W = 6.3

export function Blueprint({ project, index }: { project: Project; index: number }) {
  const [ref, { seen, visible }] = useInView<HTMLDivElement>('0px')
  const tiltable = useRef(hasFinePointer())
  const byId = Object.fromEntries(project.nodes.map((n) => [n.id, n]))
  const description = project.edges.map(([a, b]) => `${byId[a].label} to ${byId[b].label}`).join(', ')

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltable.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    e.currentTarget.style.setProperty('--ry', `${(x - 0.5) * 10}deg`)
    e.currentTarget.style.setProperty('--rx', `${(0.5 - y) * 8}deg`)
    e.currentTarget.style.setProperty('--gx', `${x * 100}%`)
    e.currentTarget.style.setProperty('--gy', `${y * 100}%`)
  }
  const onLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg')
    e.currentTarget.style.setProperty('--rx', '0deg')
  }

  return (
    <div
      ref={ref}
      className={`bp${liveClass(seen, visible)}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor="Trace"
    >
      <div className="bp-head" aria-hidden="true">
        <span>fig.P{pad(index + 1)}</span>
        <span>Architecture</span>
        <span>
          {project.nodes.length} nodes / {project.edges.length} links
        </span>
      </div>
      <svg className="bp-svg" viewBox="0 0 400 320" role="img" aria-label={`${project.name} architecture: ${description}`}>
        <defs>
          <pattern id={`grid-${project.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" className="bp-grid" />
          </pattern>
        </defs>
        <rect width="400" height="320" fill={`url(#grid-${project.id})`} />
        {project.edges.map(([a, b], i) => {
          const A = byId[a]
          const B = byId[b]
          return (
            <g key={`${a}-${b}`} className="bp-edge" style={vars({ '--i': i })}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="bp-line" pathLength={1} />
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="bp-flow" />
              <circle
                cx={A.x}
                cy={A.y}
                r="3.2"
                className="bp-packet"
                style={vars({ '--dx': `${B.x - A.x}px`, '--dy': `${B.y - A.y}px`, '--i': i })}
              />
            </g>
          )
        })}
        {project.nodes.map((n, i) => {
          const w = n.label.length * CHAR_W + 22
          return (
            <g key={n.id} className="bp-node" transform={`translate(${n.x} ${n.y})`}>
              <g style={vars({ '--i': i })}>
                <rect x={-w / 2} y={-13} width={w} height={26} rx={2} />
                <text textAnchor="middle" dominantBaseline="central">
                  {n.label}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
      <span className="bp-glare" aria-hidden="true" />
    </div>
  )
}
