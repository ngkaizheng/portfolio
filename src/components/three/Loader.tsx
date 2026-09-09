import { useProgress, Html } from '@react-three/drei'

export default function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: '#60a5fa',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        <div style={{
          width: '120px',
          height: '3px',
          background: '#18181b',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: '12px', color: '#71717a' }}>
          {Math.round(progress)}%
        </span>
      </div>
    </Html>
  )
}
