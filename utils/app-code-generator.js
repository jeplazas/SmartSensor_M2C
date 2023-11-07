const crypto = require('crypto');

const m3_sensors_list = require('./riot_m3_probes');
const m3_sensors_names = Object.keys(m3_sensors_list);

const save_endnode_code = require('./end-node-coder');
const save_sinknode_code = require('./sink-node-coder');

/**
 * Gets all the sensors information
 * @param {object} node_model 
 * @returns {{all_sensors_includes: string, 
 * all_probes_types_and_save_values_pointers: string, 
 * all_probes_and_save_values_chain: string, 
 * all_usemodule_sensors_list: string, 
 * all_sensors_mainvars_definitions: string, 
 * all_sensors_mainvars_definitions: string, 
 * init_all_sensors: string, 
 * all_sensing_structs: string, 
 * all_sense_vars_state_call: string,
 * all_sensing_info: object[]}} 
 * 
*/
const get_all_sensors_information = (node_model) => {
    const all_sensors_information = {
        all_sensors_includes: "",
        all_probes_types_and_save_values_pointers: "",
        all_probes_and_save_values_chain: "",
        all_usemodule_sensors_list: "",
        all_sensors_mainvars_definitions: "",
        init_all_sensors: "",
        all_sensing_structs: "",
        all_sense_vars_state_call: "",
        all_sensing_info: [],
    };
    const all_sensing_info = [];
    const existing_probes = [];
    const existing_probes_vars = [];
    const existing_includes = [];
    const existing_initializations = [];
    const existing_mainvars = [];
    const all_delivered_variables = [
        ...node_model.stateless_data.sending_data.variables.sensed_vars,
        ...node_model.states.High.sending_data.sending_data.variables.sensed_vars,
        ...node_model.states.Low.sending_data.sending_data.variables.sensed_vars,
    ];
    for (let deli_var of all_delivered_variables) {
        if (deli_var.type == null || !m3_sensors_names.includes(deli_var.type)) {
            // continue;    // TODO: Should be continue, but lets make it Pressure_lps to test with a bad model.
            deli_var.type = "Pressure_lps";     // TODO: Delete this nonesense that is used for testing with a bad model.
        }
        if (!existing_probes.includes(m3_sensors_list[deli_var.type].usemodule)) {
            existing_probes.push(m3_sensors_list[deli_var.type].usemodule);
            existing_includes.push(m3_sensors_list[deli_var.type].include);
            existing_initializations.push(m3_sensors_list[deli_var.type].initialization_function);
            existing_mainvars.push(m3_sensors_list[deli_var.type].mainvar_definition);
            existing_probes_vars.push({
                probe_vartype: m3_sensors_list[deli_var.type].probe_vartype,
                probe_varname: m3_sensors_list[deli_var.type].probe_varname,
            });
        }
        all_sensing_info.push({
            c_type: m3_sensors_list[deli_var.type].c_type,
            var_name: deli_var.name,
            sense_func: m3_sensors_list[deli_var.type].sense_function,
            probe_varname: m3_sensors_list[deli_var.type].probe_varname,
        });
    }
    all_sensors_information.all_usemodule_sensors_list = existing_probes.join(', ');
    all_sensors_information.all_sensors_includes = existing_includes.join('\n');
    all_sensors_information.init_all_sensors = existing_initializations.join('\t\t');
    all_sensors_information.all_sensors_mainvars_definitions = existing_mainvars.join('\n');
    all_sensors_information.all_sensing_structs = "\n" + all_sensing_info.map(item => {
        return "static " + item.c_type + " " + item.var_name + ";";
    }).join("\n") + "\n";
    const all_probes_types_pointers = existing_probes_vars.map(item => item.probe_vartype + "*");
    const all_save_values_pointers = all_sensing_info.map(item => item.c_type + "*");
    all_sensors_information.all_probes_types_and_save_values_pointers =
        all_probes_types_pointers.concat(all_save_values_pointers).join(', ');
    const all_probes_chain = existing_probes_vars.map(item => {
        return item.probe_vartype + "* " + item.probe_varname;
    });
    const all_save_values_chain = all_sensing_info.map(item => {
        return item.c_type + "* " + item.var_name;
    });
    all_sensors_information.all_probes_and_save_values_chain =
        all_probes_chain.concat(all_save_values_chain).join(', ');
    const all_probes_vars = existing_probes_vars.map(item => "&" + item.probe_varname);
    const all_save_values_vars = all_sensing_info.map(item => "&" + item.var_name);
    all_sensors_information.all_sense_vars_state_call =
        all_probes_vars.concat(all_save_values_vars).join(', ');

    if (all_sensors_information.all_probes_types_and_save_values_pointers == "")
        all_sensors_information.all_probes_types_and_save_values_pointers = 'void';
    if (all_sensors_information.all_probes_and_save_values_chain == "")
        all_sensors_information.all_probes_and_save_values_chain = 'void';

    all_sensors_information.all_sensing_info = all_sensing_info;
    return all_sensors_information;
};

