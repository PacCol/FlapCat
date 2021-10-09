function networkError() {
    alertBox("Erreur réseau", "Impossible de contacter la chatière.", `
        <button class="btn btn-primary btn-align-right ripple-effect"
        onclick="document.location.reload();">Fermer</button>
        <div style="clear: both></div>`);
}

$(document).ready(function() {
    $("body").fadeIn(300).promise().done(function() {
        setTimeout(function() {
            $("#email-input").focus();
        }, 10);
    });
});

function showUsernameSide() {
    $("#password-side").fadeOut(150).promise().done(function() {
        $("#username-side").fadeIn(150).promise().done(function() {
            $("#email-input").focus();
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

$("#show-passwd").change(function() {
    if (this.checked) {
        $("#password-input").attr("type", "text");
    } else {
        $("#password-input").attr("type", "password");
    }
});

$("#login").click(function() {
    login();
});

$(document).keypress(function(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == "13") {
        if ($("#username-side").is(":visible")) {
            showPasswordSide();
        } else {
            login();
        }
    }
});

function login() {

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

    $.ajax({
        type: "POST",
        url: "/api/login",
        data: JSON.stringify({ email: email, password: password }),
        contentType: "application/json",

        success: function(response) {

            loader(false);

            if (response == "not-found") {
                alertBox("Compte introuvable", "Ce compte n'existe pas.", `
                    <button class="btn btn-ripple btn-primary btn-align-right cancel">Fermer</button>
                    <div style="clear: both></div>`);
            } else if (response == "wrong-password") {
                alertBox("Mot de passe erroné", "Vous n'avez pas entré le bon mot de passe.", `
                    <button class="btn btn-ripple btn-primary btn-align-right cancel">Fermer</button>
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
        },

        timeout: 3000
    });
}