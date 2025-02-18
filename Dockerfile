FROM ghcr.io/onecx/docker-spa-base:1.12.0

# Copy nginx configuration
COPY nginx/locations.conf $DIR_LOCATION/locations.conf
# Copy application build
COPY dist/onecx-user-profile-ui/ $DIR_HTML

# Optional extend list of application environments
#ENV CONFIG_ENV_LIST BFF_URL,APP_BASE_HREF

# Application environments default values
ENV BFF_URL http://onecx-user-profile-bff:8080/
ENV APP_BASE_HREF /

RUN chmod 775 -R "$DIR_HTML"/assets
USER 1001
