$("#analytics-button").click(function() {
    loadLastEntries();
});

function loadLastEntries() {

    $("#analytics tbody").empty();

    loader(true);

    $.ajax({
        type: "GET",
        url: "/api/entry",

        success: function(response) {
            loader(false);

            for (let i = 0; i < response.length; i++) {

                var date = response[i].entryDate;
                data = date.replace("'", "");
                console.log(date);
                date = new Date(date.toJSON());
                console.log(date);

                var line = `
                    <tr>
                        <td>${response[i].name}</td>
                        <td>${response[i].entryDate}</td>
                    </tr>`
                $("#analytics tbody").append(line);
            }
        },

        error: function() {
            loader(false);
            networkError();
        }
    });
}