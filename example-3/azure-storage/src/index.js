const express = require("express");
const azure = require('azure-storage');

const app = express();

//
// Throws an error if the any required environment variables are missing.
//

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error("Please specify the name of an Azure storage account in environment variable STORAGE_ACCOUNT_NAME.");
}

if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error("Please specify the access key to an Azure storage account in environment variable STORAGE_ACCESS_KEY.");
}

//
// Extracts environment variables to globals for convenience.
//

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

console.log(`Serving videos from Azure storage account ${STORAGE_ACCOUNT_NAME}.`);

//
// Create the Blob service API to communicate with Azure storage.
//
function createBlobService() {
    const blobService = azure.createBlobService(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    // Uncomment next line for extra debug logging.
    //blobService.logger.level = azure.Logger.LogLevels.DEBUG;
    return blobService;
}

//
// Registers a HTTP GET route to retrieve videos from storage.
//
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

        //
        // Writes HTTP headers to the response.
        //
        res.writeHead(200, {
            "Content-Length": properties.contentLength,
            "Content-Type": "video/mp4",
        });

        //
        // Streams the video from Azure storage to the response.
        //
        blobService.getBlobToStream(containerName, videoPath, res, err => {
            if (err) {
                console.error(`Error occurred getting video ${containerName}/${videoPath} to stream.`);
                console.error(err && err.stack || err);
                res.sendStatus(500);
                return;
            }
        });
    });
});

//
// Starts the HTTP server.
//
app.listen(PORT, () => {
    console.log(`Microservice online`);
});
