/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const fs = require('fs/promises');
const parser = require('xml2json');

const extract_xmi_object = async (file_path) => {
    const base_xmi = await fs.readFile(file_path);
    const base_json = parser.toJson(base_xmi);
    const base_obj = JSON.parse(base_json);
    delete base_xmi, base_json;
    // console.log(base_obj, '\n----------------------------------\n\n');
    return base_obj;
};

const extract_stereotypes_list = (base_obj) => {
    const stereotypes = [];
    for (let k of Object.keys(base_obj['xmi:XMI'])) {
        if (k.includes("IOTAM_PSM:")) {
            stereotypes.push({ stereotype: k, ...base_obj['xmi:XMI'][k] });
        }
    }
    // console.log('stereotypes', stereotypes, '\n----------------------------------\n');
    return stereotypes;
};

const extract_app_model = (base_obj) => {
    const app_model = base_obj['xmi:XMI']['uml:Model'];
    console.log('app_model', app_model, '\n----------------------------------\n');
    return app_model;
};

// const add_stereotypes    // TODO

const parse_xmi_file = async (file_path) => {
    const base_obj = await extract_xmi_object(file_path);
    const app_model = extract_app_model(base_obj);
    const stereotypes = extract_stereotypes_list(base_obj);

    return app_model;
};

module.exports = parse_xmi_file;