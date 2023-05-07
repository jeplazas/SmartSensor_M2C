/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    Some parts of this code are based on ChatGPT-generated code examples.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const port = 3000;
const output_dir = 'output';
const views_path = path.join(__dirname, 'views')

// Check if the 'output' folder exists, create it if necessary
if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir);
}

const app = express();
const upload = multer({ dest: 'uploads/' });

app.get('/home', (req, res) => {
    res.sendFile(path.join(views_path, 'index.html'));
});

app.post('/file', upload.single('xmiFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Check that the uploaded file has .xmi or .uml extension
    const fileExtension = req.file.originalname.split('.').pop();
    if (!['uml', 'xmi'].includes(fileExtension.toLowerCase())) {
        fs.unlinkSync(req.file.path); // Delete the invalid file
        return res.status(400).send('Invalid file format. Only .uml or .xmi files are allowed.');
    }

    const xmiFilePath = req.file.path;
    const uniqueId = uuidv4();
    const outputDir = `output/${uniqueId}`;
    const outputZip = `output/${uniqueId}.zip`;

    // Perform XMI parsing and code generation here
    // Replace this section with your own logic to transform the XMI file into code

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

    // Remove the temporary XMI file
    fs.unlinkSync(xmiFilePath);

    // Provide the ZIP file for download
    output.on('close', () => {
        res.download(outputZip, 'generated_code.zip', () => {
            // Clean up the output directory and ZIP file after download
            fs.rmSync(outputDir, { recursive: true });
            fs.unlinkSync(outputZip);
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
