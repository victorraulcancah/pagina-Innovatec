{{--
    Google Analytics 4. Solo se carga si hay un ID de medición en .env (GA_MEASUREMENT_ID=G-XXXXXXXXXX), y no mide:
    - el panel de administración,
    - a quien tiene la sesión de administrador iniciada,
    - a quien activó «no me sigas» (Do Not Track o Global Privacy Control) en su navegador.
    El sitio es una SPA (Inertia): la medición mejorada de Analytics cuenta también los cambios de página.
--}}
@php
    $gaId = (string) config('services.google_analytics.id');
    $measure = preg_match('/^G-[A-Z0-9]{4,14}$/', $gaId)
        && ! str_starts_with((string) ($page['component'] ?? ''), 'admin')
        && ! request()->hasCookie(\App\Http\Middleware\AuthenticateAdmin::COOKIE);
@endphp
@if ($measure)
    <script>
        (function () {
            if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1') return;
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', @js($gaId));
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(@js($gaId));
            document.head.appendChild(s);
        })();
    </script>
@endif
