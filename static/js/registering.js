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
    $("#registering-step-2 .progress").css("width", "0%");

    $("#registering-step-1").fadeOut(300).promise().done(function() {
        $("#cat-name").val();
        $("#registering-step-2").fadeIn(300);
    });

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/register/start",
        beforeSend: function(xhr) { xhr.setRequestHeader("x-access-token", localStorage.getItem("token")); },
        data: { name: catName },

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Le reconnaissance faciale est activée. Commencez par la désactiver, puis réessayez.", `
                        <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                        <div style="clear: both></div>`);
                $("#registering-step-2").fadeOut(300).promise().done(function() {
                    $("#registering-step-1").fadeIn(300);
                });
                return;
            }

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
                    }
                });
            }
        },

        error: function(xhr) {
            loader(false);
            networkError(thrownError);
        }
    });
});


$("#reset-cat").click(function() {

    loader();

    $.ajax({
        type: "POST",
        url: "/api/register/stop",
        beforeSend: function(xhr) { xhr.setRequestHeader("x-access-token", localStorage.getItem("token")); },

        success: function() {
            loader();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError(thrownError);
        }
    });
});