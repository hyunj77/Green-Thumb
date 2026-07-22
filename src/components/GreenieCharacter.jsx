import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import bodyImg from '../assets/part-body-only.png'
import leafImg from '../assets/part-leaf.png'
import armLeftImg from '../assets/part-arm-left.png'
import armRightImg from '../assets/part-arm-right.png'
import eyeLeftImg from '../assets/part-eye-left.png'
import eyeRightImg from '../assets/part-eye-right.png'
import mouthImg from '../assets/part-mouth.png'

// 380x426 원본 캔버스 기준 각 파츠의 위치 (퍼센트 배치를 위한 픽셀 좌표)
const CANVAS = { w: 380, h: 426 }
const PARTS = {
  leaf: { left: 10, top: 0, width: 340, height: 230, originX: 0.5, originY: 0.94 },
  armLeft: { left: 14, top: 260, width: 50, height: 96, originX: 0.5, originY: 0.08 },
  armRight: { left: 316, top: 260, width: 50, height: 96, originX: 0.5, originY: 0.08 },
  eyeLeft: { left: 104, top: 235, width: 54, height: 65, originX: 0.5, originY: 0.5 },
  eyeRight: { left: 233, top: 233, width: 54, height: 64, originX: 0.5, originY: 0.5 },
  mouth: { left: 168, top: 270, width: 54, height: 35, originX: 0.5, originY: 0.5 },
}

