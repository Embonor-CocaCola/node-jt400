"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_stream_1 = require("./read_stream");
const write_stream_1 = require("./write_stream");
const path_1 = require("path");
const q = require("q");
function ifs(connection) {
    return {
        createReadStream(fileName) {
            const javaStream = q.when(fileName).then(file => {
                return q.nfcall(connection.createIfsReadStream.bind(connection), file);
            });
            return new read_stream_1.IfsReadStream({
                ifsReadStream: javaStream
            });
        },
        createWriteStream(fileName, options) {
            options = options || { append: false };
            const javaStream = q.when(fileName).then(file => {
                const folderPath = path_1.dirname(file);
                const fileName = path_1.basename(file);
                return q.nfcall(connection.createIfsWriteStream.bind(connection), folderPath, fileName, options.append);
            });
            return new write_stream_1.IfsWriteStream({
                ifsWriteStream: javaStream
            });
        },
        deleteFile(fileName) {
            return q.nfcall(connection.deleteIfsFile.bind(connection), fileName);
        },
        fileMetadata(fileName) {
            return q
                .nfcall(connection.getIfsFileMetadata.bind(connection), fileName)
                .then(JSON.parse);
        }
    };
}
exports.ifs = ifs;
//# sourceMappingURL=index.js.map