-___all_sensors_includes___-
#include "timex.h"
#include "xtimer.h"

// Represent the state itself as a pointer
typedef struct State* StatePtr;

// Pointers for each state change function:
typedef void (*EventToHighFunc) (StatePtr);
typedef void (*EventToLowFunc) (StatePtr);

// Pointers to sense and send functions:
typedef void (*SenseFunc)(-___all_probes_types_pointers___-, -___all_save_values_types_pointers___-);
typedef void (*SendSleepFunc)(void);

#ifndef StateDefined
#define StateDefined
struct State {
    EventToHighFunc toHigh;
    EventToLowFunc toLow;
    SenseFunc sense;
    SendSleepFunc sendSleep;
    int16_t status;
};
#endif

// Default implementation of the state
void defaultImplementation(StatePtr state);

// Default implementation of high sensing and sending;