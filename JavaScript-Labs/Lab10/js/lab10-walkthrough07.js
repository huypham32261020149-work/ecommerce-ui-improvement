/* put your animation code here */
$(function () { 
    // Xoa preview khi chuot roi anh
  function removePreview() {
    $(this).removeClass("gray");
    $("#preview").remove();
  }

  // Di chuyen preview theo chuot
  function movePreview(e) {
    $("#preview")
      .css("top", (e.pageY - 10) + "px")
      .css("left", (e.pageX + 30) + "px");
  }
$('figure img').on('mouseover', function (e) {
// construct preview filename based on existing img
var alt = $(this).attr('alt');
var src = $(this).attr('src');        
var newsrc = src.replace("small","medium");
// make dynamic element with larger preview image and caption
var preview = $('<div id="preview"></div>');
var image = $('<img src="' + newsrc + '">');
var caption = $('<p>' + alt + '</p>');
preview.append(image);
preview.append(caption);
$('body').append(preview);
// make small image gray
$(this).addClass("gray");
// and then fade preview in
$("#preview").fadeIn(1000);   

});   
// Xoa preview khi chuot roi anh
  $("figure img").on("mouseleave", removePreview);

  // Cap nhat vi tri preview
  $("figure img").on("mousemove", movePreview);
});

