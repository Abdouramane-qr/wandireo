#!/usr/bin/env sh
set -e

mkdir -p \
    /var/www/storage/app/public \
    /var/www/public/build \
    /var/www/storage/framework/cache/data \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/logs \
    /var/www/bootstrap/cache
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

if [ ! -L /var/www/public/storage ]; then
    rm -rf /var/www/public/storage
    ln -s /var/www/storage/app/public /var/www/public/storage
fi

if [ -d /opt/wandireo-build ]; then
    rm -rf /var/www/public/build/*
    cp -a /opt/wandireo-build/. /var/www/public/build/
    chown -R www-data:www-data /var/www/public/build
fi

exec "$@"
