const config = require('../config/stereotypes-config');

/**
 * Veryfies whether the list of the stereotypes names identifyed from the model file are known to the configured stereotypes.
 * @param {string[]} stereotypes_name_list List of the stereotypes names identifyed from the model file.
 * @returns ``true`` if all the names in ``stereotypes_name_list`` are known to the configured stereotypes.
 * @throws An error if any name is not known to the configured stereotypes.
 */
const verify_stereotypes = (stereotypes_name_list) => {
    const config_stereotypes = [];
    for (let sk in config) {
        config_stereotypes.push(config[sk]);
    }
    const not_included = stereotypes_name_list.filter(stereotype => !config_stereotypes.includes(stereotype));
    if (!not_included || not_included.length > 0) {
        throw new Error(`The model file uses stereotypes not included in the config file. The unrecognized stereotypes are: [${not_included}].`);
    }
    return true;
};

/**
 * Recursive self-accessing function that searches the whole model element and sub-elements to find all the elements that contain the expected stereotype name
 * @param {object} model_element model element that will be accessed.
 * @param {string} stereotype_name stereotype name that will be searched for.
 * @returns a list with all the elements and sub-elements of the `model_element` that contain the stereotype; ``null`` otherwise.
 */
const recursive_single_stereotype_searching = async (model_element, stereotype_name) => {
    const all_matches = [];
    if (Array.isArray(model_element)) {
        for (let item of model_element) {
            if (item.stereotype != null) {
                const is_match = item.stereotype.some(i => i.stereotype === stereotype_name);
                if (is_match)
                    all_matches.push(item);
            }
            for (let key in item) {
                if (key !== 'stereotype' && typeof item[key] === "object") {
                    let found_item = await recursive_single_stereotype_searching(item[key], stereotype_name);
                    if (found_item)
                        all_matches.push(...found_item);
                }
            }
        }
    } else if (model_element != null) {
        if (model_element.stereotype != null) {
            const is_match = model_element.stereotype.some(i => i.stereotype === stereotype_name);
            if (is_match)
                all_matches.push(model_element);
        }
        for (let key in model_element) {
            if (key !== 'stereotype' && typeof model_element[key] === "object") {
                let found_item = await recursive_single_stereotype_searching(model_element[key], stereotype_name);
                if (found_item)
                    all_matches.push(...found_item);
            }
        }
    }
    if (all_matches.length > 0)
        return all_matches;
    return null;
};

/**
 * Formats the application model as parsed from the XMI into a usable format considering the specifications of the SmartSensor profile.
 * @param {object} full_app_model Complete application model as extracted from the XMI.
 * @param {object} stereotypes Complete stereotypes object as extracted from the XMI.
 * @returns Formatted application model with the end-nodes and sink-nodes, their states (if any), and the gathering, transformed, and delivered data for each state.
 * @throws An error if any key in `stereotypes` is not known to the configured stereotypes.
 */
const format_app_model = async (full_app_model, stereotypes) => {
    verify_stereotypes(Object.keys(stereotypes));
    // Example----- TODO: delete
    const end_node = await recursive_single_stereotype_searching(full_app_model, config.endNode);
    const sink_node = await recursive_single_stereotype_searching(full_app_model, config.sinkNode);
    const gatherOperation = await recursive_single_stereotype_searching(full_app_model, config.gatherOperation);
    console.log("end_node", end_node.length, end_node);
    console.log("sink_node", sink_node.length, sink_node);
    console.log("gatherOperation", gatherOperation.length, gatherOperation);
    // -----
    return full_app_model;
};

module.exports = format_app_model;