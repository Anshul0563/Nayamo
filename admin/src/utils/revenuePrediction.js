export function predictRevenue(data = []) {
  if (!data.length) return 0;

  const last7 = data.slice(-7);
  const avg = last7.reduce((sum, d) => sum + d.revenue, 0) / last7.length;

  const trend =
    last7[last7.length - 1].revenue - last7[0].revenue;

  return Math.round(avg + trend * 0.3);
}