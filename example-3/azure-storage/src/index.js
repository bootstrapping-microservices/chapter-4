const express = require("express");
const azure = require('azure-storage');

const app = express();
const port = 3000;


if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error("Please specify the name of an Azure storage account in environment variable STORAGE_ACCOUNT_NAME.");
}

const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
console.log(`Serving videos from Azure storage account ${STORAGE_ACCOUNT_NAME}.`);

if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error("Please specify the access key to an Azure storage account in environment variable STORAGE_ACCESS_KEY.");
}

const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

//
// Create the Blob service API to communicate with Azure storage.
//
function createBlobService() {
	const blobService = azure.createBlobService(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    //blobService.logger.level = azure.Logger.LogLevels.DEBUG; Uncomment this line for extra debug logging.
    return blobService;
}

app.get("/video", (req, res) => {

    const videoPath = req.query.path;
    console.log(`Streaming video from path ${videoPath}.`);

    const blobService = createBlobService();

    const containerName = "videos";
    blobService.getBlobProperties(containerName, videoPath, (err, properties) => { // Sends a HTTP HEAD request to retreive video size.
        if (err) {
            console.error(`Error occurred getting properties for video ${containerName}/${videoPath}.`);
            console.error(err && err.stack || err);
            res.sendStatus(500);
            return;
        }

        res.writeHead(200, {
            "Content-Length": properties.contentLength,
            "Content-Type": "video/mp4",
        });

        blobService.getBlobToStream(containerName, videoPath, res, err => { // Stream the video from Azure storage.
            if (err) {
                console.error(`Error occurred getting video ${containerName}/${videoPath} to stream.`);
                console.error(err && err.stack || err);
                res.sendStatus(500);
                return;
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Microservice online`);
});
