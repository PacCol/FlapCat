$("#cat-name").on("input", function() {
    var catName = $("#cat-name").val();
    catName = catName.replace(/[^a-zA-Z0-9]/g, "");
    $("#cat-name").val(catName);
});

$("#next-step").click(function() {
    var catName = $("#cat-name").val();

    if (catName == "") {
        alertBox("Erreur", "Entrez un nom pour votre chat.", `
            <button class="btn btn-primary btn-align-right cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;
    }

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/register/start",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ name: catName }),
        contentType: "application/json",

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Le reconnaissance faciale est activée. Commencez par la désactiver, puis réessayez.", `
                        <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                        <div style="clear: both></div>`);

            } else if (response == "already-used") {
                alertBox("Erreur", "Ce nom de chat est déjà utilisé. Choisissez-en un autre puis réessayez.", `
                        <button class="btn btn-primary btn-align-right cancel"
                        onclick='$("#cat-name").focus();'>Fermer</button>
                        <div style="clear: both></div>`);
                $("#cat-name").val("");

            } else {

                $("#registering-step-2 .progress").css("width", "0%");

                $("#registering-step-1").fadeOut(300).promise().done(function() {
                    $("#registering-step-2").fadeIn(300);
                });

                displayState();

                function displayState() {

                    $.ajax({
                        type: "GET",
                        url: "/api/register/state",

                        success: function(response) {

                            if (response == "not-registering") {
                                $(".progress").css("width", "100%");
                                $("#registering-step-2").fadeOut(300).promise().done(function() {
                                    $("#cat-name").val("");
                                    $("#registering-step-1").fadeIn(300);
                                    alertBox("Opération terminée", "Votre chat a été enregistré avec succès ou l'opération a été annulée. Par exemple quand on modifie un chat durant l'enregistrement.", `
                                    <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                                    <div style="clear: both></div>`);
                                });

                            } else {
                                $(".progress").css("width", response);
                                $("#registeringState").text("Avancement: " + response);
                                setTimeout(function() {
                                    displayState();
                                }, 500);
                            }
                        },

                        error: function() {
                            networkError();
                        },

                        timeout: 3000
                    });
                }
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
});


$("#reset-cat").click(function() {

    loader();

    $.ajax({
        type: "POST",
        url: "/api/register/stop",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },

        success: function() {
            loader();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError(thrownError);
        },

        timeout: 3000
    });
});