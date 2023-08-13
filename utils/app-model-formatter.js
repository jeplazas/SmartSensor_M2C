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
 * @returns a list with all the elements and sub-elements of the `model_element` that contain the stereotype; an empty array if none were found.
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
    return all_matches;
};

/**
 * Prepares the sink node model extracting the necessary details for code generation.
 * @param {object} full_sinknode_model one complete sink-node model part as extracted from recursive_single_stereotype_searching.
 * @returns the prepared sink node model.
 */
const prepare_sink_node = async full_sinknode_model => {
    const sink_node = {
        id: full_sinknode_model['xmi:id'],
        name: full_sinknode_model.name,
        stereotype: full_sinknode_model.stereotype,
    };
    sink_node.stateless_data = await get_node_stateless_data(full_sinknode_model);
    sink_node.states = await get_node_states(full_sinknode_model);
    return sink_node;
};

/**
 * Prepares the end node model extracting the necessary details for code generation.
 * @param {object} full_endnode_model one complete end-node model part as extracted from recursive_single_stereotype_searching.
 * @returns the prepared end node model.
 */
const prepare_end_node = async full_endnode_model => {
    const end_node = {
        id: full_endnode_model['xmi:id'],
        name: full_endnode_model.name,
        stereotype: full_endnode_model.stereotype,
    };
    end_node.stateless_data = await get_node_stateless_data(full_endnode_model);
    end_node.states = await get_node_states(full_endnode_model);
    return end_node;
};

/**
 * Obtains the data (variables and operations) for the node that are independent from the states. This should include the state change.
 * @param {object} full_node_model node model where the stateless data are.
 * @returns The node's stateless data.
 */
const get_node_stateless_data = async full_node_model => {
    const stateless_gathered_measure = await recursive_single_stereotype_searching(full_node_model, config.gatheredMeasure);
    const stateless_delivered_measure = await recursive_single_stereotype_searching(full_node_model, config.deliveredMeasure);

    const stateless_data = {
        variables: [],
        operatiosn: [],
    };
    return stateless_data;
};

/**
 * Obtains the different states available in the selected model.
 * @param {object} full_node_model node model where the states are.
 * @param {object} stateless_data node stateless data that should exist on each state.
 * @returns an object containing the identified states in the node model, defining the data and operations for each state
 */
const get_node_states = async (full_node_model, stateless_data) => {
    const full_states_list = await recursive_single_stereotype_searching(full_node_model, config.mod);
    const states = {};
    full_states_list.forEach(sn => states[sn.stereotype.Mode])
    return states;
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
    const app_model = await recursive_single_stereotype_searching(full_app_model, config.application);
    const application = {
        id: app_model[0]['xmi:id'],
        name: app_model[0].name,
        stereotype: app_model[0].stereotype,       // TODO: remove if not necessary
    };
    // todo: find sink and end nodes -- for each node find states & common data, GatherOps, and SendOps -- For each state find: GatherOps; DeliveryOps; data ->
    const end_nodes = await recursive_single_stereotype_searching(app_model[0], config.endNode);
    const sink_nodes = await recursive_single_stereotype_searching(app_model[0], config.sinkNode);
    application.sink_nodes = await Promise.all(sink_nodes.map(async sk => prepare_sink_node(sk)));
    application.end_nodes = await Promise.all(end_nodes.map(async en => prepare_end_node(en)));
    console.log("application", application);
    return application;
};

module.exports = format_app_model;