function networkError(thrownError) {

    if (thrownError == "UNAUTHORIZED") {
        alertBox("Connectez-vous", "Vous devez vous connecter afin de continuer...", `
            <button class="btn btn-primary btn-align-right"
            onclick="document.location.replace('login.html');">Connexion</button>
            <div style="clear: both></div>`);
    } else {
        alertBox("Erreur réseau", "Impossible de contacter la chatière.", `
            <button class="btn btn-primary btn-align-right"
            onclick="document.location.reload();">Fermer</button>
            <div style="clear: both></div>`);
    }
}