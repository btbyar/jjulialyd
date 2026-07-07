import { useState, useEffect, useRef, useCallback } from 'react'
import emailjs from '@emailjs/browser'
import './App.css'

const EMAILJS_SERVICE = 'service_ctk26vc'
const EMAILJS_TEMPLATE = 'template_ecjwi3p'
const EMAILJS_KEY = 'lrZbUOrbvdw0sDVci'


/* ── Confetti ──────────────────────────────────────────── */
const COLORS = ['#f72b7a', '#c084fc', '#ff94bb', '#ffb347', '#67e8f9', '#86efac']
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: `${2 + Math.random() * 3}s`,
    delay: `${Math.random() * 2}s`,
    size: `${6 + Math.random() * 8}px`,
    shape: Math.random() > 0.5 ? '50%' : '2px',
  }))
  return (
    <div className="confetti-wrapper">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

/* ── Background decorations ────────────────────────────── */
function BgDecos() {
  const decos = [
    '/lily_accent.png', '/lily_accent_2.png', '/lily_accent.png',
    '/lily_accent_2.png', '/lily_accent_2.png', '/lily_accent.png',
    '/lily_accent_2.png', '/lily_accent_2.png'
  ]
  return (
    <>
      {decos.map((d, i) => (
        <img key={i} src={d} alt="" className={`bg-deco bg-deco-${i + 1}`} draggable={false} style={{ width: i % 2 === 0 ? 90 : 130, mixBlendMode: 'multiply', opacity: 0.9, filter: 'contrast(1.05)' }} />
      ))}
    </>
  )
}

/* ── Progress Dots ─────────────────────────────────────── */
function ProgressDots({ page }) {
  return (
    <div className="progress-dots">
      {[0, 1, 2].map(i => (
        <div key={i} className={`dot ${page >= i ? 'active' : ''}`} />
      ))}
    </div>
  )
}

/* ── No-counter messages ───────────────────────────────── */
const NO_MESSAGES = [
  null,
]

/* ── Page 1: Invite ────────────────────────────────────── */
function InvitePage({ onYes }) {
  const [noCount, setNoCount] = useState(0)
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const [yesSize, setYesSize] = useState(1)
  const containerRef = useRef(null)
  const noBtnRef = useRef(null)

  const moveNo = useCallback(() => {
    if (!noBtnRef.current) return
    const btn = noBtnRef.current.getBoundingClientRect()
    const padding = 20
    const maxX = window.innerWidth - btn.width - (padding * 2)
    const maxY = window.innerHeight - btn.height - (padding * 2)

    // Calculate new position ensuring it stays within bounds
    const newX = Math.max(padding, Math.random() * maxX)
    const newY = Math.max(padding, Math.random() * maxY)

    setNoPos({ x: newX, y: newY })
    setNoCount(c => {
      const next = c + 1
      setYesSize(1 + next * 0.1) // make 'yes' grow faster
      return next
    })
  }, [])

  const msg = NO_MESSAGES[Math.min(noCount, NO_MESSAGES.length - 1)]

  return (
    <div>
      <ProgressDots page={0} />
      <span className="invite-emoji">💌</span>
      <h1 className="invite-to">
        <span>Хамт салхинд гарах уу?</span>
      </h1>
      <div className="divider" />
      <p className="invite-subtitle">
      </p>

      <div className="btn-group" ref={containerRef} style={{ minHeight: 80 }}>
        {/* YES */}
        <div style={{ position: 'relative' }}>
          {noCount >= 3 && <div className="pulse-ring" />}
          <button
            className="btn-yes"
            id="btn-yes"
            style={{ transform: `scale(${yesSize})`, transformOrigin: 'center' }}
            onClick={onYes}
          >
            Тийм ❤️
          </button>
        </div>

        {/* NO */}
        <div style={{ position: 'relative' }}>
          {msg && <div className="no-counter">{msg}</div>}
          <button
            ref={noBtnRef}
            id="btn-no"
            className="btn-no"
            onMouseEnter={moveNo}
            onClick={(e) => {
              e.preventDefault();
              moveNo();
            }}
            style={{
              position: noCount > 0 ? 'fixed' : 'relative',
              left: noCount > 0 ? `${noPos.x}px` : 'auto',
              top: noCount > 0 ? `${noPos.y}px` : 'auto',
              transform: 'none',
              zIndex: noCount > 0 ? 999 : 'auto',
              transition: 'all 0.2s ease-out',
            }}
          >
            Үгүй 😢
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page 2: Date Picker ───────────────────────────────── */


function DatePickerPage({ onConfirm }) {
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const [date, setDate] = useState('')

  return (
    <div>
      <ProgressDots page={1} />
      <span className="picker-emoji">📅</span>
      <h2 className="picker-title">Хэзээ уулзах вэ?</h2>
      <p className="picker-subtitle">Дуртай өдрөө сонгоорой 🌸</p>

      <div className="date-input-wrapper">
        <span className="date-input-emoji">📅</span>
        <input
          id="date-picker"
          type="date"
          className="date-input"
          min={minDate}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <button
        id="btn-confirm"
        className="btn-confirm"
        disabled={!date}
        onClick={() => onConfirm({ date })}
      >
        Батлах ✨
      </button>
    </div>
  )
}

/* ── Page 3: Confirmed ─────────────────────────────────── */
function ConfirmedPage({ info, onReset }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [emailSent, setEmailSent] = useState(false)

  const dateObj = new Date(info.date + 'T12:00:00')
  const dateStr = dateObj.toLocaleDateString('mn-MN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Auto-send email on mount
  useEffect(() => {
    emailjs.send(
      EMAILJS_SERVICE,
      EMAILJS_TEMPLATE,
      {
        to_email: 'cinhuslen068@gmail.com',
        date: dateStr,
        time: 'Өглөө 10:00',
        message: `� Салхинд гарах өдөр батлагдлаа!\n\n📅 Өдөр: ${dateStr}\n⏰ Цаг: Өглөө 10:00\n\nУулзахдаа баяртай байна! 💖`,
      },
      EMAILJS_KEY
    ).then(() => setEmailSent(true))
      .catch(err => console.error('EmailJS error:', err))
  }, [])

  return (
    <div>
      {showConfetti && <Confetti />}
      <ProgressDots page={2} />
      <span className="confirmed-emoji">🎉</span>
      <h2 className="confirmed-title">Өглөө 10 цагт очоод авъя!</h2>
      <div className="date-summary">
        <div className="date-summary-row">
          <span className="icon">📅</span>
          <span>{dateStr}</span>
        </div>
      </div>
      <button id="btn-reset" className="btn-reset" onClick={onReset}>
        Дахин эхлэх
      </button>
    </div>
  )
}

/* ── Root App ──────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState(0)
  const [dateInfo, setDateInfo] = useState(null)

  const handleYes = () => setPage(1)
  const handleConfirm = (info) => { setDateInfo(info); setPage(2) }
  const handleReset = () => { setPage(0); setDateInfo(null) }

  return (
    <div className="app">
      <BgDecos />
      <div className="card-wrapper">
        <div className="card">
          <div className="card-decorations">
            <img src="/lily_top_left.png" alt="" className="card-lily card-lily-top-left" draggable={false} />
            <img src="/lily_bottom_left.png" alt="" className="card-lily card-lily-bottom-left" draggable={false} />
            <img src="/lily_top_right.png" alt="" className="card-lily card-lily-top-right" draggable={false} />
            <img src="/lily_bottom_right.png" alt="" className="card-lily card-lily-bottom-right" draggable={false} />
          </div>
          <div className="card-content" style={{ position: 'relative', zIndex: 1 }}>
            {page === 0 && <InvitePage onYes={handleYes} />}
            {page === 1 && <DatePickerPage onConfirm={handleConfirm} />}
            {page === 2 && dateInfo && <ConfirmedPage info={dateInfo} onReset={handleReset} />}
          </div>
        </div>
      </div>
    </div>
  )
}
