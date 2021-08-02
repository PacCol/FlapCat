function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " an(s)";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " moi(s)";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " jour(s)";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " heure(s)";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minute(s)";
    }
    return Math.floor(seconds) + " seconde(s)";
}

function loadEntries() {
    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/entry",

        success: function(response) {
            loader(false);
            loadLastEntries(response);
            loadDiagram(response);
        },

        error: function() {
            loader(false);
            networkError();
        },

        timeout: 3000
    });
}

function loadLastEntries(response) {

    $("#analytics tbody").empty();

    if (response === undefined) {
        return;
    } else if (response.length == 0) {
        return;
    }

    lastEntries = []

    for (let i = 0; i < response.length; i++) {
        if (response[i].authorized) {
            lastEntries.push(response[i]);
        }
    }

    for (let i = 0; i < lastEntries.length && i < 5; i++) {

        var date = lastEntries[i].entryDate;
        date = date.replaceAll('"', "");
        date = new Date(date);
        formattedDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + ", à " + date.getHours() + ":" + date.getMinutes();

        var line = `
            <tr>
                <td>${lastEntries[i].name}</td>
                <td><span data-tooltip="${formattedDate}">il y a ${timeSince(date)}</span></td>
            </tr>`
        $("#analytics tbody").append(line);
    }
}

function loadDiagram(response) {

    $("#diagram").empty();

    if (response === undefined) {
        return;
    } else if (response.length == 0) {
        return;
    }

    var names = []

    for (let i = 0; i < response.length; i++) {
        if (names.indexOf(response[i].name) < 0) {
            names.push(response[i].name);
        }
    }

    var values = [0, 0];

    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < response.length; j++) {
            if (response[j].name == names[i]) {
                values[i]++;
            }
        }
    }

    for (let i = 0; i < values.length; i++) {
        values[i] = values[i] / response.length * 100;
        values[i] = Math.trunc(values[i]);
    }

    var colors = [];

    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < response.length; j++) {
            if (response[j].name == names[i]) {
                colors[i] = response[j].authorized;
                break;
            }
        }
    }

    for (let i = 0; i < colors.length; i++) {
        if (colors[i]) {
            colors[i] = "success";
        } else if (names[i] == "Unknown") {
            colors[i] = "danger";
            names[i] = "Inconnu"
        } else {
            colors[i] = "warning";
        }
    }

    createDiagram("#diagram", names, colors, values);
}

$("#reset-analytics").click(function() {
    resetAnalytics();
});

function resetAnalytics() {
    alertBox("Avertissement", "Êtes-vous certain de vouloir réinitialiser les statistiques ? Cette opération est irréversible.", `
        <button class="btn btn-secondary btn-align-right ripple-effect cancel">Fermer</button>
        <button class="btn btn-primary ripple-effect cancel"
        onclick="resetAnalyticsConfirmed()">Réinitialiser</button>`);
}

function resetAnalyticsConfirmed() {

    loader(true);

    $.ajax({
        type: "POST",
        url: "/api/entry/reset",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-access-token", localStorage.getItem("token"));
        },

        success: function() {
            loader(false);
            loadLastEntries();
            loadDiagram();
        },

        error: function(xhr, ajaxOptions, thrownError) {
            loader(false);
            networkError(thrownError);
        },

        timeout: 3000
    });
}