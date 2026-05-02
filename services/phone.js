function normalizePhone(input) {
  if (!input) return "";
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) return "";
  if (digits.length === 10) return "+" + "1" + digits;
  if (digits.length === 11 && digits[0] === "1") return "+" + digits;
  if (input.startsWith("+")) return input.trim();
  return "+" + digits;
}

module.exports = { normalizePhone };
