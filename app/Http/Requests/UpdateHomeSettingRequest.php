<?php

namespace App\Http\Requests;

use App\Support\SiteLinks;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHomeSettingRequest extends FormRequest
{
    /** Enlaces permitidos: ruta interna, ancla, http(s), mailto o tel. */
    private const URL_RULE = '/^(\/|#|https?:\/\/|mailto:|tel:)\S*$/i';

    /** Opciones del menú cuyo submenú se arma solo con datos del sitio: sus subopciones no se eligen a mano. */
    private const AUTO_SUBMENUS = ['/division-enterprise', '/blog'];

    /** @var list<string>|null */
    private ?array $knownPages = null;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string', 'max:300'],

            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm', 'max:102400'],
            'remove_video' => ['boolean'],
            'poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_poster' => ['boolean'],

            'buttons' => ['array', 'max:3'],
            'buttons.*.label' => ['required', 'string', 'max:40'],
            'buttons.*.url' => ['required', 'string', 'max:255', 'regex:'.self::URL_RULE, $this->internalPageExists()],
            'buttons.*.variant' => ['required', 'in:primary,outline'],

            'menu' => ['array', 'max:9'],
            'menu.*.label' => ['required', 'string', 'max:40'],
            'menu.*.url' => ['required', 'string', 'max:255', $this->menuPage()],
            'menu.*.visible' => ['boolean'],
            'menu.*.show_children' => ['boolean'],
            'menu.*.children' => ['array', 'max:10'],
            'menu.*.children.*.label' => ['required', 'string', 'max:60'],
            'menu.*.children.*.url' => ['required', 'string', 'max:255', $this->menuPage()],
            'menu.*.children.*.visible' => ['boolean'],

            'show_panel_link' => ['boolean'],

            'nav_cta' => ['nullable', 'array'],
            'nav_cta.label' => ['required_with:nav_cta.url', 'nullable', 'string', 'max:40'],
            'nav_cta.url' => ['required_with:nav_cta.label', 'nullable', 'string', 'max:255', 'regex:'.self::URL_RULE, $this->internalPageExists()],
        ];
    }

    /** Botones: pueden ir a una sección, a otro sitio, a un correo o a un teléfono, pero una ruta interna debe existir. */
    private function internalPageExists(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (is_string($value) && str_starts_with($value, '/') && ! $this->pageExists($value)) {
                $fail("La página {$value} no existe.");
            }
        };
    }

    /** Menú: solo páginas del sitio que existen (en el panel se eligen de una lista). */
    private function menuPage(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            // Las subopciones de Enterprise y del blog se generan solas: no se eligen ni se validan aquí.
            if (preg_match('/^menu\.(\d+)\.children\./', $attribute, $m)
                && in_array($this->input("menu.{$m[1]}.url"), self::AUTO_SUBMENUS, true)) {
                return;
            }

            if (! is_string($value)) {
                return; // Lo rechaza la regla 'string'.
            }

            if (! str_starts_with($value, '/') || ! $this->pageExists($value)) {
                $fail("La página {$value} no existe. Elige una de la lista.");
            }
        };
    }

    private function pageExists(string $url): bool
    {
        $this->knownPages ??= array_column(SiteLinks::options(), 'url');

        return SiteLinks::exists($url, $this->knownPages);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'video.max' => 'El video no puede pesar más de 100 MB.',
            'video.mimetypes' => 'El video debe ser MP4 o WebM.',
            '*.regex' => 'Usa una ruta (/pagina), un ancla (#seccion) o un enlace que empiece con http(s)://, mailto: o tel:.',
        ];
    }
}
