#!/bin/sh
geover="2.12.5"
# User specific aliases and functions
export PGDATA="/var/lib/pgsql/10/data"
export GEOSERVER_DATA_DIR="/opt/geoserver/geoserver-"$geover"/data_dir"
export GEOSERVER_HOME="/opt/geoserver/geoserver-"$geover
export GDAL_DATA="/opt/geoserver/gdal-data"
export LD_LIBRARY_PATH="./nativelibs"

# java -agentlib:jdwp=transport=dt_socket=8998,server=y,suspend=y -Dlogback.configurationFile=logback.xml -cp roger-core-*.jar com.bbn.roger.launcher.CommandLineLauncher --configFile config.json

java -cp "roger-core-dependencies/dependencies/*:roger-core-1.4.0-fullRelease.jar" com.bbn.roger.launcher.CommandLineLauncher --configFile config.json

