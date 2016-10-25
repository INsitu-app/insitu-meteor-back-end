//cut

export function copyToClipboard(value, done) {
    var range = document.createRange();

    // For IE.
    if (window.clipboardData) {
        window.clipboardData.setData("Text", value);
        done(null, true);
    } else {
        // Create a temporary element off screen.
        var tmpElem = $("<div>").css({
            position: "absolute",
            left: "-1000px",
            top: "-1000px"
        });

        // Add the $input value to the temp element.
        tmpElem.text(value);

        $(document.body).append(tmpElem);

        // Select temp element.
        range.selectNodeContents(tmpElem.get(0));

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Lets copy.
        try {
            var success = document.execCommand("copy", false, null);

            if (success) {
                done(null, true);
            } else {
                done(true, false);
            }
        }
        catch (err) {
            window.prompt("Copy to clipboard: Ctrl+C, Enter", value);
            done(err, true);
        }

        tmpElem.remove();
    }
}
