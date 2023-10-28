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


/* Sensors declaration */
-___all_sensors_includes___-

-___all_sensors_mainvars_definitions___-


/* ***Definitions for threads*** */

/* *Measures* */
/* Sensing Structs */
-___all_sensing_structs___-

static struct State state;

/* Transforming Structs */
-___all_transforming_structs___-


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



/* Sensing threads */
-___all_sensing_threads_funcitons_definition___-


/* Delivery thread */
/* Code for thread 'PlotAvgTemperatureDeliveryThread' */
/* Stack of memory for thread 'PlotAvgTemperatureDeliveryThread' */
static char MainNodeDeliveryThread_memstack[THREAD_STACKSIZE_MAIN];

/* Thread 'PlotAvgTemperatureDeliveryThread' */
/* Thread to deliver the sensed and transformed variables */
static void *MainNodeDeliveryThread(void *arg)
{
	(void)arg;
	while (1) {
		// Use the state to sleep:
		state.sendSleep();
		-___prepare_output_string___-
		//Send data through Transceiver:
		if (sock_udp_send(&sock, output, sizeof(output), &server) < 0) {
			puts("Error sending message");
			sock_udp_close(&sock);
			return NULL;
		}
        printf("Node State = %hi; Output:\n\t%s", state.status, output);
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
	/* Init the sensors */
	-___init_all_sensors___-
	
	/* Call the network loader */
	int net = load_network_configuration();
	if (net == 0)
		puts("Network configuration loaded successfully");

	// Initialize the state in the low state:
	transitionToLow(&state);

	/* Init the threads */
	-___create_all_threads___-

	return 0;
}
