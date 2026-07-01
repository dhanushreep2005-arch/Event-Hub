/* =======================================================
   FETCH EVENTS WITH OPTIONAL FILTERS
======================================================= */
async function fetchEvents(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch("/api/events?" + params.toString());
  return res.json();
}

/* =======================================================
   DATE FORMAT (DD/MM/YYYY)
======================================================= */
function formatDDMMYYYY(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d)) return "";
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}

/* =======================================================
   RENDER EACH EVENT CARD
======================================================= */
function renderEventCard(ev) {
  const div = document.createElement("div");
  div.className = "bg-white p-4 rounded shadow event-card";

  const start = formatDDMMYYYY(ev.startDate);

  // Registration badge
  let badge = "";
  if (ev.registrationDeadline) {
    const deadline = new Date(ev.registrationDeadline);
    const now = new Date();

    if (deadline < now) {
      badge = `<span class="text-red-600 font-bold">Registration Closed</span>`;
    } else {
      const daysLeft = Math.ceil((deadline - now) / 86400000);
      badge = `<span class="text-green-600 font-bold">${daysLeft} days left</span>`;
    }
  }

  div.innerHTML = `
    <div class="flex justify-between">
      <h4 class="font-bold">${ev.title}</h4>

      <div>
        <button class="bookmarkBtn mr-2" data-id="${ev._id}">☆</button>

        <button class="reportBtn text-red-500 text-sm" data-id="${ev._id}">
          Report Broken Link
        </button>
      </div>
    </div>

    <p class="text-sm my-2">
      ${ev.location || (ev.isOnline ? "Online" : "")} • ${start}
    </p>

    <p class="text-sm">${badge}</p>

    <div class="flex gap-2 mt-3">
      <a href="${ev.registrationLink || "#"}" target="_blank"
        class="bg-blue-600 text-white px-3 py-1 rounded">
        Register
      </a>

      <button onclick="openDetails('${ev._id}')"
        class="bg-gray-200 px-3 py-1 rounded">
        Details
      </button>
    </div>
  `;

  return div;
}

/* =======================================================
   LOAD EVENTS + APPLY FILTERS
======================================================= */
async function loadAndRender() {
  const type = document.getElementById("typeFilter")?.value;
  const mode = document.getElementById("modeFilter")?.value;
  const timeline = document.getElementById("timelineFilter")?.value;
  const q = document.getElementById("search")?.value;

  const filters = {};
  if (type) filters.type = type;
  if (mode) filters.mode = mode;
  if (timeline) filters.timeline = timeline;
  if (q) filters.q = q;

  const events = await fetchEvents(filters);

  const grid = document.getElementById("eventsGrid");
  if (!grid) return;

  grid.innerHTML = "";
  events.forEach((ev) => grid.appendChild(renderEventCard(ev)));

  /* ---------------- WISHLIST BUTTON ---------------- */
  document.querySelectorAll(".bookmarkBtn").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const token = localStorage.getItem("token");
      if (!token) return alert("Login to save to wishlist");

      const res = await fetch("/api/bookmarks/" + id, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });

      res.ok ? alert("Updated wishlist") : alert("Error");
    })
  );

  /* ---------------- REPORT BROKEN LINK ---------------- */
  document.querySelectorAll(".reportBtn").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const token = localStorage.getItem("token");

      if (!token) return alert("Login to report");
      if (!confirm("Report broken registration link?")) return;

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await res.json();
      res.ok ? alert("Reported successfully") : alert(data.msg || "Error reporting");
    })
  );
}

/* =======================================================
   OPEN DETAILS PAGE   ✔ WORKING
======================================================= */
function openDetails(id) {
  window.location.href = `event_details.html?id=${id}`;
}

/* =======================================================
   FILTER LISTENERS
======================================================= */
["typeFilter", "modeFilter", "timelineFilter"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", loadAndRender);
});

/* Live Search */
const searchInput = document.getElementById("search");
if (searchInput) {
  let timer;
  searchInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(loadAndRender, 200); // instant search
  });
}

/* Reset Filters */
const resetBtn = document.getElementById("resetFilters");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("typeFilter").value = "";
    document.getElementById("modeFilter").value = "";
    document.getElementById("timelineFilter").value = "";
    document.getElementById("search").value = "";
    loadAndRender();
  });
}

/* First Load */
window.addEventListener("DOMContentLoaded", loadAndRender);
