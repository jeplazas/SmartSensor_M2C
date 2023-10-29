const crypto = require('crypto');

const save_endnode_code = require('./end-node-coder');
const save_sinknode_code = require('./sink-node-coder');

/**
 * Function that generates the application code in the `output_dir` folder.
 * @param {string} author Author name of the current application
 * @param {string} output_dir Output directory that will be later zipped and sent for download.
 * @param {object} formated_app_model Formatted application model.
 * @returns {Promise<object[]>} List of errors which should be empty if everything went ok.
 */
const generate_application_code = async (author, output_dir, formated_app_model) => {
    const app_name = formated_app_model.name | "IoT_Application";
    const target_board = formated_app_model.board | "iotlab-m3";
    const default_network_channel = Math.floor(Math.random() * 12 + 1); // Math.floor(Math.random() * (max - min + 1) + min);
    const default_network_id = crypto.randomBytes(2).toString('hex');
    const errors = [];
    for (end_node_model in formated_app_model.end_nodes) {
        const code_replace = await end_node_code_extractor_faker(end_node_model);
        const error = await save_endnode_code(
            author, output_dir, code_replace.end_node_name,
            code_replace.all_sensors_includes, code_replace.all_probes_types_pointers,
            code_replace.all_save_values_types_pointers, code_replace.all_probes_chain,
            code_replace.all_save_values_chain, code_replace.high_sensing_and_aggregation_code,
            code_replace.high_sending_sleeptime, code_replace.low_sensing_and_aggregation_code,
            code_replace.low_sending_sleeptime, app_name, target_board, default_network_channel,
            default_network_id, code_replace.all_usemodule_sensors_list, code_replace.all_sensors_mainvars_definitions,
            code_replace.all_sensing_structs, code_replace.all_transforming_structs,
            code_replace.all_sensing_threads_funcitons_definition, code_replace.prepare_output_string,
            code_replace.init_all_sensors, code_replace.create_all_sensing_threads
        );
        if (error != null)
            errors.push(error)
    }

    for (sink_node_model in formated_app_model.sink_nodes) {
        const code_replace = await sink_node_code_extractor_faker(sink_node_model);
        const error = await save_sinknode_code(
            author, output_dir,
            code_replace.all_sensors_includes, code_replace.all_probes_types_pointers,
            code_replace.all_save_values_types_pointers, code_replace.all_probes_chain,
            code_replace.all_save_values_chain, code_replace.high_sensing_and_aggregation_code,
            code_replace.high_sending_sleeptime, code_replace.low_sensing_and_aggregation_code,
            code_replace.low_sending_sleeptime, app_name, target_board, default_network_channel,
            default_network_id, code_replace.all_usemodule_sensors_list, code_replace.all_sensors_mainvars_definitions,
            code_replace.all_sensing_structs, code_replace.all_transforming_structs,
            code_replace.all_receiving_structs, code_replace.reception_code,
            code_replace.all_sensing_threads_funcitons_definition,
            code_replace.prepare_output_string_and_change_to_high_state_condition,
            code_replace.init_all_sensors, code_replace.create_all_sensing_and_transformation_threads
        );
        if (error != null)
            errors.push(error)
    }
    return errors;
};

const end_node_code_extractor = async (end_node_model) => {
    const end_node_replace_obj = {
        end_node_name: null,
        all_sensors_includes: null,
        all_probes_types_pointers: null,
        all_save_values_types_pointers: null,
        all_probes_chain: null,
        all_save_values_chain: null,
        high_sensing_and_aggregation_code: null,
        high_sending_sleeptime: null,
        low_sensing_and_aggregation_code: null,
        low_sending_sleeptime: null,
        all_usemodule_sensors_list: null,
        all_sensors_mainvars_definitions: null,
        all_sensing_structs: null,
        all_transforming_structs: null,
        all_sensing_threads_funcitons_definition: null,
        prepare_output_string: null,
        init_all_sensors: null,
        create_all_sensing_threads: null
    };
    // TODO: Complete
    return end_node_replace_obj;
};

const sink_node_code_extractor = async (sink_node_model) => {
    const sink_node_replace_obj = {
        all_sensors_includes: null,
        all_probes_types_pointers: null,
        all_save_values_types_pointers: null,
        all_probes_chain: null,
        all_save_values_chain: null,
        high_sensing_and_aggregation_code: null,
        high_sending_sleeptime: null,
        low_sensing_and_aggregation_code: null,
        low_sending_sleeptime: null,
        all_usemodule_sensors_list: null,
        all_sensors_mainvars_definitions: null,
        all_sensing_structs: null,
        all_transforming_structs: null,
        all_receiving_structs: null,
        reception_code: null,
        all_sensing_threads_funcitons_definition: null,
        prepare_output_string_and_change_to_high_state_condition: null,
        init_all_sensors: null,
        create_all_sensing_and_transformation_threads: null
    };
    // TODO: Complete
    return sink_node_replace_obj;
};


