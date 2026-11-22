<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();

        // Pengaman: RefreshDatabase akan mengosongkan database. Jika config ter-cache,
        // phpunit.xml diabaikan dan test bisa menyasar MySQL asli. Hentikan sebelum itu terjadi.
        $connection = $app['config']->get('database.default');
        $database = $app['config']->get("database.connections.{$connection}.database");

        if ($connection !== 'sqlite' || $database !== ':memory:') {
            throw new RuntimeException(
                "Test dihentikan: koneksi database '{$connection}' ({$database}) bukan SQLite in-memory. "
                .'Jalankan `php artisan config:clear` lalu ulangi test.'
            );
        }

        return $app;
    }
}
