@ECHO OFF
set input=%1
set PATH=..;%PATH%
java -classpath imageio-ext-gdal-bindings-1.9.2.jar;. gdalinfo %input%