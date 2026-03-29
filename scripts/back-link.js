// scripts/back-link.js
// Dynamically sets "← Back to X" based on the referring page.
// Requires an <a id="back-link"> element on the page.

document.addEventListener('DOMContentLoaded', function () {
    const el = document.getElementById('back-link')
    if (!el) return

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

    const authPages = ['/login', '/signup']

    function normalize(pathname) {
        return pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/'
    }

    const currentPath = normalize(location.pathname)
    const isAuthPage = authPages.includes(currentPath)

    try {
        const ref = document.referrer
        if (ref) {
            const refUrl = new URL(ref)
            if (refUrl.origin === location.origin) {
                const refPath = normalize(refUrl.pathname)

                if (isAuthPage && !authPages.includes(refPath)) {
                    // Coming from a real page into the auth flow — save it
                    sessionStorage.setItem('auth_back_ref', ref)
                }
            }
        }

        // Resolve the back destination
        let backRef = null
        if (isAuthPage) {
            // Always use the saved origin, not the immediate referrer
            backRef = sessionStorage.getItem('auth_back_ref') || null
        } else {
            // Non-auth page — use referrer directly if not another auth page
            if (ref) {
                const refUrl = new URL(ref)
                if (refUrl.origin === location.origin) {
                    const refPath = normalize(refUrl.pathname)
                    if (!authPages.includes(refPath)) backRef = ref
                }
            }
            // Clear saved auth origin when leaving auth flow
            sessionStorage.removeItem('auth_back_ref')
        }

        if (!backRef) return

        const backUrl = new URL(backRef)
        const backPath = normalize(backUrl.pathname)
        const name = labels[backPath]
        if (!name) return

        el.textContent = '← Back to ' + name
        el.href = backRef
    } catch (e) {}
})