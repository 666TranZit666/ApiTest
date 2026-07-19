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

// Global API Delivery Function utilizing user-specific key identification
async function sendToRoblox(luaString) {
    const apiUrl = 'https://robloxapi.6dds26hhmm.workers.dev';
    const keyDisplay = document.getElementById('key-display');
    const userKey = keyDisplay ? keyDisplay.textContent.trim() : "";

    if (!userKey || userKey === "") {
        console.error('Authentication Error: No Profile Key generated to authenticate payload.');
        alert('Please generate a Profile Key on the Home tab before modifying settings.');
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                key: userKey,
                code: luaString 
            })
        });
        if (!response.ok) {
            console.error('API Error Response:', response.statusText);
        }
    } catch (error) {
        console.error('Failed to communicate with API:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const genericTab = document.getElementById('tab-generic');
    const generateBtn = document.getElementById('generate-key-btn');
    const keyDisplay = document.getElementById('key-display');
    const themeDropdown = document.getElementById('theme-dropdown');

    // 1. COOKIE KEY VALIDATION
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

    // 2. THEME PERSISTENCE ENGINE
    const savedTheme = getCookie("LUMA_THEME");
    if (savedTheme) {
        document.body.className = savedTheme;
        if (themeDropdown) themeDropdown.value = savedTheme;
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

    // 3. NAVIGATION VIEW CONFIGURATOR
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

    // 4. INTERACTIVE MODULE COMPONENTS ENGINE
    const testBtn = document.getElementById('btn-test');
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            sendToRoblox('print(1)');
        });
    }

    const espToggle = document.getElementById('toggle-esp');
    if (espToggle) {
        espToggle.addEventListener('click', () => {
            espToggle.classList.toggle('active');
            const isEnabled = espToggle.classList.contains('active');
            sendToRoblox(`_G.ESPActive = ${isEnabled}; print("ESP State set to " .. tostring(_G.ESPActive))`);
        });
    }

    const speedSlider = document.getElementById('slider-speed');
    if (speedSlider) {
        const track = speedSlider.querySelector('.interactive-slider');
        const fill = speedSlider.querySelector('.slider-fill-gradient');
        const valueDisplay = speedSlider.querySelector('.card-value');
        
        const min = parseInt(speedSlider.dataset.min) || 0;
        const max = parseInt(speedSlider.dataset.max) || 100;
        let currentValue = parseInt(speedSlider.dataset.value) || 16;
        
        function updateSlider(clientX) {
            const rect = track.getBoundingClientRect();
            let percentage = (clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            
            fill.style.width = (percentage * 100) + '%';
            currentValue = Math.round(min + (percentage * (max - min)));
            valueDisplay.textContent = currentValue;
        }
        
        track.addEventListener('mousedown', (e) => {
            updateSlider(e.clientX);
            
            function onMouseMove(moveEvent) {
                updateSlider(moveEvent.clientX);
            }
            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                sendToRoblox(`game.Players.LocalPlayer.Character.Humanoid.WalkSpeed = ${currentValue}`);
            }
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    const dropdownComponent = document.getElementById('dropdown-mode');
    if (dropdownComponent) {
        const trigger = dropdownComponent.querySelector('.dropdown-trigger');
        const overlay = dropdownComponent.querySelector('.dropdown-overlay');
        const closeX = dropdownComponent.querySelector('.dropdown-close-x');
        const searchInput = dropdownComponent.querySelector('.dropdown-search-input');
        const items = dropdownComponent.querySelectorAll('.dropdown-item');
        const descText = dropdownComponent.querySelector('.dropdown-trigger p');

        trigger.addEventListener('click', () => {
            overlay.classList.add('open');
        });

        closeX.addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.classList.remove('open');
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedVal = item.dataset.value;
                descText.textContent = `Selected: ${selectedVal}`;
                overlay.classList.remove('open');
                
                sendToRoblox(`_G.CurrentMode = "${selectedVal}"; print("Mode changed to " .. _G.CurrentMode)`);
            });
        });

        searchInput.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filter) ? 'block' : 'none';
            });
        });
    }
});