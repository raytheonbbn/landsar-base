#!/bin/bash
input=$1
export LD_LIBRARY_PATH=..:$LD_LIBRARY_PATH
CLASSPATH=imageio-ext-gdal-bindings-1.9.2.jar:.
java -classpath "${CLASSPATH}" gdalinfo $input
