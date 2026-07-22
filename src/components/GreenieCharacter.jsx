import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'

const MOUTH_PATHS = {
  idle: 'M78,148 Q100,164 122,148',
  happy: 'M76,146 Q100,178 124,146 Q100,162 76,146 Z',
  sad: 'M80,156 Q100,146 120,156',
  sleepy: 'M88,152 L112,152',
}

let dropletSeq = 0
let sparkleSeq = 0

export default function GreenieCharacter({
  level = 1,
  hat,
  accessory,
  size = 150,
  interactive = false,
  onTap,
  levelUpSignal = 0,
}) {
  const wrapRef = useRef(null)
  const bodyControls = useAnimation()
  const glowControls = useAnimation()
  const lastTapRef = useRef(Date.now())
  const comboRef = useRef(0)
  const comboTimerRef = useRef(null)
  const prevLevelUpRef = useRef(levelUpSignal)

  const [blinking, setBlinking] = useState(false)
  const [mood, setMood] = useState('idle')
  const [expression, setExpression] = useState('idle')
  const [droplets, setDroplets] = useState([])
  const [sparkles, setSparkles] = useState([])
  const [hearts, setHearts] = useState([])

  // 3~6초마다 눈 깜빡임
  useEffect(() => {
    let cancelled = false
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000
      setTimeout(() => {
        if (cancelled) return
        setBlinking(true)
        setTimeout(() => setBlinking(false), 150)
        schedule()
      }, delay)
    }
    schedule()
    return () => { cancelled = true }
  }, [])

  // 방치 시간에 따른 기분 변화 (10초 심심, 20초 시무룩, 30초 졸림) — 상호작용 가능한 내 그린이만 해당
  useEffect(() => {
    if (!interactive) return undefined
    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastTapRef.current) / 1000
      if (elapsed >= 30) setMood('sleepy')
      else if (elapsed >= 20) setMood('sad')
      else if (elapsed >= 10) setMood('bored')
      else setMood('idle')
    }, 1000)
    return () => clearInterval(timer)
  }, [interactive])

  // 레벨업 이펙트
  useEffect(() => {
    if (levelUpSignal === prevLevelUpRef.current) return
    prevLevelUpRef.current = levelUpSignal
    glowControls.start({ scale: [0, 2.2], opacity: [0.55, 0], transition: { duration: 0.9, ease: 'easeOut' } })
    bodyControls.start({ scale: [1, 1.3, 0.9, 1.05, 1], transition: { duration: 0.7, ease: 'easeInOut' } })
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: `heart-${Date.now()}-${i}`,
      x: 30 + Math.random() * 40,
      emoji: i % 2 === 0 ? '💚' : '✨',
      delay: i * 0.08,
    }))
    setHearts((prev) => [...prev, ...newHearts])
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.includes(h)))
    }, 1400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelUpSignal])

  const spawnSparkles = () => {
    const burst = Array.from({ length: 4 }).map(() => ({
      id: `sp-${sparkleSeq++}`,
      angle: Math.random() * 360,
    }))
    setSparkles((prev) => [...prev, ...burst])
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !burst.includes(s)))
    }, 500)
  }

  const handlePointerDown = (e) => {
    if (!interactive) return
    const rect = wrapRef.current?.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.top
    const x = rect ? clientX - rect.left : size / 2
    const y = rect ? clientY - rect.top : 0

    const id = `dr-${dropletSeq++}`
    setDroplets((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setDroplets((prev) => prev.filter((d) => d.id !== id))
    }, 260)

    // 연속 터치 콤보 (900ms 안에 다시 터치하면 이어짐)
    const now = Date.now()
    const chained = now - lastTapRef.current < 900
    lastTapRef.current = now
    setMood('idle')
    const next = chained ? comboRef.current + 1 : 1
    comboRef.current = next
    clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => { comboRef.current = 0 }, 900)

    setTimeout(() => {
      const intensity = 1 + Math.min(next, 10) * 0.03
      setExpression('happy')
      spawnSparkles()
      bodyControls.start({
        scaleY: [1, 0.82 * intensity, 1.08, 1],
        scaleX: [1, 1.12 * intensity, 0.96, 1],
        transition: { duration: 0.28, ease: 'easeOut' },
      })
      setTimeout(() => setExpression('idle'), 420)

      if (next % 10 === 0) {
        bodyControls.start({
          rotate: [0, 360],
          transition: { duration: 0.6, ease: 'easeInOut' },
        }).then(() => bodyControls.set({ rotate: 0 }))
      }
    }, 180)

    onTap?.()
  }

  const currentExpression = mood === 'sleepy' ? 'sleepy' : mood === 'sad' ? 'sad' : expression
  const eyesClosed = blinking || currentExpression === 'sleepy'
  const leafRotate = mood === 'sleepy' ? [8, 14, 8] : mood === 'sad' ? [-1, 1, -1] : [-4, 4, -4]
  const leafDuration = mood === 'sleepy' ? 4.5 : 2.6

  return (
    <div
      ref={wrapRef}
      className="greenie-character"
      style={{ width: size, height: size * 1.1, cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={handlePointerDown}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? '그린이에게 물주기' : undefined}
    >
      <motion.svg viewBox="0 -18 200 248" width="100%" height="100%">
        <defs>
          <radialGradient id="greenie-body-grad" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#F6F8E2" />
            <stop offset="100%" stopColor="#DCE6A8" />
          </radialGradient>
          <linearGradient id="greenie-leaf-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9AD154" />
            <stop offset="100%" stopColor="#6FA83A" />
          </linearGradient>
          <linearGradient id="greenie-leaf-side-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8AC24A" />
            <stop offset="100%" stopColor="#5F9A34" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="212" rx="48" ry="8" fill="rgba(0,0,0,0.08)" />

        <motion.g
          animate={mood === 'bored' ? { x: [-4, 4, -4] } : { x: 0 }}
          transition={{ duration: 2.4, repeat: mood === 'bored' ? Infinity : 0, ease: 'easeInOut' }}
        >
          {/* 팔 */}
          <ellipse cx="31" cy="148" rx="10" ry="16" fill="url(#greenie-body-grad)" stroke="#cdd9a0" strokeWidth="1" />
          <ellipse cx="169" cy="148" rx="10" ry="16" fill="url(#greenie-body-grad)" stroke="#cdd9a0" strokeWidth="1" />
          {/* 발 */}
          <ellipse cx="78" cy="204" rx="15" ry="8" fill="#DCE6A8" />
          <ellipse cx="122" cy="204" rx="15" ry="8" fill="#DCE6A8" />

          <motion.g
            animate={bodyControls}
            initial={{ scale: 1 }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <motion.g
              animate={{ scaleY: [1, 1.02, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: 0.5, originY: 1 }}
            >
              {/* 옆 잎 (귀 잎) */}
              <motion.g
                animate={{ rotate: leafRotate.map((r) => r * 0.6) }}
                transition={{ duration: leafDuration, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: 0.3, originY: 0.9 }}
              >
                <path
                  d="M150,78 C168,66 176,50 174,36 C158,42 144,56 140,74 C140,80 145,82 150,78 Z"
                  fill="url(#greenie-leaf-side-grad)"
                />
              </motion.g>

              {/* 몸통 */}
              <ellipse cx="100" cy="130" rx="74" ry="72" fill="url(#greenie-body-grad)" stroke="#cdd9a0" strokeWidth="1.5" />

              {/* 새싹 (두 갈래) */}
              <motion.g
                animate={{ rotate: leafRotate }}
                transition={{ duration: leafDuration, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: 0.5, originY: 1 }}
              >
                <path
                  d="M100,62 C78,30 62,10 48,-6 C48,26 62,50 100,62 Z"
                  fill="url(#greenie-leaf-grad)"
                />
                <path
                  d="M100,62 C122,26 140,4 156,-10 C158,24 140,50 100,62 Z"
                  fill="url(#greenie-leaf-grad)"
                />
              </motion.g>

              {/* 볼 */}
              <motion.ellipse
                cx="63" cy="140" rx="13" ry="8" fill="#FFA36B"
                animate={{ opacity: currentExpression === 'happy' ? 1 : 0.68 }}
              />
              <motion.ellipse
                cx="137" cy="140" rx="13" ry="8" fill="#FFA36B"
                animate={{ opacity: currentExpression === 'happy' ? 1 : 0.68 }}
              />

              {/* 눈 */}
              <g>
                {eyesClosed ? (
                  <>
                    <path d="M62,116 Q73,125 84,116" stroke="#2b2b2b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    <path d="M116,116 Q127,125 138,116" stroke="#2b2b2b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                  </>
                ) : currentExpression === 'sad' ? (
                  <>
                    <ellipse cx="73" cy="118" rx="9" ry="11" fill="#2b2b2b" />
                    <ellipse cx="127" cy="118" rx="9" ry="11" fill="#2b2b2b" />
                  </>
                ) : (
                  <>
                    <circle cx="73" cy="114" r="11" fill="#2b2b2b" />
                    <circle cx="77" cy="110" r="3.4" fill="#fff" />
                    <circle cx="127" cy="114" r="11" fill="#2b2b2b" />
                    <circle cx="131" cy="110" r="3.4" fill="#fff" />
                  </>
                )}
              </g>

              {/* 입 */}
              <AnimatePresence mode="wait">
                <motion.path
                  key={currentExpression}
                  d={MOUTH_PATHS[currentExpression] || MOUTH_PATHS.idle}
                  stroke="#2b2b2b"
                  strokeWidth="3.5"
                  fill={currentExpression === 'happy' ? '#c0453f' : 'none'}
                  strokeLinecap="round"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </AnimatePresence>

              {mood === 'sleepy' && (
                <motion.text
                  x="155" y="65" fontSize="20" fill="#93a190"
                  animate={{ y: [65, 48, 65], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >Zzz</motion.text>
              )}
            </motion.g>
          </motion.g>
        </motion.g>

        <motion.circle
          cx="100" cy="128" r="40" fill="var(--green)"
          initial={{ scale: 0, opacity: 0 }}
          animate={glowControls}
        />
      </motion.svg>

      {hat && <span className="greenie-character-hat" style={{ fontSize: size * 0.3 }}>{hat}</span>}
      {accessory && <span className="greenie-character-accessory" style={{ fontSize: size * 0.24 }}>{accessory}</span>}

      <AnimatePresence>
        {droplets.map((d) => (
          <motion.span
            key={d.id}
            className="greenie-droplet"
            style={{ left: d.x, top: d.y }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: 36 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: 'easeIn' }}
          >💧</motion.span>
        ))}
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="greenie-sparkle"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
            animate={{
              opacity: 0,
              scale: 1,
              x: Math.cos((s.angle * Math.PI) / 180) * 36,
              y: Math.sin((s.angle * Math.PI) / 180) * 36,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >✨</motion.span>
        ))}
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            className="greenie-heart"
            style={{ left: `${h.x}%` }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -70 }}
            transition={{ duration: 1.3, delay: h.delay, ease: 'easeOut' }}
          >{h.emoji}</motion.span>
        ))}
      </AnimatePresence>

      {level >= 1000 && <span className="greenie-crown">👑</span>}
    </div>
  )
}
