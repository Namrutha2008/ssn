import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Helper to create a solar cell texture canvas
function createSolarCellTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Dark crystalline silicon base
  ctx.fillStyle = '#0f2648'
  ctx.fillRect(0, 0, 512, 512)

  // Subtle crystal wafer pattern
  const cols = 6
  const rows = 10
  const cellW = 512 / cols
  const cellH = 512 / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW
      const y = r * cellH

      // Individual cell gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH)
      grad.addColorStop(0, '#163b6d')
      grad.addColorStop(0.5, '#0e2646')
      grad.addColorStop(1, '#0b1d35')
      ctx.fillStyle = grad
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4)

      // Cell border / wafer gap
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4)

      // Micro grid fingers
      ctx.strokeStyle = 'rgba(180, 215, 255, 0.15)'
      ctx.lineWidth = 0.5
      for (let f = 1; f < 5; f++) {
        const fy = y + (cellH / 5) * f
        ctx.beginPath()
        ctx.moveTo(x + 3, fy)
        ctx.lineTo(x + cellW - 3, fy)
        ctx.stroke()
      }

      // Silver busbars (2 vertical lines)
      ctx.strokeStyle = 'rgba(230, 245, 255, 0.65)'
      ctx.lineWidth = 1.5
      const b1 = x + cellW * 0.33
      const b2 = x + cellW * 0.66
      ctx.beginPath()
      ctx.moveTo(b1, y + 2)
      ctx.lineTo(b1, y + cellH - 2)
      ctx.moveTo(b2, y + 2)
      ctx.lineTo(b2, y + cellH - 2)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Helper to create circular compass pad canvas texture
function createCompassTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  const cx = 512
  const cy = 512

  // Background pad
  ctx.fillStyle = '#061629'
  ctx.fillRect(0, 0, 1024, 1024)

  // Outer engineering rings
  ctx.strokeStyle = 'rgba(120, 190, 255, 0.25)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(cx, cy, 470, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(120, 190, 255, 0.15)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 440, 0, Math.PI * 2)
  ctx.arc(cx, cy, 320, 0, Math.PI * 2)
  ctx.arc(cx, cy, 180, 0, Math.PI * 2)
  ctx.stroke()

  // Degree ticks every 5 and 15 degrees
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg - 90) * (Math.PI / 180)
    const isMajor = deg % 30 === 0
    const isMedium = deg % 15 === 0
    const innerR = isMajor ? 420 : isMedium ? 435 : 445
    const outerR = 460

    ctx.strokeStyle = isMajor ? '#ffd45f' : isMedium ? 'rgba(180, 220, 255, 0.7)' : 'rgba(120, 190, 255, 0.3)'
    ctx.lineWidth = isMajor ? 3 : isMedium ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(rad) * innerR, cy + Math.sin(rad) * innerR)
    ctx.lineTo(cx + Math.cos(rad) * outerR, cy + Math.sin(rad) * outerR)
    ctx.stroke()

    if (isMajor && deg % 90 !== 0) {
      ctx.fillStyle = 'rgba(180, 220, 255, 0.8)'
      ctx.font = 'bold 22px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const textR = 385
      ctx.fillText(`${deg}°`, cx + Math.cos(rad) * textR, cy + Math.sin(rad) * textR)
    }
  }

  // Cardinal directions: N (0° / top), E (90° / right), S (180° / bottom), W (270° / left)
  const cardinals = [
    { label: 'N · 0°', angle: -90, color: '#ff6262' },
    { label: 'E · 90°', angle: 0, color: '#ffd45f' },
    { label: 'S · 180°', angle: 90, color: '#4ee78f' },
    { label: 'W · 270°', angle: 180, color: '#ffd45f' },
  ]

  ctx.font = 'bold 36px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  cardinals.forEach(({ label, angle, color }) => {
    const rad = angle * (Math.PI / 180)
    const tx = cx + Math.cos(rad) * 380
    const ty = cy + Math.sin(rad) * 380
    ctx.fillStyle = color
    ctx.fillText(label, tx, ty)
  })

  // Radial grid crosshairs
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 440, cy)
  ctx.lineTo(cx + 440, cy)
  ctx.moveTo(cx, cy - 440)
  ctx.lineTo(cx, cy + 440)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// Build a single complete articulated Solar Panel structure in Three.js
