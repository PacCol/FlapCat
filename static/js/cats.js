function loadCats() {

    $("#cats tbody").empty();

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/cat/list",

        success: function(response) {

            loader(false);

            for (let i = 0; i < response.length; i++) {

                if (response[i].authorized) {
                    var authorized = 'Autorisé(e) à rentrer <i class="material-icons-round set-color success">done</i>';
                } else {
                    var authorized = 'Pas autorisé(e) à rentrer <i class="material-icons-round set-color danger">close</i>';
                }

                var line = `
                    <tr data-id="${response[i].id}" data-authorized="${response[i].authorized}">
                        <td>${response[i].name}</td>
                        <td>${authorized}</td>
                    </tr>`
                $("#cats tbody").append(line);
            }
        },

        error: function() {
            loader(false);
            networkError();
        },

        timeout: 3000
    });
}

$("#cats").on("contextmenu", "tbody tr", function(e) {

    if ($(this).data("authorized")) {
        var contextMenu = `
            <button class="item rename">
                <i class="material-icons-round set-color success">drive_file_rename_outline</i>Renommer
            </button>
            <button class="item disallow">
                <i class="material-icons-round set-color warning">login</i>Interdire
            </button>
            <button class="item delete">
                <i class="material-icons-round set-color danger">delete</i>Supprimer
            </button>`;
    } else {
        var contextMenu = `
            <button class="item rename">
                <i class="material-icons-round set-color success">drive_file_rename_outline</i>Renommer
            </button>
            <button class="item allow">
                <i class="material-icons-round set-color warning">login</i>Autoriser
            </button>
            <button class="item delete">
                <i class="material-icons-round set-color danger">delete</i>Supprimer
            </button>`;
    }
    openContextMenu(contextMenu, "#cats-context-menu", e);

    $("#cats-context-menu").attr("data-id", $(this).data("id"));
});

$("body").on("click", "#cats-context-menu .item", function() {
    var id = $(this).closest(".context-menu").data("id");
    
    if ($(this).hasClass("rename")) {
        renameCat(id);
    } else if ($(this).hasClass("allow")) {
        authorizeCat(id, true);
    } else if ($(this).hasClass("disallow")) {
        authorizeCat(id, false);
    } else if ($(this).hasClass("delete")) {
        deleteCat(id);
    }
});

function renameCat(id) {
    alertBox("Renommer", "Entrez un nouveau nom pour votre chat.", `
        <div class="modern-input success">
            <input type="text" id="new-name" maxlength="10" placeholder=" " autocomplete="new-name">
            <p>Entrez le nom de votre chat</p>
        </div>
        <button class="btn btn-sp success ripple-effect cancel" onclick="renameCatConfirmed('${id}')">Renommer</button>
        <button class="btn btn-ol success btn-align-right ripple-effect cancel">Fermer</button>`);
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
            <button class="btn btn-sp primary btn-align-right ripple-effect cancel">Fermer</button>`);
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
                    <button class="btn btn-sp primary btn-align-right ripple-effect cancel">Fermer</button>`);
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
        <button class="btn btn-ol danger btn-align-right ripple-effect cancel">Fermer</button>
        <button class="btn btn-sp danger cancel"
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
                    <button class="btn btn-sp primary btn-align-right ripple-effect cancel">Fermer</button>`);
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

$("#new-cat").click(function() {
    showSection("add");
});