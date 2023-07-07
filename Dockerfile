# syntax=docker/dockerfile:1
FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
  gdal-bin \
  openjdk-8-jdk \
  vim
  
#Timezone in region/location format. See valid options: https://manpages.ubuntu.com/manpages/xenial/man3/DateTime::TimeZone::Catalog.3pm.html
ENV TZ="America/New_York"

RUN rm -rf /etc/localtime
RUN ln -s /usr/share/zoneinfo/$TZ /etc/localtime
WORKDIR /opt/roger
ENTRYPOINT ["/bin/bash", "-c", "/opt/roger/startServer.sh &>> /opt/roger/logs/dockerlog.log"]
