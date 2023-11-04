#include "State.h"

// Let's define default implementation so that we don't have to define what is each state doing on every state

static void defaultHighSensing(float* temperature) {
    puts("DEBUG_HIGH_default: Started sensing");
    float avgTemp_src[5];
    int16_t avgTemp_src_lastplace = 0;
    for (int16_t w=0; w< 5; w++) {
        // at30tse75x_get_temperature(probe, &avgTemp_src[w]);
        avgTemp_src[w] = 25;
        avgTemp_src_lastplace = w;
        xtimer_sleep(6);
    }
    double sum = 0;
    for (int8_t  i=0; i<=avgTemp_src_lastplace; i++){
        sum += avgTemp_src[i];
    }
    *temperature = sum / (avgTemp_src_lastplace + 1);
    puts("DEBUG_HIGH_default: Finished sensing");
}
static void defaultHighSending(void) {
    puts("DEBUG_HIGH_default: Waiting to send");
    xtimer_sleep(30);
}
static void defaultHigh(StatePtr state) {
    // In case that the toHigh event is not re-defined in the concrete state
    state->sense = defaultHighSensing;
    state->sendSleep = defaultHighSending;
    state->status = 1;
}

static void defaultLowSensing(float* temperature) {
    puts("DEBUG_LOW_default: Started sensing");
    xtimer_sleep(180);
    *temperature = 30;
    puts("DEBUG_LOW_default: Finished sensing");
}
static void defaultLowSending(void) {
    puts("DEBUG_LOW_default: Waiting to send");
    xtimer_sleep(180);
}
static void defaultLow(StatePtr state) {
    // In case that the toLow event is not re-defined in the concrete state
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