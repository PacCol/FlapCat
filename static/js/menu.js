var section = localStorage.getItem("section");

if (section !== null) {
    showSection(section);
} else {
    $("#home").show();
    displayStatus();
}

$(".menu .menu-button").click(function() {
    var id = $(this).attr("id");
    if (id !== undefined) {
        showSection(id.split("-")[0]);
    }
});

function showSection(id) {

    localStorage.setItem("section", id);
    $(".menu .menu-button").removeClass("menu-button-active");
    $("#" + id + "-button").addClass("menu-button-active")
    if ($("#" + id).css("display") == "none") {
        $(".app > div").fadeOut(100).promise().done(function() {
            $("#" + id).fadeIn(100);
        });
    }

    if (id == "home") {
        displayStatus();
    } else if (id == "cats") {
        loadCats();
    } else if (id == "analytics") {
        loadEntries();
    } else if (id == "users") {
        loadUsers();
    } else if (id == "settings") {
        loadSettings();
    }
}

$(".profile-button").click(function() {
    logout();
});

function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    window.location.replace("login.html");
}

if (localStorage.getItem("email") == null) {
    $(".profile-button").text("?");
} else {
    $(".profile-button").text(localStorage.getItem("email").substring(0, 1).toUpperCase());
}

function networkError(thrownError) {

    if (thrownError == "UNAUTHORIZED") {
        alertBox("Connectez-vous", "Vous devez vous connecter afin de continuer...", `
            <button class="btn btn-primary btn-align-right ripple-effect"
            onclick="document.location.replace('login.html');">Connexion</button>
            <div style="clear: both></div>`);
    } else {
        alertBox("Erreur réseau", "Impossible de contacter la chatière.", `
            <button class="btn btn-primary btn-align-right ripple-effect"
            onclick="document.location.reload();">Fermer</button>
            <div style="clear: both></div>`);
    }
}