$("#next-step").click(function () {
    var name = $("#cat-name").val();

    if (name == "") {
        alertBox("Erreur", "Entrez un nom pour votre chat.", `
            <button class="btn btn-primary btn-align-right cancel">Fermer</button>
            <div style="clear: both></div>`
        );
        return;
    }

    else {
        $("#registering-step-2 .progress").css("width", "0%");

        $("#registering-step-1").fadeOut(300).promise().done(function () {
            $("#cat-name").val();
            $("#registering-step-2").fadeIn(300);
        });

        loader();
    }
});

$("#reset-cat").click(function () {
    $("#cat-name").val("");
    if ($("#registering-step-2").is(":visible")) {
        $("#registering-step-2").fadeOut(300).promise().done(function () {
            $("#registering-step-1").fadeIn(300);
        });
    } else if ($("#registering-step-3").is(":visible")) {
        $("#registering-step-3").fadeOut(300).promise().done(function () {
            $("#registering-step-1").fadeIn(300);
        });
    }
});