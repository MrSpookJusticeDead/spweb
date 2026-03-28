// scripts/auth-nav.js
// Handles auth-aware UI across all pages.
// Requires: supabase CDN + config.js loaded before this script.

(async () => {
    const { createClient } = supabase
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data: { user } } = await sb.auth.getUser()
    const page = location.pathname

    // ── Redirect logged-in users away from login / signup ────────────────────
    if (user && (page.endsWith('login.html') || page.endsWith('signup.html'))) {
        location.href = '/upload.html'
        return
    }

    // ── Nav: swap "Log In" link for "Signed in" indicator ────────────────────
    const navLogin = document.getElementById('nav-login')
    const navUser  = document.getElementById('nav-user')

    if (user) {
        if (navLogin) navLogin.style.display = 'none'
        if (navUser)  navUser.style.display  = 'inline-flex'

        const logoutBtn = document.getElementById('nav-logout')
        if (logoutBtn) {
            logoutBtn.onclick = async (e) => {
                e.preventDefault()
                await sb.auth.signOut()
                location.reload()
            }
        }
    } else {
        if (navLogin) navLogin.style.display = ''
        if (navUser)  navUser.style.display  = 'none'
    }

    // ── Hide "Create Account" card when already logged in ────────────────────
    const createCard = document.getElementById('card-create-account')
    if (createCard && user) createCard.style.display = 'none'

    // ── Hide "Sign up" section on index when logged in ───────────────────────
    const signupCard = document.getElementById('index-signup-card')
    if (signupCard && user) signupCard.style.display = 'none'

})()