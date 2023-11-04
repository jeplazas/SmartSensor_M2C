# file 'Makefile' generated with 	RIOT_ModelToCode_v1_updating.py by @jeplazas
# brief MDA-generated Makefile for an application running on RIOT
# author Julián E. Plazas P.
# date 2022-07-19
# 


# Default application name: 'mda_high_state_tempnodehigh0'
APPLICATION ?= mda_high_state_tempnodehigh0

# Default board : 'iotlab-m3'; change it if needed
BOARD ?= iotlab-m3

# Timed-Sleep module : 'xtimer'
USEMODULE += xtimer

# Define default channel for the application :
DEFAULT_CHANNEL ?= 19
# Define default PAN id for the application :
DEFAULT_PAN_ID ?= dc83
# Define server address (REMOTE_ADDR) and port (SERVER_PORT) :
# [Defaults are (fe80::1) and (8888)]
SERVER_ADDR ?= fe80::1
SERVER_PORT ?= 8888

# Include 'gnrc_netdev_default' and 'auto_init_gnrc_netif' radio drivers:
# USEMODULE += gnrc_netdev_default auto_init_gnrc_netif

# Include 'gnrc_ipv6_default' and 'sock_udp' network modules:
# USEMODULE += gnrc_ipv6_default sock_udp

# Check if the board uses 'XBee' module for network communications. Please add your board to the list if it uses 'XBee' (just space BOARD):
BOARDS_USE_XBEE := arduino-zero
ifneq (,$(filter $(BOARD),$(BOARDS_USE_XBEE)))
	# Include 'xbee' module:
	USEMODULE += xbee
endif


# Sensors modules:
# USEMODULE += at30tse75x

# RTC:
# USEMODULE += periph_rtc

CFLAGS += -DSERVER_ADDR=\"$(SERVER_ADDR)\"
CFLAGS += -DSERVER_PORT=$(SERVER_PORT)



# RIOTBASE; i.e. the path to all RIOT files on your computer
# Custom RIOTBASE path, please check it exists
RIOTBASE ?= $(CURDIR)/../../../riot/RIOT

include $(RIOTBASE)/Makefile.include