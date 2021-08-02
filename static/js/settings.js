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

            alert("AJOUTER QQCH POUR QUAND LA RECO EST ACTIVE")
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}

$("#hard-reset").click(function() {
    hardReset();
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
            loadSettings();
            //localStorage.clear();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}