// Supabase-Verbindung
const supabase = supabase.createClient(
 const SUPABASE_URL = "https://ytcrvruzmqjehnoaffda.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"

);

// Tabs auf Login-/Register-Seite
document.getElementById('login-tab')?.addEventListener('click', () => {
  document.getElementById('login-form')?.classList.remove('hidden');
  document.getElementById('register-form')?.classList.add('hidden');
});
document.getElementById('register-tab')?.addEventListener('click', () => {
  document.getElementById('login-form')?.classList.add('hidden');
  document.getElementById('register-form')?.classList.remove('hidden');
});

// LOGIN
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email")?.value.trim();
  const password = document.getElementById("login-password")?.value;

  if (!email || !password) return alert("E-Mail und Passwort erforderlich.");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("✅ Eingeloggt");
    window.location.href = "profil.html";
  }
});

// REGISTRIERUNG
document.getElementById("register-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("register-email")?.value.trim();
  const password = document.getElementById("register-password")?.value;
  const confirm = document.getElementById("register-password-confirm")?.value;
  const userType = document.querySelector('input[name="user-type"]:checked')?.value;
  const terms = document.getElementById("terms-checkbox")?.checked;

  if (password !== confirm) return alert("❌ Passwörter stimmen nicht überein.");
  if (!terms) return alert("❌ Bitte AGB akzeptieren.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { user_type: userType } }
  });

  if (error) {
    alert("❌ " + error.message);
  } else {
    // Nur erlaubte Felder in user_profiles einfügen
    await supabase.from("user_profiles").insert([{
      id: data.user.id,
      created_at: new Date()
    }]);

    alert("✅ Registriert! Bitte E-Mail bestätigen.");
    window.location.href = "profil.html";
  }
});

// LOGOUT
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  alert("✅ Abgemeldet");
  window.location.href = "anmelden.html";
});

// USER-INFO ANZEIGEN (Header o. Ä.)
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getUser();
  const emailDisplay = document.getElementById("user-email");

  if (data?.user && emailDisplay) {
    emailDisplay.textContent = data.user.email;
    document.getElementById("user-profile")?.classList.remove("hidden");
    document.getElementById("login-button")?.classList.add("hidden");
    document.getElementById("register-button")?.classList.add("hidden");
  }
});
