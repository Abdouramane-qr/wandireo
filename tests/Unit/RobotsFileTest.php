<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class RobotsFileTest extends TestCase
{
    public function test_robots_file_exposes_sitemap_location(): void
    {
        $contents = file_get_contents(dirname(__DIR__, 2) . '/public/robots.txt');
        $envExample = file_get_contents(dirname(__DIR__, 2) . '/.env.example');
        preg_match('/^APP_URL=(.+)$/m', $envExample ?: '', $matches);
        $appUrl = rtrim($matches[1] ?? '', '/');

        $this->assertIsString($contents);
        $this->assertNotSame('', $appUrl);
        $this->assertStringContainsString(
            sprintf('Sitemap: %s/sitemap.xml', $appUrl),
            $contents,
        );
    }
}
