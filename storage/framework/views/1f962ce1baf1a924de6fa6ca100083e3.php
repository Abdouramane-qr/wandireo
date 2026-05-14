<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['dark' => ($appearance ?? 'system') == 'dark']); ?>">
    <head>
        <?php
            $seo = $seo ?? [];
            $seoTitle = $seo['title'] ?? config('app.name', 'Wandireo');
            $seoDescription = $seo['description'] ?? null;
            $seoCanonical = $seo['canonical'] ?? null;
            $seoImage = $seo['image'] ?? null;
            $seoRobots = $seo['robots'] ?? 'index,follow';
            $seoType = $seo['type'] ?? 'website';
            $seoSiteName = $seo['siteName'] ?? config('app.name', 'Wandireo');
            $twitterCard = $seo['twitterCard'] ?? 'summary_large_image';
        ?>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?php echo e($seoTitle); ?></title>
        <meta name="robots" content="<?php echo e($seoRobots); ?>">
        <?php if($seoDescription): ?>
            <meta name="description" content="<?php echo e($seoDescription); ?>">
        <?php endif; ?>
        <?php if($seoCanonical): ?>
            <link rel="canonical" href="<?php echo e($seoCanonical); ?>">
        <?php endif; ?>
        <meta property="og:type" content="<?php echo e($seoType); ?>">
        <meta property="og:title" content="<?php echo e($seoTitle); ?>">
        <meta property="og:site_name" content="<?php echo e($seoSiteName); ?>">
        <?php if($seoDescription): ?>
            <meta property="og:description" content="<?php echo e($seoDescription); ?>">
        <?php endif; ?>
        <?php if($seoCanonical): ?>
            <meta property="og:url" content="<?php echo e($seoCanonical); ?>">
        <?php endif; ?>
        <?php if($seoImage): ?>
            <meta property="og:image" content="<?php echo e($seoImage); ?>">
        <?php endif; ?>
        <meta name="twitter:card" content="<?php echo e($twitterCard); ?>">
        <meta name="twitter:title" content="<?php echo e($seoTitle); ?>">
        <?php if($seoDescription): ?>
            <meta name="twitter:description" content="<?php echo e($seoDescription); ?>">
        <?php endif; ?>
        <?php if($seoImage): ?>
            <meta name="twitter:image" content="<?php echo e($seoImage); ?>">
        <?php endif; ?>
        <?php if(! empty($seo['publishedTime'])): ?>
            <meta property="article:published_time" content="<?php echo e($seo['publishedTime']); ?>">
        <?php endif; ?>
        <?php if(! empty($seo['modifiedTime'])): ?>
            <meta property="article:modified_time" content="<?php echo e($seo['modifiedTime']); ?>">
        <?php endif; ?>

        
        <script nonce="<?php echo e($cspNonce); ?>">
            (function() {
                const appearance = '<?php echo e($appearance ?? "system"); ?>';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        
        <style nonce="<?php echo e($cspNonce); ?>">
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"]); ?>
        <?php if (isset($component)) { $__componentOriginal56673881198e3a2924721e242dee6899 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal56673881198e3a2924721e242dee6899 = $attributes; } ?>
<?php $component = Inertia\View\Components\Head::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inertia::head'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Inertia\View\Components\Head::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
            <title><?php echo e($seoTitle); ?></title>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal56673881198e3a2924721e242dee6899)): ?>
<?php $attributes = $__attributesOriginal56673881198e3a2924721e242dee6899; ?>
<?php unset($__attributesOriginal56673881198e3a2924721e242dee6899); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal56673881198e3a2924721e242dee6899)): ?>
<?php $component = $__componentOriginal56673881198e3a2924721e242dee6899; ?>
<?php unset($__componentOriginal56673881198e3a2924721e242dee6899); ?>
<?php endif; ?>
    </head>
    <body class="font-sans antialiased">
        <?php if (isset($component)) { $__componentOriginal1830bdc8f8b965a5838ec47487b5507c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1830bdc8f8b965a5838ec47487b5507c = $attributes; } ?>
<?php $component = Inertia\View\Components\App::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inertia::app'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Inertia\View\Components\App::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1830bdc8f8b965a5838ec47487b5507c)): ?>
<?php $attributes = $__attributesOriginal1830bdc8f8b965a5838ec47487b5507c; ?>
<?php unset($__attributesOriginal1830bdc8f8b965a5838ec47487b5507c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1830bdc8f8b965a5838ec47487b5507c)): ?>
<?php $component = $__componentOriginal1830bdc8f8b965a5838ec47487b5507c; ?>
<?php unset($__componentOriginal1830bdc8f8b965a5838ec47487b5507c); ?>
<?php endif; ?>
    </body>
</html>
<?php /**PATH /var/www/resources/views/app.blade.php ENDPATH**/ ?>