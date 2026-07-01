async function signup(payload) {
  const res = await fetch('/api/auth/signup', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  return res.json();
}
async function login(payload) {
  const res = await fetch('/api/auth/login', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loginBtn');
  const modal = document.getElementById('authModal');
  const forms = document.getElementById('authForms');
  const close = document.getElementById('closeAuth');
  if (btn) btn.addEventListener('click', () => {
    modal.classList.remove('hidden'); modal.style.display = 'flex';
    forms.innerHTML = `
      <div>
        <h4 class="font-bold">Login</h4>
        <input id="liEmail" placeholder="Email" class="border p-2 w-full mb-2"/>
        <input id="liPass" placeholder="Password" type="password" class="border p-2 w-full mb-2"/>
        <button id="doLogin" class="bg-blue-600 text-white px-3 py-1 rounded">Login</button>
      </div>
      <hr class="my-2"/>
      <div>
        <h4 class="font-bold">Signup</h4>
        <input id="suName" placeholder="Name" class="border p-2 w-full mb-2"/>
        <input id="suEmail" placeholder="Email" class="border p-2 w-full mb-2"/>
        <input id="suPass" placeholder="Password" type="password" class="border p-2 w-full mb-2"/>
        <input id="suCollege" placeholder="College" class="border p-2 w-full mb-2"/>
        <input id="suYear" placeholder="Year" class="border p-2 w-full mb-2"/>
        <button id="doSignup" class="bg-green-600 text-white px-3 py-1 rounded">Signup</button>
      </div>`;
    document.getElementById('doSignup').addEventListener('click', async () => {
      const payload = { name: document.getElementById('suName').value, email: document.getElementById('suEmail').value, password: document.getElementById('suPass').value, college: document.getElementById('suCollege').value, year: document.getElementById('suYear').value };
      const res = await signup(payload);
      if (res.token) { localStorage.setItem('token', res.token); alert('Signed up'); modal.classList.add('hidden'); location.reload(); }
      else alert(res.msg || JSON.stringify(res));
    });
    document.getElementById('doLogin').addEventListener('click', async () => {
      const payload = { email: document.getElementById('liEmail').value, password: document.getElementById('liPass').value };
      const res = await login(payload);
      if (res.token) { localStorage.setItem('token', res.token); alert('Logged in'); modal.classList.add('hidden'); location.reload(); }
      else alert(res.msg || JSON.stringify(res));
    });
  });
  if (close) close.addEventListener('click', () => { modal.classList.add('hidden'); modal.style.display='none'; });
});
