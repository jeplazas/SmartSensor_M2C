const config = require('../config/stereotypes-config');

/**
 * Adds the data types to the variables in the list
 * @param {*} variable_list List of variables that may have a `type` attribute.
 * @param {*} data_types Complete data_types object as extracted from the XMI
 * @returns The list of variables with the mapped type if available
 */
const add_types_to_variables_list = (variable_list, data_types) => {
    const variables_with_types = JSON.parse(JSON.stringify(variable_list));
    for (let variable of variables_with_types) {
        if (variable.type != null) {
            if (typeof variable.type == "string") {
                let found = false;
                for (let type of Object.keys(data_types)) {
                    if (data_types[type]["xmi:id"] == variable.type) {
                        found = true;
                        variable.type = type;
                        break;
                    }
                }
                if (!found)
                    variable.type = null;
            } else if (typeof variable.type == "object" && variable.type.href != null && typeof variable.type.href == "string") {
                variable.type = variable.type.href.split('#').pop();
            } else {
                variable.type = null;
            }
        }
    }
    return variables_with_types;
}

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
 * @param {object} data_types Complete data_types object as extracted from the XMI.
 * @returns the prepared sink node model.
 */
const prepare_sink_node = async (full_sinknode_model, data_types) => {
    const sink_node = {
        id: full_sinknode_model['xmi:id'],
        name: full_sinknode_model.name,
        stereotype: full_sinknode_model.stereotype,
    };
    sink_node.stateless_data = await get_node_stateless_data(full_sinknode_model, data_types);
    sink_node.states = await get_node_states(full_sinknode_model, sink_node.stateless_data, data_types);
    return sink_node;
};

/**
 * Prepares the end node model extracting the necessary details for code generation.
 * @param {object} full_endnode_model one complete end-node model part as extracted from recursive_single_stereotype_searching.
 * @param {object} data_types Complete data_types object as extracted from the XMI.
 * @returns the prepared end node model.
 */
const prepare_end_node = async (full_endnode_model, data_types) => {
    const end_node = {
        id: full_endnode_model['xmi:id'],
        name: full_endnode_model.name,
        stereotype: full_endnode_model.stereotype,
    };
    end_node.stateless_data = await get_node_stateless_data(full_endnode_model, data_types);
    end_node.states = await get_node_states(full_endnode_model, end_node.stateless_data, data_types);
    return end_node;
};

/**
 * Obtains the data (variables and operations) for the node that are independent from the states. This should include the state change.
 * @param {object} full_node_model node model where the stateless data are.
 * @param {object} data_types Complete data_types object as extracted from the XMI.
 * @returns The node's stateless data.
 * @throws An error if the node does not have one and only one delivered measure.
 */
