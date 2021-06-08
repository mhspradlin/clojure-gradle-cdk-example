#!/bin/sh

# Set current directory to the deployment directory
pushd /usr/app

# Just for testing
#java -XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal -version

# -XX:+ExitOnOutOfMemoryError - End the program if we run out of memory to cause the container to exit and be restarted
java \
  -XX:+ExitOnOutOfMemoryError \
  -jar finch.jar
  