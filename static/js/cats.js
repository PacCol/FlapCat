$("#cats-button").click(function() {
    loadCats();
});

function loadCats() {

    $("#cats tbody").empty();

    removeContextMenu("tr");

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/cat/list",

        success: function(response) {
            loader(false);

            for (let i = 0; i < response.length; i++) {

                if (response[i].authorized) {
                    var contextMenu = `<div class="item" onclick="renameCat('${response[i].name}');">
                    <i class="material-icons-round success">drive_file_rename_outline</i>Renommer</div>
                    <div class="item" onclick="authorizeCat('${response[i].name}', false);">
                    <i class="material-icons-round warning">login</i>Interdire</div>
                    <div class="item" onclick="deleteCat('${response[i].name}');">
                    <i class="material-icons-round danger">delete</i>Supprimer</div>`
                } else {
                    var contextMenu = `<div class="item" onclick="renameCat('${response[i].name}');">
                    <i class="material-icons-round success" onclick="">drive_file_rename_outline</i>Renommer</div>
                    <div class="item" onclick="authorizeCat('${response[i].name}', true);">
                    <i class="material-icons-round warning">login</i>Autoriser</div>
                    <div class="item" onclick="deleteCat('${response[i].name}');">
                    <i class="material-icons-round danger">delete</i>Supprimer</div>`
                }

                if (response[i].authorized) {
                    response[i].authorized = "Autorisé(e) à rentrer";
                } else {
                    response[i].authorized = "Pas autorisé(e) à rentrer";
                }

                var line = `
                    <tr>
                        <td>${response[i].name}</td>
                        <td>${response[i].authorized}</td>
                    </tr>`
                $("#cats tbody").append(line);

                addContextMenu(contextMenu, "#cats tbody tr:nth-child(" + (i + 1).toString() + ")");
            }
        },

        error: function() {
            loader(false);
            networkError();
        }
    });
}

function renameCat(catName) {
    alertBox("Renommer", "Entrez un nouveau nom pour votre chat.", `
        <div class="modern-input">
            <input type="text" id="new-name" maxlength="10" placeholder=" " autocomplete="off">
            <p>Entrez le nom de votre chat</p>
        </div>
        <button class="btn btn-primary cancel" onclick="renameCatConfirmed('${catName}')">Renommer</button>
        <button class="btn btn-secondary btn-align-right cancel">Fermer</button>`);
}

$("body").on("input", "#new-name", function() {
    var newName = $("#new-name").val();
    newName = newName.replace(/[^a-zA-Z0-9]/g, "");
    $("#new-name").val(newName);
});

function renameCatConfirmed(catName) {

    var newName = $("#new-name").val();

    if (newName == "") {
        alertBox("Erreur", "Recommencez et rentrez un nom pour votre chat.", `
            <button class="btn btn-primary btn-align-right cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;
    }

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/cat/exist",
        beforeSend: function(xhr) { xhr.setRequestHeader("name", newName); },

        success: function(response) {

            if (response == "true") {
                loader(false);
                alertBox("Erreur", "Ce nom ne convient pas. Peut-être l'avez-vous déjà utilisé pour un autre chat ou peut-être que votre chat porte déjà ce nom là...", `
                    <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                    <div style="clear: both></div>`);

            } else {
                $.ajax({
                    type: "POST",
                    url: "/api/cat/rename",
                    data: { name: catName, newName: newName },

                    success: function(response) {
                        loader(false);

                        if (response == "recognizing") {
                            alertBox("Erreur", "Impossible de renommer un chat lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                                <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                                <div style="clear: both></div>`);
                        }

                        loadCats();
                    },

                    error: function() {
                        loader(false);
                        networkError();
                    }
                });
            }
        },

        error: function() {
            loader(false);
            networkError();
        }
    });
}

function authorizeCat(catName, permitted) {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/cat/permissions",
        data: { name: catName, authorized: permitted },

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Impossible de modifier les autorisations d'un chat lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                    <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }

            loadCats();
        },

        error: function() {
            loader(false);
            networkError();
        }
    });
}

function deleteCat(catName) {
    alertBox("Avertissement", "Êtes-vous certain de vouloir supprimer ce chat ? Cette opération est irréversible.", `
        <button class="btn btn-secondary btn-align-right cancel">Fermer</button>
        <button class="btn btn-primary cancel"
        onclick="deleteCatConfirmed('${catName}')">Supprimer</button>`);
}

function deleteCatConfirmed(catName) {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/cat/delete",
        data: { name: catName },

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Impossible de supprimer un chat lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                    <button class="btn btn-primary btn-align-right cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }

            loadCats();
        },

        error: function() {
            loader(false);
            networkError();
        }
    });
}