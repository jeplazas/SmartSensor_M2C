/*!
 * \file 'main.c' generated with 	RIOT_ModelToCode_v1_updating.py by @jeplazas
 * \brief MDA-generated application running on RIOT
 * \author Julián E. Plazas P.
 * \date 2022-07-19
 * \
 */

#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "HighState.h"
#include "LowState.h"

#include "thread.h"
#include "timex.h"
#include "xtimer.h"

#include "net/af.h"
#include "net/protnum.h"
#include "net/netif.h"
#include "net/ipv6/addr.h"
#include "net/sock/udp.h"

#ifdef MODULE_XBEE 	// Include Xbee modules if Xbee module is used:
#include "xbee.h"
#include "xbee_params.h"
#endif


#include "periph/rtc.h"
static struct tm curtime;


/* Sensor at30tse75x declaration */
#include "at30tse75x.h"
static at30tse75x_t at30tse75x;


/* ***Definitions for threads*** */

/* *TempNode_Measures* */
/* Sensing Structs */
// Private struct for AirTemperature_avg:
typedef struct AirTemperature_avg_dataStruct {
	float avgTemp_src[5];
	int8_t avgTemp_src_lastplace;
} AirTemperature_avg_dataStruct;
// Public struct for AirTemperature_avg:
typedef struct AirTemperature_avg_publicDataStruct {
	AirTemperature_avg_dataStruct data;
	mutex_t lock;
} AirTemperature_avg_publicDataStruct;
static AirTemperature_avg_publicDataStruct public_AirTemperature_avg;

static struct State state;

/* Transforming Structs */


/*----------	----------	----------	----------	----------*/


/*	Network Loader	*/
static sock_udp_t sock;
static sock_udp_ep_t server;
int load_network_configuration(void){
	xtimer_sleep(3);
	printf("Server Address: %s\t\tPort: %d\n", SERVER_ADDR, SERVER_PORT);
	/* Create the socket endpoint */
	sock_udp_ep_t local = SOCK_IPV6_EP_ANY;
	local.port = 0xacdb;
	if (sock_udp_create(&sock, &local, NULL, 0) < 0) {
		puts("error creating UDP socket");
		return 1;
	}
	/* Configure the remote sock UDP endpoint */
	server.family = AF_INET6;
	server.netif = 5;
	server.port = SERVER_PORT;
	/* Convert server address from string to ipv6_addr_t */
	if (ipv6_addr_from_str((ipv6_addr_t *)&server.addr.ipv6, SERVER_ADDR) == NULL) {
		puts("Cannot convert server address");
		sock_udp_close(&sock);
		puts("UDP socket closed!");
		return 1;
	}
	return 0;
}



/* Code for thread 'AirTemperature_avgThread' */
/* Stack of memory for thread 'AirTemperature_avgThread' */
static char AirTemperature_avgThread_memstack[THREAD_STACKSIZE_MAIN];

/* Thread 'AirTemperature_avgThread' */
/* Thread to sense and transform one variable */
static void *AirTemperature_avgThread(void *arg)
{
	(void)arg;
	while (1) {
		AirTemperature_avg_dataStruct internalData;
		// Use the state to gather the variables:
		state.sense(&at30tse75x, &internalData.avgTemp_src[0]);
        if (internalData.avgTemp_src[0]>=27) {
            state.toHigh(&state);
        } else {
            state.toLow(&state);
        }
		// Save the internal data into the public struct:
		mutex_lock(&public_AirTemperature_avg.lock);
		public_AirTemperature_avg.data = internalData;
		mutex_unlock(&public_AirTemperature_avg.lock);
	}
	return 0;
}



/* Code for thread 'PlotAvgTemperatureDeliveryThread' */
/* Stack of memory for thread 'PlotAvgTemperatureDeliveryThread' */
static char PlotAvgTemperatureDeliveryThread_memstack[THREAD_STACKSIZE_MAIN];

/* Thread 'PlotAvgTemperatureDeliveryThread' */
/* Thread to deliver the sensed and transformed variables */
static void *PlotAvgTemperatureDeliveryThread(void *arg)
{
	(void)arg;
	while (1) {
		// Use the state to sleep:
		state.sendSleep();
		// Sensed AirTemperature_avg data:
		mutex_lock(&public_AirTemperature_avg.lock);
		AirTemperature_avg_dataStruct AirTemperature_avg_data = public_AirTemperature_avg.data;
		mutex_unlock(&public_AirTemperature_avg.lock);
        //Get Time
        rtc_get_time(&curtime);
        time_t ftime = mktime(&curtime);
		//Prepare the data string to be sent:
		char output[254];
		sprintf(output,
				"0, %i, %hi, %hi, %ld",
				(int) AirTemperature_avg_data.avgTemp_src[0], AirTemperature_avg_data.avgTemp_src_lastplace, state.status, (int32_t) ftime);
		//Send data through Transceiver:
		if (sock_udp_send(&sock, output, sizeof(output), &server) < 0) {
			puts("Error sending message");
			sock_udp_close(&sock);
			return NULL;
		}
        printf("Node_0 Temp = %i;  State = %hi\n", (int) AirTemperature_avg_data.avgTemp_src[0], state.status);
	}
	return 0;
}

/*************************************************************************************/

/*!
 * \brief Main function : Initializes sensors threads executed in RIOT
 * \
 * \Main function : Initializes sensors and threads executed in RIOT
 */
int main(void)
{
    /* Start the RTC */
    // rtc_init();
    time_t itime = 1659484800;
    rtc_set_time(gmtime(&itime));
	/* Init the sensors */
	/* Call the network loader */
	int net = load_network_configuration();
	if (net == 0)
		puts("Network configuration loaded successfully");
	at30tse75x_init(&at30tse75x, 0, 0x4f); // TODO: Check the correct I2C device and address. 0, 0x4f are default for SAMR21 nodes.
    
    rtc_get_time(&curtime);
    // time_t ftime = mktime(&curtime);
    // printf("Node_1 startup time: %ld\n", (int32_t) ftime);
    printf("Node_0 startup time: %s\n", asctime(&curtime));

	// Initialize the state in the low state:
	transitionToLow(&state);

	/* Init the threads */
	thread_create(AirTemperature_avgThread_memstack, sizeof(AirTemperature_avgThread_memstack),
				THREAD_PRIORITY_MAIN + 1, 0, AirTemperature_avgThread, NULL,
				"AirTemperature_avgThread_thread0");
	thread_create(PlotAvgTemperatureDeliveryThread_memstack, sizeof(PlotAvgTemperatureDeliveryThread_memstack),
				THREAD_PRIORITY_MAIN + 1, 0, PlotAvgTemperatureDeliveryThread, NULL,
				"PlotAvgTemperatureDeliveryThread_thread1");
	return 0;
}
