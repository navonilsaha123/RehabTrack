
/* ─── STATE ─── */
let currentRole = 'patient';
let sessionTimerInterval = null;

/*
   ROLE SELECTION (Login Page)
 */
function selectRole(el, role) {
  // Deselect all role options
  document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
  // Select clicked option
  el.classList.add('selected');
  currentRole = role;
  // Update email placeholder based on role
  const emailInput = document.getElementById('login-email');
 
}

/*
   LOGIN HANDLER
*/
async function handleLogin(e) {
  e.preventDefault();

  const btn = document.getElementById('login-btn');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  btn.textContent = "Signing in...";
  btn.disabled = true;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // ✅ Save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    document.getElementById('username').innerHTML = "Hii "+data.user.name+" 👋"
    document.getElementById('husername').innerHTML = data.user.name
    document.getElementById('susername').innerHTML = data.user.name


    
    showToast("Login successful!", "success");

    // 🔥 Redirect based on role
    if (data.user.role === "doctor") {
      showPage("page-clinician");
    } else {
      showPage("page-patient");
    }
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.textContent = "Sign In →";
    btn.disabled = false;
  }
}

/*
   HOSPITAL SSO LOGIN
 */
function ssoLogin() {
  showToast('Redirecting to Hospital SSO portal…', 'info');
  setTimeout(() => {
    showPage('page-clinician');
    showToast('✓ Signed in via Hospital SSO as Dr. Sarah Chen', 'success');
  }, 1600);
}

/* 
   LOGOUT
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showToast("Logged out successfully", "info");
  showPage("page-login");
}

/* 
   PAGE NAVIGATION
 */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goToVerify() {
  showPage('page-verify');
  showToast("Loading John Doe's keyframe session…", 'info');
}

function goToClinicianDash() {
  showPage('page-clinician');
}

/*
   SESSION START MODAL
 */
async function startSession() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    showToast("Please login again", "error");
    showPage("page-login");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/session/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        doctorId: user.assignedDoctor || "PUT_DOCTOR_ID_HERE"
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    closeModal('session-modal');
    showToast("Session started successfully!", "success");
    startSessionTimer();

  } catch (err) {
    showToast(err.message, "error");
  }
}

function startSessionTimer() {
  // Clear any existing timer
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);

  let secs = 582; // Start at 9 min 42 sec (where the demo is)
  const timerEl = document.getElementById('timer');

  sessionTimerInterval = setInterval(() => {
    secs++;
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

/* 
   KEYFRAME VERIFICATION ACTIONS
*/
async function approveSession() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5000/api/session/approve/SESSION_ID", {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    closeModal('approve-modal');
    showToast("Session approved!", "success");

  } catch (err) {
    showToast(err.message, "error");
  }
}

function rejectSession() {
  closeModal('reject-modal');
  showToast('Session rejected — patient notified to redo their session.', 'error');
  setTimeout(() => showPage('page-clinician'), 1200);
}

/*
   MODAL HELPERS
*/
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    if (user.role === "doctor") {
      showPage("page-clinician");
    } else {
      showPage("page-patient");
    }
  }
});

/* Close modal when clicking the dark overlay */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });

  /* Close modal on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => {
        m.classList.add('hidden');
      });
    }
  });

  /* ─── FILTER TABS (interactive) ─── */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      const group = this.closest('.filter-tabs');
      if (group) {
        group.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  /* ─── TOP NAV TABS (interactive) ─── */
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      // Skip "Back" buttons
      if (this.textContent.includes('Back')) return;
      const group = this.closest('.nav-tabs');
      if (group) {
        group.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  /* ─── SIDEBAR NAV ITEMS (interactive) ─── */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      const sidebar = this.closest('.sidebar');
      if (!sidebar) return;
      sidebar.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* ─── VERIFY SIDEBAR ITEMS (interactive) ─── */
  document.querySelectorAll('.vs-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.vs-item').forEach(v => v.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* ─── SEND MESSAGE (patient dashboard) ─── */
  const msgInput = document.getElementById('msg-input');
  const msgSendBtn = document.getElementById('msg-send');
  if (msgSendBtn && msgInput) {
    msgSendBtn.addEventListener('click', () => {
      const text = msgInput.value.trim();
      if (!text) return;
      showToast('Message sent to Dr. Chen ✓', 'success');
      msgInput.value = '';
    });
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        msgSendBtn.click();
      }
    });
  }
});

/* 
   TOAST NOTIFICATION SYSTEM
= */
/**
 * Shows a toast notification.
 * @param {string} msg  - The message to display
 * @param {string} type - 'success' | 'error' | 'info'
 */
function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  wrap.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => toast.remove(), 320);
  }, 2800);
}
