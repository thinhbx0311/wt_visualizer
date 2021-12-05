var valueSlider = 00;
$(document).ready(function () {
    var speakerON = true;

    // // Internet Explorer 6-11
    // var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // // Edge 20+
    // var isEdge = !isIE && !!window.StyleMedia;
    // if (isIE || isEdge) {
    //     alert("The browser which you're using is not fully-supported. Switch to another browser to continue.");
    //     $('body').css('display', 'none');
    // }

    function closedButton() {
        $(".button-bottom").toggleClass("button-bottom-hide");
        $("#corner-button-top").css("display", "inline-block");
        DongCua();
    }
    $(".function-button").on("click tap", function () {
        closedButton();
    });

    $('.button-select').width($('#select-a-car').width());
    $('.button-select').css('min-width', '139px');
    $("#speaker-button").on("click tap", function speakerActive() {
        if (speakerON) {
            $("#speaker-button").html("<i class='fas fa-volume-off' style= 'padding-bottom: 1.5px;'>&nbsp</i>");
            speakerON = false;
        } else {
            $("#speaker-button").html("<i class='fas fa-volume-up' style= 'padding-bottom: 1.5px;'>&nbsp</i>");
            speakerON = true;
        }
    });
});