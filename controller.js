/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    Some parts of this code are based on ChatGPT-generated code examples.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const fileCheck = require('./utils/file-check');

const views_path = path.join(__dirname, 'views');


const get_home = (req, res, next) => {
    return res.sendFile(path.join(views_path, 'index.html'));
}

const post_file = async (req, res, next) => {
    let xmiFilePath = '';
    try {
        // Check that the uploaded file exists, has .xmi or .uml extension, and has 'application/xmi+xml' MIME type
        fileCheck.check_xmi_file(req.file, 'uml');

        xmiFilePath = req.file.path;
        const uniqueId = uuidv4();
        const outputDir = `output/${uniqueId}`;
        const outputZip = `output/${uniqueId}.zip`;

        // TODO: Perform XMI parsing and code generation here
        // TODO: Replace this section with your own logic to transform the XMI file into code

        // Create the output directory
        fs.mkdirSync(outputDir);

        // Save the JSON object as a file
        const jsonObject = { example: 'data' };
        fs.writeFileSync(`${outputDir}/model.json`, JSON.stringify(jsonObject));

        // Create a zip archive of the output directory
        const output = fs.createWriteStream(outputZip);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(outputDir, false);
        archive.finalize();

        // Provide the ZIP file for download
        output.on('close', () => {
            res.download(outputZip, 'generated_code.zip', () => {
                // Clean up the output directory and ZIP file after download
                fs.rmSync(outputDir, { recursive: true });
                fs.unlinkSync(outputZip);
            });
        });
    } catch (error) {
        if (error.filepath)
            xmiFilePath = error.filepath
        next(error);
    } finally {
        // Remove the temporary XMI file if exists:
        if (xmiFilePath)
            fs.unlinkSync(xmiFilePath);
    }

}

const page_not_found = (req, res, next) => {
    return res.status(404).sendFile(path.join(views_path, '404.html'));
}

const error_handler = (error, req, res, next) => {
    console.error(error);
    let statuscode = 500;
    if (error.code)
        statuscode = error.code;
    if (error.error)
        error = error.error;
    return res.status(statuscode).json({ "error message": error.message });

}

module.exports = {
    get_home,
    post_file,
    page_not_found,
    error_handler,
};