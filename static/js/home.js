function displayStatus() {

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/recognize/state",

        success: function(response) {

            loader(false);

            if (response == "recognizing") {
                $("#status").html("<b>Statut</b>: Activé (La chatière détecte les chats présents devant elle, et s'il sont reconnus, la chatière se déverrouille.)");
                $("#status-toggle-switch input").prop("checked", true);
            } else {
                $("#status").html("<b>Statut</b>: Désactivé (La chatière ne s'ouvrira pas du tout, et ne cherchera pas à détecter un chat enregistré au préalable.)");
                $("#status-toggle-switch input").prop("checked", false);
            }
        },

        error: function() {
            loader(false);
            networkError();
        },

        timeout: 3000
    });
}

$("#status-toggle-switch input").change(function() {

    if (this.checked) {

        loader(true);

        $.ajax({
            type: "POST",
            url: "/api/recognize/start",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
            },

            success: function(response) {
                loader(false);

                if (response == "training") {
                    alertBox("Erreur", "La chatière est entrain de traiter les données de votre chat. Réessayez dans 1 à 2 minutes.", `
                        <button class="btn btn-sp primary btn-align-right ripple-effect cancel">Fermer</button>`);
                } else if (response == "no-cat-recorded") {
                    alertBox("Erreur", "Commencez par enregistrer un chat puis réessayez.", `
                        <button class="btn btn-sp primary btn-align-right ripple-effect cancel">Fermer</button>`);
                }

                displayStatus();
            },

            error: function(xhr, ajaxOptions, thrownError) {
                loader(false);
                networkError(thrownError);
            },

            timeout: 3000
        });
    } else {

        loader(true);

        $.ajax({
            type: "POST",
            url: "/api/recognize/stop",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
            },

            success: function() {
                loader(false);
                displayStatus();
            },

            error: function(xhr, ajaxOptions, thrownError) {
                loader(false);
                networkError(thrownError);
            },

            timeout: 3000
        });
    }
});