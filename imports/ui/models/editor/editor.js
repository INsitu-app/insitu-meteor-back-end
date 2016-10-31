import "./editor.html";
import "./editor.less";

import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import { Presets } from "../../../api/presets.js";
import { Models, SaveModelMaterial } from "../../../api/models.js";

Template.editor.onCreated(() => {
    const instance = Template.instance();

    instance.presetsList = new ReactiveVar([]);
    instance.materialsList = new ReactiveVar([]);

    instance.currentMaterial = new ReactiveVar(null);

    $.getJSON("/viewer/materials/mat-lib-auto.json", (json) => {
        let presetsList = [];

        json.textures.forEach((texture) => {
            json.images.forEach((image) => {
                if (texture.image == image.uuid) {
                    texture.image = image.url;
                }
            });
        });

        json.materials.forEach((material, i) => {
            material.color = "#" + ('000000' + material.color.toString(16)).slice(-6);
            material.specular = "#" + ('000000' + material.specular.toString(16)).slice(-6);

            json.textures.forEach((texture) => {
                if (material.map == texture.uuid) {
                    material.map = texture.image;
                }

                if (material.bumpMap == texture.uuid) {
                    material.bumpMap = texture.image;
                }
            });

            presetsList.push({
                _id: i,
                name: material.name,
                typeMap: "none",
                color: material.color,
                specular: material.specular,
                shininess: material.shininess,
                map: material.map || false,
                envMap: false,
                bumpMap: material.bumpMap || false,
                bumpScale: material.bumpScale || 0,
                transparent: material.transparent || false,
                opacity: material.opacity || 1,
                reflectivity: 0
            });
        });

        const presets = Presets.find().fetch();

        presets.forEach((preset) => {
            presetsList.unshift(preset);
        });

        instance.presetsList.set(presetsList);
    });

    window.setCurrentMaterial = (material) => {
        if (material) {
            $(`select[name=list] option`).prop("selected", false);
            $(`select[name=list] option[value=${material.name}]`).prop("selected", true).change();
        }
    };

    window.setMaterialList = (materialList) => {
        if (materialList) {
            let names = [];

            for (var key in materialList.materials) {
                if (materialList.materials.hasOwnProperty(key)) {
                    names.push({
                        name: key
                    });
                }
            }

            instance.materialsList.set(names);
        }
    };

    window.getMaterialList = () => {
        const model = Models.findOne({
            _id: Router.current().params.id
        });

        return model ? model.materials : [];
    };
});

Template.editor.helpers({
    material() {
        const instance = Template.instance();

        return {
            current() {
                return instance.currentMaterial.get();
            },
            list() {
                return instance.materialsList.get();
            }
        }
    },
    preset() {
        const instance = Template.instance();

        return {
            materials() {
                return instance.presetsList.get();
            }
        }
    },
    model() {
        let obj = null;
        let mtl = null;

        const model = Models.findOne({
            _id: Router.current().params.id
        });

        if (model) {
            for (var key in model.uploads) {
                if (model.uploads.hasOwnProperty(key)) {
                    let ext = model.uploads[key].url.split(".").pop();

                    if (ext === "obj") {
                        obj = model.uploads[key].url;
                    }

                    if (ext === "mtl") {
                        mtl = model.uploads[key].url;
                    }
                }
            }
        }

        return {
            obj() {
                return obj;
            },
            mtl() {
                return mtl;
            },
            data() {
                return model;
            }
        }
    }
});

