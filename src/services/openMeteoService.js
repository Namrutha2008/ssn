const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm',
}

const toNumber = (value, fallback = null) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toSolarValue = (value) => {
  const parsed = toNumber(value, null)
  return parsed === null ? null : Math.max(0, parsed)
}

export function getWeatherLabel(code) {
  return WEATHER_CODES[code] || 'Weather unavailable'
}

export async function fetchSolarData(latitude, longitude) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    throw new Error('Invalid coordinates provided for solar data.')
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', [
    'temperature_2m',
    'relative_humidity_2m',
    'cloud_cover',
    'wind_speed_10m',
    'wind_direction_10m',
    'weather_code',
    'is_day',
    'shortwave_radiation',
    'direct_radiation',
    'diffuse_radiation',
    'direct_normal_irradiance',
    'global_tilted_irradiance',
  ].join(','))
  url.searchParams.set('hourly', [
    'temperature_2m',
    'cloud_cover',
    'wind_speed_10m',
    'wind_direction_10m',
    'shortwave_radiation',
    'direct_radiation',
    'diffuse_radiation',
    'direct_normal_irradiance',
    'global_tilted_irradiance',
    'sunshine_duration',
  ].join(','))
  url.searchParams.set('daily', ['sunrise', 'sunset', 'daylight_duration'].join(','))
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '2')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Open-Meteo weather data is temporarily unavailable.')
  }

  const data = await response.json()

  const hourly = (data.hourly?.time || []).map((time, index) => ({
    time,
    temperature: toNumber(data.hourly?.temperature_2m?.[index], null),
    cloudCover: toNumber(data.hourly?.cloud_cover?.[index], null),
    windSpeed: toNumber(data.hourly?.wind_speed_10m?.[index], null),
    windDirection: toNumber(data.hourly?.wind_direction_10m?.[index], null),
    ghi: toSolarValue(data.hourly?.shortwave_radiation?.[index]),
    dni: toSolarValue(data.hourly?.direct_normal_irradiance?.[index]),
    dhi: toSolarValue(data.hourly?.diffuse_radiation?.[index]),
    gti: toSolarValue(data.hourly?.global_tilted_irradiance?.[index]),
    sunshineDuration: toNumber(data.hourly?.sunshine_duration?.[index], null),
  }))

  const current = data.current || {}
  const currentTime = current.time ? new Date(current.time).getTime() : NaN
  const currentHourly = hourly.reduce((closest, point) => {
    const pointTime = new Date(point.time).getTime()
    if (!Number.isFinite(currentTime) || !Number.isFinite(pointTime)) {
      return closest
    }
    if (!closest || Math.abs(pointTime - currentTime) < Math.abs(new Date(closest.time).getTime() - currentTime)) {
      return point
    }
    return closest
  }, null)

  const currentSolar = {
    ghi: toSolarValue(current.shortwave_radiation ?? currentHourly?.ghi),
    dni: toSolarValue(current.direct_normal_irradiance ?? currentHourly?.dni),
    dhi: toSolarValue(current.diffuse_radiation ?? currentHourly?.dhi),
    gti: toSolarValue(current.global_tilted_irradiance ?? currentHourly?.gti),
  }

  return {
    location: {
      latitude: Number(latitude),
      longitude: Number(longitude),
    },
    current: {
      temperature: toNumber(current.temperature_2m, null),
      humidity: toNumber(current.relative_humidity_2m, null),
      cloudCover: toNumber(current.cloud_cover, null),
      windSpeed: toNumber(current.wind_speed_10m, null),
      windDirection: toNumber(current.wind_direction_10m, null),
      weatherCode: toNumber(current.weather_code, null),
      isDay: current.is_day === undefined ? null : Boolean(current.is_day),
    },
    solar: currentSolar,
    daily: {
      sunrise: data.daily?.sunrise?.[0] || null,
      sunset: data.daily?.sunset?.[0] || null,
      daylightDuration: toNumber(data.daily?.daylight_duration?.[0], null),
    },
    hourly,
    weatherLabel: getWeatherLabel(toNumber(current.weather_code, null)),
    raw: data,
  }
}

export async function fetchSolarDataForDate(latitude, longitude, date = new Date()) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    throw new Error('Invalid coordinates provided for solar data.')
  }

  const d = date instanceof Date ? date : new Date(date)
  const dateStr = d.toISOString().slice(0, 10)

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('start_date', dateStr)
  url.searchParams.set('end_date', dateStr)
  url.searchParams.set('hourly', [
    'temperature_2m',
    'cloud_cover',
    'wind_speed_10m',
    'wind_direction_10m',
    'weather_code',
    'shortwave_radiation',
    'direct_radiation',
    'diffuse_radiation',
    'direct_normal_irradiance',
    'global_tilted_irradiance',
    'sunshine_duration',
  ].join(','))
  url.searchParams.set('daily', ['sunrise', 'sunset', 'daylight_duration'].join(','))
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url)
  if (!response.ok) {
    // If start_date/end_date fails (e.g. outside forecast range), fallback to standard fetchSolarData
    return fetchSolarData(latitude, longitude)
  }

  const data = await response.json()
  const hourly = (data.hourly?.time || []).map((time, index) => ({
    time,
    temperature: toNumber(data.hourly?.temperature_2m?.[index], null),
    cloudCover: toNumber(data.hourly?.cloud_cover?.[index], null),
    windSpeed: toNumber(data.hourly?.wind_speed_10m?.[index], null),
    windDirection: toNumber(data.hourly?.wind_direction_10m?.[index], null),
    weatherCode: toNumber(data.hourly?.weather_code?.[index], null),
    ghi: toSolarValue(data.hourly?.shortwave_radiation?.[index]),
    dni: toSolarValue(data.hourly?.direct_normal_irradiance?.[index]),
    dhi: toSolarValue(data.hourly?.diffuse_radiation?.[index]),
    gti: toSolarValue(data.hourly?.global_tilted_irradiance?.[index]),
    sunshineDuration: toNumber(data.hourly?.sunshine_duration?.[index], null),
  }))

  const middayIndex = Math.min(12, Math.max(0, Math.floor(hourly.length / 2)))
  const midday = hourly[middayIndex] || {}

  return {
    location: { latitude: Number(latitude), longitude: Number(longitude) },
    date: dateStr,
    daily: {
      sunrise: data.daily?.sunrise?.[0] || null,
      sunset: data.daily?.sunset?.[0] || null,
      daylightDuration: toNumber(data.daily?.daylight_duration?.[0], null),
    },
    current: {
      temperature: midday.temperature ?? 25,
      cloudCover: midday.cloudCover ?? 20,
      windSpeed: midday.windSpeed ?? 10,
      weatherCode: midday.weatherCode ?? 0,
      isDay: true,
    },
    solar: {
      ghi: midday.ghi ?? 0,
      dni: midday.dni ?? 0,
      dhi: midday.dhi ?? 0,
      gti: midday.gti ?? 0,
    },
    hourly,
    weatherLabel: getWeatherLabel(midday.weatherCode ?? 0),
    raw: data,
  }
}

