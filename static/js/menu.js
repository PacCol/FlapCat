$("#home").show();

$(".menu .menu-button").click(function() {
    var id = $(this).attr("id");

    if (id !== undefined) {
        $(".menu .menu-button").removeClass("menu-button-active");
        $(this).addClass("menu-button-active")
        $(".app > div").hide();
        id = id.split("-")[0];
        $("#" + id).show();
    }
});

$("#profile-button p").text(localStorage.getItem("email").substring(0, 1).toUpperCase());