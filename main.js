// Supabase Konfiguration
const SUPABASE_URL = "https://ytcrvruzmqjehnoaffda.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Globale Logout-Funktion
window.logout = async function () {
  await supabase.auth.signOut();
  window.location.href = "index.html";
};

// Benutzeroberfläche aktualisieren
function updateUserInterface(user) {
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const userProfile = document.getElementById("user-profile");
  const userEmail = document.getElementById("user-email");

  if (user) {
    loginButton?.classList.add("hidden");
    registerButton?.classList.add("hidden");
    userProfile?.classList.remove("hidden");
    if (userEmail) userEmail.textContent = user.email;
  } else {
    loginButton?.classList.remove("hidden");
    registerButton?.classList.remove("hidden");
    userProfile?.classList.add("hidden");
    if (userEmail) userEmail.textContent = "";
  }
}

// Benachrichtigung anzeigen
function showNotification(message, type = "info") {
  document.querySelectorAll(".notification").forEach(n => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// DOM geladen
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // Login-Formular
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email")?.value;
      const password = document.getElementById("login-password")?.value;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        showNotification("Erfolgreich angemeldet!", "success");
        updateUserInterface(data.user);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Login Fehler:", error.message);
        showNotification(error.message, "error");
      }
    });
  }

  // Registrierungsformular
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("register-email")?.value;
      const password = document.getElementById("register-password")?.value;
      const confirm = document.getElementById("register-password-confirm")?.value;
      const userType = document.querySelector('input[name="user-type"]:checked')?.value;
      const accepted = document.getElementById("terms-checkbox")?.checked;

      if (password !== confirm) {
        showNotification("Die Passwörter stimmen nicht überein.", "error");
        return;
      }
      if (!accepted) {
        showNotification("Bitte akzeptiere die Nutzungsbedingungen.", "error");
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { user_type: userType },
          },
        });
        if (error) throw error;

        await supabase.from("profiles").insert([{
          id: data.user.id,
          email,
          user_type: userType,
          created_at: new Date(),
        }]);

        showNotification("Registrierung erfolgreich! Bitte E-Mail bestätigen.", "success");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Registrierung Fehler:", error.message);
        showNotification(error.message, "error");
      }
    });
  }

  // Hash (#register) aktivieren
  if (window.location.hash === "#register") {
    document.getElementById("login-tab")?.click();
  }

  // Auth Buttons in nav.html (wenn vorhanden)
  document.getElementById("login-button")?.addEventListener("click", () => {
    document.getElementById("login-modal")?.classList.remove("hidden");
  });

  document.getElementById("register-button")?.addEventListener("click", () => {
    document.getElementById("register-modal")?.classList.remove("hidden");
  });

  document.getElementById("show-register")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-modal")?.classList.add("hidden");
    document.getElementById("register-modal")?.classList.remove("hidden");
  });

  document.getElementById("show-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("register-modal")?.classList.add("hidden");
    document.getElementById("login-modal")?.classList.remove("hidden");
  });

  document.querySelectorAll(".close-modal")?.forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("login-modal")?.classList.add("hidden");
      document.getElementById("register-modal")?.classList.add("hidden");
    });
  });

  // Klick außerhalb Modals schließt es
  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("login-modal")) {
      document.getElementById("login-modal")?.classList.add("hidden");
    }
    if (e.target === document.getElementById("register-modal")) {
      document.getElementById("register-modal")?.classList.add("hidden");
    }
  });

  // Beim Laden prüfen, ob angemeldet
  supabase.auth.getUser().then(({ data: { user } }) => {
    updateUserInterface(user);
  });

  // Notification-Styling
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
