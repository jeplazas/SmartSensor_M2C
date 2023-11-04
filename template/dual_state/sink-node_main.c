/*!
 * \file 'main.c' generated with RIOT_ModelToCode_Tool by @jeplazas
 * \brief MDA-generated application running on RIOT
 * \author -___author___-
 * \date -___date___-
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

#include "msg.h"
#include "shell.h"

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

/* Receiving Structs */
-___all_receiving_structs___-


/*----------	----------	----------	----------	----------*/


/*	Network Loader	*/
extern int _gnrc_netif_config(int argc, char **argv);
static sock_udp_t sock;
int load_network_configuration(void){
	/* print network addresses */
	xtimer_sleep(7);
	puts("Configured network interfaces:");
	_gnrc_netif_config(0, NULL);
	printf("Server Port: %d\n", SERVER_PORT);
	/* Create the socket endpoint */
	sock_udp_ep_t local = SOCK_IPV6_EP_ANY;
	local.port = SERVER_PORT;
	 if (sock_udp_create(&sock, &local, NULL, 0) < 0) {
		puts("error creating UDP socket");
		return 1;
	}
	return 0;
}

/* Code for thread 'DataLoaderThread' */
/* Stack of memory for thread 'DataLoaderThread' */
static char DataLoaderThread_memstack[THREAD_STACKSIZE_MAIN];
/* PID of thread 'DataLoaderThread' */
static kernel_pid_t loader_pid;

/* Thread 'DataLoaderThread' */
/* Thread that receives and loads the incoming data */
static void *DataLoaderThread(void *arg)
{
	(void)arg;
	while (1) {
		msg_t msg;
		msg_receive(&msg); /* Blocks until a message is received */
		/* Copy to an internal variable */
		int len_msg = strlen((char*)msg.content.ptr);
		char msg_str[len_msg];
		strcpy(msg_str, (char*)msg.content.ptr);
		/* Declare the variables using the internal structs for received data */
		/* Extract the data from the received string  */
		// First check if it is the header (first item is not a number!):
		int node_id = atoi(msg_str);
		if (node_id != 0 || msg_str[0] == '0'){
            // Get Time
            rtc_get_time(&curtime);
			// Not a header!
			-___reception_code___-
		} else {
			puts("Header received:");
			puts(msg_str);
		}
	}
	return NULL;
}

/* Code for thread 'TransceiverListenerThread' */
/* Stack of memory for thread 'TransceiverListenerThread' */
static char TransceiverListenerThread_memstack[THREAD_STACKSIZE_MAIN];
static uint8_t transceiver_buffer[254];

/* Thread 'TransceiverListenerThread' */
/* Simple Thread listening the transceiver */
static void *TransceiverListenerThread(void *arg)
{
	(void)arg;
	while (1) {
		sock_udp_ep_t remote;
		ssize_t res;
		if ((res = sock_udp_recv(&sock, transceiver_buffer, sizeof(transceiver_buffer), SOCK_NO_TIMEOUT, &remote)) >= 0) {
			/* Send the message to the DataLoaderThread */
			msg_t msg;
			msg.content.ptr = transceiver_buffer;
			msg_send(&msg, loader_pid);
			// Uncomment following lines to reply with ACK
			/* char ack[] = "ACK";
			if (sock_udp_send(&sock, ack, sizeof(ack), &remote) < 0) {
				puts("Error sending ACK");
			} */
		}
	}
	return 0;
}

/* Sensing threads */
-___all_sensing_threads_funcitons_definition___-


/* Delivery thread */
/* Code for thread 'MainNodeDeliveryThread' */
/* Stack of memory for thread 'MainNodeDeliveryThread' */
static char MainNodeDeliveryThread_memstack[THREAD_STACKSIZE_MAIN];

/* Thread 'MainNodeDeliveryThread' */
/* Thread to deliver the sensed and transformed variables */
static void *MainNodeDeliveryThread(void *arg)
{
	(void)arg;
	while (1) {
		// Use the state to sleep:
		state.sendSleep();
		-___prepare_output_string_and_change_to_high_state_condition___-
		//Send data through UART_0:
		puts(output);
		if (change_to_high_state) {
            state.toHigh(&state);
        } else {
            state.toLow(&state);
        }
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
    time_t itime = -___generation_unix_time___-;
    rtc_set_time(gmtime(&itime));
	/* Init the sensors */
	-___init_all_sensors___-
	
	/* Call the network loader */
	int net = load_network_configuration();
	if (net == 0)
		puts("Network configuration loaded successfully");

	rtc_get_time(&curtime);
    printf("SinkNode startup time: %s\n", asctime(&curtime));

	// Initialize the state in the low state:
	transitionToLow(&state);

	/* Init the threads */
	loader_pid = thread_create(DataLoaderThread_memstack, sizeof(DataLoaderThread_memstack),
				THREAD_PRIORITY_MAIN, 0, DataLoaderThread, NULL,
				"DataLoaderThread_thread0");
	thread_create(TransceiverListenerThread_memstack, sizeof(TransceiverListenerThread_memstack),
				THREAD_PRIORITY_MAIN - 1, 0, TransceiverListenerThread, NULL,
				"TransceiverListenerThread_thread1");
	-___create_all_sensing_and_transformation_threads___-
	thread_create(MainNodeDeliveryThread_memstack, sizeof(MainNodeDeliveryThread_memstack),
				THREAD_PRIORITY_MAIN + 1, 0, MainNodeDeliveryThread, NULL,
				"MainNodeDeliveryThread_finalthread");

	return 0;
}
