// Supabase-Konfiguration
const SUPABASE_URL = "https://ytcrvruzmqjehnoaffda.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM-Elemente
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const logoutButton = document.getElementById("logout-button");
const userProfile = document.getElementById("user-profile");
const userEmail = document.getElementById("user-email");

const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");
const closeModalButtons = document.querySelectorAll(".close-modal");

// Modals öffnen/schließen
loginButton?.addEventListener("click", () => loginModal.classList.remove("hidden"));
registerButton?.addEventListener("click", () => registerModal.classList.remove("hidden"));

showRegisterLink?.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.classList.add("hidden");
  registerModal.classList.remove("hidden");
});

showLoginLink?.addEventListener("click", (e) => {
  e.preventDefault();
  registerModal.classList.add("hidden");
  loginModal.classList.remove("hidden");
});

closeModalButtons?.forEach((btn) =>
  btn.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    registerModal.classList.add("hidden");
  })
);

// Klick außerhalb schließt Modal
window.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.add("hidden");
  if (e.target === registerModal) registerModal.classList.add("hidden");
});

// Login
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showNotification(error.message, "error");

  loginModal.classList.add("hidden");
  updateUserInterface(data.user);
  showNotification("Erfolgreich angemeldet!", "success");
});

// Registrierung
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-password-confirm").value;
  const userType = document.querySelector('input[name="user-type"]:checked')?.value;
  const termsAccepted = document.getElementById("terms-checkbox").checked;

  if (password !== confirm) return showNotification("Passwörter stimmen nicht überein.", "error");
  if (!termsAccepted) return showNotification("AGB müssen akzeptiert werden.", "error");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { user_type: userType },
    },
  });

  if (error) return showNotification(error.message, "error");

  // Beispiel-Profileintrag
  const profile = {
    id: data.user.id,
    email,
    user_type: userType,
    created_at: new Date(),
  };

  await supabase.from("user_profiles").insert([profile]);

  registerModal.classList.add("hidden");
  updateUserInterface(data.user);
  showNotification("Registrierung erfolgreich! Bestätige deine E-Mail.", "success");
});

// Logout
logoutButton?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return showNotification(error.message, "error");

  updateUserInterface(null);
  showNotification("Erfolgreich abgemeldet.", "success");
});

// Oberfläche je nach Loginstatus
function updateUserInterface(user) {
  if (user) {
    loginButton?.classList.add("hidden");
    registerButton?.classList.add("hidden");
    userProfile?.classList.remove("hidden");
    userEmail.textContent = user.email;
  } else {
    loginButton?.classList.remove("hidden");
    registerButton?.classList.remove("hidden");
    userProfile?.classList.add("hidden");
    userEmail.textContent = "";
  }
}

// Benachrichtigungen
function showNotification(message, type = "info") {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// Beim Laden prüfen ob eingeloggt
document.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) updateUserInterface(data.user);
});
