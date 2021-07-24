$("#cats-button").click(function() {
    loadCats();
});

function loadCats() {

    $("#cats tbody").empty();

    removeContextMenu("#cats tbody tr");

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/cat/list",

        success: function(response) {
            loader(false);

            for (let i = 0; i < response.length; i++) {

                if (response[i].authorized) {
                    var contextMenu = `<div class="item" onclick="renameCat('${response[i].id}');">
                        <i class="material-icons-round success">drive_file_rename_outline</i>Renommer</div>
                        <div class="item" onclick="authorizeCat('${response[i].id}', false);">
                        <i class="material-icons-round warning">login</i>Interdire</div>
                        <div class="item" onclick="deleteCat('${response[i].id}');">
                        <i class="material-icons-round danger">delete</i>Supprimer</div>`
                } else {
                    var contextMenu = `<div class="item" onclick="renameCat('${response[i].id}');">
                        <i class="material-icons-round success" onclick="">drive_file_rename_outline</i>Renommer</div>
                        <div class="item" onclick="authorizeCat('${response[i].id}', true);">
                        <i class="material-icons-round warning">login</i>Autoriser</div>
                        <div class="item" onclick="deleteCat('${response[i].id}');">
                        <i class="material-icons-round danger">delete</i>Supprimer</div>`
                }

                if (response[i].authorized) {
                    response[i].authorized = 'Autorisé(e) à rentrer <i class="material-icons-round success">done</i>';
                } else {
                    response[i].authorized = 'Pas autorisé(e) à rentrer <i class="material-icons-round danger">close</i>';
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
        },

        timeout: 3000
    });
}

function renameCat(id) {
    alertBox("Renommer", "Entrez un nouveau nom pour votre chat.", `
        <div class="modern-input">
            <input type="text" id="new-name" maxlength="10" placeholder=" " autocomplete="new-name">
            <p>Entrez le nom de votre chat</p>
        </div>
        <button class="btn btn-primary ripple-effect cancel" onclick="renameCatConfirmed('${id}')">Renommer</button>
        <button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>`);
}

$("body").on("input", "#new-name", function() {
    var newName = $("#new-name").val();
    newName = newName.replace(/[^a-zA-Z0-9]/g, "");
    $("#new-name").val(newName);
});

function renameCatConfirmed(id) {

    var newName = $("#new-name").val();

    if (newName == "") {
        alertBox("Erreur", "Recommencez et rentrez un nom pour votre chat.", `
            <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
            <div style="clear: both></div>`);
        return;
    }

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/cat/rename",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ id: Number(id), newName: newName }),
        contentType: "application/json",

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Impossible de renommer un chat lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                    <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }
            loadCats();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}

function authorizeCat(id, permitted) {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/cat/permissions",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ id: Number(id), authorized: permitted }),
        contentType: "application/json",

        success: function() {
            loader(false);
            loadCats();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}

function deleteCat(id) {
    alertBox("Avertissement", "Êtes-vous certain de vouloir supprimer ce chat ? Cette opération est irréversible.", `
        <button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>
        <button class="btn btn-primary cancel"
        onclick="deleteCatConfirmed('${id}')">Supprimer</button>`);
}

function deleteCatConfirmed(id) {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/cat/delete",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },
        data: JSON.stringify({ id: Number(id) }),
        contentType: "application/json",

        success: function(response) {
            loader(false);

            if (response == "recognizing") {
                alertBox("Erreur", "Impossible de supprimer un chat lorsque la reconnaissance faciale est activée. Commencez par désactiver la reconnaissance faciale.", `
                    <button class="btn btn-primary btn-align-right ripple-effect cancel">Fermer</button>
                    <div style="clear: both></div>`);
            }

            loadCats();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}