const end_node_code_extractor_faker = async (end_node_model) => {
    const end_node_replace_obj = {
        end_node_name: null,
        all_sensors_includes: null,
        all_probes_types_pointers: null,
        all_save_values_types_pointers: null,
        all_probes_chain: null,
        all_save_values_chain: null,
        high_sensing_and_aggregation_code: null,
        high_sending_sleeptime: null,
        low_sensing_and_aggregation_code: null,
        low_sending_sleeptime: null,
        all_usemodule_sensors_list: null,
        all_sensors_mainvars_definitions: null,
        all_sensing_structs: null,
        all_transforming_structs: null,
        all_sensing_threads_funcitons_definition: null,
        prepare_output_string: null,
        init_all_sensors: null,
        create_all_sensing_threads: null
    };

    /* Fake part */
    end_node_replace_obj.end_node_name = ``;
    end_node_replace_obj.all_sensors_includes = ``;
    end_node_replace_obj.all_probes_types_pointers = ``;
    end_node_replace_obj.all_save_values_types_pointers = ``;
    end_node_replace_obj.all_probes_chain = ``;
    end_node_replace_obj.all_save_values_chain = ``;
    end_node_replace_obj.high_sensing_and_aggregation_code = ``;
    end_node_replace_obj.high_sending_sleeptime = ``;
    end_node_replace_obj.low_sensing_and_aggregation_code = ``;
    end_node_replace_obj.low_sending_sleeptime = ``;
    end_node_replace_obj.all_usemodule_sensors_list = ``;
    end_node_replace_obj.all_sensors_mainvars_definitions = ``;
    end_node_replace_obj.all_sensing_structs = ``;
    end_node_replace_obj.all_transforming_structs = ``;
    end_node_replace_obj.all_sensing_threads_funcitons_definition = ``;
    end_node_replace_obj.prepare_output_string = ``;
    end_node_replace_obj.init_all_sensors = ``;
    end_node_replace_obj.create_all_sensing_threads = ``;
    /* ********* */

    return end_node_replace_obj;
};

const sink_node_code_extractor_faker = async (sink_node_model) => {
    const sink_node_replace_obj = {
        all_sensors_includes: null,
        all_probes_types_pointers: null,
        all_save_values_types_pointers: null,
        all_probes_chain: null,
        all_save_values_chain: null,
        high_sensing_and_aggregation_code: null,
        high_sending_sleeptime: null,
        low_sensing_and_aggregation_code: null,
        low_sending_sleeptime: null,
        all_usemodule_sensors_list: null,
        all_sensors_mainvars_definitions: null,
        all_sensing_structs: null,
        all_transforming_structs: null,
        all_receiving_structs: null,
        reception_code: null,
        all_sensing_threads_funcitons_definition: null,
        prepare_output_string_and_change_to_high_state_condition: null,
        init_all_sensors: null,
        create_all_sensing_and_transformation_threads: null
    };

    /* Fake part */
    sink_node_replace_obj.all_sensors_includes = ``;
    sink_node_replace_obj.all_probes_types_pointers = ``;
    sink_node_replace_obj.all_save_values_types_pointers = ``;
    sink_node_replace_obj.all_probes_chain = ``;
    sink_node_replace_obj.all_save_values_chain = ``;
    sink_node_replace_obj.high_sensing_and_aggregation_code = ``;
    sink_node_replace_obj.high_sending_sleeptime = ``;
    sink_node_replace_obj.low_sensing_and_aggregation_code = ``;
    sink_node_replace_obj.low_sending_sleeptime = ``;
    sink_node_replace_obj.all_usemodule_sensors_list = ``;
    sink_node_replace_obj.all_sensors_mainvars_definitions = ``;
    sink_node_replace_obj.all_sensing_structs = ``;
    sink_node_replace_obj.all_transforming_structs = ``;
    sink_node_replace_obj.all_receiving_structs = ``;
    sink_node_replace_obj.reception_code = ``;
    sink_node_replace_obj.all_sensing_threads_funcitons_definition = ``;
    sink_node_replace_obj.prepare_output_string_and_change_to_high_state_condition = ``;
    sink_node_replace_obj.init_all_sensors = ``;
    sink_node_replace_obj.create_all_sensing_and_transformation_threads = ``;
    /* ********* */

    return sink_node_replace_obj;
};

module.exports = {
    generate_application_code
};