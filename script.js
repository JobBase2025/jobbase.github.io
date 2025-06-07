const supabase = window.supabase.createClient(
"https://ytcrvruzmqjehnoaffda.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3J2cnV6bXFqZWhub2FmZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDc4NDUsImV4cCI6MjA2MDM4Mzg0NX0.gndc10XvC_Imyl3mPXb8EyXHKZiLAa3FHSn5J39qUB0"

);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  // Nutzeranzeige in index.html
  if (user) {
    const userNav = document.getElementById("user-nav");
    const userEmail = document.getElementById("user-email");
    const loginLink = document.getElementById("login-link");

    if (userNav) userNav.classList.remove("hidden");
    if (userEmail) userEmail.textContent = user.email;
    if (loginLink) loginLink.classList.add("hidden");
  }

  // Wenn wir auf profil.html sind, dann Profil laden
  if (document.getElementById("profile-form")) {
    if (!user) {
      window.location.href = "anmelden.html";
      return;
    }

    let avatarUrl = "default-avatar.png";
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
        avatarUrl = profile.avatar_url;
        document.getElementById("avatar-preview").src = avatarUrl;
      }
    }

    document.getElementById("avatar-upload")?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const filePath = `avatars/${user.id}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
        document.getElementById("avatar-preview").src = avatarUrl;
      }
    });

    document.getElementById("profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const updateData = {
        first_name: document.getElementById("first-name").value,
        last_name: document.getElementById("last-name").value,
        bio: document.getElementById("bio").value,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", user.id);

      document.getElementById("status").textContent = error
        ? "❌ Fehler beim Speichern"
        : "✅ Profil aktualisiert";
    });
  }

  // Logout-Funktion
  document.getElementById("logout-button")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });
});
