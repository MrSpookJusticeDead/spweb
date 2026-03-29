// scripts/back-link.js
// Dynamically sets "← Back to X" based on the referring page.
// Requires an <a id="back-link"> element on the page.

(function () {
    const el = document.getElementById('back-link')
    if (!el) return

    const ref = document.referrer
    if (!ref) return // no referrer — keep the hardcoded default

    try {
        const url = new URL(ref)

        // Only follow same-origin referrers
        if (url.origin !== location.origin) return

        const labels = {
            '/':            'Home',
            '/index.html':  'Home',
            '/charts.html': 'Charts',
            '/upload.html': 'Publish',
            '/login.html':  'Log In',
            '/signup.html': 'Sign Up',
            '/profile.html':'Settings',
            '/user.html':   'Profile',
        }

        const name = labels[url.pathname] ?? 'Back'
        el.textContent = '← Back to ' + name
        el.href = ref  // preserve full URL including any ?query params
    } catch (e) {}
})()