// Supabase-Client initialisieren
const supabase = window.supabase.createClient(
"https://ytcrvruzmqjehnoaffda.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"

);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;

  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");
  const userProfile = document.getElementById("user-profile");
  const userEmailSpan = document.getElementById("user-email");
  const avatarImage = document.getElementById("avatar-image");

  if (user) {
    // Login-/Registrierbuttons ausblenden
    if (loginButton) loginButton.style.display = "none";
    if (registerButton) registerButton.style.display = "none";

    // Profil-Bereich einblenden
    if (userProfile) userProfile.classList.remove("hidden");

    // E-Mail anzeigen
    if (userEmailSpan) userEmailSpan.textContent = user.email;

    // Profilbild laden
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profile?.avatar_url && avatarImage) {
      avatarImage.src = profile.avatar_url;
    }
  }

  // Logout
  document.getElementById("logout-button")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });
});