/**
 * Function that generates the application code in the `output_dir` folder.
 * @param {string} author Author name of the current application
 * @param {string} output_dir Output directory that will be later zipped and sent for download.
 * @param {object} formated_app_model Formatted application model.
 * @returns {Promise<object[]>} List of errors which should be empty if everything went ok.
 */
const generate_application_code = async (author, output_dir, formated_app_model) => {
    const app_name = formated_app_model.name ?? "IoT_Application";
    const target_board = formated_app_model.board ?? "iotlab-m3";
    const default_network_channel = Math.floor(Math.random() * 12 + 1); // Math.floor(Math.random() * (max - min + 1) + min);
    const default_network_id = crypto.randomBytes(2).toString('hex');
    const errors = [];
    for (end_node_model of formated_app_model.end_nodes) {
        const code_replace = await end_node_code_extractor(end_node_model);
        const error = await save_endnode_code(
            author, output_dir, code_replace.end_node_name,
            code_replace.all_sensors_includes, code_replace.all_probes_types_and_save_values_pointers,
            code_replace.all_probes_and_save_values_chain,
            code_replace.output_values_types_chain, code_replace.output_values_chain,
            code_replace.high_sensing_and_aggregation_code,
            code_replace.high_sending_sleeptime_and_output_building, code_replace.low_sensing_and_aggregation_code,
            code_replace.low_sending_sleeptime_and_output_building, app_name, target_board, default_network_channel,
            default_network_id, code_replace.all_usemodule_sensors_list, code_replace.all_sensors_mainvars_definitions,
            code_replace.all_sensing_structs, code_replace.all_transforming_structs,
            code_replace.all_sensing_threads_funcitons_definition, code_replace.prepare_output_string,
            code_replace.init_all_sensors, code_replace.create_all_sensing_threads
        );
        if (error != null)
            errors.push(error)
    }

    for (sink_node_model of formated_app_model.sink_nodes) {
        const code_replace = await sink_node_code_extractor(sink_node_model, formated_app_model.end_nodes);
        const error = await save_sinknode_code(
            author, output_dir,
            code_replace.all_sensors_includes, code_replace.all_probes_types_and_save_values_pointers,
            code_replace.all_probes_and_save_values_chain,
            code_replace.output_values_types_chain, code_replace.output_values_chain,
            code_replace.high_sensing_and_aggregation_code,
            code_replace.high_sending_sleeptime_and_output_building, code_replace.low_sensing_and_aggregation_code,
            code_replace.low_sending_sleeptime_and_output_building, app_name, target_board, default_network_channel,
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
        all_probes_types_and_save_values_pointers: "/* No Generated all_probes_types_and_save_values_pointers */",
        all_probes_and_save_values_chain: "/* No Generated all_probes_and_save_values_chain */",
        output_values_types_chain: "/* No Generated output_values_types_chain */",
        output_values_chain: "/* No Generated output_values_chain */",
        high_sensing_and_aggregation_code: "/* No Generated high_sensing_and_aggregation_code */",
        high_sending_sleeptime_and_output_building: "/* No Generated high_sending_sleeptime_and_output_building */",
        low_sensing_and_aggregation_code: "/* No Generated low_sensing_and_aggregation_code */",
        low_sending_sleeptime_and_output_building: "/* No Generated low_sending_sleeptime_and_output_building */",
        all_usemodule_sensors_list: "/* No Generated all_usemodule_sensors_list */",
        all_sensors_mainvars_definitions: "/* No Generated all_sensors_mainvars_definitions */",
        all_sensing_structs: "/* No Generated all_sensing_structs */",
        all_transforming_structs: "/* No Generated all_transforming_structs */",
        all_sensing_threads_funcitons_definition: "/* No Generated all_sensing_threads_funcitons_definition */",
        prepare_output_string: "/* No Generated prepare_output_string */",
        init_all_sensors: "/* No Generated init_all_sensors */",
        create_all_sensing_threads: "/* No Generated create_all_sensing_threads */"
    };
    const sensing_info = get_all_sensors_information(end_node_model);
    end_node_replace_obj.end_node_name = end_node_model.name;
    end_node_replace_obj.all_sensors_includes = sensing_info.all_sensors_includes;
    end_node_replace_obj.all_probes_types_and_save_values_pointers = sensing_info.all_probes_types_and_save_values_pointers;
    end_node_replace_obj.all_probes_and_save_values_chain = sensing_info.all_probes_and_save_values_chain;
    end_node_replace_obj.high_sensing_and_aggregation_code = `int16_t avg_temp_src[5];
    uint16_t avg_press_src[5];
    int16_t sense_lastplace = 0;
    for (int16_t w=0; w< 5; w++) {
        lpsxxx_read_temp(${sensing_info.all_sensing_info[0].probe_varname}, &avg_temp_src[w]);
        lpsxxx_read_pres(${sensing_info.all_sensing_info[1].probe_varname}, &avg_press_src[w]);
        sense_lastplace = w;
        xtimer_sleep(6);
    }
    int32_t sum_temp = 0;
    uint32_t sum_press = 0;
    for (int8_t  i=0; i<=sense_lastplace; i++){
        sum_temp += avg_temp_src[i];
        sum_press += avg_press_src[i];
    }
    *${sensing_info.all_sensing_info[0].var_name} = sum_temp / (sense_lastplace + 1);
    *${sensing_info.all_sensing_info[1].var_name} = sum_press / (sense_lastplace + 1);
    `;
    end_node_replace_obj.output_values_types_chain = "int16_t,  uint16_t,  int16_t";
    end_node_replace_obj.output_values_chain = `int16_t ${sensing_info.all_sensing_info[0].var_name}, uint16_t ${sensing_info.all_sensing_info[1].var_name}, int16_t status`;
    end_node_replace_obj.high_sending_sleeptime_and_output_building = `xtimer_sleep(30);
    sprintf(output,
        "0, %hi, %hi, %hu",
        status, ${sensing_info.all_sensing_info[0].var_name}, ${sensing_info.all_sensing_info[1].var_name});
    `;
    end_node_replace_obj.low_sensing_and_aggregation_code = `xtimer_sleep(180);
    *${sensing_info.all_sensing_info[1].var_name} = 0;     // Necessary to avoid not used error.
    ${sensing_info.all_sensing_info[0].sense_func.replace("___sense_probe_ptr___", sensing_info.all_sensing_info[0].probe_varname).replace("___sense_var_name_ptr___", sensing_info.all_sensing_info[0].var_name)};`;
    end_node_replace_obj.low_sending_sleeptime_and_output_building = `xtimer_sleep(180);
    ${sensing_info.all_sensing_info[1].var_name} = ${sensing_info.all_sensing_info[1].var_name} + 0;      // Necessary to avoid not used error.
    sprintf(output,
        "0, %hi, %hi",
        status, ${sensing_info.all_sensing_info[0].var_name});
    `;
    end_node_replace_obj.all_usemodule_sensors_list = sensing_info.all_usemodule_sensors_list;
    end_node_replace_obj.all_sensors_mainvars_definitions = sensing_info.all_sensors_mainvars_definitions;
    end_node_replace_obj.all_sensing_structs = sensing_info.all_sensing_structs;
    end_node_replace_obj.all_transforming_structs = ``;
    end_node_replace_obj.all_sensing_threads_funcitons_definition = `/* Code for thread 'MainSensingThread' */
    /* Stack of memory for thread 'MainSensingThread' */
    static char MainSensingThread_memstack[THREAD_STACKSIZE_MAIN];
    
    /* Thread 'MainSensingThread' */
    /* Thread to sense and transform one variable */
    static void *MainSensingThread(void *arg)
    {
        (void)arg;
        while (1) {
            // Use the state to gather the variables:
            state.sense(${sensing_info.all_sense_vars_state_call});
            if (${sensing_info.all_sensing_info[0].var_name}>=27) {
                state.toHigh(&state);
            } else {
                state.toLow(&state);
            }
        }
        return 0;
    }`;
    end_node_replace_obj.prepare_output_string = `// Use state to prepare output:
    //Get Time
    // rtc_get_time(&curtime);
    // time_t ftime = mktime(&curtime);
    state.sendSleep(output, ${sensing_info.all_sensing_info[0].var_name}, ${sensing_info.all_sensing_info[1].var_name}, state.status);
    `;
    end_node_replace_obj.init_all_sensors = `/* Start the RTC */
    time_t itime = ${Date.now()};
    rtc_set_time(gmtime(&itime));
    rtc_get_time(&curtime);
    ${sensing_info.init_all_sensors}`;
    end_node_replace_obj.create_all_sensing_threads = `thread_create(MainSensingThread_memstack, sizeof(MainSensingThread_memstack),
    THREAD_PRIORITY_MAIN + 1, 0, MainSensingThread, NULL,
    "MainSensingThread_thread0");`;
    return end_node_replace_obj;
};

const sink_node_code_extractor = async (sink_node_model, all_end_nodes) => {
    const sink_node_replace_obj = {
        all_sensors_includes: "/* No Generated all_sensors_includes */",
        all_probes_types_and_save_values_pointers: "/* No Generated all_probes_types_and_save_values_pointers */",
        all_probes_and_save_values_chain: "/* No Generated all_probes_and_save_values_chain */",
        output_values_types_chain: "/* No Generated output_values_types_chain */",
        output_values_chain: "/* No Generated output_values_chain */",
        high_sensing_and_aggregation_code: "/* No Generated high_sensing_and_aggregation_code */",
        high_sending_sleeptime_and_output_building: "/* No Generated high_sending_sleeptime_and_output_building */",
        low_sensing_and_aggregation_code: "/* No Generated low_sensing_and_aggregation_code */",
        low_sending_sleeptime_and_output_building: "/* No Generated low_sending_sleeptime_and_output_building */",
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
    const sensing_info = get_all_sensors_information(sink_node_model);
    sink_node_replace_obj.all_sensors_includes = sensing_info.all_sensors_includes;
    sink_node_replace_obj.all_probes_types_and_save_values_pointers = sensing_info.all_probes_types_and_save_values_pointers;
    sink_node_replace_obj.all_probes_and_save_values_chain = sensing_info.all_probes_and_save_values_chain;
    sink_node_replace_obj.output_values_types_chain = "int16_t,  uint16_t, int16_t";
    sink_node_replace_obj.output_values_chain = "int16_t temp_0, uint16_t press_0, int16_t status";
    sink_node_replace_obj.high_sensing_and_aggregation_code = ``;
    sink_node_replace_obj.high_sending_sleeptime_and_output_building = `xtimer_sleep(30);
    sprintf(output,
        "SinkNode Result:\t State: %hi, temp_0: %hi, press_0 %hu",
        status, temp_0, press_0);
    `;
    sink_node_replace_obj.low_sensing_and_aggregation_code = `xtimer_sleep(180);`;
    sink_node_replace_obj.low_sending_sleeptime_and_output_building = `xtimer_sleep(30);
    press_0 = press_0 + 0;      // Necessary to avoid not used error.
    sprintf(output,
        "SinkNode Result:\\t State: %hi, temp_0: %hi",
        status, temp_0);
    `;
    sink_node_replace_obj.all_usemodule_sensors_list = sensing_info.all_usemodule_sensors_list;
    sink_node_replace_obj.all_sensors_mainvars_definitions = sensing_info.all_sensors_mainvars_definitions;
    sink_node_replace_obj.all_sensing_structs = sensing_info.all_sensing_structs;
    sink_node_replace_obj.all_transforming_structs = ``;
    sink_node_replace_obj.all_receiving_structs = `// From Node 0:
    static int16_t state_0 = 0;
    static int16_t temp_0 = 0;
    static uint16_t pres_0 = 0;
    `;
    sink_node_replace_obj.reception_code = `rtc_get_time(&curtime);
    // Not a header!
    if (node_id == 0){
        sscanf(msg_str,
                "%i, %hi, %hi, %hu",
                &node_id, &state_0, &temp_0, &pres_0);
    }`;
    sink_node_replace_obj.all_sensing_threads_funcitons_definition = ``;
    sink_node_replace_obj.prepare_output_string_and_change_to_high_state_condition = `// Use state to prepare output:
    //Get Time
    // rtc_get_time(&curtime);
    // time_t ftime = mktime(&curtime);
    state.sendSleep(output, temp_0, pres_0, state.status);
    int change_to_high_state = state_0;
    `;
    sink_node_replace_obj.init_all_sensors = sensing_info.init_all_sensors;
    sink_node_replace_obj.create_all_sensing_and_transformation_threads = ``;
    return sink_node_replace_obj;
};


const end_node_code_extractor_faker = async (end_node_model) => {
    const end_node_replace_obj = {
        end_node_name: null,
        all_sensors_includes: null,
        all_probes_types_and_save_values_pointers: null,
        all_probes_and_save_values_chain: null,
        output_values_types_chain: "/* No Generated output_values_types_chain */",
        output_values_chain: "/* No Generated output_values_chain */",
        high_sensing_and_aggregation_code: null,
        high_sending_sleeptime_and_output_building: null,
        low_sensing_and_aggregation_code: null,
        low_sending_sleeptime_and_output_building: null,
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
    end_node_replace_obj.all_sensors_includes = `#include "lpsxxx.h"
    #include "lpsxxx_params.h"
    //#include "isl29020.h"
    //#include "isl29020_params.h"`;
    end_node_replace_obj.all_probes_types_and_save_values_pointers = `lpsxxx_t*, int16_t*,  uint16_t*`;
    end_node_replace_obj.all_probes_and_save_values_chain = `lpsxxx_t* lpsx_probe, int16_t* temp, uint16_t* press`;
    end_node_replace_obj.high_sensing_and_aggregation_code = `int16_t avg_temp_src[5];
    uint16_t avg_press_src[5];
    int16_t sense_lastplace = 0;
    for (int16_t w=0; w< 5; w++) {
        lpsxxx_read_temp(lpsx_probe, &avg_temp_src[w]);
        lpsxxx_read_pres(lpsx_probe, &avg_press_src[w]);
        sense_lastplace = w;
        xtimer_sleep(6);
    }
    int32_t sum_temp = 0;
    uint32_t sum_press = 0;
    for (int8_t  i=0; i<=sense_lastplace; i++){
        sum_temp += avg_temp_src[i];
        sum_press += avg_press_src[i];
    }
    *temp = sum_temp / (sense_lastplace + 1);
    *press = sum_press / (sense_lastplace + 1);
    `;
    end_node_replace_obj.output_values_types_chain = "int16_t,  uint16_t,  int16_t";
    end_node_replace_obj.output_values_chain = "int16_t temp, uint16_t press, int16_t status";
    end_node_replace_obj.high_sending_sleeptime_and_output_building = `xtimer_sleep(30);
    sprintf(output,
        "0, %hi, %hi, %hu",
        status, temp, press);
    `;
    end_node_replace_obj.low_sensing_and_aggregation_code = `xtimer_sleep(180);
    *press = 0;     // Necessary to avoid not used error.
    lpsxxx_read_temp(lpsx_probe, temp);`;
    end_node_replace_obj.low_sending_sleeptime_and_output_building = `xtimer_sleep(180);
    press = press + 0;      // Necessary to avoid not used error.
    sprintf(output,
        "0, %hi, %hi",
        status, temp);
    `;
    end_node_replace_obj.all_usemodule_sensors_list = `lps331ap isl29020`;
    end_node_replace_obj.all_sensors_mainvars_definitions = `static lpsxxx_t lpsxxx;
    //static isl29020_t isl29020;`;
    end_node_replace_obj.all_sensing_structs = `static int16_t temperature = 0;
    static uint16_t pressure = 0;
    `;
    end_node_replace_obj.all_transforming_structs = ``;
    end_node_replace_obj.all_sensing_threads_funcitons_definition = `/* Code for thread 'MainSensingThread' */
    /* Stack of memory for thread 'MainSensingThread' */
    static char MainSensingThread_memstack[THREAD_STACKSIZE_MAIN];
    
    /* Thread 'MainSensingThread' */
    /* Thread to sense and transform one variable */
    static void *MainSensingThread(void *arg)
    {
        (void)arg;
        while (1) {
            // Use the state to gather the variables:
            state.sense(&lpsxxx, &temperature, &pressure);
            if (temperature>=27) {
                state.toHigh(&state);
            } else {
                state.toLow(&state);
            }
        }
        return 0;
    }`;
    end_node_replace_obj.prepare_output_string = `// Use state to prepare output:
    //Get Time
    // rtc_get_time(&curtime);
    // time_t ftime = mktime(&curtime);
    state.sendSleep(output, temperature, pressure, state.status);
    `;
    end_node_replace_obj.init_all_sensors = `/* Start the RTC */
    time_t itime = ${Date.now()};
    rtc_set_time(gmtime(&itime));
    lpsxxx_init(&lpsxxx, lpsxxx_params);
    //isl29020_init(&isl29020, isl29020_params);

    rtc_get_time(&curtime);`;
    end_node_replace_obj.create_all_sensing_threads = `thread_create(MainSensingThread_memstack, sizeof(MainSensingThread_memstack),
    THREAD_PRIORITY_MAIN + 1, 0, MainSensingThread, NULL,
    "MainSensingThread_thread0");`;
    /* ********* */

    return end_node_replace_obj;
};

const sink_node_code_extractor_faker = async (sink_node_model) => {
    const sink_node_replace_obj = {
        all_sensors_includes: null,
        all_probes_types_and_save_values_pointers: null,
        all_probes_and_save_values_chain: null,
        output_values_types_chain: "/* No Generated output_values_types_chain */",
        output_values_chain: "/* No Generated output_values_chain */",
        high_sensing_and_aggregation_code: null,
        high_sending_sleeptime_and_output_building: null,
        low_sensing_and_aggregation_code: null,
        low_sending_sleeptime_and_output_building: null,
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
    sink_node_replace_obj.all_probes_types_and_save_values_pointers = `void`;
    sink_node_replace_obj.all_probes_and_save_values_chain = `void`;
    sink_node_replace_obj.output_values_types_chain = "int16_t,  uint16_t, int16_t";
    sink_node_replace_obj.output_values_chain = "int16_t temp_0, uint16_t press_0, int16_t status";
    sink_node_replace_obj.high_sensing_and_aggregation_code = ``;
    sink_node_replace_obj.high_sending_sleeptime_and_output_building = `xtimer_sleep(30);
    sprintf(output,
        "SinkNode Result:\t State: %hi, temp_0: %hi, press_0 %hu",
        status, temp_0, press_0);
    `;
    sink_node_replace_obj.low_sensing_and_aggregation_code = `xtimer_sleep(180);`;
    sink_node_replace_obj.low_sending_sleeptime_and_output_building = `xtimer_sleep(30);
    press_0 = press_0 + 0;      // Necessary to avoid not used error.
    sprintf(output,
        "SinkNode Result:\\t State: %hi, temp_0: %hi",
        status, temp_0);
    `;
    sink_node_replace_obj.all_usemodule_sensors_list = ``;
    sink_node_replace_obj.all_sensors_mainvars_definitions = ``;
    sink_node_replace_obj.all_sensing_structs = ``;
    sink_node_replace_obj.all_transforming_structs = ``;
    sink_node_replace_obj.all_receiving_structs = `// From Node 0:
    static int16_t state_0 = 0;
    static int16_t temp_0 = 0;
    static uint16_t pres_0 = 0;
    `;
    sink_node_replace_obj.reception_code = `rtc_get_time(&curtime);
    // Not a header!
    if (node_id == 0){
        sscanf(msg_str,
                "%i, %hi, %hi, %hu",
                &node_id, &state_0, &temp_0, &pres_0);
    }`;
    sink_node_replace_obj.all_sensing_threads_funcitons_definition = ``;
    sink_node_replace_obj.prepare_output_string_and_change_to_high_state_condition = `// Use state to prepare output:
    //Get Time
    // rtc_get_time(&curtime);
    // time_t ftime = mktime(&curtime);
    state.sendSleep(output, temp_0, pres_0, state.status);
    int change_to_high_state = state_0;
    `;
    sink_node_replace_obj.init_all_sensors = ``;
    sink_node_replace_obj.create_all_sensing_and_transformation_threads = ``;
    /* ********* */

    return sink_node_replace_obj;
};

module.exports = {
    generate_application_code
};