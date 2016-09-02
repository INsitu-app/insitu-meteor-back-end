import "./models.html";
import "./models.less";

import "./uploads/uploads.js";
import "./editor/editor.js";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import { Models } from "../../api/models.js";
import { Collections } from "../../api/collections.js";

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
    UI();
});

Template.models.helpers({
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
    activeCollectionList(collection) {
        return Router.current().params.collection === collection;
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

        let collection = Collections.insert({
            name: $name.val(),
            owner: Meteor.userId()
        });

        $("[data-dismiss='modal']").click();

        $name.val('');
    },
    "click [data-event='model-remove']"(event) {
        let id = $(event.currentTarget).attr("data-id");

        if (confirm("Remove this model?")) {
            Models.remove({ _id: id });
        }
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
