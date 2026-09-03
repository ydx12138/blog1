export function formatDashboardNumber(value) {
  const number = Number(value) || 0
  if (number >= 10000) {
    const formatted = (number / 10000).toFixed(number >= 1000000 ? 0 : 1)
    return `${formatted.replace(/\.0$/, '')}万`
  }
  return String(number)
}

export function buildTrendPoints(values, width, height) {
  const safeValues = values.map((value) => Number(value) || 0)
  const maximum = Math.max(...safeValues, 0)
  const lastIndex = Math.max(safeValues.length - 1, 1)

  return safeValues.map((value, index) => ({
    x: Number(((index / lastIndex) * width).toFixed(2)),
    y: maximum === 0
      ? height
      : Number((height - ((value / maximum) * height)).toFixed(2)),
  }))
}
