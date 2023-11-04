/*!
 * \file 'State.c' generated with RIOT_ModelToCode_Tool by @jeplazas
 * \brief MDA-generated application running on RIOT
 * \author -___author___-
 * \date -___date___-
 * \
 */

#include "State.h"

// Let's define default implementation so that we don't have to define what is each state doing on every state

/*	High State	*/
static void defaultHighSensing(-___all_probes_and_save_values_chain___-) {
    puts("DEBUG_def_HIGH: Started sensing");
    -___high_sensing_and_aggregation_code___-
    puts("DEBUG_def_HIGH: Finished sensing");
}
static void defaultHighSending(char* output, -___output_values_chain___-) {
    puts("DEBUG_def_HIGH: Waiting to send");
    -___high_sending_sleeptime_and_output_building___-   
    puts("DEBUG_def_HIGH: Output built");
}

/*	Low State	*/
static void defaultLowSensing(-___all_probes_and_save_values_chain___-) {
    puts("DEBUG_def_LOW: Started sensing");
    -___low_sensing_and_aggregation_code___-
    puts("DEBUG_def_LOW: Finished sensing");
}
static void defaultLowSending(char* output, -___output_values_chain___-) {
    puts("DEBUG_def_LOW: Waiting to send");
    -___low_sending_sleeptime_and_output_building___-
    puts("DEBUG_def_LOW: Output built");
}

/*	High State	*/
static void defaultHigh(StatePtr state) {
    state->sense = defaultHighSensing;
    state->sendSleep = defaultHighSending;
    state->status = 1;
}
/*	Low State	*/
static void defaultLow(StatePtr state) {
    state->sense = defaultLowSensing;
    state->sendSleep = defaultLowSending;
    state->status = 0;
}


// Implementation defition of the default implementation
void defaultImplementation(StatePtr state){
    state->toHigh = defaultHigh;
    state->toLow = defaultLow;
    state->status = -1;
}