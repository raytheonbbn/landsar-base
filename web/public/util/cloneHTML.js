/**
 * Takes parent div and saves state, returns variable storing this state
 * NOTE: does not account for textareas
 * see https://stackoverflow.com/questions/30108938/save-html-form-layout-and-values-with-jquery
  */
function cloneHTML(parentElement){
    let $clone = $(parentElement).clone()

    $clone.find(':input').each(function () {
        var $input = $(this);
        // start an attribute object later use with attr()
        var attrs = {
            value: $input.val()
        }
        // case for radios and checkbox
        if ($input.is(':radio,:checkbox')) {
            if (this.checked) {
                attrs.checked = 'checked'
            } else {
                // make sure attributes are removed that might be there from initial load
                $input.removeAttr('checked');
            }
        }
        // add the attributes to element
        $input.attr(attrs);

    });

    return $clone.html();
}
