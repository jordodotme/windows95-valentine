// Window management
let windowZIndex = 100;
let draggedWindow = null;
let dragOffset = { x: 0, y: 0 };

// Initialize clock
function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}

updateClock();
setInterval(updateClock, 1000);

// Desktop icon interactions
const desktopIcons = document.querySelectorAll('.desktop-icon');

desktopIcons.forEach(icon => {
    let clickCount = 0;
    let clickTimer = null;

    icon.addEventListener('click', function(e) {
        clickCount++;

        if (clickCount === 1) {
            // Single click - select icon
            desktopIcons.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');

            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 300);
        } else if (clickCount === 2) {
            // Double click
            clearTimeout(clickTimer);
            clickCount = 0;

            if (this.id === 'click-me-folder') {
                openFolderWindow();
            }
        }
    });
});

// Start button - visual feedback only
document.getElementById('start-button').addEventListener('click', function(e) {
    e.stopPropagation();
});

// Deselect icons when clicking desktop
document.getElementById('desktop').addEventListener('click', function(e) {
    if (e.target === this) {
        desktopIcons.forEach(i => i.classList.remove('selected'));
    }
});

// Create folder window
function openFolderWindow() {
    // Check if folder window already exists
    if (document.getElementById('folder-window')) {
        focusWindow(document.getElementById('folder-window'));
        return;
    }

    const window = createWindow('folder-window', 'click me', 450, 350);
    const content = window.querySelector('.window-content');

    // Create folder content
    const folderContent = document.createElement('div');
    folderContent.className = 'folder-content';

    // Create file icon
    const fileIcon = document.createElement('div');
    fileIcon.className = 'file-icon';
    fileIcon.id = 'gif-file';

    const fileIconImage = document.createElement('div');
    fileIconImage.className = 'file-icon-image';
    fileIconImage.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="4" y="2" width="20" height="28" fill="white" stroke="black"/>
        <path d="M24,2 L24,10 L32,10 Z" fill="white" stroke="black"/>
        <rect x="8" y="10" width="12" height="2" fill="black"/>
        <rect x="8" y="14" width="12" height="2" fill="black"/>
        <rect x="8" y="18" width="8" height="2" fill="black"/>
    </svg>`;

    const fileIconLabel = document.createElement('div');
    fileIconLabel.className = 'file-icon-label';
    fileIconLabel.textContent = 'for sheb';

    fileIcon.appendChild(fileIconImage);
    fileIcon.appendChild(fileIconLabel);
    folderContent.appendChild(fileIcon);
    content.appendChild(folderContent);

    // Add double-click handler to GIF file
    let gifClickCount = 0;
    let gifClickTimer = null;

    fileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        gifClickCount++;

        if (gifClickCount === 1) {
            gifClickTimer = setTimeout(() => {
                gifClickCount = 0;
            }, 300);
        } else if (gifClickCount === 2) {
            clearTimeout(gifClickTimer);
            gifClickCount = 0;
            openImageViewer();
        }
    });

    document.getElementById('desktop').appendChild(window);
    centerWindow(window);
}

// Create image viewer window
function openImageViewer() {
    // Check if image viewer already exists
    if (document.getElementById('image-viewer-window')) {
        focusWindow(document.getElementById('image-viewer-window'));
        return;
    }

    const window = createWindow('image-viewer-window', 'for sheb', 800, 600);
    const content = window.querySelector('.window-content');
    content.classList.add('image-viewer-content');

    const img = document.createElement('img');
    img.src = 'assets/low-fidelity-final-frame.gif';
    img.alt = "Valentine's Day";
    content.appendChild(img);

    document.getElementById('desktop').appendChild(window);
    centerWindow(window);
}

// Generic window creation
function createWindow(id, title, width, height) {
    const window = document.createElement('div');
    window.className = 'window active';
    window.id = id;
    window.style.width = width + 'px';
    window.style.height = height + 'px';

    // Create title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'window-title-bar';

    const windowTitle = document.createElement('div');
    windowTitle.className = 'window-title';
    windowTitle.textContent = title;

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'window-control-btn minimize';
    minimizeBtn.disabled = true;

    const maximizeBtn = document.createElement('button');
    maximizeBtn.className = 'window-control-btn maximize';
    maximizeBtn.disabled = true;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'window-control-btn close';

    controls.appendChild(minimizeBtn);
    controls.appendChild(maximizeBtn);
    controls.appendChild(closeBtn);

    titleBar.appendChild(windowTitle);
    titleBar.appendChild(controls);

    // Create content area
    const content = document.createElement('div');
    content.className = 'window-content';

    window.appendChild(titleBar);
    window.appendChild(content);

    // Close button
    closeBtn.addEventListener('click', function() {
        window.remove();
    });

    // Make window draggable
    titleBar.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('window-control-btn')) return;

        draggedWindow = window;
        focusWindow(window);

        const rect = window.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;

        e.preventDefault();
    });

    // Focus window on click
    window.addEventListener('mousedown', function() {
        focusWindow(window);
    });

    return window;
}

// Window dragging
document.addEventListener('mousemove', function(e) {
    if (draggedWindow) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Keep window within viewport
        const maxX = window.innerWidth - draggedWindow.offsetWidth;
        const maxY = window.innerHeight - 28 - draggedWindow.offsetHeight; // Account for taskbar

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        draggedWindow.style.left = newX + 'px';
        draggedWindow.style.top = newY + 'px';
    }
});

document.addEventListener('mouseup', function() {
    draggedWindow = null;
});

// Center window on screen
function centerWindow(window) {
    const x = (window.innerWidth - window.offsetWidth) / 2;
    const y = (window.innerHeight - 28 - window.offsetHeight) / 2; // Account for taskbar

    window.style.left = Math.max(0, x) + 'px';
    window.style.top = Math.max(0, y) + 'px';
}

// Focus window (bring to front)
function focusWindow(window) {
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    window.classList.add('active');
    window.style.zIndex = ++windowZIndex;
}