function createSolarPanelModel(panelColorHex = 0xffd45f) {
  const root = new THREE.Group()

  // 1. Base anchor flange & concrete foundation footing
  const footingGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.16, 24)
  const footingMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85, metalness: 0.2 })
  const footing = new THREE.Mesh(footingGeo, footingMat)
  footing.position.y = 0.08
  footing.receiveShadow = true
  root.add(footing)

  // 2. Azimuth Rotator Group (rotates horizontally around Y axis)
  const azimuthGroup = new THREE.Group()
  root.add(azimuthGroup)

  // Steel mounting mast
  const mastHeight = 1.9
  const mastGeo = new THREE.CylinderGeometry(0.12, 0.14, mastHeight, 20)
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.8 })
  const mast = new THREE.Mesh(mastGeo, mastMat)
  mast.position.y = mastHeight / 2 + 0.1
  mast.castShadow = true
  mast.receiveShadow = true
  azimuthGroup.add(mast)

  // Strut collar ring
  const collarGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16)
  const collar = new THREE.Mesh(collarGeo, mastMat)
  collar.position.y = 0.95
  azimuthGroup.add(collar)

  // Diagonal support struts
  const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12)
  const leftStrut = new THREE.Mesh(strutGeo, mastMat)
  leftStrut.position.set(-0.35, 1.35, -0.2)
  leftStrut.rotation.z = -0.4
  leftStrut.rotation.x = -0.2
  azimuthGroup.add(leftStrut)

  const rightStrut = new THREE.Mesh(strutGeo, mastMat)
  rightStrut.position.set(0.35, 1.35, -0.2)
  rightStrut.rotation.z = 0.4
  rightStrut.rotation.x = -0.2
  azimuthGroup.add(rightStrut)

  // 3. Dual-axis Gimbal / Hinge Head at top of mast
  const gimbalGeo = new THREE.SphereGeometry(0.18, 16, 16)
  const gimbalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7 })
  const gimbal = new THREE.Mesh(gimbalGeo, gimbalMat)
  gimbal.position.y = mastHeight + 0.1
  azimuthGroup.add(gimbal)

  // 4. Tilt Rotator Group (pivots vertically around local X axis)
  const tiltGroup = new THREE.Group()
  tiltGroup.position.y = mastHeight + 0.1
  azimuthGroup.add(tiltGroup)

  // Rear mounting rack rails
  const railGeo = new THREE.BoxGeometry(0.08, 0.08, 1.9)
  const rail1 = new THREE.Mesh(railGeo, mastMat)
  rail1.position.set(-0.7, 0.06, 0)
  const rail2 = new THREE.Mesh(railGeo, mastMat)
  rail2.position.set(0.7, 0.06, 0)
  tiltGroup.add(rail1)
  tiltGroup.add(rail2)

  // Cross bracket
  const crossGeo = new THREE.BoxGeometry(1.8, 0.07, 0.08)
  const cross = new THREE.Mesh(crossGeo, mastMat)
  cross.position.set(0, 0.06, 0)
  tiltGroup.add(cross)

  // Junction box on underside
  const jboxGeo = new THREE.BoxGeometry(0.3, 0.12, 0.25)
  const jboxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 })
  const jbox = new THREE.Mesh(jboxGeo, jboxMat)
  jbox.position.set(0, 0.08, 0)
  tiltGroup.add(jbox)

  // 5. Main Solar Panel
  // Dimensions: 2.8m wide, 1.7m deep (oriented along Z when flat, facing +Y)
  const panelW = 2.8
  const panelH = 1.7
  const frameThick = 0.07

  // Aluminum perimeter frame
  const frameGeo = new THREE.BoxGeometry(panelW + 0.08, frameThick, panelH + 0.08)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.85 })
  const frame = new THREE.Mesh(frameGeo, frameMat)
  frame.position.set(0, 0.11, 0)
  frame.castShadow = true
  frame.receiveShadow = true
  tiltGroup.add(frame)

  // Photovoltaic cell surface
  const cellTexture = createSolarCellTexture()
  const pvGeo = new THREE.PlaneGeometry(panelW, panelH)
  const pvMat = new THREE.MeshStandardMaterial({
    map: cellTexture,
    roughness: 0.2,
    metalness: 0.6,
    color: 0xffffff,
  })
  const pvSurface = new THREE.Mesh(pvGeo, pvMat)
  // Rotate plane so its normal points UP (+Y) when panel tilt is 0
  pvSurface.rotation.x = -Math.PI / 2
  pvSurface.position.set(0, 0.146, 0)
  pvSurface.castShadow = true
  pvSurface.receiveShadow = true
  tiltGroup.add(pvSurface)

  // Protective glass sheen overlay
  const glassGeo = new THREE.PlaneGeometry(panelW, panelH)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.9,
    reflectivity: 0.7,
  })
  const glass = new THREE.Mesh(glassGeo, glassMat)
  glass.rotation.x = -Math.PI / 2
  glass.position.set(0, 0.148, 0)
  tiltGroup.add(glass)

  // Outline / selection highlight ring
  const ringGeo = new THREE.BufferGeometry()
  const hw = (panelW + 0.1) / 2
  const hh = (panelH + 0.1) / 2
  const ringPoints = [
    new THREE.Vector3(-hw, 0.16, -hh),
    new THREE.Vector3(hw, 0.16, -hh),
    new THREE.Vector3(hw, 0.16, hh),
    new THREE.Vector3(-hw, 0.16, hh),
    new THREE.Vector3(-hw, 0.16, -hh),
  ]
  ringGeo.setFromPoints(ringPoints)
  const ringMat = new THREE.LineBasicMaterial({ color: panelColorHex, transparent: true, opacity: 0.7, linewidth: 2 })
  const highlightRing = new THREE.Line(ringGeo, ringMat)
  tiltGroup.add(highlightRing)

  // 6. Inverter / Energy Unit attached to mast base
  const invW = 0.45
  const invH = 0.65
  const invD = 0.24
  const inverterBox = new THREE.Group()
  inverterBox.position.set(0.35, 0.55, 0.2)

  const invBodyGeo = new THREE.BoxGeometry(invW, invH, invD)
  const invBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 })
  const invBody = new THREE.Mesh(invBodyGeo, invBodyMat)
  invBody.castShadow = true
  invBody.receiveShadow = true
  inverterBox.add(invBody)

  // Status LED
  const ledGeo = new THREE.SphereGeometry(0.025, 12, 12)
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x4ee78f,
    emissive: 0x4ee78f,
    emissiveIntensity: 1.5,
  })
  const statusLed = new THREE.Mesh(ledGeo, ledMat)
  statusLed.position.set(0.12, 0.18, invD / 2 + 0.015)
  inverterBox.add(statusLed)

  // Inverter display screen
  const screenGeo = new THREE.PlaneGeometry(0.24, 0.12)
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x03172e })
  const screen = new THREE.Mesh(screenGeo, screenMat)
  screen.position.set(-0.04, 0.14, invD / 2 + 0.005)
  inverterBox.add(screen)

  // Cable conduit from junction box to inverter
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, mastHeight + 0.08, 0),
    new THREE.Vector3(0.12, 1.3, 0.08),
    new THREE.Vector3(0.22, 0.8, 0.14),
    new THREE.Vector3(0.35, 0.55, 0.2),
  ])
  const cableGeo = new THREE.TubeGeometry(cableCurve, 16, 0.025, 8, false)
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
  const cable = new THREE.Mesh(cableGeo, cableMat)
  azimuthGroup.add(cable)
  azimuthGroup.add(inverterBox)

  return {
    root,
    azimuthGroup,
    tiltGroup,
    highlightRing,
    statusLed,
    inverterBox,
    pvSurface,
  }
}