function partStyle(p) {
  return {
    position: 'absolute',
    left: `${(p.left / CANVAS.w) * 100}%`,
    top: `${(p.top / CANVAS.h) * 100}%`,
    width: `${(p.width / CANVAS.w) * 100}%`,
    height: `${(p.height / CANVAS.h) * 100}%`,
    originX: p.originX,
    originY: p.originY,
  }
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

  const [mood, setMood] = useState('idle')
  const [blink, setBlink] = useState(false)
  const [reaction, setReaction] = useState(null) // 'happy' | 'surprised' | null
  const [leafPop, setLeafPopRaw] = useState(false)
  const [armWave, setArmWaveRaw] = useState(false)
  const leafPopTimerRef = useRef(null)
  const armWaveTimerRef = useRef(null)

  const triggerLeafPop = (duration = 550) => {
    clearTimeout(leafPopTimerRef.current)
    setLeafPopRaw(true)
    leafPopTimerRef.current = setTimeout(() => setLeafPopRaw(false), duration)
  }
  const triggerArmWave = (duration = 500) => {
    clearTimeout(armWaveTimerRef.current)
    setArmWaveRaw(true)
    armWaveTimerRef.current = setTimeout(() => setArmWaveRaw(false), duration)
  }
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
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
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

  // 가끔 새싹이 쫑긋 (혼자서도 살아있는 느낌)
  useEffect(() => {
    let cancelled = false
    const schedule = () => {
      const delay = 4000 + Math.random() * 4000
      setTimeout(() => {
        if (cancelled) return
        triggerLeafPop()
        schedule()
      }, delay)
    }
    schedule()
    return () => { cancelled = true }
  }, [])

  // 레벨업 이펙트
  useEffect(() => {
    if (levelUpSignal === prevLevelUpRef.current) return
    prevLevelUpRef.current = levelUpSignal
    glowControls.start({ scale: [0, 2.3], opacity: [0.55, 0], transition: { duration: 0.9, ease: 'easeOut' } })
    bodyControls.start({ scale: [1, 1.28, 0.92, 1.05, 1], transition: { duration: 0.7, ease: 'easeInOut' } })
    setReaction('surprised')
    triggerLeafPop(700)
    triggerArmWave(700)
    setTimeout(() => setReaction(null), 750)
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: `heart-${Date.now()}-${i}`,
      x: 26 + Math.random() * 48,
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
      spawnSparkles()
      setReaction('happy')
      triggerLeafPop()
      triggerArmWave()
      bodyControls.start({
        scaleY: [1, 0.82 * intensity, 1.08, 1],
        scaleX: [1, 1.12 * intensity, 0.96, 1],
        rotate: [0, next % 2 === 0 ? -6 : 6, 0],
        transition: { duration: 0.28, ease: 'easeOut' },
      })
      setTimeout(() => setReaction(null), 400)
      if (next % 10 === 0) {
        bodyControls.start({
          rotate: [0, 360],
          transition: { duration: 0.6, ease: 'easeInOut' },
        }).then(() => bodyControls.set({ rotate: 0 }))
      }
    }, 60)

    onTap?.()
  }

  const swayAnim = mood === 'bored'
    ? { rotate: [-5, 5, -5], x: [-3, 3, -3] }
    : mood === 'sad'
      ? { rotate: [-2, 2, -2], y: [0, 4, 0] }
      : mood === 'sleepy'
        ? { rotate: [-2, 2, -2] }
        : { rotate: [-2.5, 2.5, -2.5], y: [0, -6, 0] }
  const swayDuration = mood === 'bored' ? 1.8 : mood === 'sad' ? 3 : mood === 'sleepy' ? 4.2 : 2.4

  // 눈: 깜빡임/기분/리액션에 따라 실제로 눌리고 커지는 변형
  const eyeScaleY = blink || mood === 'sleepy' ? 0.12 : reaction === 'surprised' ? 1.35 : reaction === 'happy' ? 0.72 : mood === 'sad' ? 0.8 : 1
  const eyeScaleX = reaction === 'surprised' ? 1.15 : 1

  // 입: 표정에 따라 실제로 늘어나고 휘어지는 변형
  const mouthScaleY = reaction === 'surprised' ? 2.4 : reaction === 'happy' ? 1.8 : mood === 'sad' ? 0.6 : mood === 'sleepy' ? 0.5 : 1
  const mouthScaleX = reaction === 'happy' ? 1.15 : mood === 'sad' ? 0.85 : 1
  const mouthY = mood === 'sad' ? 4 : 0

  const leafAnim = leafPop
    ? { rotate: [0, -16, 10, -5, 0], scale: [1, 1.16, 0.96, 1.04, 1] }
    : mood === 'sleepy'
      ? { rotate: [10, 16, 10], scale: 1 }
      : { rotate: [-4, 4, -4], scale: [1, 1.03, 1] }
  const leafTransition = leafPop
    ? { duration: 0.55, ease: 'easeOut' }
    : { duration: mood === 'sleepy' ? 4.5 : 2.8, repeat: Infinity, ease: 'easeInOut' }

  const armLeftAnim = armWave
    ? { rotate: [0, -22, 8, 0] }
    : { rotate: mood === 'bored' ? [-3, 10, -3] : [-4, 4, -4] }
  const armRightAnim = armWave
    ? { rotate: [0, 22, -8, 0] }
    : { rotate: mood === 'bored' ? [3, -10, 3] : [4, -4, 4] }
  const armTransition = armWave
    ? { duration: 0.5, ease: 'easeOut' }
    : { duration: mood === 'bored' ? 1.6 : 2.2, repeat: Infinity, ease: 'easeInOut' }

  return (
    <div
      ref={wrapRef}
      className="greenie-character"
      style={{ width: size, height: size * (CANVAS.h / CANVAS.w), cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={handlePointerDown}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? '그린이에게 물주기' : undefined}
    >
      <motion.div className="greenie-glow" initial={{ scale: 0, opacity: 0 }} animate={glowControls} />

      <motion.div
        animate={bodyControls}
        initial={{ scale: 1 }}
        style={{ originX: 0.5, originY: 0.85, width: '100%', height: '100%' }}
      >
        <motion.div
          animate={{ scale: [1, 1.03, 1], ...swayAnim }}
          transition={{ duration: swayDuration, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: 0.5, originY: 1, width: '100%', height: '100%', position: 'relative', filter: mood === 'sleepy' ? 'brightness(0.95)' : 'none' }}
        >
          <img src={bodyImg} alt="그린이" className="greenie-character-img" draggable={false} />

          <motion.div style={partStyle(PARTS.leaf)} animate={leafAnim} transition={leafTransition}>
            <img src={leafImg} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.div>

          <motion.div style={partStyle(PARTS.armLeft)} animate={armLeftAnim} transition={armTransition}>
            <img src={armLeftImg} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.div>
          <motion.div style={partStyle(PARTS.armRight)} animate={armRightAnim} transition={armTransition}>
            <img src={armRightImg} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.div>

          <motion.div
            style={partStyle(PARTS.eyeLeft)}
            animate={{ scaleY: eyeScaleY, scaleX: eyeScaleX }}
            transition={{ duration: 0.14 }}
          >
            <img src={eyeLeftImg} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.div>
          <motion.div
            style={partStyle(PARTS.eyeRight)}
            animate={{ scaleY: eyeScaleY, scaleX: eyeScaleX }}
            transition={{ duration: 0.14 }}
          >
            <img src={eyeRightImg} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.div>

          <motion.div
            style={partStyle(PARTS.mouth)}
            animate={{ scaleY: mouthScaleY, scaleX: mouthScaleX, y: mouthY }}
            transition={{ duration: 0.16 }}
          >
            <img src={mouthImg} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          </motion.div>
        </motion.div>
      </motion.div>

      {mood === 'sleepy' && (
        <motion.span
          className="greenie-zzz"
          animate={{ y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >Zzz</motion.span>
      )}

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
