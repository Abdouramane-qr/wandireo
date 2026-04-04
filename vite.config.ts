import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const scoopPhpPath = process.env.USERPROFILE
    ? join(process.env.USERPROFILE, 'scoop', 'apps', 'php', 'current', 'php.exe')
    : null;

const phpCommand = process.env.PHP_EXECUTABLE
    ?? (scoopPhpPath && existsSync(scoopPhpPath) ? `"${scoopPhpPath}"` : 'php');
const canGenerateWayfinder = existsSync(join(process.cwd(), 'vendor', 'autoload.php'));

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        ...(canGenerateWayfinder
            ? [wayfinder({
                  command: `${phpCommand} artisan wayfinder:generate`,
                  formVariants: true,
              })]
            : []),
    ],
});
