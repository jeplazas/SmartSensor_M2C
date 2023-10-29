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
        end_node_name: "/* No Generated end_node_name */",
        all_sensors_includes: "/* No Generated all_sensors_includes */",
        all_probes_types_pointers: "/* No Generated all_probes_types_pointers */",
        all_save_values_types_pointers: "/* No Generated all_save_values_types_pointers */",
        all_probes_chain: "/* No Generated all_probes_chain */",
        all_save_values_chain: "/* No Generated all_save_values_chain */",
        high_sensing_and_aggregation_code: "/* No Generated high_sensing_and_aggregation_code */",
        high_sending_sleeptime: "/* No Generated high_sending_sleeptime */",
        low_sensing_and_aggregation_code: "/* No Generated low_sensing_and_aggregation_code */",
        low_sending_sleeptime: "/* No Generated low_sending_sleeptime */",
        all_usemodule_sensors_list: "/* No Generated all_usemodule_sensors_list */",
        all_sensors_mainvars_definitions: "/* No Generated all_sensors_mainvars_definitions */",
        all_sensing_structs: "/* No Generated all_sensing_structs */",
        all_transforming_structs: "/* No Generated all_transforming_structs */",
        all_sensing_threads_funcitons_definition: "/* No Generated all_sensing_threads_funcitons_definition */",
        prepare_output_string: "/* No Generated prepare_output_string */",
        init_all_sensors: "/* No Generated init_all_sensors */",
        create_all_sensing_threads: "/* No Generated create_all_sensing_threads */"
    };
    // TODO: Complete
    return end_node_replace_obj;
};

