displayStatus();

$("#home-button").click(function() {
    displayStatus();
});

function displayStatus() {

    loader();

    $.ajax({
        type: "GET",
        url: "/api/recognize/state",

        success: function(response) {

            loader();

            if (response == "recognizing") {
                $("#status").html("<b>Statut</b>: Activé (La chatière détecte les chats présents devant elle, et, s'il sont reconnus, la chatière se déverrouille.)");
                $("#status-toggle-switch input").prop("checked", true);
            } else {
                $("#status").html("<b>Statut</b>: Désactivé (La chatière ne s'ouvrira pas du tout, et ne cherchera pas à détecter un chat enregistré au préalable.)");
                $("#status-toggle-switch input").prop("checked", false);
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError();
        }
    });
}

$("#status-toggle-switch input").change(function() {

    if (this.checked) {

        loader();

        $.ajax({
            type: "POST",
            url: "/api/recognize/start",

            success: function(response) {
                loader();

                if (response == "training") {
                    alertBox("Erreur", "La chatière est entrain de traiter les données de votre chat. Réessayez dans 1 à 2 minutes.", `
                        <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                        <div style="clear: both></div>`);
                }

                displayStatus();
            },

            error: function(xhr, ajaxOptions, thrownError) {
                loader();
                networkError();
            }
        });
    } else {

        loader();

        $.ajax({
            type: "POST",
            url: "/api/recognize/stop",

            success: function(response) {
                loader();
                displayStatus();
            },

            error: function(xhr, ajaxOptions, thrownError) {
                loader();
                networkError();
            }
        });
    }
});