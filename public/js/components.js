async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

function initMenu() {
    if (!window.jQuery || !jQuery('#navigation').length) return;

    jQuery('#navigation').meanmenu({
        meanScreenWidth: "800",
        meanMenuContainer: '.top-bar',
        meanMenuClose: "✕ Close",
        meanMenuOpen: "☰ Menu",
        meanRevealPosition: "right",
        meanRevealColour: "#333",
        meanNavPush: "0"
    });
}

document.addEventListener("DOMContentLoaded", async () => {

    await loadComponent("navbar", "/components/navbar.html");

    setTimeout(() => {
        initMenu();
        if (window.updateAuthUI) {
            window.updateAuthUI();
        }
    }, 50);

});