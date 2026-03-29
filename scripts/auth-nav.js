// scripts/auth-nav.js
// Handles auth-aware UI across all pages.
// Requires: supabase CDN + config.js loaded before this script.

(async () => {
    const { data: { user } } = await sb.auth.getUser()
    const page = location.pathname

    // ── Redirect logged-in users away from login / signup ────────────────────
    if (user && (page.endsWith('login.html') || page.endsWith('signup.html'))) {
        location.href = '/upload.html'
        return
    }

    // ── Fetch profile (username + avatar) ─────────────────────────────────────
    let username  = null
    let avatarUrl = null
    const DEFAULT_AVATAR = 'imgs/icon.png'

    if (user) {
        const { data: profile } = await sb
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .maybeSingle()

        username  = profile?.username  ?? null
        avatarUrl = profile?.avatar_url ?? null

        // First login after email confirmation: migrate username from metadata
        if (!username && user.user_metadata?.username) {
            const meta = user.user_metadata.username
            const { error: upsertErr } = await sb
                .from('profiles')
                .upsert({ id: user.id, username: meta }, { onConflict: 'id' })
            if (!upsertErr) username = meta
        }

         right.innerHTML = `
        <div class="header-user">
            <img
                class="header-avatar"
                src="${resolveAvatar(avatarUrl)}"
                alt="avatar"
                onerror="this.src='${DEFAULT_AVATAR}'">
            <a href="/profile.html" class="header-username">${escHtml(username ?? 'User')}</a>
            <a href="/profile.html" class="header-settings" aria-label="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.33-1.82c.21-.16.27-.46.13-.7l-2.2-3.82c-.13-.24-.42-.32-.66-.24l-2.75 1.11c-.57-.44-1.18-.81-1.86-1.08L14 2.42C13.95 2.16 13.72 2 13.45 2h-4.4c-.27 0-.5.16-.55.42l-.41 2.45c-.68.27-1.3.64-1.86 1.08L3.48 4.84c-.24-.09-.53 0-.66.24L.62 8.9c-.14.24-.08.54.13.7l2.33 1.82C3.03 11.76 3 12.11 3 12.5s.03.74.07 1.08L.74 15.4c-.21.16-.27.46-.13.7l2.2 3.82c.13.24.42.32.66.24l2.75-1.11c.57.44 1.18.81 1.86 1.08l.41 2.45c.05.26.28.42.55.42h4.4c.27 0 .5-.16.55-.42l.41-2.45c.68-.27 1.3-.64 1.86-1.08l2.75 1.11c.24.09.53 0 .66-.24l2.2-3.82c.14-.24.08-.54-.13-.7l-2.33-1.82z"/>
                </svg>
            </a>
            <a href="#" class="header-logout" id="header-logout-btn">Log Out</a>
        </div>
    `
    }

    function resolveAvatar(path) {
        if (!path) return DEFAULT_AVATAR
        if (path.startsWith('http')) return path
        const { data } = sb.storage.from('avatars').getPublicUrl(path)
        return data.publicUrl
    }

    // ── Inject header-right widget into every <header> ────────────────────────
    const header = document.querySelector('header')
    if (header) {
        const right = document.createElement('div')
        right.className = 'header-right'

        if (user) {
            right.innerHTML = `
                <div class="header-user">
                    <img
                        class="header-avatar"
                        src="${resolveAvatar(avatarUrl)}"
                        alt="avatar"
                        onerror="this.src='${DEFAULT_AVATAR}'">
                    <a href="/profile.html" class="header-username">${escHtml(username ?? 'User')}</a>
                    <a href="#" class="header-logout" id="header-logout-btn">Log Out</a>
                </div>
            `
        } else {
            right.innerHTML = `
                <div class="header-guest">
                    <a href="/login.html"  class="header-btn-login">Log In</a>
                    <a href="/signup.html" class="header-btn-register">Register</a>
                </div>
            `
        }

        // Insert as first child so float:right works correctly
        header.insertBefore(right, header.firstChild)

        document.getElementById('header-logout-btn')?.addEventListener('click', async (e) => {
            e.preventDefault()
            await sb.auth.signOut()
            location.reload()
        })
    }

    // ── Keep legacy nav-login / nav-user in sync (charts.html etc.) ───────────
    const navLogin   = document.getElementById('nav-login')
    const navUser    = document.getElementById('nav-user')
    const navUsername = document.getElementById('nav-username')

    if (user) {
        if (navLogin)   navLogin.style.display   = 'none'
        if (navUser)    navUser.style.display    = 'inline-flex'
        if (navUsername) navUsername.textContent = username ?? 'Signed in'

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

    // ── Hide cards when logged in ─────────────────────────────────────────────
    const about_card  = document.getElementById('card-aboutgame')
    if (about_card) about_card.style.display = 'none'

    const createCard = document.getElementById('card-create-account')
    if (createCard && user) createCard.style.display = 'none'

    const signupCard = document.getElementById('index-signup-card')
    if (signupCard && user) signupCard.style.display = 'none'

    document.querySelectorAll('a[href="/profile.html"]').forEach(link => {
        link.style.display = user ? '' : 'none'
    })

    // ── Expose globals ────────────────────────────────────────────────────────
    window._authUser     = user
    window._authUsername = username


    
    function escHtml(str) {
        return String(str ?? '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    }
})()