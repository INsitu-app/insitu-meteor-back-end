var Viewer = (function () {
    var editor = window.parent.window || window;

    function Viewer() {
        this.request = new Request();
        this.texture = new Texture();
        this.material = new Material();

        this.mesh = new THREE.Mesh();

        this.init();

        this.lights();
        this.controls();
        this.handlers();
        this.events();

        this.render();

        this.load(this.request.get("obj"), this.request.get("mtl"));

        this.api();
    }

    Viewer.prototype.init = function () {
        this.scene = new THREE.Scene();
        this.scene.name = "Scene";

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = "Raycaster";

        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.name = "Renderer";
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.renderReverseSided = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x1e1e1e);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.name = "Camera";
        this.camera.position.set(0, 1.3, 10);
        this.scene.add(this.camera);
    };

    Viewer.prototype.controls = function () {
        this.control = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.control.target = new THREE.Vector3(0, 1.3, 0);

        this.transform = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(this.transform);
    };

    Viewer.prototype.lights = function () {
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
        this.hemiLight.name = "HemisphereLight";
        this.hemiLight.color.setHSL(0.5, 0.1, 1);
        this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        this.hemiLight.position.set(0, 500, 0);
        this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.dirLight.name = "DirectionalLight";
        this.dirLight.position.set(-1, 0.25, 1);
        this.dirLight.position.multiplyScalar(50);

        this.dirLight.target = this.scene;

        this.dirLight.castShadow = true;

        this.dirLight.shadow.mapSize.height = 2048;
        this.dirLight.shadow.mapSize.width = 2048;

        this.dirLight.shadow.camera.left = -200;
        this.dirLight.shadow.camera.right = 200;
        this.dirLight.shadow.camera.top = 200;
        this.dirLight.shadow.camera.bottom = -200;

        this.dirLight.shadow.camera.near = 10;
        this.dirLight.shadow.camera.far = 500;
        this.scene.add(this.dirLight);

        this.ambientLight = new THREE.AmbientLight(0xe1e1e1);
        this.ambientLight.name = "AmbientLight";
        //this.scene.add(this.ambientLight);
    };

    Viewer.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame((function () {
            this.render();
            this.update();
        }).bind(this));
    };

    Viewer.prototype.update = function () {
        this.control.update();
        this.transform.update();
    };

    Viewer.prototype.handlers = function () {
        var $preloader = $("#preloader");

        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

        THREE.DefaultLoadingManager.onProgress = (function (item, loaded, total) {
            var percent = (loaded / total * 100).toFixed(2) + "%";

            $($preloader).find(".progress > .progress-bar").css({
                width: percent
            });

            $($preloader).show();

        }).bind(this);

        THREE.DefaultLoadingManager.onLoad = (function () {
            $($preloader).find(".progress > .progress-bar").css({
                width: "100%"
            });

            setTimeout((function () {
                $($preloader).hide();
            }).bind(this), 1000);
        }).bind(this);

        THREE.DefaultLoadingManager.onError = (function () {
            $($preloader).find(".progress > .progress-bar").css({
                width: "100%"
            }).text("Sorry, load error");

            $($preloader).show();
        }).bind(this);

        THREE.ShaderLib["phong"].fragmentShader = THREE.ShaderLib["phong"].fragmentShader
            .split("envmap_fragment>")
            .join("envmap_fragment>\n\
                #ifdef USE_ENVMAP\n\
                    if (opacity < 1.0) {\n\
                        float glass = max (0.0, 1.0 + dot (cameraToVertex, worldNormal));\n\
                        outgoingLight += 0.4 * glass * envColor.xyz;\n\
                        float partA = diffuseColor.a * 0.9;\n\
                        diffuseColor.a = partA + (1.0 - partA) * glass;\n\
                    }\n\
                #endif\n"
        );

        document.body.appendChild(this.renderer.domElement);
    };

    Viewer.prototype.load = function (obj, mtl) {
        var loader = new THREE.OBJMTLLoader();

        loader.load(obj, mtl, (function (object, materials) {
            editor.setMaterialList(materials);

            var materialList = editor.getMaterialList();

            $.getJSON("/viewer/materials/mat-lib-auto.json", (function (json) {
                object.traverse((function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.material instanceof THREE.MeshPhongMaterial) {
                            // Done
                            var done = (function () {
                                // Save state
                                child.material.typeMap = child.material.typeMap || "none";

                                child.material.original = child.material.original || child.material.clone();
                                child.material.original.typeMap = child.material.original.typeMap || "none";

                                // Set grass
                                if (child.material.name.indexOf("gc-") === 0 || child.material.name.indexOf("gc_") === 0) {
                                    this.material.grass(child.material);
                                }

                                // Set glass
                                if (child.material.name.indexOf("tg-") === 0 || child.material.name.indexOf("tg_") === 0) {
                                    this.material.glass(child.material);
                                }

                                // Set metal
                                if (child.material.name.indexOf("mt-") === 0 || child.material.name.indexOf("mt_") === 0) {
                                    this.material.metal(child.material);
                                }

                                // Config
                                for (var i = 0; i < materialList.length; i++) {
                                    if (materialList[i].name == child.material.name) {
                                        var params = materialList[i];

                                        child.material.params = params;
                                        child.material.original.params = params;

                                        switch (params.typeMap) {
                                            case "metal":
                                                child.material.map = null;
                                                child.material.envMap = this.texture.get("envMap");
                                                child.material.bumpMap = this.texture.get("metalBumpMap");
                                                break;
                                            case "glass":
                                                child.material.map = null;
                                                child.material.envMap = this.texture.get("envMap");
                                                child.material.bumpMap = null;
                                                break;
                                            default:
                                                child.material.map = typeof params.map == "string" ? this.texture.load(params.map) : child.material.original.map;
                                                child.material.envMap = typeof params.envMap == "string" ? this.texture.load(params.envMap) : child.material.original.envMap;
                                                child.material.bumpMap = typeof params.bumpMap == "string" ? this.texture.load(params.bumpMap) : child.material.original.bumpMap;
                                                break;
                                        }

                                        child.material.color = new THREE.Color(params.color);
                                        child.material.specular = new THREE.Color(params.specular);
                                        child.material.transparent = params.transparent;
                                        child.material.opacity = params.opacity;
                                        child.material.reflectivity = params.reflectivity;
                                        child.material.shininess = params.shininess;
                                        child.material.bumpScale = params.bumpScale;
                                        child.material.needsUpdate = true;
                                        break;
                                    }
                                }

                                // Anisotropy
                                this.material.anisotropy(child.material, this.renderer.getMaxAnisotropy());
                            }).bind(this);

                            // Set matlib
                            Util.forEach(json.materials, function (material) {
                                if (child.material.name.indexOf(material.name.split("-").slice(0, 2).join("_") + "_") === 0) {
                                    child.material.color = new THREE.Color(material.color !== undefined ? material.color : child.material.color);
                                    child.material.specular = new THREE.Color(material.specular !== undefined ? material.specular : child.material.specular);
                                    child.material.emissive = new THREE.Color(material.emissive !== undefined ? material.emissive : child.material.emissive);
                                    child.material.ambient = new THREE.Color(material.ambient !== undefined ? material.ambient : child.material.ambient);
                                    child.material.shininess = material.shininess !== undefined ? material.shininess : child.material.shininess;
                                    child.material.shading = THREE.SmoothShading;
                                    child.material.needsUpdate = true;
                                }
                            });

                            var bmpIndex = child.material.name.indexOf("_bmp");

                            if (bmpIndex > -1) {
                                var resBmpName = '';
                                var bmpPrefix = child.material.name.substring(0, bmpIndex);
                                var bmpPostfix = child.material.name.substring(bmpIndex + 1);
                                var splitPostfix = bmpPostfix.split('_');

                                if (splitPostfix.length == 1) {
                                    resBmpName = bmpPrefix + '_bmp-up-0.3.jpg'
                                } else if (splitPostfix.length == 4) {
                                    resBmpName = bmpPrefix + '_' + splitPostfix[0].toString() + '-' + splitPostfix[1].toString() + '-' + splitPostfix[2].toString() + '.' + splitPostfix[3].toString() + '.jpg';
                                }

                                var url = obj.split("models//").shift() + "textures/" + resBmpName;

                                var loader = new THREE.TextureLoader();

                                var texture = loader.load(url, function (texture) {
                                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                                    texture.format = THREE.RGBAFormat;
                                    texture.repeat.set(1, 1);
                                    texture.needsUpdate = true;

                                    child.material.bumpMap = texture;
                                    child.material.bumpScale = (splitPostfix[2] && splitPostfix[3] ? splitPostfix[2].toString() + '.' + splitPostfix[3].toString() : 0.3) / 8;
                                    child.material.needsUpdate = true;

                                    done();
                                }, undefined, function () {
                                    done();
                                });
                            } else {
                                if (!child.material.bumpMap) {
                                    child.material.bumpMap = child.material.map;
                                    child.material.bumpMap.needsUpdate = true;
                                }

                                done();
                            }
                        }
                    }
                }).bind(this));

                this.transform.attach(object);

                this.scene.add(object);
                this.mesh = object;
            }).bind(this));
        }).bind(this));
    };

    Viewer.prototype.events = function () {
        var mouseup = true;
        var mousedown = false;
        var mousemove = false;
        var dragging = false;

        this.renderer.domElement.addEventListener("mousedown", (function (event) {
            mousedown = true;
        }).bind(this), false);

        this.renderer.domElement.addEventListener("mousemove", (function () {
            if (mousedown) {
                dragging = true;
            }

            mousemove = true;
        }).bind(this), false);

        this.renderer.domElement.addEventListener("mouseup", (function (event) {
            if (dragging) {
                mouseup = true;
                mousemove = false;
                mousedown = false;
                dragging = false;
                return false;
            }

            this.raycaster.setFromCamera(new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            ), this.camera);

            var intersects = this.raycaster.intersectObject(this.mesh, true);

            if (intersects.length) {
                if (intersects[0].object.material) {
                    editor.setCurrentMaterial(intersects[0].object.material);
                }
            }

            mouseup = true;
            mousemove = false;
            mousedown = false;
            dragging = false;
        }).bind(this), false);

        window.addEventListener("resize", (function () {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }).bind(this), false);
    };

    Viewer.prototype.api = function () {
        var material = null;

        window.setMaterial = (function (params) {
            material.params = params;
            material.typeMap = params.typeMap;

            switch (params.typeMap) {
                case "metal":
                    material.map = null;
                    material.envMap = this.texture.get("envMap");
                    material.bumpMap = this.texture.get("metalBumpMap");
                    break;
                case "glass":
                    material.map = null;
                    material.envMap = this.texture.get("envMap");
                    material.bumpMap = null;
                    break;
                default:
                    material.map = typeof params.map == "string" ? this.texture.load(params.map) : material.original.map;
                    material.envMap = typeof params.envMap == "string" ? this.texture.load(params.envMap) : material.original.envMap;
                    material.bumpMap = typeof params.bumpMap == "string" ? this.texture.load(params.bumpMap) : material.original.bumpMap;
                    break;
            }

            material.color = new THREE.Color(params.color);
            material.specular = new THREE.Color(params.specular);
            material.transparent = params.transparent;
            material.opacity = params.opacity;
            material.reflectivity = params.reflectivity;
            material.shininess = params.shininess;
            material.bumpScale = params.bumpScale;
            material.needsUpdate = true;

            // Anisotropy
            this.material.anisotropy(material, this.renderer.getMaxAnisotropy());
        }).bind(this);

        window.selectMaterial = (function (name) {
            this.mesh.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    if (child.material && child.material.name === name) {
                        material = child.material;
                    }
                }
            });

            material.temp = material.clone();
            material.temp.params = material.params || {};
            material.temp.typeMap = material.temp.typeMap || "none";

            material.color = new THREE.Color(0x4dcc7a);

            setTimeout(function () {
                material.color = new THREE.Color(material.temp.color);
            }, 250);

            return material.temp;
        }).bind(this);
    };

    return Viewer;
})();
