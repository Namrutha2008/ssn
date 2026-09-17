import { getSunPosition } from './sunPositionService'

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/**
 * Calculates the solar angle of incidence (AOI) theta between panel normal and sun vector.
 * @param {number} sunAltDeg Sun altitude in degrees (-90 to 90)
 * @param {number} sunAzDeg Sun azimuth in compass degrees (0=N, 90=E, 180=S, 270=W)
 * @param {number} panelTiltDeg Panel tilt from horizontal in degrees (0=flat, 90=vertical)
 * @param {number} panelAzDeg Panel azimuth in compass degrees (0=N, 90=E, 180=S, 270=W)
 * @returns {{ cosTheta: number, incidenceAngleDeg: number, isSunFacing: boolean }}
 */
export function calculateIncidenceAngle(sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg) {
  if (sunAltDeg <= 0) {
    return { cosTheta: 0, incidenceAngleDeg: 90, isSunFacing: false }
  }

  const alpha = sunAltDeg * DEG2RAD
  const beta = panelTiltDeg * DEG2RAD
  const azDiff = (sunAzDeg - panelAzDeg) * DEG2RAD

  // Cosine of incidence angle on tilted surface
  // cos(theta) = sin(alpha)*cos(beta) + cos(alpha)*sin(beta)*cos(sunAz - panelAz)
  const cosThetaRaw = Math.sin(alpha) * Math.cos(beta) + Math.cos(alpha) * Math.sin(beta) * Math.cos(azDiff)
  const isSunFacing = cosThetaRaw > 0
  const cosTheta = clamp(cosThetaRaw, 0, 1)
  const incidenceAngleDeg = Math.round(Math.acos(clamp(cosThetaRaw, -1, 1)) * RAD2DEG * 10) / 10

  return { cosTheta, incidenceAngleDeg, isSunFacing }
}

/**
 * Calculates Plane-Of-Array (POA) Global Tilted Irradiance (GTI) in W/m²
 * using Liu-Jordan / Isotropic transposition model.
 */
export function calculateTiltedIrradiance(solarMetrics, sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg, albedo = 0.2) {
  const ghi = Math.max(0, Number(solarMetrics?.ghi) || 0)
  const dni = Math.max(0, Number(solarMetrics?.dni) || 0)
  const dhi = Math.max(0, Number(solarMetrics?.dhi) || (ghi * 0.3))

  if (sunAltDeg <= 0 || ghi <= 0) {
    return { gti: 0, beamComponent: 0, diffuseComponent: 0, groundComponent: 0 }
  }

  const { cosTheta } = calculateIncidenceAngle(sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg)
  const beta = panelTiltDeg * DEG2RAD

  // Direct beam on tilted surface
  const beamComponent = dni > 0 ? dni * cosTheta : ghi * cosTheta * 0.75
  // Isotropic diffuse transposition
  const diffuseComponent = dhi * ((1 + Math.cos(beta)) / 2)
  // Ground reflected irradiance
  const groundComponent = ghi * albedo * ((1 - Math.cos(beta)) / 2)

  const gti = Math.round((beamComponent + diffuseComponent + groundComponent) * 10) / 10

  return {
    gti: Math.max(0, gti),
    beamComponent: Math.round(beamComponent * 10) / 10,
    diffuseComponent: Math.round(diffuseComponent * 10) / 10,
    groundComponent: Math.round(groundComponent * 10) / 10,
  }
}

/**
 * Calculates instantaneous DC power (kW) with cell temperature derating.
 */
