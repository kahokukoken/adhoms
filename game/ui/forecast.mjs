const clamp = value => Math.max(0, Math.min(100, value));

function point(index, value) {
  return [24 + index * 62, 112 - clamp(value) * 0.88];
}

export function forecastSeries(state) {
  const baseline = (
    state.metrics.socialStability +
    state.metrics.legitimacy +
    state.metrics.resilience
  ) / 3;
  const slope = (state.metrics.adaptability - 50) / 25;
  const uncertainty = (100 - state.metrics.observationQuality) / 13;
  return Array.from({ length: 6 }, (_, year) => ({
    year,
    value: clamp(baseline + slope * year),
    low: clamp(baseline + slope * year - uncertainty * (1 + year * 0.22)),
    high: clamp(baseline + slope * year + uncertainty * (1 + year * 0.22))
  }));
}

export function renderForecast(state) {
  const series = forecastSeries(state);
  const line = series.map((item, index) => `${index ? 'L' : 'M'} ${point(index, item.value).join(' ')}`).join(' ');
  const upper = series.map((item, index) => `${index ? 'L' : 'M'} ${point(index, item.high).join(' ')}`).join(' ');
  const lower = [...series].reverse().map((item, index) => `L ${point(series.length - index - 1, item.low).join(' ')}`).join(' ');
  return `
    <svg class="forecast" viewBox="0 0 360 140" role="img" aria-label="5年間予測">
      <title>現在から5年間の地域機能予測と不確実性</title>
      <path data-series="uncertainty-band" d="${upper} ${lower} Z" fill="#69d0c733" stroke="none"></path>
      <path data-series="forecast-line" d="${line}" fill="none" stroke="#69d0c7" stroke-width="3"></path>
      ${series.map((item, index) => `<text x="${point(index, item.value)[0] - 7}" y="132">${index}年</text>`).join('')}
    </svg>`;
}
