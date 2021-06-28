$("#next-step").click(function() {
    var catName = $("#cat-name").val();

    if (catName == "") {
        alertBox("Erreur", "Entrez un nom pour votre chat.", `
            <button class="btn btn-primary btn-align-right cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;

    } else {
        $("#registering-step-2 .progress").css("width", "0%");

        $("#registering-step-1").fadeOut(300).promise().done(function() {
            $("#cat-name").val();
            $("#registering-step-2").fadeIn(300);
        });

        loader();

        $.ajax({
            type: "POST",
            url: "/api/register/start",
            data: { name: catName },

            success: function(response) {
                loader();

                displayState();

                function displayState() {

                    $.ajax({
                        type: "GET",
                        url: "/api/register/state",

                        success: function(response) {

                            if (response == "not-registering") {
                                $(".progress").css("width", "100%");
                                $("#registering-step-2").fadeOut(300).promise().done(function() {
                                    $("#registering-step-1").fadeIn(300);
                                    alertBox("Opération terminée", "Votre chat a été enregistré avec succès, ou vous avez annulé l'opération", `
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

                        error: function(xhr, ajaxOptions, thrownError) {
                            networkError();
                        }
                    });
                }
            },

            error: function(xhr, ajaxOptions, thrownError) {
                loader();
                networkError();
            }
        });
    }
});


$("#reset-cat").click(function() {
    loader();

    $.ajax({
        type: "POST",
        url: "/api/register/stop",

        success: function(response) {
            loader();
            $("#registering-step-2").fadeOut(300).promise().done(function() {
                $("#registering-step-1").fadeIn(300);
            });
        },
        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError();
        }
    });
});