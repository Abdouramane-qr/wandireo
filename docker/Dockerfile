FROM node:20-alpine AS node-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY routes ./routes
COPY artisan ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY components.json ./

RUN npm run build

FROM php:8.4-cli-alpine AS vendor-builder

RUN apk add --no-cache \
    git \
    libpq-dev \
    oniguruma-dev \
    unzip \
    zip \
    && docker-php-ext-install \
        bcmath \
        mbstring \
        pcntl \
        pdo \
        pdo_pgsql

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts

COPY . .
RUN composer dump-autoload --optimize --no-dev

FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash \
    curl \
    fcgi \
    freetype-dev \
    git \
    jpeg-dev \
    libpng-dev \
    libpq \
    libpq-dev \
    libxml2-dev \
    oniguruma-dev \
    supervisor \
    unzip \
    zip

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        bcmath \
        exif \
        gd \
        mbstring \
        pcntl \
        pdo \
        pdo_pgsql

WORKDIR /var/www

COPY . .
COPY --from=vendor-builder /app/vendor ./vendor
COPY --from=node-builder /app/public/build ./public/build
COPY --from=node-builder /app/public/build /opt/wandireo-build
COPY docker/php/local.ini /usr/local/etc/php/conf.d/local.ini
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/wandireo-entrypoint

RUN chmod +x /usr/local/bin/wandireo-entrypoint \
    && mkdir -p /var/www/storage /var/www/bootstrap/cache /var/log/supervisor \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["wandireo-entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
