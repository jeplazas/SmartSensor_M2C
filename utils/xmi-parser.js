/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const fs = require('fs/promises');
const { type } = require('os');
const parser = require('xml2json');

const extract_xmi_object = async (file_path) => {
    const base_xmi = await fs.readFile(file_path);
    const base_json = parser.toJson(base_xmi);
    const base_obj = JSON.parse(base_json);
    delete base_xmi, base_json;
    // console.log(base_obj, '\n----------------------------------\n\n');
    return base_obj;
};

const extract_stereotype_base_name = (stereotype_content) => {
    for (let ck of Object.keys(stereotype_content)) {
        if (ck.includes('base_'))
            return ck;
    }
    return null;
};

const extract_stereotypes_list = (base_obj) => {
    const stereotypes = {};
    for (let k of Object.keys(base_obj['xmi:XMI'])) {
        if (k.includes("IOTAM_PSM:")) {
            const temporal_content = { ...base_obj['xmi:XMI'][k] };
            const stereotype_content = {};
            const base_key_name = extract_stereotype_base_name(temporal_content);
            if (base_key_name) {
                const base_id = temporal_content[base_key_name];
                delete temporal_content['xmi:id'];
                delete temporal_content[base_key_name];
                stereotype_content[base_id] = { ...temporal_content };
            } else {
                for (let io in temporal_content) {
                    const io_base_key_name = extract_stereotype_base_name(temporal_content[io]);
                    const save_obj = { ...temporal_content[io] };
                    delete save_obj['xmi:id'];
                    delete save_obj[io_base_key_name];
                    stereotype_content[temporal_content[io][io_base_key_name]] = { ...save_obj };
                }
            }
            stereotypes[k] = stereotype_content;
        }
    }
    // console.log('stereotypes', stereotypes, '\n----------------------------------\n');
    return stereotypes;
};

const extract_app_model = (base_obj) => {
    const app_model = base_obj['xmi:XMI']['uml:Model'];
    // console.log('app_model', app_model, '\n----------------------------------\n');
    return app_model;
};

const find_stereotype_match = (xmi_id, stereotype_list) => {
    for (let s in stereotype_list) {
        const stereotyped_ids = Object.keys(stereotype_list[s]);
        if (stereotyped_ids.includes(xmi_id)) {
            return { ...stereotype_list[s][xmi_id], stereotype: s };
        }
    }
};

const recursive_add_stereotypes = async (stereotype_list, modifiable_packagedElement) => {
    if (Array.isArray(modifiable_packagedElement)) {
        for (let item of modifiable_packagedElement) {
            let stereotype = find_stereotype_match(item['xmi:id'], stereotype_list);
            if (stereotype) {
                item['stereotype'] = stereotype;
            }
            for (let key in item) {
                if (typeof item[key] === "object") {
                    await recursive_add_stereotypes(stereotype_list, item[key]);
                }
            }
        }
    } else if (modifiable_packagedElement != null) {
        let stereotype = find_stereotype_match(modifiable_packagedElement['xmi:id'], stereotype_list);
        if (stereotype) {
            modifiable_packagedElement['stereotype'] = stereotype;
        }
        for (let key in modifiable_packagedElement) {
            if (typeof modifiable_packagedElement[key] === "object") {
                await recursive_add_stereotypes(stereotype_list, modifiable_packagedElement[key]);
            }
        }
    }
    return null;
};

const add_stereotypes = async (stereotype_list, app_model) => {
    const mod_app_model = JSON.parse(JSON.stringify(app_model));
    let stereotype = find_stereotype_match(mod_app_model['xmi:id'], stereotype_list);
    if (stereotype) {
        mod_app_model['stereotype'] = stereotype;
    }
    if (Object.keys(mod_app_model).includes('packagedElement')) {
        await recursive_add_stereotypes(stereotype_list, mod_app_model.packagedElement);
    }
    // console.log('mod_app_model', mod_app_model, '\n----------------------------------\n');
    return mod_app_model;
};

const parse_xmi_file = async (file_path) => {
    const base_obj = await extract_xmi_object(file_path);
    const app_model = extract_app_model(base_obj);
    const stereotypes = extract_stereotypes_list(base_obj);
    const full_app_model = await add_stereotypes(stereotypes, app_model);
    return full_app_model;
};

module.exports = parse_xmi_file;