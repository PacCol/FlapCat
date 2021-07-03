var action = "login";

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

function login() {
    $("#main-container").fadeOut(150).promise().done(function() {
        action = "login";
        $("#login").hide();
        $("#signup").show();
        $("h1").text("Connexion");
        $("#finish").text("Connexion");
        $("#main-container").fadeIn(150);
    });
}

$("#signup").click(function() {
    newAccount();
});

function newAccount() {
    $("#main-container").fadeOut(150).promise().done(function() {
        action = "signup";
        $("#signup").hide();
        $("#login").show();
        $("h1").text("Créer un nouveau compte");
        $("#finish").text("Confirmer");
        $("#main-container").fadeIn(150);
    });
}

$(document).keypress(function(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == "13") {
        if ($("#username-side").is(":visible")) {
            showPasswordSide();
        } else {
            finish();
        }
    }
});

$("#finish").click(function() {
    finish();
});

function finish() {

    var email = $("#email-input").val();
    var password = $("#password-input").val();

    if (email == "") {
        showUsernameSide();
        alertBox("Erreur", "L'adresse email ne peut pas être vide.", `
            <button class="btn btn-primary btn-align-right cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;

    } else if (password == "") {
        showPasswordSide();
        alertBox("Erreur", "Le mot de passe ne peut pas être vide.", `
            <button class="btn btn-primary btn-align-right cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;
    }

    loader(true);

    if (action == "signup") {
        $.ajax({
            type: "POST",
            url: "/api/signup",
            data: { email: email, password: password },

            success: function(response) {

                loader(false);

                if (response == "registered") {
                    alertBox("Compte créé", "Votre compte a bien été créé.", `
                        <button class="btn btn-primary btn-align-right cancel"
                        onclick="login();">Connexion</button>
                        <div style="clear: both></div>`);
                } else {
                    alertBox("Compte déjà existant", "Un compte dont l'adresse email est similaire existe déjà.", `
                        <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                        <div style="clear: both></div>`);
                }
            },

            error: function() {
                loader(false);
                networkError();
            }
        });

    } else {
        $.ajax({
            type: "POST",
            url: "/api/login",
            data: { email: email, password: password },

            success: function(response) {

                loader(false);

                if (response == "not-found") {
                    $("#username-input").val("");
                    showUsernameSide();
                    $("#password-input").val("");
                    alertBox("Compte introuvable", "Ce compte n'existe pas.", `
                        <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                        <div style="clear: both></div>`);
                } else if (response == "wrong-password") {
                    $("#password-input").val("");
                    alertBox("Mot de passe erroné", "Vous n'avez pas entré le bon mot de passe.", `
                        <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                        <div style="clear: both></div>`);
                } else {
                    localStorage.setItem("email", email);
                    localStorage.setItem("token", response.token);
                    window.location.replace("index.html");
                }
            },

            error: function() {
                loader(false);
                networkError();
            }
        });
    }
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

        error: function() {
            loader(false);
            networkError();
        }
    });
}