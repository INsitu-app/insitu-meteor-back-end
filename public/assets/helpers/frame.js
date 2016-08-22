/**
 *
 */
var Frame = (function () {
    /**
     *
     * @constructor
     */
    function Frame(window) {
        this.window = window;

        this.messeges = {};

        this.window.onmessage = (function(event) {
            if (event.data && event.data.type == "transfer") {
                var key = event.data.key;
                var data = event.data.value;

                if (this.messeges[key]) {
                    this.messeges[key](data);
                } else {
                    console.error("Frame transfer: Function '" + key + "' undefined.");
                }
            }
        }).bind(this);
    }

    Frame.prototype.connect = function (frame) {
        this.frame = frame;
    };

    Frame.prototype.on = function (key, callback) {
        this.messeges[key] = callback;
    };

    Frame.prototype.send = function (key, data) {
        this.frame.postMessage({
            key: key,
            value: data,
            type: "transfer"
        }, "*");
    };

    return Frame;
})();
