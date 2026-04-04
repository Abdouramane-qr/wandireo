<?php

declare(strict_types=1);

$sqlitePath = __DIR__ . '/../database/database.sqlite';

$source = new PDO('sqlite:' . $sqlitePath);
$source->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$target = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=wandireo', 'wandireo', 'secret');
$target->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$tables = [
    'users',
    'service_categories',
    'service_subcategories',
    'service_attributes',
    'service_attribute_options',
    'service_extras',
    'services',
    'bookings',
    'reviews',
    'blog_posts',
    'favorites',
    'availability_slots',
    'service_calendar_syncs',
    'support_tickets',
    'product_events',
];

function targetColumns(PDO $pdo, string $table): array
{
    $statement = $pdo->prepare(
        "SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = :table
           AND is_generated = 'NEVER'
         ORDER BY ordinal_position"
    );
    $statement->execute(['table' => $table]);

    return $statement->fetchAll(PDO::FETCH_COLUMN) ?: [];
}

function sourceColumns(PDO $pdo, string $table): array
{
    $statement = $pdo->query("PRAGMA table_info('{$table}')");
    $rows = $statement->fetchAll(PDO::FETCH_ASSOC) ?: [];

    return array_map(
        static fn (array $row): string => $row['name'],
        $rows
    );
}

function fetchAllRows(PDO $pdo, string $table, array $columns): array
{
    $columnList = implode(', ', array_map(
        static fn (string $column): string => "\"{$column}\"",
        $columns
    ));

    $statement = $pdo->query("SELECT {$columnList} FROM \"{$table}\"");

    return $statement->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function truncateTable(PDO $pdo, string $table): void
{
    $pdo->exec("TRUNCATE TABLE public.\"{$table}\" RESTART IDENTITY CASCADE");
}

function insertRows(PDO $pdo, string $table, array $columns, array $rows): void
{
    if ($rows === []) {
        return;
    }

    $columnList = implode(', ', array_map(
        static fn (string $column): string => "\"{$column}\"",
        $columns
    ));
    $placeholderList = implode(', ', array_map(
        static fn (string $column): string => ':' . $column,
        $columns
    ));

    $statement = $pdo->prepare(
        "INSERT INTO public.\"{$table}\" ({$columnList}) VALUES ({$placeholderList})"
    );

    foreach ($rows as $row) {
        $payload = [];

        foreach ($columns as $column) {
            $value = $row[$column] ?? null;

            if (is_resource($value)) {
                $value = stream_get_contents($value);
            }

            $payload[$column] = $value;
        }

        $statement->execute($payload);
    }
}

function syncSequence(PDO $pdo, string $table): void
{
    $statement = $pdo->prepare(
        "SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = :table
           AND column_default LIKE 'nextval(%'
         ORDER BY ordinal_position
         LIMIT 1"
    );
    $statement->execute(['table' => $table]);
    $column = $statement->fetchColumn();

    if (!$column) {
        return;
    }

    $sequenceStatement = $pdo->prepare(
        "SELECT pg_get_serial_sequence(:table_name, :column_name)"
    );
    $sequenceStatement->execute([
        'table_name' => 'public.' . $table,
        'column_name' => $column,
    ]);
    $sequence = $sequenceStatement->fetchColumn();

    if (!$sequence) {
        return;
    }

    $pdo->exec(
        "SELECT setval('{$sequence}', COALESCE((SELECT MAX(\"{$column}\") FROM public.\"{$table}\"), 1), true)"
    );
}

$target->beginTransaction();

try {
    foreach ($tables as $table) {
        echo "Importing {$table}..." . PHP_EOL;
        $targetCols = targetColumns($target, $table);
        $sourceCols = sourceColumns($source, $table);
        $commonCols = array_values(array_intersect($targetCols, $sourceCols));

        truncateTable($target, $table);

        if ($commonCols !== []) {
            $rows = fetchAllRows($source, $table, $commonCols);
            insertRows($target, $table, $commonCols, $rows);
        }

        syncSequence($target, $table);
    }

    $target->commit();

    echo "Import completed.\n";
} catch (Throwable $exception) {
    $target->rollBack();
    fwrite(STDERR, $exception->getMessage() . PHP_EOL);
    exit(1);
}
