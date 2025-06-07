// Supabase initialisieren
const supabase = window.supabase.createClient(
"https://ytcrvruzmqjehnoaffda.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"

);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;

  const userProfile = document.getElementById("user-profile");
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const userEmailSpan = document.getElementById("user-email");

  if (user) {
    if (userProfile) userProfile.classList.remove("hidden");
    if (loginButton) loginButton.style.display = "none";
    if (registerButton) registerButton.style.display = "none";
    if (userEmailSpan) userEmailSpan.textContent = user.email;
  }

  // Logout-Button
  const logoutButton = document.getElementById("logout-button");
  logoutButton?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });

  // Falls wir auf profil.html sind → Zugang nur mit Login
  if (window.location.pathname.includes("profil.html")) {
    if (!user) {
      window.location.href = "anmelden.html";
      return;
    }

    // Profil-Daten abrufen & anzeigen
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      document.getElementById("first-name").value = profile.first_name || "";
      document.getElementById("last-name").value = profile.last_name || "";
      document.getElementById("bio").value = profile.bio || "";
      if (profile.avatar_url) {
        document.getElementById("avatar-preview").src = profile.avatar_url;
      }
    }

    // Avatar hochladen
    document.getElementById("avatar-upload")?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const filePath = `avatars/${user.id}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        document.getElementById("avatar-preview").src = data.publicUrl;
      }
    });

    // Formular speichern
    document.getElementById("profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const updateData = {
        first_name: document.getElementById("first-name").value,
        last_name: document.getElementById("last-name").value,
        bio: document.getElementById("bio").value,
        avatar_url: document.getElementById("avatar-preview").src,
      };

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", user.id);

      document.getElementById("status").textContent = error
        ? "❌ Fehler beim Speichern"
        : "✅ Profil gespeichert – Zurück zur Startseite ...";

      if (!error) {
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
    });
  }
});