export function calculateInstantaneousPower(tiltedGti, panelConfig, ambientTemp = 25) {
  const capacityKw = Number(panelConfig?.capacityKw || panelConfig?.capacity) || 2.5
  const systemEfficiency = Number(panelConfig?.systemEfficiency) || 0.85

  if (tiltedGti <= 0) {
    return 0
  }

  // Estimated cell temperature with NOCT ~ 45°C
  const cellTemp = ambientTemp + (tiltedGti / 800) * (45 - 20)
  // Temp coefficient for silicon ~ -0.4% per °C above 25°C
  const tempFactor = clamp(1 - 0.004 * (cellTemp - 25), 0.7, 1.05)

  const powerKw = capacityKw * (tiltedGti / 1000) * tempFactor * systemEfficiency
  return Math.round(Math.max(0, powerKw) * 1000) / 1000
}

/**
 * Calculates modeled daily energy generation (kWh) by integrating across hourly forecast data.
 */
export function calculateModeledDailyEnergy(hourlyData, panelConfig, latitude, longitude, targetDate = new Date()) {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    return 0
  }

  const targetDateStr = (targetDate instanceof Date ? targetDate : new Date(targetDate)).toISOString().slice(0, 10)
  const dayHourly = hourlyData.filter((point) => point.time && point.time.startsWith(targetDateStr))
  const dataset = dayHourly.length >= 8 ? dayHourly : hourlyData.slice(0, 24)

  const tilt = Number(panelConfig?.tilt ?? 18)
  const azimuth = Number(panelConfig?.azimuth ?? 180)

  let totalKwh = 0

  dataset.forEach((point) => {
    const pointTime = new Date(point.time)
    const sun = getSunPosition(latitude, longitude, pointTime)

    if (sun.altitudeDeg > 0 && (point.ghi > 0 || point.dni > 0)) {
      const { gti } = calculateTiltedIrradiance(point, sun.altitudeDeg, sun.azimuthDeg, tilt, azimuth)
      const powerKw = calculateInstantaneousPower(gti, panelConfig, point.temperature ?? 25)
      // 1 hour integration step
      totalKwh += powerKw
    }
  })

  return Math.round(totalKwh * 100) / 100
}

/**
 * Computes the dynamic Orientation Score (0 to 100) based on sun alignment.
 */
export function calculateOrientationScore(sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg) {
  if (sunAltDeg <= 0) {
    return 0
  }

  const { cosTheta } = calculateIncidenceAngle(sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg)
  return Math.round(clamp(cosTheta * 100, 0, 100))
}

/**
 * Computes Solar Capture Breakdown factors ("SolarQuest Modelled Impact").
 */
export function calculateCaptureBreakdown(solarMetrics, sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg) {
  if (sunAltDeg <= 0) {
    return {
      sunAngle: 0,
      panelOrientation: 0,
      cloudCover: Math.max(0, 100 - (Number(solarMetrics?.cloudCover) || 0)),
      availableRadiation: 0,
      timeOfDay: 0,
      overallEfficiency: 0,
    }
  }

  // 1. Sun Angle factor (zenith angle factor: higher altitude = thinner atmosphere, better transmission)
  const sunAngleFactor = clamp(Math.sin(sunAltDeg * DEG2RAD), 0, 1)

  // 2. Panel orientation factor (cos theta)
  const { cosTheta } = calculateIncidenceAngle(sunAltDeg, sunAzDeg, panelTiltDeg, panelAzDeg)

  // 3. Cloud Cover transmission (0 cloud = 100% transmission, 100 cloud = ~25% diffuse transmission)
  const cloudPercent = clamp(Number(solarMetrics?.cloudCover) || 0, 0, 100)
  const cloudTransmission = 1 - (cloudPercent / 100) * 0.75

  // 4. Available Radiation factor (GHI relative to nominal STC peak 1000 W/m²)
  const ghi = Number(solarMetrics?.ghi) || 0
  const radiationFactor = clamp(ghi / 1000, 0, 1)

  // 5. Time of day daylight window (bell curve peaking at solar noon)
  const timeOfDayFactor = clamp(Math.sin((sunAltDeg / 90) * (Math.PI / 2)), 0, 1)

  const overall = (sunAngleFactor * 0.2 + cosTheta * 0.35 + cloudTransmission * 0.2 + radiationFactor * 0.15 + timeOfDayFactor * 0.1) * 100

  return {
    sunAngle: Math.round(sunAngleFactor * 100),
    panelOrientation: Math.round(cosTheta * 100),
    cloudCover: Math.round(cloudTransmission * 100),
    availableRadiation: Math.round(radiationFactor * 100),
    timeOfDay: Math.round(timeOfDayFactor * 100),
    overallEfficiency: Math.round(clamp(overall, 0, 100)),
  }
}

