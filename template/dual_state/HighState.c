/*!
 * \file 'HighState.c' generated with RIOT_ModelToCode_Tool by @jeplazas
 * \brief MDA-generated application running on RIOT
 * \author -___author___-
 * \date -___date___-
 * \
 */

#include "HighState.h"
#include "LowState.h"

static void toLowSensing(StatePtr state) {
    transitionToLow(state);
}

static void highSensing(-___all_probes_and_save_values_chain___-) {
    puts("DEBUG_HIGH: Started sensing");
    -___high_sensing_and_aggregation_code___-
    puts("DEBUG_HIGH: Finished sensing");
}
static void highSending(char* output, -___output_values_chain___-) {
    puts("DEBUG_HIGH: Waiting to send");
    -___high_sending_sleeptime_and_output_building___-
    puts("DEBUG_HIGH: Output built");
}

void transitionToHigh(StatePtr state) {
    // Initialize the default implementation and re-define the specific events to handle in the high state (toLow)
    defaultImplementation(state);
    state->toLow = toLowSensing;
    state->sense = highSensing;
    state->sendSleep = highSending;
    state->status = 1;
    puts("Passed to High State");
}