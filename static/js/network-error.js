function networkError() {
    alertBox("Erreur réseau", "Impossible de contacter la chatière", `
        <button class="btn btn-primary btn-align-right"
        onclick="document.location.reload();">Fermer</button>
        <div style="clear: both></div>`);
}