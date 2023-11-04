/*!
 * \file 'LowState.c' generated with RIOT_ModelToCode_Tool by @jeplazas
 * \brief MDA-generated application running on RIOT
 * \author -___author___-
 * \date -___date___-
 * \
 */

#include "LowState.h"
#include "HighState.h"

static void toHighSensing(StatePtr state) {
    transitionToHigh(state);
}

static void lowSensing(-___all_probes_and_save_values_chain___-) {
    puts("DEBUG_LOW: Started sensing");
    -___low_sensing_and_aggregation_code___-
    puts("DEBUG_LOW: Finished sensing");
}
static void lowSending(char* output, -___output_values_chain___-) {
    puts("DEBUG_LOW: Waiting to send");
    -___low_sending_sleeptime_and_output_building___-
    puts("DEBUG_LOW: Output built");
}

void transitionToLow(StatePtr state) {
    // Initialize the default implementation and re-define the specific events to handle in the low state (toHigh)
    defaultImplementation(state);
    state->toHigh = toHighSensing;
    state->sense = lowSensing;
    state->sendSleep = lowSending;
    state->status = 0;
    puts("Passed to Low State");
}