import { useEffect, useRef, type MutableRefObject } from 'react'

import type { SceneInteraction } from '#/components/site/HeroSceneGate'

interface AtelierSceneProps {
  interaction: MutableRefObject<SceneInteraction>
  mode: number
  quality: 'low' | 'high'
  visible: boolean
  onReady: () => void
}

interface SceneRuntime {
  start: () => void
  stop: () => void
}

export default function AtelierScene({
  interaction,
  mode,
  quality,
  visible,
  onReady,
}: AtelierSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)
  const visibleRef = useRef(visible)
  const runtimeRef = useRef<SceneRuntime | null>(null)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    visibleRef.current = visible
    if (visible) runtimeRef.current?.start()
    else runtimeRef.current?.stop()
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    })
    if (!canvas || !gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return
    }

    const buffer = gl.createBuffer()
    if (!buffer) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    gl.useProgram(program)
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const pointerLocation = gl.getUniformLocation(program, 'u_pointer')
    const dragLocation = gl.getUniformLocation(program, 'u_drag')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const modeLocation = gl.getUniformLocation(program, 'u_mode')
    const frameInterval = quality === 'low' ? 50 : 1000 / 30
    let frame = 0
    let lastFrame = 0
    let startTime = 0
    let currentMode = modeRef.current

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const scale = quality === 'low' ? 0.72 : Math.min(window.devicePixelRatio, 1.15)
      const width = Math.max(1, Math.round(parent.clientWidth * scale))
      const height = Math.max(1, Math.round(parent.clientHeight * scale))
      if (canvas.width === width && canvas.height === height) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }

    const draw = (timestamp: number) => {
      frame = window.requestAnimationFrame(draw)
      if (timestamp - lastFrame < frameInterval) return
      if (!startTime) startTime = timestamp
      lastFrame = timestamp
      resize()

      const targetMode = modeRef.current
      currentMode += (targetMode - currentMode) * 0.08
      const input = interaction.current
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(pointerLocation, input.x, input.y)
      gl.uniform2f(dragLocation, input.dragX, input.dragY)
      gl.uniform1f(timeLocation, (timestamp - startTime) / 1000)
      gl.uniform1f(modeLocation, currentMode)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const runtime: SceneRuntime = {
      start: () => {
        if (frame || document.visibilityState === 'hidden') return
        frame = window.requestAnimationFrame(draw)
      },
      stop: () => {
        if (!frame) return
        window.cancelAnimationFrame(frame)
        frame = 0
      },
    }
    runtimeRef.current = runtime

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && visibleRef.current) runtime.start()
      else runtime.stop()
    }
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      runtime.stop()
      canvas.parentElement?.setAttribute('data-ready', 'false')
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement ?? canvas)
    document.addEventListener('visibilitychange', handleVisibility)
    canvas.addEventListener('webglcontextlost', handleContextLost)
    resize()
    draw(performance.now())
    onReady()
    if (!visibleRef.current) runtime.stop()

    return () => {
      runtime.stop()
      runtimeRef.current = null
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [interaction, onReady, quality])

  return <canvas ref={canvasRef} className="atelier-scene-canvas" aria-hidden="true" tabIndex={-1} />
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

