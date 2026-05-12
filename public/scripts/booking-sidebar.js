const PRICE_PER_NIGHT = 2026;

const checkInInput = document.getElementById("check-in");
const checkOutInput = document.getElementById("check-out");
const priceEl = document.getElementById("price");
const totalPriceEl = document.getElementById("total-price");

// Set initial prices
priceEl.textContent = `USD $${PRICE_PER_NIGHT.toLocaleString()}`;
totalPriceEl.textContent = `USD $${PRICE_PER_NIGHT.toLocaleString()}`;

// Format "YYYY-MM-DD" string → "Jun 10, 2025"
function formatDisplay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Nights between two "YYYY-MM-DD" strings
function calcNights(startStr, endStr) {
  const diff =
    new Date(endStr + "T00:00:00") - new Date(startStr + "T00:00:00");
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// The library is attached to the check-in input.
// It writes the full range ("2025-06-10 to 2025-06-14") into that input,
// which we intercept in onSelectRange to split across both visible inputs.
const picker = new HotelDatepicker(checkInInput, {
  format: "YYYY-MM-DD",
  separator: " to ",
  startOfWeek: "sunday",
  minNights: 1,
  maxNights: 0,
  selectForward: true,
  showTopBar: true,
  moveBothMonths: false,
  onSelectRange: function () {
    const raw = picker.getValue(); // "2025-06-10 to 2025-06-14"
    if (!raw) return;

    const parts = raw.split(" to ");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return;

    // Show formatted dates in each input separately
    checkInInput.value = formatDisplay(parts[0]);
    checkOutInput.value = formatDisplay(parts[1]);

    const nights = calcNights(parts[0], parts[1]);
    if (nights > 0) {
      totalPriceEl.textContent = `USD $${(
        nights * PRICE_PER_NIGHT
      ).toLocaleString()}`;
    }
  },
});

// Clicking the check-out input also opens the same picker
checkOutInput.addEventListener("click", function () {
  checkInInput.focus();
});
