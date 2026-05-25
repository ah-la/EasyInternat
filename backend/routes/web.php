<?php

use Illuminate\Support\Facades\Route;

Route::get('/assets/{path}', function (string $path) {
    $asset = base_path('../frontend/dist/assets/'.$path);

    abort_unless(file_exists($asset), 404);

    return response()->file($asset);
})->where('path', '.*');

Route::get('/{any?}', function () {
    $index = file_exists(public_path('index.html'))
        ? public_path('index.html')
        : base_path('../frontend/dist/index.html');

    if (file_exists($index)) {
        return response()->file($index);
    }

    return view('welcome');
})->where('any', '^(?!api|storage|build|favicon\.ico|robots\.txt).*$');