const get_node_stateless_data = async (full_node_model, data_types) => {
    const sensed_variables = {};
    const sending_data = {};
    const stateless_gathered_measures = await recursive_single_stereotype_searching(full_node_model, config.gatheredMeasure);
    await stateless_gathered_measures.forEach(async gm => {
        let variables = await recursive_single_stereotype_searching(gm, config.variable);
        variables = add_types_to_variables_list(variables, data_types);
        const operations = await recursive_single_stereotype_searching(gm, config.gatherOperation);
        const change_mode = await recursive_single_stereotype_searching(gm, config.changeModeDefinition);
        let stateless_sensing_op = null;
        if (operations.length > 0) stateless_sensing_op = operations[0];
        let change_mode_op = null;
        if (change_mode.length > 0) change_mode_op = change_mode[0];
        if (variables.length < 0)
            sensed_variables["__NO_STATELESS_VARS__"] = { stateless_sensing_op, change_mode_op };
        else
            variables.forEach(v => {
                sensed_variables[v.name] = { ...v, stateless_sensing_op, change_mode_op };
            });
    });

    const stateless_delivered_measures = await recursive_single_stereotype_searching(full_node_model, config.deliveredMeasure);
    if (stateless_delivered_measures.length !== 1)
        throw new Error("Nodes can only have one, and must have one delivered measure.");
    await stateless_delivered_measures.forEach(async dm => {
        let device_vars = await recursive_single_stereotype_searching(dm, config.deviceVariable);
        device_vars = add_types_to_variables_list(device_vars, data_types);
        let time_vars = await recursive_single_stereotype_searching(dm, config.explicitTime);
        time_vars = add_types_to_variables_list(time_vars, data_types);
        // changed from deliveredVariable stereotyte to variable due to errors in the UML model....
        // const sensed_vars = await recursive_single_stereotype_searching(dm, config.deliveredVariable);
        let sensed_and_received_vars = await recursive_single_stereotype_searching(dm, config.variable);
        sensed_and_received_vars = add_types_to_variables_list(sensed_and_received_vars, data_types);
        // ....
        // since only the received variables have source, then split them:
        const sensed_vars = sensed_and_received_vars.filter(item => {
            for (let st of item.stereotype) {
                if (st.source != null)
                    return false;
            }
            return true;
        });
        const received_vars = sensed_and_received_vars.filter(item => {
            for (let st of item.stereotype) {
                if (st.source != null)
                    return true;
            }
            return false;
        });
        const operations = await recursive_single_stereotype_searching(dm, config.sendOperation);
        const change_mode = await recursive_single_stereotype_searching(dm, config.changeModeDefinition);
        let stateless_sending_op = null;
        if (operations.length > 0) stateless_sending_op = operations[0];
        let change_mode_op = null;
        if (change_mode.length > 0) change_mode_op = change_mode[0];
        const variables = { device_vars, time_vars, sensed_vars, received_vars };
        sending_data.stateless_sending_op = stateless_sending_op;
        sending_data.change_mode_op = change_mode_op;
        sending_data.variables = variables;
    });

    console.log({ sensed_variables });
    console.log({ sending_data });
    const stateless_data = {
        sensed_variables,
        sending_data,
    };
    return stateless_data;
};

/**
 * Obtains the different states available in the selected model.
 * @param {object} full_node_model node model where the states are.
 * @param {object} stateless_data node stateless data that should exist on each state.
 * @param {object} data_types Complete data_types object as extracted from the XMI.
 * @returns an object containing the identified states in the node model, defining the data and operations for each state
 */
