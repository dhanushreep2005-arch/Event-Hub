document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in first');
    window.location.href = '/auth/login.html';
    return;
  }

  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userCollege = document.getElementById('userCollege');
  const userYear = document.getElementById('userYear');

  const myEventsList = document.getElementById('myEventsList');
  const myWishlist = document.getElementById('myWishlist');

  const eventsSection = document.getElementById('eventsSection');
  const wishlistSection = document.getElementById('wishlistSection');

  const myEventsBtn = document.getElementById('myEventsBtn');
  const myWishlistBtn = document.getElementById('myWishlistBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  function formatDDMMYYYY(dateInput) {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d)) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // load profile data once
  let profileData;
  try {
    const res = await fetch('/api/users/me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    profileData = await res.json();
    if (!res.ok || !profileData.user) {
      alert(profileData.msg || 'Failed to load profile');
      return;
    }
  } catch (err) {
    console.error(err);
    alert('Error loading profile');
    return;
  }

  const { user } = profileData;

  userName.textContent = user.name;
  userEmail.textContent = 'Email: ' + user.email;
  userCollege.textContent = 'College: ' + (user.college || '');
  userYear.textContent = user.year ? `Year: ${user.year}` : '';

  // --- render my events ---
  async function fetchMyEvents() {
    // re-fetch profile to stay in sync after delete
    const res = await fetch('/api/users/me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    return data.myEvents || [];
  }

  async function showMyEvents() {
    wishlistSection.classList.add('hidden');
    eventsSection.classList.remove('hidden');

    myEventsList.innerHTML = '<p class="text-gray-500">Loading...</p>';

    const myEvents = await fetchMyEvents();
    myEventsList.innerHTML = '';

    if (!myEvents.length) {
      myEventsList.innerHTML =
        '<p class="text-gray-600">No events added yet.</p>';
      return;
    }

    myEvents.forEach(ev => {
      const card = document.createElement('div');
      card.className =
        'p-5 border border-gray-300 rounded-xl shadow-sm bg-white';

      card.innerHTML = `
        <h4 class="text-xl font-bold text-blue-600 mb-1">${ev.title}</h4>
        <p class="text-gray-700 mb-2">${ev.description || ''}</p>

        <p class="text-sm text-gray-600">📅 ${formatDDMMYYYY(ev.startDate)}</p>
        <p class="text-sm text-gray-600">📍 ${ev.location || (ev.isOnline ? 'Online' : '')}</p>
        <p class="text-sm text-gray-600">🎫 ${ev.customType || ev.type}</p>

        <a href="${ev.registrationLink}"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 underline text-sm block mb-3">
          Registration Link
        </a>

        <div class="flex justify-center mt-2">
          <button
            class="deleteEventBtn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            data-id="${ev._id}">
            Remove Event&#128465;
          </button>
        </div>
      `;

      myEventsList.appendChild(card);
    });

    // attach delete handlers
    document.querySelectorAll('.deleteEventBtn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Delete this event?')) return;

        try {
          const res = await fetch(`/api/events/${id}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
          });
          const data = await res.json();

          if (!res.ok) {
            alert(data.msg || 'Failed to delete');
            return;
          }

          // remove card from UI
          btn.closest('.p-5').remove();
          alert('Event deleted');

        } catch (err) {
          console.error(err);
          alert('Server error while deleting');
        }
      });
    });
  }

  myEventsBtn.addEventListener('click', showMyEvents);

  // --- wishlist ---
  myWishlistBtn.addEventListener('click', () => {
    eventsSection.classList.add('hidden');
    wishlistSection.classList.remove('hidden');

    myWishlist.innerHTML = '';

    if (!user.wishlist || !user.wishlist.length) {
      myWishlist.innerHTML =
        '<p class="text-gray-600">No events in wishlist.</p>';
      return;
    }

    user.wishlist.forEach(ev => {
      const div = document.createElement('div');
      div.className =
        'p-5 border border-gray-300 rounded-xl shadow-sm bg-white';

      div.innerHTML = `
        <h4 class="text-xl font-bold text-green-600 mb-1">${ev.title}</h4>
        <p class="text-gray-700 mb-2">${ev.description || ''}</p>
        <p class="text-sm text-gray-600">📅 ${formatDDMMYYYY(ev.startDate)}</p>
        <p class="text-sm text-gray-600">📍 ${ev.location || (ev.isOnline ? 'Online' : '')}</p>
      `;
      myWishlist.appendChild(div);
    });
  });

  // default: show nothing until button clicked

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login.html';
  });
});
