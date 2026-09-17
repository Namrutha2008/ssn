import * as SunCalc from 'suncalc'

export function getSunPosition(latitude, longitude, date = new Date()) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return {
      altitude: -Math.PI / 2,
      azimuth: 0,
      altitudeDeg: -90,
      azimuthDeg: 180,
      zenithDeg: 180,
      isDaylight: false,
      timestamp: new Date(date).toISOString(),
    }
  }

  const dateObj = date instanceof Date ? date : new Date(date)
  const position = SunCalc.getPosition(dateObj, Number(latitude), Number(longitude))
  const altitudeDeg = (position.altitude * 180) / Math.PI
  // SunCalc returns azimuth in radians: 0 = South, -PI/2 = East, PI/2 = West, PI/-PI = North
  // Convert to standard compass azimuth: 0° = North, 90° = East, 180° = South, 270° = West
  const compassAzimuthDeg = (((position.azimuth * 180) / Math.PI) + 180 + 360) % 360

  return {
    altitude: position.altitude, // radians for backward compatibility with Dashboard
    azimuth: position.azimuth,   // radians for backward compatibility with Dashboard
    altitudeDeg: Math.round(altitudeDeg * 10) / 10,
    azimuthDeg: Math.round(compassAzimuthDeg * 10) / 10,
    zenithDeg: Math.max(0, Math.round((90 - altitudeDeg) * 10) / 10),
    isDaylight: position.altitude > 0,
    timestamp: dateObj.toISOString(),
  }
}

export function getSunPositionInDegrees(latitude, longitude, date = new Date()) {
  const pos = getSunPosition(latitude, longitude, date)
  return {
    altitude: pos.altitudeDeg,
    azimuth: pos.azimuthDeg,
    zenith: pos.zenithDeg,
    isDaylight: pos.isDaylight,
    timestamp: pos.timestamp,
  }
}

export function getSunPhase(latitude, longitude, date = new Date()) {
  const dateObj = date instanceof Date ? date : new Date(date)
  const times = SunCalc.getTimes(dateObj, Number(latitude), Number(longitude))

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
    nadir: times.nadir,
    dawn: times.dawn,
    dusk: times.dusk,
  }
}

export function calculateSunPath(latitude, longitude, date = new Date(), stepMinutes = 30) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return []
  }

  const baseDate = new Date(date)
  baseDate.setHours(0, 0, 0, 0)
  const points = []

  const totalSteps = (24 * 60) / stepMinutes
  for (let i = 0; i <= totalSteps; i++) {
    const time = new Date(baseDate.getTime() + i * stepMinutes * 60 * 1000)
    const pos = getSunPosition(latitude, longitude, time)
    points.push({
      time,
      altitudeDeg: pos.altitudeDeg,
      azimuthDeg: pos.azimuthDeg,
      isDaylight: pos.isDaylight,
    })
  }

  return points
}

