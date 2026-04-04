<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class RobotsFileTest extends TestCase
{
    public function test_robots_file_exposes_sitemap_location(): void
    {
        $contents = file_get_contents(dirname(__DIR__, 2) . '/public/robots.txt');

        $this->assertIsString($contents);
        $this->assertStringContainsString(
            'Sitemap: https://tripanova.code-ai-insight.com/sitemap.xml',
            $contents,
        );
    }
}
