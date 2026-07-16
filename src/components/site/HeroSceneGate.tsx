import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { ClientOnly } from '@tanstack/react-router'

const AtelierScene = lazy(() => import('#/components/site/AtelierScene.client'))

export interface SceneInteraction {
  x: number
  y: number
  dragX: number
  dragY: number
  dragging: boolean
  lastX: number
  lastY: number
}

interface HeroSceneGateProps {
  mode: number
}

export function HeroSceneGate({ mode }: HeroSceneGateProps) {
  return (
    <ClientOnly fallback={<ScenePoster />}>
      <SceneCapabilityGate mode={mode} />
    </ClientOnly>
  )
}

function SceneCapabilityGate({ mode }: HeroSceneGateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<SceneInteraction>({
    x: 0,
    y: 0,
    dragX: 0,
    dragY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  })
  const [canRender, setCanRender] = useState(false)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const [quality, setQuality] = useState<'low' | 'high'>('high')
  const handleReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection

    if (reduceMotion.matches || connection?.saveData || !supportsWebGL()) return

    setQuality(coarsePointer.matches ? 'low' : 'high')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting) setCanRender(true)
      },
      { rootMargin: '180px 0px', threshold: 0.01 },
    )
    observer.observe(root)

    return () => observer.disconnect()
  }, [])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const interaction = interactionRef.current
    interaction.dragging = true
    interaction.lastX = event.clientX
    interaction.lastY = event.clientY
    event.currentTarget.dataset.dragging = 'true'
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const interaction = interactionRef.current
    interaction.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    interaction.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

    if (!interaction.dragging || event.pointerType !== 'mouse') return
    interaction.dragX += (event.clientX - interaction.lastX) * 0.006
    interaction.dragY += (event.clientY - interaction.lastY) * 0.006
    interaction.lastX = event.clientX
    interaction.lastY = event.clientY
  }

  const releasePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    interactionRef.current.dragging = false
    event.currentTarget.dataset.dragging = 'false'
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      ref={rootRef}
      className="atelier-scene-shell"
      data-ready={ready ? 'true' : 'false'}
      data-dragging="false"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onPointerLeave={(event) => {
        interactionRef.current.x = 0
        interactionRef.current.y = 0
        releasePointer(event)
      }}
    >
      <ScenePoster />
      {canRender ? (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <AtelierScene
              interaction={interactionRef as MutableRefObject<SceneInteraction>}
              mode={mode}
              quality={quality}
              visible={visible}
              onReady={handleReady}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : null}
    </div>
  )
}

function ScenePoster() {
  return (
    <div className="atelier-scene-poster" aria-hidden="true">
      <img src="/atelier-hero.png" alt="" />
      <span className="atelier-scene-poster-orbit atelier-scene-poster-orbit-a" />
      <span className="atelier-scene-poster-orbit atelier-scene-poster-orbit-b" />
      <span className="atelier-scene-poster-core" />
    </div>
  )
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
