function popover(){
	$("[data-toggle=popover]").popover({
 		html : true,
        content: function() {
          var content = $(this).attr("data-popover-content");
          return $(content).get(0).outerHTML;
        }
	});

	$("[data-toggle=popover]").children().click(function(){

		$(this).parents($("[data-toggle=popover]")).focus();

	});	

}