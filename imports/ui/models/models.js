import "./models.html";
import "./models.less";

import "./uploads/uploads.js";
import "./editor/editor.js";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { ReactiveVar } from "meteor/reactive-var"
import { Router } from "meteor/iron:router";

import { Models } from "../../api/models.js";
import { Collections } from "../../api/collections.js";

import { copyToClipboard } from "../../helpers/clipboard.js";

function droppable() {
    $("[data-event='droppable-model'] li").droppable({
        tolerance: 'pointer',
        over(event, ui) {
            $(event.target).css({
                "background-color": "#ccc"
            });
        },
        out(event, ui) {
            $(event.target).css({
                "background-color": ""
            });
        },
        drop(event, ui) {
            let $target = $(event.target).css({
                "background-color": ""
            });

            let id = $(ui.helper).data('bind-id');
            let collection = $target.data("bind-collection");

            Models.update({
                _id: id
            }, {
                $set: {
                    collection: collection
                }
            });
        }
    });
}

function draggable() {
    $("[data-event='draggable-model']").draggable({
        revert: true,
        appendTo: "body",
        zIndex: 100000,
        start(event, ui) {
            $(ui.helper).css({
                "opacity": 0.5
            });
        },
        stop(event, ui) {
            $(ui.helper).css({
                "opacity": ""
            });
        }
    });
}

/**
 * Collection item
 */
Template.collectionItem.onRendered(function () {
    droppable();
});

Template.collectionItem.helpers({
    isActiveCollection(collection) {
        return Router.current().params.collection === collection;
    }
});

/**
 * Model item
 */
Template.modelItem.onRendered(function () {
    draggable();
});

/**
 * Base template
 */
Template.models.onCreated(function () {
    this.modelList = new ReactiveVar();
});

Template.models.onRendered(function () {
    $(window).off().on("scroll", () => {
        if (window.scrollY >= 49) {
            $(".sidebar").css({
                top: 0
            });
        } else {
            $(".sidebar").css({
                top: 50 - window.scrollY
            });
        }
    });
});

Template.models.helpers({
    isActiveCollection(collection) {
        return Router.current().params.collection === collection;
    },
    modelList() {
        let query = {
            owner: Meteor.userId()
        };

        if (Router.current().params.collection) {
            query.collection = Router.current().params.collection;
        }

        Template.instance().modelList.set(Models.find(query));

        return Template.instance().modelList.get()
    },
    collectionList() {
        return Collections.find({
            owner: Meteor.userId()
        });
    },
    onPreviewUpload() {
        return {
            finished(index, fileInfo, template) {
                let $input = $(template.find("input[type=file]"));

                //fileInfo.url = `/upload/${fileInfo.subDirectory}/${fileInfo.name}`;

                Models.update({
                    _id: $input.data("bind-id")
                }, {
                    $set: {
                        image: fileInfo
                    }
                });
            }
        }
    },
    onDumpUpload() {
        return {
            finished(index, fileInfo, template) {
                fileInfo.url = `/upload/${fileInfo.subDirectory}/${fileInfo.name}`;

                console.log(index, fileInfo);
            }
        }
    }
});