// Particle stream generator along power cable
function createEnergyParticles(count = 45) {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const progress = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    progress[i] = i / count
    positions[i * 3] = 0
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = 0
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: 0x4ee78f,
    size: 0.07,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geo, mat)
  return { points, progress, count }
}

export default function SolarAnalystTwin({
  tilt = 35,
  azimuth = 180,
  capacityKw = 2.5,
  currentTilt = 18,
  currentAzimuth = 180,
  isCompare = false,
  sunAltitude = 45,
  sunAzimuth = 180,
  cloudCover = 0,
  solarRadiation = 0,
  powerKw = 0,
  isOptimized = false,
  showRays = true,
  showEnergy = true,
  predictedGenerationKwh = 0,
  solarCapturePercent = 0,
  alignmentPercent = 0,
  alignmentMessage = 'Waiting for solar alignment data.',
  onResetCamera,
}) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)

  const expPanelRef = useRef(null)
  const currPanelRef = useRef(null)
  const sunGroupRef = useRef(null)
  const sunLightRef = useRef(null)
  const sunRayMeshRef = useRef(null)
  const cloudGroupRef = useRef(null)
  const particlesRef = useRef(null)
  const ambientLightRef = useRef(null)
  const skyDomeRef = useRef(null)
  const starsRef = useRef(null)
  const expTiltTargetRef = useRef(0)
  const expAzimuthTargetRef = useRef(0)
  const currTiltTargetRef = useRef(0)
  const currAzimuthTargetRef = useRef(0)
  const particleSpeedRef = useRef(0.015)

  // Initialize Three.js scene once
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 520

    // 1. Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.fog = new THREE.FogExp2(0x021124, 0.015)

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.2, 150)
    camera.position.set(0, 4.2, 8.8)
    cameraRef.current = camera

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.target.set(0, 1.2, 0)
    controls.maxPolarAngle = Math.PI / 2 + 0.02
    controls.minDistance = 2.5
    controls.maxDistance = 35
    controlsRef.current = controls

    // 5. Ambient Light
    const ambient = new THREE.AmbientLight(0x19375e, 0.85)
    scene.add(ambient)
    ambientLightRef.current = ambient

    // Directional Sunlight
    const sunLight = new THREE.DirectionalLight(0xfff5db, 2.5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 1
    sunLight.shadow.camera.far = 60
    sunLight.shadow.camera.left = -6
    sunLight.shadow.camera.right = 6
    sunLight.shadow.camera.top = 6
    sunLight.shadow.camera.bottom = -6
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)
    sunLightRef.current = sunLight

    // 6. Sky Dome
    const skyGeo = new THREE.SphereGeometry(65, 32, 24)
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x051a33,
      side: THREE.BackSide,
    })
    const skyDome = new THREE.Mesh(skyGeo, skyMat)
    scene.add(skyDome)
    skyDomeRef.current = skyDome

    // Starfield for night sky
    const starCount = 600
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const u = (i * 0.61803398875) % 1
      const v = (i * 0.41421356237) % 1
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 62 + (i % 7) / 4
      const sinPhi = Math.sin(phi)
      starPos[i * 3] = r * sinPhi * Math.cos(theta)
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) // upper hemisphere
      starPos[i * 3 + 2] = r * sinPhi * Math.sin(theta)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.8 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)
    starsRef.current = stars

    // 7. Ground / Platform with Compass
    const compassTexture = createCompassTexture()
    const platformGeo = new THREE.CylinderGeometry(7, 7.2, 0.22, 64)
    const platformMat = new THREE.MeshStandardMaterial({
      map: compassTexture,
      roughness: 0.7,
      metalness: 0.3,
    })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    platform.position.y = -0.11
    platform.receiveShadow = true
    scene.add(platform)

    // Outer terrain / engineering ring
    const groundGeo = new THREE.PlaneGeometry(60, 60)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x020b17,
      roughness: 0.95,
      metalness: 0.1,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.23
    ground.receiveShadow = true
    scene.add(ground)

    // 8. 3D Sun Sphere & Corona
    const sunGroup = new THREE.Group()
    const sunCoreGeo = new THREE.SphereGeometry(1.2, 24, 24)
    const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xfff0b8 })
    const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat)
    sunGroup.add(sunCore)

    // Glowing Corona Shells
    const corona1Geo = new THREE.SphereGeometry(1.6, 24, 24)
    const corona1Mat = new THREE.MeshBasicMaterial({ color: 0xffd45f, transparent: true, opacity: 0.45, side: THREE.BackSide })
    const corona1 = new THREE.Mesh(corona1Geo, corona1Mat)
    sunGroup.add(corona1)

    const corona2Geo = new THREE.SphereGeometry(2.3, 24, 24)
    const corona2Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.2, side: THREE.BackSide })
    const corona2 = new THREE.Mesh(corona2Geo, corona2Mat)
    sunGroup.add(corona2)

    scene.add(sunGroup)
    sunGroupRef.current = sunGroup

    // 9. Volumetric Sunlight Rays
    // Segmented ray lines from Sun to panel
    const rayGroup = new THREE.Group()
    const rayLinesGeo = new THREE.BufferGeometry()
    const rayPositions = new Float32Array(18 * 3) // 9 lines, 2 vertices each
    rayLinesGeo.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3))
    const rayMat = new THREE.LineBasicMaterial({
      color: 0xffe279,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    })
    const rayMesh = new THREE.LineSegments(rayLinesGeo, rayMat)
    rayGroup.add(rayMesh)
    scene.add(rayGroup)
    sunRayMeshRef.current = rayMesh

    // 10. Atmospheric Clouds
    const cloudGroup = new THREE.Group()
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.3,
      roughness: 0.9,
    })
    for (let c = 0; c < 12; c++) {
      const cloudGeo = new THREE.DodecahedronGeometry(2 + (c % 4) * 0.5, 1)
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
      const cRad = 20 + (c % 5) * 2
      const cAngle = (c / 12) * Math.PI * 2 + (c % 3) * 0.1
      cloudMesh.position.set(Math.cos(cAngle) * cRad, 14 + (c % 4) * 1.5, Math.sin(cAngle) * cRad)
      cloudMesh.scale.set(2.2, 0.7, 1.4)
      cloudGroup.add(cloudMesh)
    }
    scene.add(cloudGroup)
    cloudGroupRef.current = cloudGroup

    // 11. Energy Flow Particles
    const energySys = createEnergyParticles(50)
    scene.add(energySys.points)
    particlesRef.current = energySys

    // 12. Create Experiment Panel
    const expPanel = createSolarPanelModel(0xffd45f)
    scene.add(expPanel.root)
    expPanelRef.current = expPanel

    // 13. Create Current Comparison Panel (hidden by default unless isCompare = true)
    const currPanel = createSolarPanelModel(0x38bdf8)
    currPanel.root.visible = false
    scene.add(currPanel.root)
    currPanelRef.current = currPanel

    // 14. Animation Loop
    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Damped controls update
      controls.update()

      // Animate energy particles
      if (particlesRef.current && particlesRef.current.points.visible) {
        const { points, progress, count } = particlesRef.current
        const posAttr = points.geometry.attributes.position
        const cableTopY = 2.0
        const cableBotY = 0.55

        for (let i = 0; i < count; i++) {
          progress[i] = (progress[i] + particleSpeedRef.current) % 1.0
          const t = progress[i]
          // Interpolate down from top of mast to inverter
          const py = THREE.MathUtils.lerp(cableTopY, cableBotY, t)
          const px = THREE.MathUtils.lerp(0.05, 0.35, t) + Math.sin(t * Math.PI) * 0.03
          const pz = THREE.MathUtils.lerp(0.02, 0.2, t) + Math.cos(t * Math.PI) * 0.03
          posAttr.setXYZ(i, px, py, pz)
        }
        posAttr.needsUpdate = true
      }

      // Gentle cloud drift
      if (cloudGroupRef.current) {
        cloudGroupRef.current.rotation.y = elapsed * 0.003
      }

      if (expPanelRef.current) {
        expPanelRef.current.azimuthGroup.rotation.y = THREE.MathUtils.lerp(expPanelRef.current.azimuthGroup.rotation.y, expAzimuthTargetRef.current, 0.12)
        expPanelRef.current.tiltGroup.rotation.x = THREE.MathUtils.lerp(expPanelRef.current.tiltGroup.rotation.x, expTiltTargetRef.current, 0.12)
      }
      if (currPanelRef.current) {
        currPanelRef.current.azimuthGroup.rotation.y = THREE.MathUtils.lerp(currPanelRef.current.azimuthGroup.rotation.y, currAzimuthTargetRef.current, 0.12)
        currPanelRef.current.tiltGroup.rotation.x = THREE.MathUtils.lerp(currPanelRef.current.tiltGroup.rotation.x, currTiltTargetRef.current, 0.12)
      }

      renderer.render(scene, camera)
    }

    animate()

    // 15. Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Update Sun Position and Lighting when sun coordinates or weather change
  useEffect(() => {
    if (!sunGroupRef.current || !sunLightRef.current) return

    const R = 28
    const altRad = (sunAltitude * Math.PI) / 180
    // Azimuth: 0° N is -Z, 90° E is +X, 180° S is +Z, 270° W is -X
    const azRad = (sunAzimuth * Math.PI) / 180

    const x = R * Math.cos(altRad) * Math.sin(azRad)
    const y = R * Math.sin(altRad)
    const z = -R * Math.cos(altRad) * Math.cos(azRad)

    sunGroupRef.current.position.set(x, y, z)
    sunLightRef.current.position.set(x, y, z)
    sunLightRef.current.target.position.set(0, 1.2, 0)
    sunLightRef.current.target.updateMatrixWorld()

    // Sun & Sky appearance based on daylight & weather
    const isSunUp = sunAltitude > 0
    sunGroupRef.current.visible = isSunUp

    // Directional sunlight intensity
    const cloudDamping = 1 - (cloudCover / 100) * 0.65
    const sunElevationFactor = Math.max(0, Math.sin(altRad))
    const sunIntensity = isSunUp ? sunElevationFactor * cloudDamping * 2.8 : 0
    sunLightRef.current.intensity = sunIntensity

    // Sun color temperature
    if (sunAltitude < 15) {
      // Golden hour / sunset
      sunLightRef.current.color.setHex(0xffaa5e)
    } else {
      sunLightRef.current.color.setHex(0xfff7e6)
    }

    // Sky dome color
    if (skyDomeRef.current) {
      if (!isSunUp) {
        skyDomeRef.current.material.color.setHex(0x010814) // Night
      } else if (cloudCover > 65) {
        skyDomeRef.current.material.color.setHex(0x1a2e46) // Overcast
      } else if (sunAltitude < 12) {
        skyDomeRef.current.material.color.setHex(0x271e3b) // Sunset purple/orange
      } else {
        skyDomeRef.current.material.color.setHex(0x072242) // Daylight blue
      }
    }

    // Stars visibility
    if (starsRef.current) {
      starsRef.current.visible = !isSunUp || sunAltitude < 2
    }

    // Clouds opacity
    if (cloudGroupRef.current) {
      const cloudOpacity = Math.max(0.08, Math.min(0.85, (cloudCover / 100) * 0.8))
      cloudGroupRef.current.children.forEach((mesh) => {
        mesh.material.opacity = cloudOpacity
        mesh.material.color.setHex(isSunUp ? 0x94a3b8 : 0x1e293b)
      })
    }

    // Volumetric Rays calculation
    if (sunRayMeshRef.current) {
      sunRayMeshRef.current.visible = isSunUp && showRays && solarRadiation > 50
      if (sunRayMeshRef.current.visible) {
        const rayPos = sunRayMeshRef.current.geometry.attributes.position
        const targets = isCompare
          ? [new THREE.Vector3(-3.2, 1.8, 0), new THREE.Vector3(3.2, 1.8, 0)]
          : [new THREE.Vector3(0, 1.8, 0)]

        let pIdx = 0
        targets.forEach((tgt) => {
          // 4 fan rays to target corners
          const offsets = [
            new THREE.Vector3(-1.2, 0.8, -0.6),
            new THREE.Vector3(1.2, 0.8, -0.6),
            new THREE.Vector3(-1.2, 0.8, 0.6),
            new THREE.Vector3(1.2, 0.8, 0.6),
          ]
          offsets.forEach((off) => {
            const dest = tgt.clone().add(off)
            rayPos.setXYZ(pIdx++, x, y, z)
            rayPos.setXYZ(pIdx++, dest.x, dest.y, dest.z)
          })
        })
        rayPos.needsUpdate = true

        const rayOpacity = Math.max(0.1, Math.min(0.55, (solarRadiation / 1000) * (1 - cloudCover / 130)))
        sunRayMeshRef.current.material.opacity = rayOpacity
      }
    }

    // Ambient light adjustment
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = isSunUp ? 0.85 + (cloudCover / 100) * 0.4 : 0.25
    }
  }, [sunAltitude, sunAzimuth, cloudCover, solarRadiation, isCompare, showRays])

  // Update 3D Experiment Panel Physical Rotation & Position
  useEffect(() => {
    if (!expPanelRef.current) return
    const { highlightRing, statusLed, root } = expPanelRef.current

    // Set position depending on comparison mode
    if (isCompare) {
      root.position.x = 2.4
    } else {
      root.position.x = 0
    }

    // Azimuth: Physical horizontal rotation around Y
    // When Azimuth = 180° (South), panel faces +Z (towards viewer)
    const azRad = -((azimuth - 180) * Math.PI) / 180
    expAzimuthTargetRef.current = azRad

    // Tilt: Physical vertical rotation around local X
    // 0° = horizontal facing straight up; 90° = vertical
    const tiltRad = (tilt * Math.PI) / 180
    expTiltTargetRef.current = tiltRad

    // Optimized visual highlight
    if (isOptimized) {
      highlightRing.material.color.setHex(0x4ee78f)
      highlightRing.material.opacity = 0.95
    } else {
      highlightRing.material.color.setHex(0xffd45f)
      highlightRing.material.opacity = 0.45
    }

    // Status LED logic on inverter
    if (!statusLed) return
    if (sunAltitude <= 0 || powerKw <= 0) {
      // Night or 0 generation
      statusLed.material.color.setHex(0x38bdf8)
      statusLed.material.emissive.setHex(0x0284c7)
      statusLed.material.emissiveIntensity = 0.4
    } else if (powerKw > 0.5) {
      // Actively generating
      statusLed.material.color.setHex(0x4ee78f)
      statusLed.material.emissive.setHex(0x22c55e)
      statusLed.material.emissiveIntensity = 1.6
    } else {
      // Low generation
      statusLed.material.color.setHex(0xf59e0b)
      statusLed.material.emissive.setHex(0xd97706)
      statusLed.material.emissiveIntensity = 1.0
    }
  }, [tilt, azimuth, isCompare, isOptimized, powerKw, sunAltitude])

  // Update Current Comparison Panel Physical Rotation & Position
  useEffect(() => {
    if (!currPanelRef.current) return
    const { root } = currPanelRef.current

    if (isCompare) {
      root.visible = true
      root.position.x = -2.4

      const azRad = -((currentAzimuth - 180) * Math.PI) / 180
      currAzimuthTargetRef.current = azRad

      const tiltRad = (currentTilt * Math.PI) / 180
      currTiltTargetRef.current = tiltRad
    } else {
      root.visible = false
    }
  }, [isCompare, currentTilt, currentAzimuth])

  // Energy Flow Particles toggle & speed
  useEffect(() => {
    if (!particlesRef.current) return
    const isGenerating = sunAltitude > 0 && powerKw > 0.05
    particlesRef.current.points.visible = showEnergy && isGenerating
    if (particlesRef.current.points.visible) {
      const particleBrightness = Math.min(1.0, 0.4 + (powerKw / capacityKw) * 0.6)
      particlesRef.current.points.material.opacity = particleBrightness
      particleSpeedRef.current = Math.min(0.08, 0.012 + (Math.max(0, powerKw) / Math.max(0.1, capacityKw)) * 0.04)
    } else {
      particleSpeedRef.current = 0
    }
  }, [showEnergy, sunAltitude, powerKw, capacityKw])

  // Reset Camera View handler
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(0, 4.2, 8.8)
    controlsRef.current.target.set(0, 1.2, 0)
    controlsRef.current.update()
    if (onResetCamera) onResetCamera()
  }

  return (
    <div className="twin-viewport-container">
      <div ref={mountRef} className="three-canvas-root" />

      {/* Floating 3D Twin Viewport Badges */}
      <div className="twin-floating-header">
        <div className="twin-badge">
          <span className="twin-status-dot pulse"></span>
          <span>PHYSICAL 3D TWIN</span>
        </div>
        {isCompare && (
          <div className="twin-compare-badge">
            <span className="curr-tag">LEFT: CURRENT ({currentTilt}°, {currentAzimuth}°)</span>
            <span className="exp-tag">RIGHT: EXPERIMENT ({tilt}°, {azimuth}°)</span>
          </div>
        )}
      </div>

      {/* Camera and Simulation Action Buttons */}
      <div className="twin-viewport-actions">
        <button type="button" className="twin-btn" onClick={handleResetCamera} title="Reset camera angle">
          ↺ RESET VIEW
        </button>
      </div>

      <div className="twin-prediction-panel">
        <div className="twin-prediction-kicker">☀ PREDICTED SOLAR GENERATION</div>
        <strong className="twin-prediction-value">{Number.isFinite(Number(predictedGenerationKwh)) ? `${Number(predictedGenerationKwh).toFixed(2)} kWh` : 'Data unavailable'}</strong>
        <div className="twin-prediction-row"><span>Panel tilt</span><strong>{Math.round(tilt)}°</strong></div>
        <div className="twin-prediction-row"><span>Azimuth</span><strong>{Math.round(azimuth)}°</strong></div>
        <div className="twin-prediction-row"><span>Solar capture</span><strong>{Math.round(solarCapturePercent)}%</strong></div>
        <div className="twin-alignment-meter"><span style={{ width: `${Math.min(100, Math.max(0, alignmentPercent))}%` }} /></div>
        <small>{alignmentMessage}</small>
      </div>

      <div className="twin-angle-indicator">TILT = {Math.round(tilt)}°<span>Panel angle from ground</span></div>
    </div>
  )
}

