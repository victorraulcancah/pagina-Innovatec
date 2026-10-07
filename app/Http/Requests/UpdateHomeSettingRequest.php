<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHomeSettingRequest extends FormRequest
{
    /** Enlaces permitidos: ruta interna, ancla, http(s), mailto o tel. */
    private const URL_RULE = '/^(\/|#|https?:\/\/|mailto:|tel:)\S*$/i';

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
            'brand_name' => ['required', 'string', 'max:80'],
            'title' => ['required', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string', 'max:300'],

            'logo' => ['nullable', 'file', 'mimes:png,webp,svg', 'max:2048'],
            'remove_logo' => ['boolean'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm', 'max:102400'],
            'remove_video' => ['boolean'],
            'poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_poster' => ['boolean'],

            'buttons' => ['array', 'max:3'],
            'buttons.*.label' => ['required', 'string', 'max:40'],
            'buttons.*.url' => ['required', 'string', 'max:255', 'regex:'.self::URL_RULE],
            'buttons.*.variant' => ['required', 'in:primary,outline'],

            'menu' => ['array', 'max:8'],
            'menu.*.label' => ['required', 'string', 'max:40'],
            'menu.*.url' => ['required', 'string', 'max:255', 'regex:'.self::URL_RULE],
            'menu.*.children' => ['array', 'max:10'],
            'menu.*.children.*.label' => ['required', 'string', 'max:60'],
            'menu.*.children.*.url' => ['required', 'string', 'max:255', 'regex:'.self::URL_RULE],

            'nav_cta' => ['nullable', 'array'],
            'nav_cta.label' => ['required_with:nav_cta.url', 'nullable', 'string', 'max:40'],
            'nav_cta.url' => ['required_with:nav_cta.label', 'nullable', 'string', 'max:255', 'regex:'.self::URL_RULE],
        ];
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