const get_node_states = async (full_node_model, stateless_data, data_types) => {
    const states = {};
    const gm_states_list = await recursive_single_stereotype_searching(full_node_model, config.gatheredMeasureMode);
    // TODO: What happends to those variables that only the sense operation changes?!?!?!?!
    for (let gms of gm_states_list) {
        if (states[gms.stereotype[0].Mode] == null) states[gms.stereotype[0].Mode] = {};
        if (states[gms.stereotype[0].Mode].sensed_variables == null) states[gms.stereotype[0].Mode].sensed_variables = {};
        const sensed_variables = {};
        let variables = await recursive_single_stereotype_searching(gms, config.variable);
        variables = add_types_to_variables_list(variables, data_types);
        const operations = await recursive_single_stereotype_searching(gms, config.gatherOperation);
        let sensing_op = null;
        if (operations.length > 0) sensing_op = operations[0];
        variables.forEach(v => {
            if (sensing_op == null && stateless_data.sensed_variables != null && stateless_data.sensed_variables[v.name] != null && stateless_data.sensed_variables[v.name].stateless_sensing_op != null)
                sensing_op = stateless_data.sensed_variables[v.name].stateless_sensing_op;
            else if (sensing_op == null && stateless_data.sensed_variables != null && stateless_data.sensed_variables["__NO_STATELESS_VARS__"] != null && stateless_data.sensed_variables["__NO_STATELESS_VARS__"].stateless_sensing_op != null)
                sensing_op = stateless_data.sensed_variables["__NO_STATELESS_VARS__"].stateless_sensing_op;
            sensed_variables[v.name] = { ...v, sensing_op };
        });
        const sensed_variables_keys = Object.keys(sensed_variables);
        if (stateless_data.sensed_variables != null)
            Object.keys(stateless_data.sensed_variables).forEach(key => {
                if (key != "__NO_STATELESS_VARS__" && !sensed_variables_keys.includes(key)) {
                    if (sensing_op != null && stateless_data.sensed_variables[key].stateless_sensing_op == null) {
                        sensed_variables[key] = {
                            ...stateless_data.sensed_variables[key],
                            sensing_op,
                            stateless_sensing_op: undefined,
                        }
                    } else if (sensing_op == null && stateless_data.sensed_variables[key].stateless_sensing_op != null) {
                        sensed_variables[key] = {
                            ...stateless_data.sensed_variables[key],
                            sensing_op: stateless_data.sensed_variables[key].stateless_sensing_op,
                            stateless_sensing_op: undefined,
                        }
                    }
                }
            });
        states[gms.stereotype[0].Mode].sensed_variables = { ...states[gms.stereotype[0].Mode].sensed_variables, sensed_variables };
    }
    const dm_states_list = await recursive_single_stereotype_searching(full_node_model, config.deliveredMeasureMode);
    for (let dms of dm_states_list) {
        if (states[dms.stereotype[0].Mode] == null) states[dms.stereotype[0].Mode] = {};
        if (states[dms.stereotype[0].Mode].sending_data == null) states[dms.stereotype[0].Mode].sending_data = {};
        const sending_data = {};
        let device_vars = await recursive_single_stereotype_searching(dms, config.deviceVariable);
        device_vars = add_types_to_variables_list(device_vars, data_types);
        let time_vars = await recursive_single_stereotype_searching(dms, config.explicitTime);
        time_vars = add_types_to_variables_list(time_vars, data_types);
        // changed from deliveredVariable stereotyte to variable due to errors in the UML model....
        // const sensed_vars = await recursive_single_stereotype_searching(dms, config.deliveredVariable);
        let sensed_and_received_vars = await recursive_single_stereotype_searching(dms, config.variable);
        sensed_and_received_vars = add_types_to_variables_list(sensed_and_received_vars, data_types);
        // ....
        // since only the received variables have source, then split them:
        const sensed_vars = sensed_and_received_vars.filter(item => {
            for (let st of item.stereotype) {
                if (st.source != null)
                    return false;
            }
            return true;
        });
        const received_vars = sensed_and_received_vars.filter(item => {
            for (let st of item.stereotype) {
                if (st.source != null)
                    return true;
            }
            return false;
        });
        const operations = await recursive_single_stereotype_searching(dms, config.sendOperation);
        let sending_op = null;
        if (operations.length > 0) sending_op = operations[0];
        const variables = { device_vars, time_vars, sensed_vars, received_vars };
        sending_data.sending_op = sending_op;
        sending_data.variables = variables;
        states[dms.stereotype[0].Mode].sending_data = { ...states[dms.stereotype[0].Mode].sending_data, sending_data };
    }
    return states;
};



/**
 * Formats the application model as parsed from the XMI into a usable format considering the specifications of the SmartSensor profile.
 * @param {object} full_app_model Complete application model as extracted from the XMI.
 * @param {object} stereotypes Complete stereotypes object as extracted from the XMI.
 * @param {object} data_types Complete data_types object as extracted from the XMI.
 * @returns Formatted application model with the end-nodes and sink-nodes, their states (if any), and the gathering, transformed, and delivered data for each state.
 * @throws An error if any key in `stereotypes` is not known to the configured stereotypes.
 */
const format_app_model = async (full_app_model, stereotypes, data_types) => {
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
    application.sink_nodes = await Promise.all(sink_nodes.map(async sk => prepare_sink_node(sk, data_types)));
    application.end_nodes = await Promise.all(end_nodes.map(async en => prepare_end_node(en, data_types)));
    console.log("application\n", JSON.stringify(application));
    return application;
};

module.exports = format_app_model;