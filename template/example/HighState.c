#include "HighState.h"
#include "LowState.h"

static void toLowSensing(StatePtr state) {
    transitionToLow(state);
}

static void highSensing(at30tse75x_t* probe, float* temperature) {
    puts("DEBUG_HIGH: Started sensing");
    float avgTemp_src[5];
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
    *temperature = sum / (avgTemp_src_lastplace + 1);
    puts("DEBUG_HIGH: Finished sensing");
}
static void highSending(void) {
    puts("DEBUG_HIGH: Waiting to send");
    xtimer_sleep(300);
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