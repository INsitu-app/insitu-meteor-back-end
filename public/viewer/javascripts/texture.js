var Texture = (function () {
    function Texture() {
        var envMap = (function () {
            var path = "textures/env/";
            var format = ".jpg";

            var urls = [
                path + "posx" + format, path + "negx" + format,
                path + "posy" + format, path + "negy" + format,
                path + "posz" + format, path + "negz" + format
            ];

            var loader = new THREE.CubeTextureLoader();

            return loader.load(urls, function (texture) {
                texture.format = THREE.RGBFormat;
                texture.needsUpdate = true;
            });
        })();

        var metalBumpMap = (function () {
            var url = "textures/BrushedMetal.png";

            var loader = new THREE.TextureLoader();

            return loader.load(url, function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.format = THREE.RGBFormat;
                texture.repeat.set(10, 10);
                texture.needsUpdate = true;
            });
        })();

        this.mapList = {
            envMap: envMap,
            metalBumpMap: metalBumpMap
        };

        this.cacheList = {};
    }

    Texture.prototype.get = function (key) {
        return this.mapList[key] || null;
    };

    Texture.prototype.set = function (key, material) {
        this.mapList[key] = material;
    };

    Texture.prototype.load = function (file) {
        if (this.cacheList[file]) {
            return this.cacheList[file];
        } else {
            var url = "textures/" + file;

            var loader = new THREE.TextureLoader();

            return this.cacheList[file] = loader.load(url, function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.format = THREE.RGBAFormat;
                texture.repeat.set(1, 1);
                texture.needsUpdate = true;
            });
        }
    };

    return Texture;
})();
