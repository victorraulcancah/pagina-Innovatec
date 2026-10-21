<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @if (!empty($brand['favicon']))
            <link rel="icon" href="{{ $brand['favicon'] }}">
            <link rel="apple-touch-icon" href="{{ $brand['favicon'] }}">
        @else
            @php($v = @filemtime(public_path('favicon.ico')) ?: 1)
            <link rel="icon" href="/favicon.ico?v={{ $v }}" sizes="48x48 32x32 16x16">
            <link rel="icon" href="/favicon-32.png?v={{ $v }}" type="image/png" sizes="32x32">
            <link rel="icon" href="/favicon-192.png?v={{ $v }}" type="image/png" sizes="192x192">
            <link rel="apple-touch-icon" href="/apple-touch-icon.png?v={{ $v }}">
        @endif

        @if (!empty($brand))
            <meta property="og:site_name" content="{{ $brand['siteName'] }}">
            <meta property="og:type" content="website">
            @if (!empty($brand['ogImage']))
                <meta property="og:image" content="{{ $brand['ogImage'] }}">
            @endif
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