const VERTEX_SHADER = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform vec2 u_drag;
  uniform float u_time;
  uniform float u_mode;

  #define MAX_STEPS 58
  #define FAR_CLIP 11.0
  #define EPSILON 0.0025

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float sdOctahedron(vec3 p, float size) {
    p = abs(p);
    float m = p.x + p.y + p.z - size;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;
    float k = clamp(0.5 * (q.z - q.y + size), 0.0, size);
    return length(vec3(q.x, q.y - size + k, q.z - k));
  }

  float sdTorus(vec3 p, vec2 shape) {
    vec2 q = vec2(length(p.xz) - shape.x, p.y);
    return length(q) - shape.y;
  }

  vec3 rotateObject(vec3 p) {
    float energy = u_mode;
    p.yz *= rotate2d(0.34 + u_pointer.y * 0.2 + u_drag.y);
    p.xz *= rotate2d(
      -0.38 + u_pointer.x * 0.24 + u_drag.x + u_time * (0.055 + energy * 0.018)
    );
    p.xy *= rotate2d(u_pointer.x * -0.06);
    return p;
  }

  vec2 mapScene(vec3 point) {
    vec3 p = rotateObject(point);
    float breathing = sin(u_time * (0.72 + u_mode * 0.12)) * 0.018;
    float octahedron = sdOctahedron(p, 1.72 + breathing) - 0.14;
    float sphere = length(p) - (1.12 + breathing);
    float core = mix(octahedron, sphere, 0.22 + smoothstep(0.8, 1.5, u_mode) * 0.24);
    core += sin(p.x * 4.0 + p.y * 3.0 + p.z * 2.0 + u_time * 0.35) * 0.018;

    vec3 ringA = p;
    ringA.xy *= rotate2d(1.05 + u_time * 0.09);
    float dA = sdTorus(ringA, vec2(2.05, 0.025));

    vec3 ringB = p.yzx;
    ringB.xy *= rotate2d(0.42 - u_time * 0.07);
    float dB = sdTorus(ringB, vec2(2.42, 0.018));

    vec3 ringC = p.zxy;
    ringC.xy *= rotate2d(-0.7 + u_time * 0.055);
    float dC = sdTorus(ringC, vec2(1.72, 0.014));

    vec2 result = vec2(core, 1.0);
    if (dA < result.x) result = vec2(dA, 2.0);
    if (dB < result.x) result = vec2(dB, 3.0);
    if (dC < result.x) result = vec2(dC, 4.0);
    return result;
  }

  vec3 getNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);
    float d = mapScene(p).x;
    return normalize(vec3(
      mapScene(p + e.xyy).x - d,
      mapScene(p + e.yxy).x - d,
      mapScene(p + e.yyx).x - d
    ));
  }

  vec3 modeColor(float mode) {
    vec3 lacquer = vec3(0.79, 0.30, 0.23);
    vec3 lagoon = vec3(0.32, 0.72, 0.67);
    vec3 brass = vec3(0.78, 0.60, 0.28);
    vec3 first = mix(lacquer, lagoon, smoothstep(0.0, 1.0, mode));
    return mix(first, brass, smoothstep(1.0, 2.0, mode));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec3 rayOrigin = vec3(0.0, 0.0, 5.7);
    vec3 rayDirection = normalize(vec3(uv, -1.85));
    float distanceTravelled = 0.0;
    float material = 0.0;
    float closest = 10.0;
    bool hit = false;

    for (int step = 0; step < MAX_STEPS; step++) {
      vec3 position = rayOrigin + rayDirection * distanceTravelled;
      vec2 samplePoint = mapScene(position);
      closest = min(closest, abs(samplePoint.x));
      if (abs(samplePoint.x) < EPSILON) {
        material = samplePoint.y;
        hit = true;
        break;
      }
      distanceTravelled += samplePoint.x * 0.82;
      if (distanceTravelled > FAR_CLIP) break;
    }

    if (!hit) {
      float halo = smoothstep(0.19, 0.015, closest) * 0.24;
      gl_FragColor = vec4(modeColor(u_mode) * halo, halo);
      return;
    }

    vec3 position = rayOrigin + rayDirection * distanceTravelled;
    vec3 normal = getNormal(position);
    vec3 viewDirection = normalize(rayOrigin - position);
    vec3 keyDirection = normalize(vec3(-0.45, 0.78, 0.62));
    vec3 fillDirection = normalize(vec3(0.72, -0.32, 0.54));
    float diffuse = max(dot(normal, keyDirection), 0.0);
    float fill = max(dot(normal, fillDirection), 0.0) * 0.34;
    float specular = pow(max(dot(reflect(-keyDirection, normal), viewDirection), 0.0), 34.0);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.4);

    vec3 base = modeColor(u_mode);
    if (material > 1.5 && material < 2.5) base = vec3(0.36, 0.76, 0.70);
    if (material > 2.5 && material < 3.5) base = vec3(0.84, 0.66, 0.32);
    if (material > 3.5) base = vec3(0.83, 0.86, 0.81);

    vec3 color = base * (0.24 + diffuse * 0.82 + fill);
    color += vec3(1.0, 0.92, 0.78) * specular * 0.62;
    color += mix(vec3(0.24, 0.68, 0.64), base, 0.45) * rim * 0.54;
    float fog = smoothstep(4.2, 8.0, distanceTravelled);
    color = mix(color, vec3(0.06, 0.08, 0.08), fog * 0.38);
    gl_FragColor = vec4(color, 0.98);
  }
`