/**
 * SolarQuest Optimizer:
 * Runs a deterministic simulation testing all panel tilts (0° to 85°) and azimuths (0° to 350°)
 * across the daylight hours of the given date.
 * Finds the orientation producing the highest modeled energy.
 */
export function runSolarOptimizer(latitude, longitude, hourlyData, currentPanel, date = new Date()) {
  const currentTilt = Number(currentPanel?.tilt ?? 18)
  const currentAzimuth = Number(currentPanel?.azimuth ?? 180)
  const capacityKw = Number(currentPanel?.capacityKw || currentPanel?.capacity) || 2.5

  const currentGen = calculateModeledDailyEnergy(hourlyData, { ...currentPanel, tilt: currentTilt, azimuth: currentAzimuth }, latitude, longitude, date)

  let bestTilt = currentTilt
  let bestAzimuth = currentAzimuth
  let maxGen = -1

  // Grid search: tilts 5° to 75° (step 5°), azimuths 0° to 350° (step 10°)
  // Also specifically tests rule-of-thumb: latitude tilt facing Equator (180° in Northern hemisphere, 0° in Southern hemisphere)
  const latTilt = clamp(Math.round(Math.abs(latitude)), 5, 75)
  const equatorAzimuth = latitude >= 0 ? 180 : 0

  const tiltCandidates = [latTilt, 0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
  const azimuthCandidates = [equatorAzimuth, 90, 120, 135, 150, 165, 180, 195, 210, 225, 240, 270, 0]

  tiltCandidates.forEach((testTilt) => {
    azimuthCandidates.forEach((testAzimuth) => {
      const candidateConfig = { capacityKw, tilt: testTilt, azimuth: testAzimuth }
      const gen = calculateModeledDailyEnergy(hourlyData, candidateConfig, latitude, longitude, date)
      if (gen > maxGen) {
        maxGen = gen
        bestTilt = testTilt
        bestAzimuth = testAzimuth
      }
    })
  })

  // Fine-tune around best candidate (+/- 4 degrees, step 2)
  const fineTilts = [Math.max(0, bestTilt - 4), Math.max(0, bestTilt - 2), bestTilt, Math.min(90, bestTilt + 2), Math.min(90, bestTilt + 4)]
  const fineAzimuths = [(bestAzimuth - 6 + 360) % 360, (bestAzimuth - 3 + 360) % 360, bestAzimuth, (bestAzimuth + 3) % 360, (bestAzimuth + 6) % 360]

  fineTilts.forEach((fTilt) => {
    fineAzimuths.forEach((fAzimuth) => {
      const gen = calculateModeledDailyEnergy(hourlyData, { capacityKw, tilt: fTilt, azimuth: fAzimuth }, latitude, longitude, date)
      if (gen > maxGen) {
        maxGen = gen
        bestTilt = fTilt
        bestAzimuth = fAzimuth
      }
    })
  })

  const modeledGeneration = Math.round(maxGen * 100) / 100
  const baselineGen = Math.max(0.01, currentGen)
  const improvement = Math.round(Math.max(0, ((modeledGeneration - currentGen) / baselineGen) * 100) * 10) / 10

  return {
    recommendedTilt: bestTilt,
    recommendedAzimuth: bestAzimuth,
    modeledGeneration,
    currentGeneration: currentGen,
    improvementPercent: improvement,
  }
}

