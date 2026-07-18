function setCookie(name, value, days = 7) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const genericTab = document.getElementById('tab-generic');
    const generateBtn = document.getElementById('generate-key-btn');
    const keyDisplay = document.getElementById('key-display');
    const themeDropdown = document.getElementById('theme-dropdown');

    // 1. COOKIE KEY VALIDATION LOGIC
    const savedKey = getCookie("LUMA_KEY");
    if (savedKey && savedKey.startsWith("LUMA-") && savedKey.length === 37) {
        keyDisplay.textContent = savedKey;
    } else {
        keyDisplay.textContent = ""; 
    }

    if (generateBtn && keyDisplay) {
        generateBtn.addEventListener('click', () => {
            const hexChars = '0123456789ABCDEF';
            let mockToken = 'LUMA-';
            for (let i = 0; i < 32; i++) {
                mockToken += hexChars[Math.floor(Math.random() * 16)];
            }
            keyDisplay.textContent = mockToken;
            setCookie("LUMA_KEY", mockToken, 30);
        });
    }

    // 2. THEME SELECTION & INITIALIZATION LOGIC
    const savedTheme = getCookie("LUMA_THEME");
    if (savedTheme) {
        document.body.className = savedTheme;
        if (themeDropdown) {
            themeDropdown.value = savedTheme;
        }
    } else {
        document.body.className = "theme-rise"; 
    }

    if (themeDropdown) {
        themeDropdown.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            document.body.className = selectedTheme;
            setCookie("LUMA_THEME", selectedTheme, 30);
        });
    }

    // 3. NAVIGATION MANAGEMENT
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            item.classList.add('active');
            const tabTarget = item.getAttribute('data-tab');
            const targetElement = document.getElementById(`tab-${tabTarget}`);

            if (targetElement) {
                targetElement.classList.add('active');
            } else {
                genericTab.classList.add('active');
                genericTab.querySelector('.main-title').textContent = item.textContent.trim();
            }
        });
    });
});