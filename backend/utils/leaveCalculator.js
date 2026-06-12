function calculateDays(from, to) {
  const d = Math.floor((new Date(to) - new Date(from)) / 86400000) + 1;
  return d > 0 ? d : 0;
}
module.exports = { calculateDays };
