import fs from "fs";
import path from "path";

Meteor.startup(() => {
    const root = Meteor.absolutePath;

    UploadServer.init({
        tmpDir: `${root}/uploads/tmp`,
        uploadDir: `${root}/uploads`,
        checkCreateDirectories: true,
        getDirectory(fileInfo, formData) {
            switch (formData.method) {
                case "preview":
                    return `${formData.folder}/previews/`;
                default:
                    let folder = "misc";

                    if (fileInfo.type.indexOf("application/") === 0) {
                        folder = "models";
                    }

                    if (fileInfo.type.indexOf("image/") === 0) {
                        folder = "textures";
                    }

                    if (formData.model) {
                        return `${formData.model}/${folder}/`;
                    }

                    return `others/${folder}/`;
            }
        },
        getFileName(fileInfo, formData) {
            return fileInfo.name;
        },
        finished(fileInfo, formData) {
            if (formData.model) {
                let ext = fileInfo.url.split(".").pop();

                if (ext === "mtl") {
                    fs.readFile(`${root}/uploads/${fileInfo.path}`, (err, data) => {
                        if (err) {
                            throw err;
                        }

                        let mtl = data.toString().replace(/(map_Ka|map_Kd|map_Bump|bump) (.+)/g, (match, p1, p2) => {
                            if (p1 && p2) {
                                p2 = p2.replace(/\\|\//g, "/");
                                p2 = p2.split("/").pop();

                                return `${p1} upload/${formData.model}/textures/${p2}`;
                            }

                            return match;
                        });

                        fs.writeFile(`${root}/uploads/${fileInfo.path}`, mtl, (err, data) => {
                            if (err) {
                                throw err;
                            }
                        });
                    });
                }
            }
        }
    });
});
