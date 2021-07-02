$(document).ready(function() {
    $("body").fadeIn(300).promise().done(function() {
        setTimeout(function() {
            $("#username-input").focus();
        }, 10);
    });
});

function showUsernameSide() {
    $("#password-side").fadeOut(150).promise().done(function() {
        $("#username-side").fadeIn(150).promise().done(function() {
            $("#username-input").focus();
        });
    });
}

function showPasswordSide() {
    $("#username-side").fadeOut(150).promise().done(function() {
        $("#password-side").fadeIn(150).promise().done(function() {
            $("#password-input").focus();
        });
    });
}

$("#next").click(function() {
    showPasswordSide();
});

$("#back").click(function() {
    showUsernameSide();
});

$("#login").click(function() {
    login();
});

$("#signup").click(function() {
    signup();
});

$(document).keypress(function(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == "13") {
        if ($("#username-side").is(":visible")) {
            showPasswordSide();
        } else {
            if ($("#login").length != 0) {
                login();
            } else {
                signup();
            }
        }
    }
});

function login() {

    if ($("#username-input").val() == "") {
        $(".alert-container p").text("L'adresse email ne peut pas être vide.");
        $(".alert-container").fadeIn(200).promise().done(function() {
            $(".alert-container .cancel").click(function() {
                $(".alert-container").fadeOut(200).promise().done(function() {
                    showUsernameSide();
                });
            });
        });
        return;
    } else if ($("#password-input").val() == "") {
        $(".alert-container p").text("Le mot de passe ne peut pas être vide.");
        $(".alert-container").fadeIn(200).promise().done(function() {
            $(".alert-container .cancel").click(function() {
                $(".alert-container").fadeOut(200).promise().done(function() {
                    showUsernameSide();
                });
            });
        });
        return;
    }

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/signup",
        data: { email: $("#username-input").val(), password: $("#password-input").val() },

        success: function(response) {
            loader(false);

            alert(response);

            if (response == "registered") {
                alertBox("Compte créé", "Votre compte a bien été créé.", `
                    <button class="btn btn-primary btn-align-right"
                    onclick="window.location.replace('login.html');">Connexion</button>
                    <div style="clear: both></div>`);
            } else {
                alertBox("Compte déjà existant", "Un compte dont l'adresse email est similaire existe déjà.", `
                    <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError();
        }
    });
}

function signup() {

    if ($("#username-input").val() == "") {
        $(".alert-container p").text("L'adresse email ne peut pas être vide.");
        $(".alert-container").fadeIn(200).promise().done(function() {
            $(".alert-container .cancel").click(function() {
                $(".alert-container").fadeOut(200).promise().done(function() {
                    showUsernameSide();
                });
            });
        });
        return;
    } else if ($("#password-input").val() == "") {
        $(".alert-container p").text("Le mot de passe ne peut pas être vide.");
        $(".alert-container").fadeIn(200).promise().done(function() {
            $(".alert-container .cancel").click(function() {
                $(".alert-container").fadeOut(200).promise().done(function() {
                    showUsernameSide();
                });
            });
        });
        return;
    }

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/signup",
        data: { email: $("#username-input").val(), password: $("#password-input").val() },

        success: function(response) {
            loader(false);

            alert(response);

            if (response == "registered") {
                alertBox("Compte créé", "Votre compte a bien été créé.", `
                    <button class="btn btn-primary btn-align-right"
                    onclick="window.location.replace('login.html');">Connexion</button>
                    <div style="clear: both></div>`);
            } else {
                alertBox("Compte déjà existant", "Un compte dont l'adresse email est similaire existe déjà.", `
                    <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError();
        }
    });
}