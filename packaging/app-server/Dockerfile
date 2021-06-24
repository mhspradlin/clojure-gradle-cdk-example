FROM amazoncorretto:11

# This enables the useradd and groupadd commands
RUN yum install shadow-utils.x86_64 -y
# Set up the user and group used for running the server
RUN groupadd app-service
RUN useradd -G app-service app-runner

# Copy application files and set permissions
COPY ./app-server.jar /usr/app/app-server.jar
RUN chmod 555 /usr/app/app-server.jar
COPY ./run_server.sh /usr/app/run_server.sh
RUN chmod 555 /usr/app/run_server.sh

# The server runs on port 3000
EXPOSE 3000

# Run as a limited-permissions user and group
USER app-runner:app-service
CMD ["/usr/app/run_server.sh"]