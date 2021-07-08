$("#home").show();

$(".menu .menu-button").click(function() {
    var id = $(this).attr("id");

    if (id !== undefined) {
        $(".menu .menu-button").removeClass("menu-button-active");
        $(this).addClass("menu-button-active")
        $(".app > div").hide();
        id = id.split("-")[0];
        $("#" + id).show();
    }
});

$(".profile-button").click(function() {
    logout();
});

function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    window.location.replace("login.html");
}

if (localStorage.getItem("email") == null) {
    $(".profile-button p").text("?");
} else {
    $(".profile-button p").text(localStorage.getItem("email").substring(0, 1).toUpperCase());
}

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