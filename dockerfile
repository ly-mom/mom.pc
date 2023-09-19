FROM 10.0.24.65:8081/mom/nginx:1.21.3

MAINTAINER ly.momweb.sundry


RUN rm /etc/nginx/conf.d/default.conf


COPY dist/ /usr/share/nginx/html/

