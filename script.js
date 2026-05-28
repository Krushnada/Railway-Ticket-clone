const searchForm = document.getElementById("searchForm");
const bookingForm = document.getElementById("bookingForm");
const trainResults = document.getElementById("trainResults");
const ticketArea = document.getElementById("ticketArea");

const travelClassMultipliers = {
  SL: 1,
  "3A": 1.7,
  "2A": 2.2,
  "1A": 3.1
};

const sampleTrains = [
  { number: "12951", name: "Rajdhani Express", baseFare: 560, departure: "06:40", arrival: "12:20" },
  { number: "12627", name: "Karnataka Express", baseFare: 440, departure: "09:15", arrival: "16:05" },
  { number: "12002", name: "Shatabdi Express", baseFare: 510, departure: "14:10", arrival: "19:10" },
  { number: "12724", name: "Duronto Express", baseFare: 620, departure: "22:20", arrival: "05:35" }
];

let selectedTrain = null;
let searchPayload = null;

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const journeyDate = document.getElementById("journeyDate").value;
  const travelClass = document.getElementById("travelClass").value;
  const passengers = Number(document.getElementById("passengers").value);

  if (!from || !to || !journeyDate || Number.isNaN(passengers) || passengers < 1) {
    showMessage(trainResults, "Enter valid route and date details.");
    return;
  }

  if (from.toLowerCase() === to.toLowerCase()) {
    showMessage(trainResults, "From and To stations must be different.");
    return;
  }

  searchPayload = { from, to, journeyDate, travelClass, passengers };
  selectedTrain = null;
  renderTrains();
  bookingForm.classList.remove("disabled-form");
  showMessage(ticketArea, "Select a train and submit passenger details to book.");
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!searchPayload) {
    showMessage(ticketArea, "Search for trains first.");
    return;
  }

  if (!selectedTrain) {
    showMessage(ticketArea, "Please select one train to continue.");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const age = Number(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!fullName || !gender || !email || Number.isNaN(age) || age < 1 || !/^\d{10}$/.test(mobile)) {
    showMessage(ticketArea, "Enter valid passenger details before booking.");
    return;
  }

  const classFactor = travelClassMultipliers[searchPayload.travelClass] || 1;
  const farePerPassenger = Math.round(selectedTrain.baseFare * classFactor);
  const totalFare = farePerPassenger * searchPayload.passengers;
  const pnr = generatePNR();

  ticketArea.classList.remove("empty");
  ticketArea.innerHTML = `
    <div class="ticket">
      <h3>Ticket Confirmed</h3>
      <div><strong>PNR:</strong> ${pnr}</div>
      <div><strong>Passenger:</strong> ${escapeHtml(fullName)} (${age}, ${escapeHtml(gender)})</div>
      <div><strong>Train:</strong> ${selectedTrain.name} (${selectedTrain.number})</div>
      <div><strong>Route:</strong> ${escapeHtml(searchPayload.from)} to ${escapeHtml(searchPayload.to)}</div>
      <div><strong>Date:</strong> ${searchPayload.journeyDate}</div>
      <div><strong>Class:</strong> ${searchPayload.travelClass}</div>
      <div><strong>Passengers:</strong> ${searchPayload.passengers}</div>
      <div><strong>Fare:</strong> INR ${farePerPassenger} x ${searchPayload.passengers} = INR ${totalFare}</div>
      <div><strong>Contact:</strong> ${mobile} | ${escapeHtml(email)}</div>
    </div>
  `;
});

function renderTrains() {
  trainResults.classList.remove("empty");
  trainResults.innerHTML = "";

  sampleTrains.forEach((train, index) => {
    const classFactor = travelClassMultipliers[searchPayload.travelClass] || 1;
    const fare = Math.round(train.baseFare * classFactor);

    const item = document.createElement("article");
    item.className = "train-item";
    item.innerHTML = `
      <div class="train-row">
        <strong>${train.name}</strong>
        <span>#${train.number}</span>
      </div>
      <div class="train-row">
        <span>${searchPayload.from} (${train.departure})</span>
        <span>${searchPayload.to} (${train.arrival})</span>
      </div>
      <div class="train-row">
        <span>Fare per passenger: INR ${fare}</span>
        <button class="btn" data-index="${index}">Select</button>
      </div>
    `;
    trainResults.appendChild(item);
  });

  trainResults.querySelectorAll("button[data-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-index"));
      selectedTrain = sampleTrains[idx];
      highlightSelectedTrain(idx);
      showMessage(ticketArea, `Selected ${selectedTrain.name}. Complete passenger details to confirm booking.`);
    });
  });
}

function highlightSelectedTrain(selectedIndex) {
  const cards = trainResults.querySelectorAll(".train-item");
  cards.forEach((card, idx) => {
    card.style.borderColor = idx === selectedIndex ? "#0c6cf2" : "#dbe4ef";
    card.style.boxShadow = idx === selectedIndex ? "0 0 0 3px rgba(12,108,242,.15)" : "none";
  });
}

function showMessage(target, message) {
  target.classList.add("empty");
  target.textContent = message;
}

function generatePNR() {
  const randomPart = Math.floor(1000000000 + Math.random() * 9000000000);
  return String(randomPart);
}

function escapeHtml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
