$("#cats-button").click(function() {
    loadCats();
});

function loadCats() {

    $("#cats tbody").empty();

    removeContextMenu("tr");

    loader();

    $.ajax({
        type: "GET",
        url: "/api/cat/list",

        success: function(response) {
            loader();

            for (let i = 0; i < response.length; i++) {

                if (response[i].authorized) {
                    var contextMenu = `<div class="item"><i class="material-icons-round success">drive_file_rename_outline</i>Renommer</div>
                    <div class="item" onclick="authorizeCat('${response[i].name}', false);"><i class="material-icons-round warning">login</i>Interdire</div>
                    <div class="item" onclick="deleteCat('${response[i].name}');"><i class="material-icons-round danger">delete</i>Supprimer</div>`
                } else {
                    var contextMenu = `<div class="item"><i class="material-icons-round success" onclick="">drive_file_rename_outline</i>Renommer</div>
                    <div class="item" onclick="authorizeCat('${response[i].name}', true);"><i class="material-icons-round warning">login</i>Autoriser</div>
                    <div class="item" onclick="deleteCat('${response[i].name}');"><i class="material-icons-round danger">delete</i>Supprimer</div>`
                }

                if (response[i].authorized) {
                    response[i].authorized = "Autorisé(e) à rentrer";
                } else {
                    response[i].authorized = "Pas autorisé(e) à rentrer";
                }

                var line = `
                    <tr>
                        <td>
                            <input type="text" maxlength="10" class="editable-value" value="${response[i].name}"></input>
                        </td>
                        <td>${response[i].authorized}</td>
                    </tr>`
                $("#cats tbody").append(line);

                addContextMenu(contextMenu, "tr:nth-child(" + (i + 1).toString() + ")");
            }
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError();
        }
    });
}

function authorizeCat(catName, permitted) {

    loader();

    $.ajax({
        type: "POST",
        url: "/api/cat/permissions",
        data: { name: catName, authorized: permitted },

        success: function(response) {
            loader();
            loadCats();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError();
        }
    });
}

function deleteCat(catName) {

    loader();

    $.ajax({
        type: "POST",
        url: "/api/cat/delete",
        data: { name: catName },

        success: function(response) {
            loader();
            loadCats();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader();
            networkError();
        }
    });
}