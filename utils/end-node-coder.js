const fs = require('fs/promises');
const path = require('path');

const templates_dir = path.join('template', 'dual_state');

const copy_replace_State_files = async (
    author, save_dir,
    all_sensors_includes, all_probes_types_and_save_values_pointers, all_probes_and_save_values_chain,
    output_values_types_chain, output_values_chain,
    high_sensing_and_aggregation_code, high_sending_sleeptime_and_output_building, low_sensing_and_aggregation_code,
    low_sending_sleeptime_and_output_building) => {
    const date_str = new Date().toDateString();
    const state_h = await fs.readFile(path.join(templates_dir, 'State.h'));
    let new_state_h = state_h.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str)
        .replaceAll("-___all_sensors_includes___-", all_sensors_includes)
        .replaceAll("-___all_probes_types_and_save_values_pointers___-", all_probes_types_and_save_values_pointers)
        .replaceAll("-___output_values_types_chain___-", output_values_types_chain);
    await fs.writeFile(path.join(save_dir, 'State.h'), new_state_h);

    const state_c = await fs.readFile(path.join(templates_dir, 'State.c'));
    let new_state_c = state_c.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str)
        .replaceAll("-___all_probes_and_save_values_chain___-", all_probes_and_save_values_chain)
        .replaceAll("-___output_values_chain___-", output_values_chain)
        .replaceAll("-___high_sensing_and_aggregation_code___-", high_sensing_and_aggregation_code)
        .replaceAll("-___high_sending_sleeptime_and_output_building___-", high_sending_sleeptime_and_output_building)
        .replaceAll("-___low_sensing_and_aggregation_code___-", low_sensing_and_aggregation_code)
        .replaceAll("-___low_sending_sleeptime_and_output_building___-", low_sending_sleeptime_and_output_building);
    await fs.writeFile(path.join(save_dir, 'State.c'), new_state_c);

    const highstate_c = await fs.readFile(path.join(templates_dir, 'HighState.c'));
    let new_highstate_c = highstate_c.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str)
        .replaceAll("-___all_probes_and_save_values_chain___-", all_probes_and_save_values_chain)
        .replaceAll("-___output_values_chain___-", output_values_chain)
        .replaceAll("-___high_sensing_and_aggregation_code___-", high_sensing_and_aggregation_code)
        .replaceAll("-___high_sending_sleeptime_and_output_building___-", high_sending_sleeptime_and_output_building);
    await fs.writeFile(path.join(save_dir, 'HighState.c'), new_highstate_c);

    const highstate_h = await fs.readFile(path.join(templates_dir, 'HighState.h'));
    let new_highstate_h = highstate_h.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str);
    await fs.writeFile(path.join(save_dir, 'HighState.h'), new_highstate_h);

    const lowstate_c = await fs.readFile(path.join(templates_dir, 'LowState.c'));
    let new_lowstate_c = lowstate_c.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str)
        .replaceAll("-___all_probes_and_save_values_chain___-", all_probes_and_save_values_chain)
        .replaceAll("-___output_values_chain___-", output_values_chain)
        .replaceAll("-___low_sensing_and_aggregation_code___-", low_sensing_and_aggregation_code)
        .replaceAll("-___low_sending_sleeptime_and_output_building___-", low_sending_sleeptime_and_output_building);
    await fs.writeFile(path.join(save_dir, 'LowState.c'), new_lowstate_c);

    const lowstate_h = await fs.readFile(path.join(templates_dir, 'LowState.h'));
    let new_lowstate_h = lowstate_h.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str);
    await fs.writeFile(path.join(save_dir, 'LowState.h'), new_lowstate_h);

    return true;
};

const copy_replace_Makefile = async (
    author, save_dir,
    app_name, target_board, default_network_channel, default_network_id, all_usemodule_sensors_list) => {
    const date_str = new Date().toDateString();
    const makefile = await fs.readFile(path.join(templates_dir, 'Makefile_endnode'));
    let new_makefile = makefile.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str)
        .replaceAll("-___app_name___-", app_name)
        .replaceAll("-___target_board___-", target_board)
        .replaceAll("-___default_network_channel___-", default_network_channel)
        .replaceAll("-___default_network_id___-", default_network_id)
        .replaceAll("-___all_usemodule_sensors_list___-", all_usemodule_sensors_list);
    await fs.writeFile(path.join(save_dir, 'Makefile'), new_makefile);

    return true;
};

const copy_replace_Main_file = async (
    author, save_dir, all_sensors_includes, all_sensors_mainvars_definitions, all_sensing_structs, all_transforming_structs,
    all_sensing_threads_funcitons_definition, prepare_output_string, init_all_sensors, create_all_sensing_threads) => {
    const date_str = new Date().toDateString();
    const main_c = await fs.readFile(path.join(templates_dir, 'end-node_main.c'));
    let new_main_c = main_c.toString().replaceAll("-___author___-", author)
        .replaceAll("-___date___-", date_str)
        .replaceAll("-___all_sensors_includes___-", all_sensors_includes)
        .replaceAll("-___all_sensors_mainvars_definitions___-", all_sensors_mainvars_definitions)
        .replaceAll("-___all_sensing_structs___-", all_sensing_structs)
        .replaceAll("-___all_transforming_structs___-", all_transforming_structs)
        .replaceAll("-___all_sensing_threads_funcitons_definition___-", all_sensing_threads_funcitons_definition)
        .replaceAll("-___prepare_output_string___-", prepare_output_string)
        .replaceAll("-___init_all_sensors___-", init_all_sensors)
        .replaceAll("-___create_all_sensing_threads___-", create_all_sensing_threads);
    await fs.writeFile(path.join(save_dir, 'main.c'), new_main_c);

    return true;
};


const generate_end_node = async (
    author = "Julian E. Plazas P.", output_dir, end_node_name,
    all_sensors_includes, all_probes_types_and_save_values_pointers, 
    all_probes_and_save_values_chain, output_values_types_chain, output_values_chain,
    high_sensing_and_aggregation_code, high_sending_sleeptime_and_output_building,
    low_sensing_and_aggregation_code, low_sending_sleeptime_and_output_building, app_name, target_board, default_network_channel,
    default_network_id, all_usemodule_sensors_list, all_sensors_mainvars_definitions, all_sensing_structs,
    all_transforming_structs, all_sensing_threads_funcitons_definition, prepare_output_string, init_all_sensors,
    create_all_sensing_threads) => {
    try {
        const save_dir = path.join(output_dir, end_node_name);
        await fs.mkdir(save_dir, { recursive: true });
        await copy_replace_State_files(author, save_dir, all_sensors_includes, all_probes_types_and_save_values_pointers,
            all_probes_and_save_values_chain, output_values_types_chain, output_values_chain,
            high_sensing_and_aggregation_code, high_sending_sleeptime_and_output_building,
            low_sensing_and_aggregation_code, low_sending_sleeptime_and_output_building);
        await copy_replace_Makefile(author, save_dir, app_name, target_board, default_network_channel, default_network_id,
            all_usemodule_sensors_list);
        await copy_replace_Main_file(author, save_dir, all_sensors_includes, all_sensors_mainvars_definitions, all_sensing_structs,
            all_transforming_structs, all_sensing_threads_funcitons_definition, prepare_output_string, init_all_sensors,
            create_all_sensing_threads);
        return null;
    } catch (error) {
        console.error(error);
        return error;
    }

};

module.exports = generate_end_node;