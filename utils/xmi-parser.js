/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const fs = require('fs/promises');
const parser = require('xml2json');

const parse_xmi_file = async (file_path) => {
    const base_xmi = await fs.readFile(file_path);
    const base_json = parser.toJson(base_xmi);
    return base_json;
};

module.exports = parse_xmi_file;