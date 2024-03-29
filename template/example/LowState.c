#include "LowState.h"
#include "HighState.h"

static void toHighSensing(StatePtr state) {
    transitionToHigh(state);
}

static void lowSensing(float* temperature) {
    puts("DEBUG_LOW: Started sensing");
    xtimer_sleep(180);
    *temperature = 30;
    puts("DEBUG_LOW: Finished sensing");
}
static void lowSending(void) {
    puts("DEBUG_LOW: Waiting to send");
    xtimer_sleep(180);
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