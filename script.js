// Supabase Konfiguration
const SUPABASE_URL = "https://ytcrvruzmqjehnoaffda.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// DOM-Elemente
const loginButton = document.getElementById("login-button")
const registerButton = document.getElementById("register-button")
const logoutButton = document.getElementById("logout-button")
const userProfile = document.getElementById("user-profile")
const userEmail = document.getElementById("user-email")
const loginModal = document.getElementById("login-modal")
const registerModal = document.getElementById("register-modal")
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const showRegisterLink = document.getElementById("show-register")
const showLoginLink = document.getElementById("show-login")
const closeModalButtons = document.querySelectorAll(".close-modal")

// Event Listeners für Modals
loginButton.addEventListener("click", () => {
  loginModal.classList.remove("hidden")
})

registerButton.addEventListener("click", () => {
  registerModal.classList.remove("hidden")
})

showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault()
  loginModal.classList.add("hidden")
  registerModal.classList.remove("hidden")
})

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault()
  registerModal.classList.add("hidden")
  loginModal.classList.remove("hidden")
})

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    loginModal.classList.add("hidden")
    registerModal.classList.add("hidden")
  })
})

// Klick außerhalb des Modals schließt es
window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.classList.add("hidden")
  }
  if (e.target === registerModal) {
    registerModal.classList.add("hidden")
  }
})

// Login-Formular
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Login erfolgreich
    loginModal.classList.add("hidden")
    updateUserInterface(data.user)
    showNotification("Erfolgreich angemeldet!", "success")
  } catch (error) {
    console.error("Fehler beim Anmelden:", error.message)
    showNotification(error.message, "error")
  }
})

// Registrierungs-Formular
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const passwordConfirm = document.getElementById("register-password-confirm").value
  const userType = document.querySelector('input[name="user-type"]:checked').value
  const termsAccepted = document.getElementById("terms-checkbox").checked

  // Validierung
  if (password !== passwordConfirm) {
    showNotification("Die Passwörter stimmen nicht überein.", "error")
    return
  }

  if (!termsAccepted) {
    showNotification("Bitte akzeptiere die Nutzungsbedingungen.", "error")
    return
  }

  try {
    // Benutzer registrieren
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
        },
      },
    })

    if (error) throw error

    // Registrierung erfolgreich
    registerModal.classList.add("hidden")

    // Benutzer in profiles Tabelle speichern
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email: email,
        user_type: userType,
        created_at: new Date(),
      },
    ])

    if (profileError) throw profileError

    updateUserInterface(data.user)
    showNotification("Registrierung erfolgreich! Bitte überprüfe deine E-Mails für die Bestätigung.", "success")
  } catch (error) {
    console.error("Fehler bei der Registrierung:", error.message)
    showNotification(error.message, "error")
  }
})

// Abmelden
logoutButton.addEventListener("click", async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Abmeldung erfolgreich
    updateUserInterface(null)
    showNotification("Erfolgreich abgemeldet!", "success")
  } catch (error) {
    console.error("Fehler beim Abmelden:", error.message)
    showNotification(error.message, "error")
  }
})

// Benutzeroberfläche aktualisieren
function updateUserInterface(user) {
  if (user) {
    loginButton.classList.add("hidden")
    registerButton.classList.add("hidden")
    userProfile.classList.remove("hidden")
    userEmail.textContent = user.email
  } else {
    loginButton.classList.remove("hidden")
    registerButton.classList.remove("hidden")
    userProfile.classList.add("hidden")
    userEmail.textContent = ""
  }
}

// Benachrichtigung anzeigen
function showNotification(message, type = "info") {
  // Bestehende Benachrichtigungen entfernen
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => {
    notification.remove()
  })

  // Neue Benachrichtigung erstellen
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  // Nach 5 Sekunden ausblenden
  setTimeout(() => {
    notification.classList.add("fade-out")
    setTimeout(() => {
      notification.remove()
    }, 500)
  }, 5000)
}

// Beim Laden der Seite prüfen, ob der Benutzer angemeldet ist
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error

    updateUserInterface(user)
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzers:", error.message)
  }

  // CSS für Benachrichtigungen hinzufügen
  const style = document.createElement("style")
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
    
    .notification.info {
      background-color: #3b82f6;
    }
    
    .notification.success {
      background-color: #10b981;
    }
    
    .notification.error {
      background-color: #ef4444;
    }
    
    .notification.fade-out {
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
})

// Supabase Auth Status Änderungen überwachen
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session) {
    updateUserInterface(session.user)
  } else if (event === "SIGNED_OUT") {
    updateUserInterface(null)
  }
})
