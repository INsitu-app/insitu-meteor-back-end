import "./models.html";
import "./models.less";

import "./uploads/uploads.js";
import "./editor/editor.js";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Router } from "meteor/iron:router";

import { Models } from "../../api/models.js";
import { Collections } from "../../api/collections.js";

import { copyToClipboard } from "../../helpers/clipboard.js";

function UI() {
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

    $("[data-event='droppable-model-area'] li").droppable({
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

            let id = $(ui.helper).find("[data-id]").attr("data-id");
            let collection = $target.attr("data-collection");

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

Template.models.onRendered(() => {
    $(window).off().on("scroll", function (event) {
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

    UI();
});

Template.models.helpers({
    isActiveCollection(collection) {
        return Router.current().params.collection === collection;
    },
    modelList() {
        UI();

        let query = {
            owner: Meteor.userId()
        };

        let collection = Router.current().params.collection;

        if (collection) {
            query.collection = collection;
        }

        return Models.find(query);
    },
    collectionList() {
        UI();

        return Collections.find({
            owner: Meteor.userId()
        });
    },
    onPreviewUpload() {
        return {
            finished(index, file, template) {
                let $input = $(template.find("input[type=file]"));

                Models.update({
                    _id: $input.attr("data-form-id")
                }, {
                    $set: {
                        image: file
                    }
                });
            }
        }
    }
});

Template.models.events({
    "click [data-event='collection-save']"(event) {
        let $name = $("[data-event='collection-name']");

        if (!$name.val().length) {
            $name.parent().addClass("has-error");
            return false;
        }

        let collection = Collections.findOne({name: $name.val()});

        if (collection) {
            $name.parent().addClass("has-warning");
            return false;
        }

        Collections.insert({
            name: $name.val(),
            owner: Meteor.userId()
        });

        $("[data-dismiss='modal']").click();

        $name.val('');
    },
    "click [data-event='collection-remove']"(event) {
        let id = $(event.currentTarget).closest("li").attr("data-collection");

        Collections.remove({
            _id: id
        });

        if (Router.current().params.collection == id) {
            Router.go("models");
        }
    },
    "click [data-event='model-remove']"(event) {
        let id = $(event.currentTarget).attr("data-id");

        if (confirm("Remove this model?")) {
            Models.remove({_id: id});
        }
    },
    "click [data-event='copy-iframe']"(event) {
        let $alert = $(".alert-copy");

        let width = 560;
        let height = 315;

        let page = `?page=viewer&query=${this._id}`;
        let link = `http://138.68.144.164:3005/${page}`;

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

        let page = `?page=viewer&query=${this._id}`;
        let link = `http://138.68.144.164:3005/${page}`;

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
    }
});

Template.uploadPreview.created = () => {
    Uploader.init(Template.instance());
};

Template.uploadPreview.rendered = () => {
    Uploader.render.call(Template.instance());
};

Template.uploadPreview.events({
    "fileuploadadd"(event, template, data) {
        let model = Models.findOne({
            _id: $(event.target).attr("data-form-id")
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