Template.models.events({
    "click [data-event='collection-add']"() {
        let $currentModal = $('#collection-add');

        $currentModal.find('[data-bind="collection-name"]').val('');
        $currentModal.modal('show');

        return false;
    },
    "dblclick [data-event='collection-rename']"() {
        let $currentModal = $('#collection-rename');

        $currentModal.find('[data-bind="collection-id"]').val(this._id);
        $currentModal.find('[data-bind="collection-name"]').val(this.name);
        $currentModal.modal('show');

        return false;
    },
    "click [data-event='collection-close']"() {
        let $currentModal = null;
        let $addModal = $('#collection-add');
        let $renameModal = $('#collection-rename');

        if ($addModal.hasClass('in')) {
            $currentModal = $addModal;
            $currentModal.mode = 'add';
        } else if ($renameModal.hasClass('in')) {
            $currentModal = $renameModal;
            $currentModal.mode = 'rename';
        }

        let $id = $currentModal.find("[data-bind='collection-id']");
        let $name = $currentModal.find("[data-bind='collection-name']");

        $name.parent().removeClass("has-error");
        $name.parent().removeClass("has-warning");

        $($currentModal).modal('hide');

        $id.val('');
        $name.val('');
    },
    "click [data-event='collection-save']"() {
        let $currentModal = null;
        let $addModal = $('#collection-add');
        let $renameModal = $('#collection-rename');

        if ($addModal.hasClass('in')) {
            $currentModal = $addModal;
            $currentModal.mode = 'add';
        } else if ($renameModal.hasClass('in')) {
            $currentModal = $renameModal;
            $currentModal.mode = 'rename';
        }

        let $id = $currentModal.find("[data-bind='collection-id']");
        let $name = $currentModal.find("[data-bind='collection-name']");

        $name.parent().removeClass("has-error");
        $name.parent().removeClass("has-warning");

        if (!$name.val().length) {
            $name.parent().addClass("has-error");
            return false;
        }

        if (["all", "without"].indexOf($name.val().toLowerCase()) !== -1) {
            $name.parent().addClass("has-error");
            return false;
        }

        let collection = Collections.findOne({
            name: $name.val(),
            owner: Meteor.userId()
        });

        if (collection) {
            $name.parent().addClass("has-warning");
            return false;
        }

        if ($currentModal.mode == 'add') {
            Collections.insert({
                name: $name.val(),
                owner: Meteor.userId()
            });
        } else if ($currentModal.mode == 'rename') {
            Collections.update({
                _id: $id.val()
            }, {
                $set: {
                    name: $name.val()
                }
            });
        }

        $($currentModal).modal('hide');

        $id.val('');
        $name.val('');

        let query = {
            owner: Meteor.userId()
        };

        if (Router.current().params.collection) {
            query.collection = Router.current().params.collection;
        }

        Template.instance().modelList.set(Models.find(query));
    },
    "click [data-event='collection-remove']"() {
        Collections.remove({
            _id: this._id
        });

        let query = {
            owner: Meteor.userId()
        };

        if (Router.current().params.collection) {
            query.collection = Router.current().params.collection;
        }

        Template.instance().modelList.set(Models.find(query));

        if (Router.current().params.collection == this._id) {
            Router.go("models");
        }
    },
    "click [data-event='model-remove']"() {
        if (confirm("Remove this model?")) {
            Models.remove({_id: this._id});
        }
    },
    "click [data-event='copy-iframe']"() {
        let $alert = $(".alert-copy");

        let width = 560;
        let height = 315;

        let page = `?only&page=viewer&model=${this._id}`;
        // let link = `http://138.68.144.164:3005/${page}`;
        let link = `http://138.68.128.66:3005/${page}`;

        let iframe = `<iframe width="${width}" height="${height}" src="${link}" frameborder="0" allowfullscreen></iframe>`;

        copyToClipboard(iframe, (err, status) => {
            $alert
                .removeClass("alert-success")
                .removeClass("alert-danger")
                .addClass(status ? "alert-success" : "alert-danger")
                .fadeIn()
                .find(".message").text(status ? "The text is on the clipboard, try to paste it!" : "Unsupported browser!");

            let timeout = setTimeout(() => {
                $alert.fadeOut();
                clearTimeout(timeout);
            }, 3000);
        });

        return false;
    },
    "click [data-event='copy-link']"() {
        let $alert = $(".alert-copy");

        let page = `?page=viewer&model=${this._id}`;
        // let link = `http://138.68.144.164:3005/${page}`;
        let link = `http://138.68.128.66:3005/${page}`;

        copyToClipboard(link, (err, status) => {
            $alert
                .removeClass("alert-success")
                .removeClass("alert-danger")
                .addClass(status ? "alert-success" : "alert-danger")
                .fadeIn()
                .find(".message").text(status ? "The text is on the clipboard, try to paste it!" : "Unsupported browser!");

            let timeout = setTimeout(() => {
                $alert.fadeOut();
                clearTimeout(timeout);
            }, 3000);
        });

        return false;
    },
    "click [data-event='alert-close']"(event) {
        $(event.currentTarget).closest(".alert").fadeOut();
    },

    "submit [data-event='upload']"(event) {
        let form = $(event.target).get(0);
        let data = new FormData(form);

        $.ajax({
            type: "POST",
            url: "/api/upload",
            data: data,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: false
        }).done((response) => {
            console.log(response);
        });

        //let models = Models.find().fetch();
        //
        //models.forEach((model) => {
        //    model.uploads.forEach((upload) => {
        //        upload.url = upload.url.replace(/http:\/\/(.+):3000\//g, 'asdasd')
        //    });
        //
        //    Models.update({ _id: model._id }, {
        //        $set: {
        //            uploads: model.uploads
        //        }
        //    });
        //});

        return false;
    }
});

/**
 * Upload dump
 */
Template.uploadDump.onCreated(function () {
    Uploader.init(Template.instance());
});

Template.uploadDump.onRendered(function () {
    Uploader.render.call(Template.instance());
});

Template.uploadDump.events({
    "fileuploadadd"(event, template, data) {
        data.formData = {
            method: "restore"
        };

        data.process().done(() => {
            data.submit();
        });
    }
});

/**
 * Upload preview
 */
Template.uploadPreview.onCreated(function () {
    Uploader.init(Template.instance());
});

Template.uploadPreview.onRendered(function () {
    Uploader.render.call(Template.instance());
});

Template.uploadPreview.events({
    "fileuploadadd"(event, template, data) {
        let model = Models.findOne({
            _id: $(event.target).data("bind-id")
        });

        if (model) {
            data.formData = {
                id: model._id,
                folder: model.name,
                method: "preview"
            };

            data.process().done(() => {
                data.submit();
            });
        }
    }
});
