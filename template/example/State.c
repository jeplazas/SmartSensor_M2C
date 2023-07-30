#include "State.h"

// Let's define default implementation so that we don't have to define what is each state doing on every state

/*	High State	*/
static void defaultHighSensing(at30tse75x_t* probe, float* temperature) {
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
}
static void defaultHighSending(void) {
    xtimer_sleep(300);
}

/*	Low State	*/
static void defaultLowSensing(at30tse75x_t* probe, float* temperature) {
    xtimer_sleep(1800);
    at30tse75x_get_temperature(probe, temperature);
}
static void defaultLowSending(void) {
    xtimer_sleep(1800);
}

/*	High State	*/
static void defaultHigh(StatePtr state) {
    state->toLow = defaultLow;
    state->sense = defaultHighSensing;
    state->sendSleep = defaultHighSending;
    state->status = 1;
}
/*	Low State	*/
static void defaultLow(StatePtr state) {
    state->toHigh = defaultHigh;
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