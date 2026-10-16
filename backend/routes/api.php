<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    $connection = config('database.default');

    try {
        DB::select('SELECT 1');
        $connected = true;
    } catch (Throwable) {
        $connected = false;
    }

    return response()->json([
        'status' => $connected ? 'ok' : 'degraded',
        'app' => config('app.name'),
        'laravel' => app()->version(),
        'php' => PHP_VERSION,
        'database' => [
            'connection' => $connection,
            'name' => config("database.connections.{$connection}.database"),
            'connected' => $connected,
        ],
        'time' => now()->toIso8601String(),
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
