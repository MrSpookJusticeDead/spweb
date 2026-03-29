// scripts/auth-nav.js
// Handles auth-aware UI across all pages.
// Requires: supabase CDN + config.js loaded before this script.

(async () => {
    // const { createClient } = supabase
   //  const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data: { user } } = await sb.auth.getUser()
    const page = location.pathname

    // ── Redirect logged-in users away from login / signup ────────────────────
    if (user && (page.endsWith('login.html') || page.endsWith('signup.html'))) {
        location.href = '/upload.html'
        return
    }

    // ── Fetch username from profiles table ───────────────────────────────────
    let username = null
    if (user) {
        const { data: profile } = await sb
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle()

        username = profile?.username ?? null

        // First login after email confirmation: migrate username from metadata
        if (!username && user.user_metadata?.username) {
            const meta_username = user.user_metadata.username
            const { error: upsertErr } = await sb
                .from('profiles')
                .upsert({ id: user.id, username: meta_username }, { onConflict: 'id' })
            if (!upsertErr) username = meta_username
        }
    }

    // ── Nav: swap "Log In" link for username indicator ────────────────────────
    const navLogin = document.getElementById('nav-login')
    const navUser = document.getElementById('nav-user')
    const navUsername = document.getElementById('nav-username')

    if (user) {
        if (navLogin) navLogin.style.display = 'none'
        if (navUser) navUser.style.display = 'inline-flex'
        if (navUsername) navUsername.textContent = username ?? 'Signed in'

        const logoutBtn = document.getElementById('nav-logout')
        if (logoutBtn) {
            logoutBtn.onclick = async (e) => {
                e.preventDefault()
                await sb.auth.signOut()
                location.reload()
            }
        }

        if (navUsername) {
            navUsername.textContent = username ?? 'Signed in'
            // Make it clickable to go to profile
            navUsername.parentElement?.addEventListener('click', () => {
                location.href = '/profile.html'
            })
        }

    } else {
        if (navLogin) navLogin.style.display = ''
        if (navUser) navUser.style.display = 'none'
    }

    const about_card = document.getElementById('card-aboutgame')
    if (about_card) about_card.style.display = "none"


    // ── Hide "Create Account" card when already logged in ────────────────────
    const createCard = document.getElementById('card-create-account')
    if (createCard && user) createCard.style.display = 'none'

    // ── Hide "Sign up" section on index when logged in ───────────────────────
    const signupCard = document.getElementById('index-signup-card')
    if (signupCard && user) signupCard.style.display = 'none'

    // ── Expose username globally so upload.html can use it ───────────────────
    window._authUser = user
    window._authUsername = username

})()