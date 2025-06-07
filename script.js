// Supabase Konfiguration
const SUPABASE_URL = "https://ytcrvruzmqjehnoaffda.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Globale Logout-Funktion (auch für nav.html)
window.logout = async function () {
  await supabase.auth.signOut();
  window.location.href = "index.html";
};

// UI aktualisieren je nach Loginstatus
function updateUserInterface(user) {
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const userProfile = document.getElementById("user-profile");
  const userEmail = document.getElementById("user-email");

  if (!loginButton || !registerButton || !userProfile || !userEmail) return;

  if (user) {
    loginButton.classList.add("hidden");
    registerButton.classList.add("hidden");
    userProfile.classList.remove("hidden");
    userEmail.textContent = user.email;
  } else {
    loginButton.classList.remove("hidden");
    registerButton.classList.remove("hidden");
    userProfile.classList.add("hidden");
    userEmail.textContent = "";
  }
}

// Benachrichtigung anzeigen
function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 5000);
}

// Login-Formular
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

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

  // Registrierungs-Formular
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const passwordConfirm = document.getElementById("register-password-confirm").value;
      const userType = document.querySelector('input[name="user-type"]:checked')?.value;
      const termsAccepted = document.getElementById("terms-checkbox")?.checked;

      if (password !== passwordConfirm) {
        showNotification("Die Passwörter stimmen nicht überein.", "error");
        return;
      }

      if (!termsAccepted) {
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

        // Optionale Speicherung in einer "profiles"-Tabelle
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email,
            user_type: userType,
            created_at: new Date(),
          },
        ]);

        showNotification("Registrierung erfolgreich! Bitte E-Mail bestätigen.", "success");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Registrierung Fehler:", error.message);
        showNotification(error.message, "error");
      }
    });
  }

  // Direkt „Registrieren“-Tab aktivieren, wenn #register in URL
  if (window.location.hash === "#register") {
    document.getElementById("login-form")?.classList.add("hidden");
    document.getElementById("register-form")?.classList.remove("hidden");
  }

  // Benutzerstatus beim Laden prüfen
  supabase.auth.getUser().then(({ data: { user } }) => {
    updateUserInterface(user);
  });

  // Benachrichtigungs-Styles einfügen
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
