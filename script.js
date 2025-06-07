// Supabase Konfiguration
const SUPABASE_URL = "https://ytcrvruzmqjehnoaffda.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM-Elemente
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const logoutButton = document.getElementById("logout-button");
const userProfile = document.getElementById("user-profile");
const userEmail = document.getElementById("user-email");
const avatarImage = document.getElementById("avatar-image");

// Benutzeroberfläche aktualisieren
async function updateUserInterface(user) {
  if (user) {
    loginButton?.classList.add("hidden");
    registerButton?.classList.add("hidden");
    userProfile?.classList.remove("hidden");
    if (userEmail) userEmail.textContent = user.email;

    // Avatar laden, falls vorhanden
    if (avatarImage) {
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        avatarImage.src = profile?.avatar_url || "default-avatar.png";
      } catch (err) {
        console.warn("Avatar konnte nicht geladen werden:", err.message);
        avatarImage.src = "default-avatar.png";
      }
    }
  } else {
    loginButton?.classList.remove("hidden");
    registerButton?.classList.remove("hidden");
    userProfile?.classList.add("hidden");
    if (userEmail) userEmail.textContent = "";
    if (avatarImage) avatarImage.src = "default-avatar.png";
  }
}

// Benachrichtigung anzeigen
function showNotification(message, type = "info") {
  document.querySelectorAll(".notification").forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// CSS für Benachrichtigungen hinzufügen
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;

    updateUserInterface(user);
  } catch (error) {
    console.warn("Kein Benutzer angemeldet oder Fehler:", error.message);
  }

  const style = document.createElement("style");
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }
    .notification.info { background-color: #3b82f6; }
    .notification.success { background-color: #10b981; }
    .notification.error { background-color: #ef4444; }
    .notification.fade-out { opacity: 0; transition: opacity 0.5s ease; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
});

// Logout
logoutButton?.addEventListener("click", async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    updateUserInterface(null);
    showNotification("Erfolgreich abgemeldet!", "success");
  } catch (error) {
    showNotification(error.message, "error");
  }
});

// Auth-Status überwachen
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session) {
    updateUserInterface(session.user);
  } else if (event === "SIGNED_OUT") {
    updateUserInterface(null);
  }
});
