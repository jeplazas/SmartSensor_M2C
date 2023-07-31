/*
    Copyright (C) 2023  Julián Eduardo Plazas.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const fs = require('fs/promises');
const { type } = require('os');
const parser = require('xml2json');

/**
 * Extracts the JSON representation of the XMI file.
 * @param {string} file_path The file path to the XMI file to transform.
 * @returns A JavaScript object with the representation of the XMI file.
 */
const extract_xmi_object = async (file_path) => {
    const base_xmi = await fs.readFile(file_path);
    const base_json = parser.toJson(base_xmi);
    const base_obj = JSON.parse(base_json);
    delete base_xmi, base_json;
    // console.log(base_obj, '\n----------------------------------\n\n');
    return base_obj;
};

/**
 * Extracts the base key name from an stereotype object.
 * @param {object} stereotype_content Stereotype object.
 * @returns The base key name if exists, null otherwise.
 */
const extract_stereotype_base_name = (stereotype_content) => {
    for (let ck of Object.keys(stereotype_content)) {
        if (ck.includes('base_'))
            return ck;
    }
    return null;
};

/**
 * Extracts the formatted stereotype list from the JavaScript base object (As extracted from the XMI).
 * @param {*} base_obj The JavaScript base object (as extracted from the XMI).
 * @returns Object containing all the Stereotypes in format.
 */
const extract_stereotypes_list = (base_obj, stereotype_start) => {
    const stereotypes = {};
    for (let k of Object.keys(base_obj['xmi:XMI'])) {
        if (k.includes(stereotype_start)) {
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

/**
 * Extracts the application part from the JavaScript base object (ss extracted from the XMI).
 * @param {object} base_obj The JavaScript base object (as extracted from the XMI).
 * @returns An object with the application part data.
 */
const extract_app_model = (base_obj) => {
    const app_model = base_obj['xmi:XMI']['uml:Model'];
    // console.log('app_model', app_model, '\n----------------------------------\n');
    return app_model;
};

/**
 * Recursively searches for matches of the xmi_id in the stereotype_list.
 * @param {string} xmi_id 'xmi:id' attribute of the object.
 * @param {object} stereotype_list  Object containing all the Stereotypes in format as received from extract_stereotypes_list.
 * @returns A list with the stereotype objects for the 'xmi:id' if exists, null otherwise.
 */
const find_stereotypes_matches = (xmi_id, stereotype_list) => {
    const stereotypes = [];
    for (let s in stereotype_list) {
        const stereotyped_ids = Object.keys(stereotype_list[s]);
        if (stereotyped_ids.includes(xmi_id)) {
            stereotypes.push({ ...stereotype_list[s][xmi_id], stereotype: s });
        }
    }
    if (stereotypes.length > 0) {
        return stereotypes;
    }
    return null;
};

/**
 * Self-calling recursive function that allows to add the stereotype attribute to all the stereotyped elements inside the modifiable_packagedElement. This element will be modifyed.
 * @param {object} stereotype_list Object containing all the Stereotypes in format as received from extract_stereotypes_list.
 * @param {object} modifiable_element App-model element whose internal attributes will be searched for stereotypes. This object will be modifyed.
 * @returns A null promise when finishes.
 */
const recursive_add_stereotypes = async (stereotype_list, modifiable_element) => {
    if (Array.isArray(modifiable_element)) {
        for (let item of modifiable_element) {
            let stereotype = find_stereotypes_matches(item['xmi:id'], stereotype_list);
            if (stereotype) {
                item['stereotype'] = stereotype;
            }
            for (let key in item) {
                if (typeof item[key] === "object") {
                    await recursive_add_stereotypes(stereotype_list, item[key]);
                }
            }
        }
    } else if (modifiable_element != null) {
        let stereotype = find_stereotypes_matches(modifiable_element['xmi:id'], stereotype_list);
        if (stereotype) {
            modifiable_element['stereotype'] = stereotype;
        }
        for (let key in modifiable_element) {
            if (typeof modifiable_element[key] === "object") {
                await recursive_add_stereotypes(stereotype_list, modifiable_element[key]);
            }
        }
    }
    return null;
};

/**
 * Adds stereotypes to all the elements inside the application model.
 * @param {object} stereotype_list Object containing all the Stereotypes in format as received from extract_stereotypes_list.
 * @param {object} app_model Object containing the application part data as received from extract_app_model.
 * @returns The application model element with the stereotypes.
 */
const add_stereotypes = async (stereotype_list, app_model) => {
    const mod_app_model = JSON.parse(JSON.stringify(app_model));
    let stereotype = find_stereotypes_matches(mod_app_model['xmi:id'], stereotype_list);
    if (stereotype) {
        mod_app_model['stereotype'] = stereotype;
    }
    if (Object.keys(mod_app_model).includes('packagedElement')) {
        await recursive_add_stereotypes(stereotype_list, mod_app_model.packagedElement);
    }
    // console.log('mod_app_model', mod_app_model, '\n----------------------------------\n');
    return mod_app_model;
};

/**
 * Extracts an useful representation of an XMI file including the stereotypes marked as indicated in stereotype_key_start.
 * @param {string} file_path Path to the XMI file that will be parsed.
 * @param {string} stereotype_key_start String chain that allows identifying the begining of the stereotypes keys.
 * @returns An object with the complete application model (full_app_model) and the stereotypes list (stereotypes).
 */
const parse_xmi_file = async (file_path, stereotype_key_start = '') => {
    const base_obj = await extract_xmi_object(file_path);
    const app_model = extract_app_model(base_obj);
    const stereotypes = extract_stereotypes_list(base_obj, stereotype_key_start);
    const full_app_model = await add_stereotypes(stereotypes, app_model);
    return { full_app_model, stereotypes };
};

module.exports = parse_xmi_file;