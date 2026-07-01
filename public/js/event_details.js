// Format date dd/mm/yyyy
function formatDDMMYYYY(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Invalid Event");
    return;
  }

  const res = await fetch(`/api/events/${id}`);
  const ev = await res.json();

  document.getElementById("title").textContent = ev.title;
  document.getElementById("description").textContent = ev.description || "No description";
  document.getElementById("date").textContent = "📅 Date: " + formatDDMMYYYY(ev.startDate);
  document.getElementById("location").textContent =
    "📍 Location: " + (ev.location || (ev.isOnline ? "Online" : "Not provided"));
  document.getElementById("type").textContent =
    "🎫 Type: " + (ev.customType || ev.type);

  document.getElementById("registerLink").href = ev.registrationLink || "#";
}

window.addEventListener("DOMContentLoaded", loadDetails);
