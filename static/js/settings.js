$("#fullscreen").click(function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

$("#settings-general-button").click(function() {
    $("#settings-advanced").fadeOut(150).promise().done(function() {
        $("#settings-general").fadeIn(150);
    });
});

$("#settings-advanced-button").click(function() {
    $("#settings-general").fadeOut(150).promise().done(function() {
        $("#settings-advanced").fadeIn(150);
    });
});

$("#hard-reset").click(function() {
    if (localStorage.getItem("email") == "admin") {
        hardReset();
    } else {
        alertBox("Interdit", `Vous n'avez pas le droit de faire ceci. Éssayez de vous connecter en tant qu'administrateur.`,
            `<button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>`);
    }
});

function hardReset() {
    alertBox("Avertissement", `Êtes-vous certain de vouloir réinitialiser les paramètres ? Cette opération est irréversible. 
        Les chats, les comptes et les statistiques seront conservés.`,
        `<button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>
        <button class="btn btn-primary cancel"
        onclick="hardResetConfirmed()">Réinitialiser</button>`);
}

function hardResetConfirmed() {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/settings/reset",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Impossible de modifier ces paramètres lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                    <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }

            loadSettings();
            localStorage.clear();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}

$("#shutdown").click(function() {
    if (localStorage.getItem("email") == "admin") {
        shutdown();
    } else {
        alertBox("Interdit", `Vous n'avez pas le droit de faire ceci. Éssayez de vous connecter en tant qu'administrateur.`,
            `<button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>`);
    }
});

function shutdown() {
    alertBox("Avertissement", `Êtes-vous certain de vouloir éteindre la chatière ? Vous pourrez la redémarrer en la débranchant puis en la rebranchant.`,
        `<button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>
        <button class="btn btn-primary"
        onclick="shutdownConfirmed()">Éteindre</button>`);
}

function shutdownConfirmed() {
    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/settings/shutdown",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },

        success: function(response) {
            loader(false);
            alertBox("Opération terminée", `La chatière va s'éteindre.`,
                ``);
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}

var imgNumber = 0;
var fiability = 0;
var minFiability = 0;

function loadSettings() {

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/settings/list",

        success: function(response) {

            loader(false);

            $("#registering-duration .btn-badge").text(response.imgNbr + " img");
            imgNbr = response.imgNbr;
            $("#fiability .btn-badge").text(response.fiability + " fois");
            fiability = response.fiability;
            $("#min-fiability .btn-badge").text(response.minFiability);
            minFiability = response.minFiability;
        },

        error: function() {
            loader(false);
            networkError();
        },

        timeout: 3000
    });
}

$("#registering-duration .dropdown-content button").click(function() {
    imgNbr = Number($(this).attr("data-value"));
    $(this).closest(".modern-dropdown").find(".btn-badge").text(imgNbr + " img");
    updateSettings();
});

$("#fiability .dropdown-content button").click(function() {
    fiability = Number($(this).attr("data-value"));
    $(this).closest(".modern-dropdown").find(".btn-badge").text(fiability + " fois");
    updateSettings();
});

$("#min-fiability .dropdown-content button").click(function() {
    minFiability = Number($(this).attr("data-value"));
    $(this).closest(".modern-dropdown").find(".btn-badge").text(minFiability);
    updateSettings();
});

function updateSettings() {

    if (localStorage.getItem("email") != "admin") {
        alertBox("Interdit", `Vous n'avez pas le droit de faire ceci. Éssayez de vous connecter en tant qu'administrateur.`,
            `<button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>`);
        loadSettings();
        return;
    }

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/settings/update",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ imgNbr: imgNbr, fiability: fiability, minFiability: minFiability }),
        contentType: "application/json",

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Impossible de modifier ces paramètres lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                    <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
                    <div style="clear: both></div>`);
                loadSettings();
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}