const sink_node_code_extractor = async (sink_node_model) => {
    const sink_node_replace_obj = {
        all_sensors_includes: "/* No Generated all_sensors_includes */",
        all_probes_types_pointers: "/* No Generated all_probes_types_pointers */",
        all_save_values_types_pointers: "/* No Generated all_save_values_types_pointers */",
        all_probes_chain: "/* No Generated all_probes_chain */",
        all_save_values_chain: "/* No Generated all_save_values_chain */",
        high_sensing_and_aggregation_code: "/* No Generated high_sensing_and_aggregation_code */",
        high_sending_sleeptime: "/* No Generated high_sending_sleeptime */",
        low_sensing_and_aggregation_code: "/* No Generated low_sensing_and_aggregation_code */",
        low_sending_sleeptime: "/* No Generated low_sending_sleeptime */",
        all_usemodule_sensors_list: "/* No Generated all_usemodule_sensors_list */",
        all_sensors_mainvars_definitions: "/* No Generated all_sensors_mainvars_definitions */",
        all_sensing_structs: "/* No Generated all_sensing_structs */",
        all_transforming_structs: "/* No Generated all_transforming_structs */",
        all_receiving_structs: "/* No Generated all_receiving_structs */",
        reception_code: "/* No Generated reception_code */",
        all_sensing_threads_funcitons_definition: "/* No Generated all_sensing_threads_funcitons_definition */",
        prepare_output_string_and_change_to_high_state_condition: "/* No Generated prepare_output_string_and_change_to_high_state_condition */",
        init_all_sensors: "/* No Generated init_all_sensors */",
        create_all_sensing_and_transformation_threads: "/* No Generated create_all_sensing_and_transformation_threads */"
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
    end_node_replace_obj.end_node_name = `TestTemp0`;
    end_node_replace_obj.all_sensors_includes = `#include "at30tse75x.h"`;
    end_node_replace_obj.all_probes_types_pointers = `at30tse75x_t*`;
    end_node_replace_obj.all_save_values_types_pointers = `float*`;
    end_node_replace_obj.all_probes_chain = `at30tse75x_t* probe`;
    end_node_replace_obj.all_save_values_chain = `float* temperature`;
    end_node_replace_obj.high_sensing_and_aggregation_code = `float avgTemp_src[5];
    int16_t avgTemp_src_lastplace = 0;
    for (int16_t w=0; w< 5; w++) {
        at30tse75x_get_temperature(probe, &avgTemp_src[w]);
        avgTemp_src_lastplace = w;
        xtimer_sleep(60);
    }
    double sum = 0;
    for (int8_t  i=0; i<=avgTemp_src_lastplace; i++){
        sum += avgTemp_src[i];
    }
    *temperature = sum / (avgTemp_src_lastplace + 1);`;
    end_node_replace_obj.high_sending_sleeptime = `xtimer_sleep(300);`;
    end_node_replace_obj.low_sensing_and_aggregation_code = `xtimer_sleep(1800);
    at30tse75x_get_temperature(probe, temperature);`;
    end_node_replace_obj.low_sending_sleeptime = `xtimer_sleep(1800);`;
    end_node_replace_obj.all_usemodule_sensors_list = `at30tse75x`;
    end_node_replace_obj.all_sensors_mainvars_definitions = `static at30tse75x_t at30tse75x;`;
    end_node_replace_obj.all_sensing_structs = `// Private struct for AirTemperature_avg:
    typedef struct AirTemperature_avg_dataStruct {
        float avgTemp_src[5];
        int8_t avgTemp_src_lastplace;
    } AirTemperature_avg_dataStruct;
    // Public struct for AirTemperature_avg:
    typedef struct AirTemperature_avg_publicDataStruct {
        AirTemperature_avg_dataStruct data;
        mutex_t lock;
    } AirTemperature_avg_publicDataStruct;
    static AirTemperature_avg_publicDataStruct public_AirTemperature_avg;`;
    end_node_replace_obj.all_transforming_structs = ``;
    end_node_replace_obj.all_sensing_threads_funcitons_definition = `/* Code for thread 'AirTemperature_avgThread' */
    /* Stack of memory for thread 'AirTemperature_avgThread' */
    static char AirTemperature_avgThread_memstack[THREAD_STACKSIZE_MAIN];
    
    /* Thread 'AirTemperature_avgThread' */
    /* Thread to sense and transform one variable */
    static void *AirTemperature_avgThread(void *arg)
    {
        (void)arg;
        while (1) {
            AirTemperature_avg_dataStruct internalData;
            // Use the state to gather the variables:
            state.sense(&at30tse75x, &internalData.avgTemp_src[0]);
            if (internalData.avgTemp_src[0]>=27) {
                state.toHigh(&state);
            } else {
                state.toLow(&state);
            }
            // Save the internal data into the public struct:
            mutex_lock(&public_AirTemperature_avg.lock);
            public_AirTemperature_avg.data = internalData;
            mutex_unlock(&public_AirTemperature_avg.lock);
        }
        return 0;
    }`;
    end_node_replace_obj.prepare_output_string = `// Sensed AirTemperature_avg data:
    mutex_lock(&public_AirTemperature_avg.lock);
    AirTemperature_avg_dataStruct AirTemperature_avg_data = public_AirTemperature_avg.data;
    mutex_unlock(&public_AirTemperature_avg.lock);
    //Get Time
    rtc_get_time(&curtime);
    time_t ftime = mktime(&curtime);
    //Prepare the data string to be sent:
    char output[254];
    sprintf(output,
            "0, %i, %hi, %hi, %ld",
            (int) AirTemperature_avg_data.avgTemp_src[0], AirTemperature_avg_data.avgTemp_src_lastplace, state.status, (int32_t) ftime);`;
    end_node_replace_obj.init_all_sensors = `/* Start the RTC */
    // rtc_init();
    time_t itime = 1659484800;
    rtc_set_time(gmtime(&itime));
    at30tse75x_init(&at30tse75x, 0, 0x4f); // TODO: Check the correct I2C device and address. 0, 0x4f are default for SAMR21 nodes.
    
    rtc_get_time(&curtime);`;
    end_node_replace_obj.create_all_sensing_threads = `thread_create(AirTemperature_avgThread_memstack, sizeof(AirTemperature_avgThread_memstack),
    THREAD_PRIORITY_MAIN + 1, 0, AirTemperature_avgThread, NULL,
    "AirTemperature_avgThread_thread0");`;
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