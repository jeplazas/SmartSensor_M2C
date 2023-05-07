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

const controller = require('./controller');

const port = 3000;
const output_dir = 'output';

// Check if the 'output' folder exists, create it if necessary
if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir);
}

const app = express();
const upload = multer({ dest: 'uploads/' });

// Main page
app.get('/home', controller.get_home);
app.get('/', controller.get_home);

// Post file
app.post('/file', upload.single('xmiFile'), controller.post_file);

// Page not found
app.use(controller.page_not_found);

// Error handler
app.use(controller.error_handler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
