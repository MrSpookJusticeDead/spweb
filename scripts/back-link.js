// scripts/back-link.js
// Dynamically sets "← Back to X" based on the referring page.
// Requires an <a id="back-link"> element on the page.

document.addEventListener('DOMContentLoaded', function () {
    const el = document.getElementById('back-link')
    if (!el) return

    const ref = document.referrer
    if (!ref) return

    try {
        const url = new URL(ref)

        // Only follow same-origin referrers
        if (url.origin !== location.origin) return

        // Normalize: strip .html and trailing slash
        let path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/'

        // Don't let login/signup override each other — they're siblings,
        // not a meaningful "back" destination
        const authPages = ['/login', '/signup']
        if (authPages.includes(path)) return

        const labels = {
            '/':        'Home',
            '/index':   'Home',
            '/charts':  'Charts',
            '/upload':  'Publish',
            '/login':   'Log In',
            '/signup':  'Sign Up',
            '/profile': 'Settings',
            '/user':    'Profile',
        }

        const name = labels[path]
        if (!name) return // unrecognized page — keep hardcoded default

        el.textContent = '← Back to ' + name
        el.href = ref
    } catch (e) {}
})