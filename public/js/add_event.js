document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addEventForm");
  const typeSelect = document.getElementById("type");
  const otherTypeDiv = document.getElementById("otherTypeDiv");
  const otherTypeInput = document.getElementById("otherTypeInput");
  const isOnlineCheckbox = document.getElementById("isOnline");
  const locationDiv = document.getElementById("locationDiv");

  // custom type toggle
  typeSelect.addEventListener("change", () => {
    if (typeSelect.value === "Other") otherTypeDiv.classList.remove("hidden");
    else { otherTypeDiv.classList.add("hidden"); otherTypeInput.value = ""; }
  });

  // Option B: hide location when online
  function toggleLocation() {
    if (isOnlineCheckbox.checked) locationDiv.style.display = "none";
    else locationDiv.style.display = "block";
  }
  toggleLocation();
  isOnlineCheckbox.addEventListener("change", toggleLocation);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in first'); window.location.href = '/auth/login.html'; return; }

    const title = document.getElementById("title").value.trim();
    const startDate = document.getElementById("startDate").value;
    const registrationDeadline = document.getElementById("registrationDeadline").value || null;
    const description = document.getElementById("description").value.trim();
    const type = document.getElementById("type").value;
    const customType = (type === "Other") ? document.getElementById("otherTypeInput").value.trim() : null;
    const isOnline = isOnlineCheckbox.checked;
    const location = isOnline ? '' : (document.getElementById("location").value.trim() || '');
    const registrationLink = document.getElementById("registrationLink").value.trim();

    if (!title || !startDate) { alert('Please fill required fields'); return; }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          title,
          startDate,
          registrationDeadline,
          location,
          description,
          type,
          customType,
          isOnline,
          registrationLink
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Event added successfully');
        window.location.href = '/profile.html';
      } else {
        alert(data.msg || JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
});
