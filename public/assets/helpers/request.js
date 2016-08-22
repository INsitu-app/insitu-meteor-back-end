/**
 *
 */
var Request = (function () {
    /**
     *
     * @constructor
     */
    function Request() {
        this.query = {};
        this.hashes = window.location.hash.replace("#/", '').split("&");

        for (var key in this.hashes) {
            if (this.hashes.hasOwnProperty(key)) {
                var values = this.hashes[key].split("=");

                if (values.length) {
                    this.query[values[0]] = values[1] || null;
                }
            }
        }
    }

    /**
     *
     * @returns {{}|*}
     */
    Request.prototype.all = function () {
        return this.query || {};
    };

    /**
     *
     * @param key
     * @returns {*|null}
     */
    Request.prototype.get = function (key) {
        return this.query[key] || null;
    };

    /**
     *
     * @param key
     * @param value
     */
    Request.prototype.set = function (key, value) {
        this.query[key] = value;
    };

    /**
     *
     * @returns {*}
     */
    Request.prototype.hash = function () {
        var hash = "/";

        for (var key in this.query) {
            if (this.query.hasOwnProperty(key)) {
                hash += ((this.query[key]) ? key + "=" + this.query[key] : key) + "&";
            }
        }

        return hash.replace(new RegExp("[&]+$"), "");
    };

    return Request;
})();
