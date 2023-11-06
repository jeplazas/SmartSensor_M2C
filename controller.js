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
const xmi_parser = require('./utils/xmi-parser');
const model_formatter = require('./utils/app-model-formatter');
const { generate_application_code } = require('./utils/app-code-generator');

const views_path = path.join(__dirname, 'views');


const get_home = (req, res, next) => {
    return res.sendFile(path.join(views_path, 'index.html'));
}

const post_file = async (req, res, next) => {
    let xmiFilePath = '';
    try {
        // Check that the uploaded file exists, has .xmi or .uml extension, and has 'application/xmi+xml' MIME type
        fileCheck.check_xmi_file(req.file, 'uml');
        // Check if the author name is valid:
        let author = "anonymous author"
        if (req.body != null && req.body.authorName != null && typeof req.body.authorName === "string" && req.body.authorName.length > 0) {
            if (/^([A-Za-zÀ-ÖØ-öø-ÿ_@.\s])+$/.test(req.body.authorName))
                author = req.body.authorName.trim()
            else
                author = "invalid author name"
        }

        xmiFilePath = req.file.path;
        const uniqueId = uuidv4();
        const outputDir = `output/${uniqueId}`;
        const outputZip = `output/${uniqueId}.zip`;

        // TODO: Perform XMI parsing and code generation here
        const parsedXmi = await xmi_parser(xmiFilePath, "IOTAM_PSM:");
        const jsonObject = await model_formatter(parsedXmi.full_app_model, parsedXmi.stereotypes, parsedXmi.data_types);
        // Create the output directory
        fs.mkdirSync(outputDir);
        // Generate and save the code
        const errors = await generate_application_code(author, outputDir, jsonObject);
        if (errors.length > 0) {
            throw {
                message: `Error generating application code.`,
                errors,
            };
        }

        // Create a zip archive of the output directory
        const output = fs.createWriteStream(outputZip);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(outputDir, false);
        archive.finalize();

        // Provide the ZIP file for download
        output.on('close', () => {
            res.download(outputZip, 'generated_code_b.zip', () => {
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
    return res.status(statuscode).json({ "error message": error.message, "errors": error.errors });

}

module.exports = {
    get_home,
    post_file,
    page_not_found,
    error_handler,
};