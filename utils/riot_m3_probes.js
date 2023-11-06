const m3_sensors_list = {
    Temperature_lps: {
        name: "Temperature_lps",
        include: `\n#include "lpsxxx.h"\n#include "lpsxxx_params.h"\n`,
        c_type: "int16_t",
        sense_function: "lpsxxx_read_temp(___sense_probe_ptr___, ___sense_var_name_ptr___);\n",
        usemodule: "lps331ap",
        mainvar_definition: "static lpsxxx_t lpsxxx;\n",
        initialization_function: "lpsxxx_init(&lpsxxx, lpsxxx_params);\n",
    },
    Pressure_lps: {
        name: "Pressure_lps",
        include: `\n#include "lpsxxx.h"\n#include "lpsxxx_params.h"\n`,
        c_type: "uint16_t",
        sense_function: "lpsxxx_read_pres(___sense_probe_ptr___, ___sense_var_name_ptr___);\n",
        usemodule: "lps331ap",
        mainvar_definition: "static lpsxxx_t lpsxxx;\n",
        initialization_function: "lpsxxx_init(&lpsxxx, lpsxxx_params);\n",
    },
    Light_isl: {
        name: "Light_isl",
        include: `\n#include "lpsxxx.h"\n#include "lpsxxx_params.h"\n`,
        c_type: "int16_t",
        sense_function: "isl29020_read(___sense_probe_ptr___);\n",
        usemodule: "isl29020",
        mainvar_definition: "static isl29020_t isl29020;\n",
        initialization_function: "isl29020_init(&isl29020, isl29020_params);\n",
    },
};

module.exports = m3_sensors_list;