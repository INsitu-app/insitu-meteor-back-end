var Material = (function () {
    function Material() {
        this.texture = new Texture();
    }

    Material.prototype.save = function (material) {

    };

    Material.prototype.reset = function () {

    };

    Material.prototype.grass = function (material, params) {
        params = params || {};

        material.transparent = params.transparent || true;

        return material;
    };

    Material.prototype.glass = function (material, params) {
        params = params || {};

        material.map = null;
        material.bumpMap = null;
        material.envMap = params.envMap || this.texture.get("envMap");
        material.color = new THREE.Color(params.color || "#444444");
        material.specular = new THREE.Color(params.specular || "#777777");
        material.transparent = params.transparent || true;
        material.opacity = params.opacity || 0.5;
        material.reflectivity = params.reflectivity || 0.25;
        material.shininess = params.shininess || 100;
        material.needsUpdate = true;

        return material;
    };

    Material.prototype.metal = function (material, params) {
        params = params || {};

        material.map = null;
        material.color = new THREE.Color(params.color || "#222222");
        material.specular = new THREE.Color(params.specular || "#bbbbbb");
        material.envMap = params.envMap || this.texture.get("envMap");
        material.bumpMap = params.bumpMap || this.texture.get("metalBumpMap");
        material.bumpScale = params.bumpScale || 0.00015;
        material.shininess = params.shininess || 50;
        material.reflectivity = params.reflectivity || 0.05;
        material.needsUpdate = true;

        return material;
    };

    Material.prototype.anisotropy = function(material, anisotropy) {
        if (material.map) {
            material.map.anisotropy = anisotropy;
        }

        if (material.envMap) {
            material.envMap.anisotropy = anisotropy;
        }

        if (material.bumpMap) {
            material.bumpMap.anisotropy = anisotropy;
        }

        return material;
    };

    return Material;
})();