Template.editor.events({
    "change input[name=name]"() {
        $(".save-preset").prop("disabled", false);
    },
    "change input[name=color]"(event) {
        const instance = Template.instance();
        const current = instance.currentMaterial.get();

        if (current) {
            const value = event.target.value;
            const viewer = $("iframe").get(0).contentWindow;

            const material = SaveModelMaterial(Router.current().params.id, current, {
                color: value
            });

            instance.currentMaterial.set(material);

            viewer.setMaterial(material);
        }
    },
    "change input[name=specular]"(event) {
        const instance = Template.instance();
        const current = instance.currentMaterial.get();

        if (current) {
            const value = event.target.value;
            const viewer = $("iframe").get(0).contentWindow;

            const material = SaveModelMaterial(Router.current().params.id, current, {
                specular: value
            });

            instance.currentMaterial.set(material);

            viewer.setMaterial(material);
        }
    },
    "change input[name=shininess]"(event) {
        const instance = Template.instance();
        const current = instance.currentMaterial.get();

        if (current) {
            const value = event.target.value;
            const viewer = $("iframe").get(0).contentWindow;

            const material = SaveModelMaterial(Router.current().params.id, current, {
                shininess: value
            });

            instance.currentMaterial.set(material);

            viewer.setMaterial(material);
        }
    },
    "change input[name=bumpScale]"(event) {
        const instance = Template.instance();
        const current = instance.currentMaterial.get();

        if (current) {
            const value = event.target.value;
            const viewer = $("iframe").get(0).contentWindow;

            const material = SaveModelMaterial(Router.current().params.id, current, {
                bumpScale: value
            });

            instance.currentMaterial.set(material);

            viewer.setMaterial(material);
        }
    },
    "change select[name=list]"(event) {
        const value = event.target.value;
        const viewer = $("iframe").get(0).contentWindow;
        const material = viewer.selectMaterial(value);
        const instance = Template.instance();

        const presets = instance.presetsList.get();

        instance.currentMaterial.set({
            name: material.name,
            typeMap: material.typeMap,
            map: material.params.map || !!material.map,
            envMap: material.params.envMap || !!material.envMap,
            bumpMap: material.params.bumpMap || !!material.bumpMap,
            color: `#${material.color.getHexString()}`,
            specular: `#${material.specular.getHexString()}`,
            transparent: material.transparent,
            opacity: material.opacity,
            reflectivity: material.reflectivity,
            shininess: material.shininess,
            bumpScale: material.bumpScale,
            preset: material.params.preset || ''
        });

        $(".presets .thumbnail").find("button").hide();

        presets.forEach(function (preset) {
            if (material.params.preset == preset.name) {
                $(`.presets .thumbnail[data-preset-in-db=${preset._id}]`).find("button").show();
                return false;
            }
        });
    },
    "click .presets .thumbnail"(event) {
        const instance = Template.instance();
        const current = instance.currentMaterial.get();

        if (current) {
            const id = $(event.currentTarget).attr("data-preset-in-db");
            const viewer = $("iframe").get(0).contentWindow;
            const preset = Presets.findOne({_id: id});

            if (preset) {
                preset.preset = preset.name;
                current.preset = preset.name;

                const material = SaveModelMaterial(Router.current().params.id, current, preset);

                $("input[name=color]").val(preset.color);
                $("input[name=specular]").val(preset.specular);
                $("input[name=shininess]").val(preset.shininess);
                $("input[name=bumpScale]").val(preset.bumpScale);

                $(".presets .thumbnail").find("button").hide();
                $(`.presets .thumbnail[data-preset-in-db=${preset._id}]`).find("button").show();

                instance.currentMaterial.set(material);

                viewer.setMaterial(preset);
            } else {
                const presetsList = instance.presetsList.get();

                presetsList.forEach((preset) => {
                    if (preset._id == id) {
                        preset.preset = preset.name;
                        current.preset = preset.name;

                        const material = SaveModelMaterial(Router.current().params.id, current, preset);

                        $("input[name=color]").val(preset.color);
                        $("input[name=specular]").val(preset.specular);
                        $("input[name=shininess]").val(preset.shininess);
                        $("input[name=bumpScale]").val(preset.bumpScale);

                        $(".presets .thumbnail").find("button").hide();
                        $(`.presets .thumbnail[data-preset-in-db=${preset._id}]`).find("button").show();

                        instance.currentMaterial.set(material);

                        viewer.setMaterial(preset);
                        return false;
                    }
                });
            }
        }
    },
    "click .save-preset"(event) {
        const instance = Template.instance();
        const current = instance.currentMaterial.get();

        if (current) {
            current.name = $("input[name=name]").val();

            Presets.insert(current);

            $(event.target).prop("disabled", true);
        }
    }
});
