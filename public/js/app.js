document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const profileLink = document.getElementById('profileLink');
  if (token && profileLink) profileLink.classList.remove('hidden');

  // If on profile page, load user info
  if (location.pathname.endsWith('profile.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login first'); location.href = '/index.html'; return;
    }
    const res = await fetch('/api/users/me', { headers: { 'Authorization': 'Bearer '+token }});
    if (res.ok) {
      const user = await res.json();
      const info = document.getElementById('profileInfo');
      info.innerHTML = `<div class="flex items-center gap-4"><div class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">👤</div><div><div class="font-bold">${user.name}</div><div class="text-sm text-gray-600">${user.college || ''} • Year ${user.year || ''}</div></div></div>`;
      // load my events & wishlist
      loadMyEvents();
      loadWishlist();
    } else {
      alert('Session expired'); localStorage.removeItem('token'); location.href = '/index.html';
    }
  }
});

async function loadMyEvents() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/events?type=', { headers: { 'Authorization': 'Bearer '+token }});
  const events = await res.json();
  const container = document.getElementById('myEvents');
  if (!container) return;
  container.innerHTML = events.filter(e => e.postedBy && e.postedBy === JSON.parse(atob(token.split('.')[1])).user.id).map(ev => {
    return `<div class="bg-white p-3 rounded mb-2">${ev.title} • ${new Date(ev.startDate).toLocaleString()} <div class="mt-2"><button data-id="${ev._id}" class="markFixed bg-gray-100 px-2 py-1 rounded">Mark Fixed</button></div></div>`;
  }).join('') || '<div>No events yet</div>';
}

async function loadWishlist() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/bookmarks', { headers: { 'Authorization': 'Bearer '+token }});
  const wishlist = await res.json();
  const container = document.getElementById('myWishlist');
  if (!container) return;
  container.innerHTML = wishlist.map(ev => `<div class="bg-white p-3 rounded mb-2">${ev.title} • ${ev.location || (ev.isOnline? 'Online':'')}</div>`).join('') || '<div>No wishlist items</div>';
}

document.addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('markFixed')) {
    const id = e.target.dataset.id;
    const token = localStorage.getItem('token');
    const reportRes = await fetch('/api/reports/for-owner', { headers: { 'Authorization': 'Bearer '+token }});
    if (!reportRes.ok) return alert('Error');
    alert('Marked as fixed locally. Use report endpoints to resolve reports.');
  }
});
