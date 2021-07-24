$("#users-button").click(function() {
    loadUsers();
});

function loadUsers() {

    $("#users tbody").empty();

    removeContextMenu("#users tbody tr");

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/user/list",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },

        success: function(response) {
            loader(false);

            for (let i = 0; i < response.length; i++) {

                var contextMenu = `<div class="item" onclick="changePassword('${response[i].email}');">
                    <i class="material-icons-round warning">vpn_key</i>Changer le mot de passe</div>`;

                if (response[i].email != "admin") {
                    contextMenu = contextMenu + `<div class="item" onclick="deleteUser('${response[i].email}');">
                        <i class="material-icons-round danger">delete</i>Supprimer</div>`;
                }

                if (response[i].email == "admin") {
                    var line = `<tr><td>${response[i].email} <i class="material-icons-round success">verified</i></td></tr>`;
                } else {
                    var line = `<tr><td>${response[i].email}</td></tr>`;
                }
                $("#users tbody").append(line);

                addContextMenu(contextMenu, "#users tbody tr:nth-child(" + (i + 1).toString() + ")");
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        }
    });
}

$("#create-account").click(function() {
    createAccount();
});

function createAccount() {
    alertBox("Créer un nouveau compte", "Remplissez les champs suivant afin de vous créer un nouveau compte.", `
        <div class="modern-input">
            <input type="email" id="email" maxlength="20" placeholder=" " autocomplete="email">
            <p>Entrez une adresse email</p>
        </div>
        <div class="modern-input">
            <input type="password" id="password" maxlength="20" placeholder=" " autocomplete="password">
            <p>Entrez un mot de passe</p>
        </div>
        <button class="btn btn-primary cancel" onclick="createAccountConfirmed();">Créer</button>
        <button class="btn btn-secondary btn-align-right cancel">Fermer</button>`);
}

function createAccountConfirmed() {

    var email = $("#email").val();
    var password = $("#password").val();

    if (email == "") {
        alertBox("Erreur", "L'adresse email ne peut pas être vide.", `
            <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;

    } else if (password == "") {
        alertBox("Erreur", "Le mot de passe ne peut pas être vide.", `
            <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/signup",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ email: email, password: password }),
        contentType: "application/json",

        success: function(response) {

            loader(false);
            loadUsers();

            if (response == "already-exists") {
                alertBox("Erreur", "Une compte ayant cette adresse email existe déjà.", `
                    <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
                    <div style="clear: both></div>`);
            } else if (response == "registered") {
                alertBox("Compte créé", "Le compte a bien été créé.", `
                    <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }
        },

        error: function() {
            loader(false);
            networkError();
        },

        timeout: 3000
    });
}

function changePassword(userEmail) {
    alertBox("Changer le mot de passe", "Entrez un nouveau mot de passe pour ce compte.", `
        <div class="modern-input">
            <input type="password" id="new-password" maxlength="20" placeholder=" " autocomplete="new-password">
            <p>Entrez le nouveau mot de passe</p>
        </div>
        <button class="btn btn-primary cancel" onclick="changePasswordConfirmed('${userEmail}');">Changer</button>
        <button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>`);
}

function changePasswordConfirmed(userEmail) {

    var newPassword = $("#new-password").val();

    if (newPassword == "") {
        alertBox("Erreur", "Recommencez et rentrez un mot de passe.", `
            <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;
    }

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/user/password",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ "email": userEmail, "password": newPassword }),
        contentType: "application/json",

        success: function(response) {
            loader(false);
            loadCats();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        }
    });
}

function deleteUser(userEmail) {
    alertBox("Avertissement", "Êtes-vous certain de vouloir supprimer ce compte ? Cette opération est irréversible.", `
        <button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>
        <button class="btn btn-primary cancel"
        onclick="deleteUserConfirmed('${userEmail}');">Supprimer</button>`);
}

function deleteUserConfirmed(userEmail) {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/user/delete",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ "email": userEmail }),
        contentType: "application/json",

        success: function() {
            loader(false);

            if (userEmail == localStorage.getItem("email")) {
                logout();
            } else {
                loadUsers();
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        }
    });
}