document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-btn');
    const banner = document.getElementById('banner');
    closeBtn.onclick = () => banner.style.display = 'none';

    const markdownEditor = document.getElementById('markdown-editor');
    const preview = document.getElementById('preview');

    markdownEditor.addEventListener('input', updatePreview);

    function updatePreview() {
        const markdownText = markdownEditor.value;
        const htmlText = marked.parse(markdownText); // Ensure 'marked' library is loaded
        preview.innerHTML = htmlText;
    }

    const fullscreenContainer = document.getElementById('fullscreen-container');
    const enterFullscreenIcon = document.getElementById('enter-fullscreen');
    const exitFullscreenIcon = document.getElementById('exit-fullscreen');

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
            document.documentElement.mozRequestFullScreen?.();
            document.documentElement.webkitRequestFullscreen?.();
            document.documentElement.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.();
            document.mozCancelFullScreen?.();
            document.webkitExitFullscreen?.();
            document.msExitFullscreen?.();
        }
    }

    fullscreenContainer.addEventListener('click', toggleFullscreen);

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            enterFullscreenIcon.classList.add('visible');
            exitFullscreenIcon.classList.remove('visible');
        } else {
            enterFullscreenIcon.classList.remove('visible');
            exitFullscreenIcon.classList.add('visible');
        }
    });

    const toggleButton = document.getElementById("theme-toggle");
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    let currentTheme = localStorage.getItem("theme");

    function applyTheme(theme) {
        document.body.classList.toggle("dark-mode", theme === "dark");
        document.querySelectorAll('header, footer, .container').forEach(element => {
            element.classList.toggle('dark-mode', theme === "dark");
        });
    }

    if (!currentTheme) {
        currentTheme = prefersDarkScheme.matches ? "dark" : "light";
    }

    applyTheme(currentTheme);

    toggleButton.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        document.querySelectorAll('header, footer, .container').forEach(element => {
            element.classList.toggle('dark-mode', isDarkMode);
        });
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    });

    prefersDarkScheme.addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
            applyTheme(e.matches ? "dark" : "light");
        }
    });

    const popupButton = document.getElementById('popupButton');
    const popup = document.getElementById('popup');
    let isOpen = false;

    popupButton.addEventListener('click', (event) => {
        event.stopPropagation();
        isOpen ? closePopup() : openPopup();
    });

    function openPopup() {
        const screenWidth = window.innerWidth;
        popup.classList.add(screenWidth <= 768 ? 'popup-mobile' : 'popup-desktop');
        if (screenWidth > 768) {
            const buttonRect = popupButton.getBoundingClientRect();
            popup.style.left = `${buttonRect.left + (buttonRect.width / 2) - (popup.offsetWidth / 2)}px`;
            popup.style.top = `${buttonRect.bottom + 12}px`;
        }
        popup.style.display = 'block';
        isOpen = true;
        document.addEventListener('click', closePopupOutside);
    }

    function closePopup() {
        popup.style.display = 'none';
        popup.classList.remove('popup-mobile', 'popup-desktop');
        isOpen = false;
        document.removeEventListener('click', closePopupOutside);
    }

    function closePopupOutside(event) {
        if (!popup.contains(event.target) && event.target !== popupButton) {
            closePopup();
        }
    }

    updatePreview(); // Initial update
});

function applyTheme(theme) {
    const isDarkMode = theme === "dark";
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.querySelectorAll('header, footer, .container').forEach(element => {
        element.classList.toggle('dark-mode', isDarkMode);
    });
    // Apply dark mode to markdown editor and preview
    document.getElementById('markdown-editor').classList.toggle('dark-mode', isDarkMode);
    document.getElementById('preview').classList.toggle('dark-mode', isDarkMode);
}

document.addEventListener('DOMContentLoaded', () => {
    const undoIcon = document.getElementById('undo-icon');
    const redoIcon = document.getElementById('redo-icon');
    const markdownEditor = document.getElementById('markdown-editor');
    
    // Stack to store the history of changes
    let undoStack = [];
    let redoStack = [];
    let isTyping = false;

    // Save the current state of the editor to the undo stack
    function saveState() {
        if (isTyping) return; // Prevent saving state on every keystroke
        undoStack.push(markdownEditor.value);
        redoStack = []; // Clear the redo stack whenever a new change is made
    }

    // Call saveState when user starts typing
    markdownEditor.addEventListener('input', () => {
        if (!isTyping) {
            isTyping = true;
            setTimeout(() => {
                saveState();
                isTyping = false;
            }, 500); // Adjust delay as needed
        }
    });

    // Undo function
    function undo() {
        if (undoStack.length > 0) {
            redoStack.push(markdownEditor.value);
            const previousState = undoStack.pop();
            markdownEditor.value = previousState;
            updatePreview();
        }
    }

    // Redo function
    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(markdownEditor.value);
            const nextState = redoStack.pop();
            markdownEditor.value = nextState;
            updatePreview();
        }
    }

    // Event listeners for undo and redo icons
    undoIcon.addEventListener('click', undo);
    redoIcon.addEventListener('click', redo);

    // Initial save state
    saveState();
});

function updatePreview() {
    const markdownText = markdownEditor.value;
    const htmlText = marked.parse(markdownText);
    document.getElementById('preview').innerHTML = htmlText;
}
document.addEventListener('DOMContentLoaded', () => {
    const filenameSpan = document.getElementById('filename');

    filenameSpan.addEventListener('dblclick', () => {
        filenameSpan.contentEditable = true;
        filenameSpan.classList.add('editable');
        filenameSpan.focus();
    });

    filenameSpan.addEventListener('blur', () => {
        filenameSpan.contentEditable = false;
        filenameSpan.classList.remove('editable');
    });

    filenameSpan.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            filenameSpan.contentEditable = false;
            filenameSpan.classList.remove('editable');
        }
    });

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', async () => {
        const filename = filenameSpan.innerText.trim();
        const content = document.getElementById('markdown-editor').value;
        try {
            const response = await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content })
            });
            const result = await response.json();
            console.log('File saved with ID:', result.fileId);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const markdownEditor = document.getElementById('markdown-editor');
    const wordCountSpan = document.getElementById('word-count');
    const wordLabelSpan = document.getElementById('word-label');

    markdownEditor.addEventListener('input', function() {
        const text = markdownEditor.value.trim();
        const words = text === '' ? 0 : text.match(/\S+/g).length;

        // Update word count
        wordCountSpan.textContent = words;

        // Update word label
        if (words === 1) {
            wordLabelSpan.textContent = 'word';
        } else {
            wordLabelSpan.textContent = 'words';
        }
    });
});
