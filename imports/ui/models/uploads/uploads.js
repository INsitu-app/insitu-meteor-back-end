import "./uploads.html";
import "./uploads.less";

import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import { Models } from "../../../api/models.js";

Template.uploads.onCreated(function () {
    Session.set("formData", {
        owner: Meteor.userId()
    });
});

var uploadButton = $("<button/>")
    .addClass("btn btn-primary")
    .hide()
    .text("Upload")
    .on("click", function () {
        var $this = $(this);
        var data = $this.data();

        data.submit().done(function () {
            $this.remove();
        });
    });

var removeButton = $("<button/>")
    .text("Remove")
    .addClass("btn btn-sm btn-danger")
    .on("click", function () {
        var $this = $(this);
        var data = $this.data();

        $this.parent().remove();

        if ($("#files").find("li").length == 0) {
            $(".files-added").hide();
            $(".files-empty").show();
        }

        data.abort();
    });

var uploadsData = [];

var uploadCount = 0;
var doneCount = 0;

Template.uploads.events({
    "fileuploadadd"(event, template, data) {
        data.context = $("<div/>").appendTo("#files");

        $.each(data.files, function (index, file) {
            var node = $("<li/>").data(data)
                .append($("<span/>").text(file.name));

            if (!index) {
                node
                    .append("&nbsp;")
                    .append(removeButton.clone(true).data(data))
                    .append(uploadButton.clone(true).data(data))
                    .append("<br>")
            }

            node.appendTo(data.context);
        });

        $(".files-added").show();
        $(".files-empty").hide();
    },
    "fileuploadprogressall"(event, template, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);

        $('.progress').find('.progress-bar').css('width', progress + '%');
    },
    "fileuploadsubmit"(event, template, data) {
        uploadCount++;

        data.formData = Session.get("formData");
    },
    "fileuploaddone"(event, template, data) {
        doneCount++;

        if (data.result && data.result.files[0]) {
            //data.result.files[0].url = `/upload/${data.result.files[0].subDirectory}/${data.result.files[0].name}`;
            uploadsData.push(data.result.files[0]);
        }

        if (uploadCount == doneCount) {
            let formData = Session.get("formData");
            let collection = Router.current().params.collection;

            let id = Models.insert({
                name: formData.model || null,
                owner: formData.owner || null,
                collection: collection !== "uploads" ? collection : "all",
                image: "",
                uploads: uploadsData,
                materials: []
            });

            setTimeout(() => {
                Router.go("editor", {
                    id: id
                });
            }, 350);
        }
    }
});

Template.uploadModel.created = function () {
    Uploader.init(this);
};

Template.uploadModel.rendered = function () {
    Uploader.render.call(this);
};

Template.uploadModel.events({
    "change input[name=name]"(event) {
        let $name = $(event.target);

        $name.parent().toggleClass("has-error", !$name.val().length);
    },
    "click .start"(event) {
        let $name = $("form input[name=name]");

        if (!$name.val().length) {
            $name.parent().addClass("has-error");
            return false;
        }

        Session.set("formData", {
            model: $name.val(),
            owner: Meteor.userId()
        });

        $("#files").find("li").each(function (index, node) {
            var data = $(node).data();

            data.submit().done(function () {
                $(node).html($(node).find("span").text() + " - <span class='text-success'>upload success</span>");
            });
        });
    }
});
