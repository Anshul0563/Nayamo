/**
 * Escape special regex characters to prevent ReDoS attacks
 * @param {string} string
 * @returns {string}
 */
const escapeRegex = (string) => {
  if (typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = escapeRegex;
