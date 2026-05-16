<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceAttribute;
use App\Models\ServiceCategory;
use App\Models\ServiceExtra;
use App\Models\ServiceSubcategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminServiceStructureController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->with([
                'subcategories',
                'attributes.options',
                'extras',
            ])
            ->orderBy('service_type')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $this->validateCategory($request);
        $this->normalizeTranslatableStructureFields($data);
        $data['slug'] = $this->uniqueSlug(ServiceCategory::class, $data['slug'] ?? $data['name']);

        $category = ServiceCategory::create($data);

        return response()->json($category->load(['subcategories', 'attributes.options', 'extras']), 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = ServiceCategory::findOrFail($id);
        $data = $this->validateCategory($request, $category->id);
        $this->normalizeTranslatableStructureFields($data, $category->name, $category->description);

        if (array_key_exists('slug', $data)) {
            $data['slug'] = $this->uniqueSlug(
                ServiceCategory::class,
                $data['slug'] ?: ($data['name'] ?? $category->name),
                $category->id,
            );
        }

        $category->update($data);

        return response()->json($category->load(['subcategories', 'attributes.options', 'extras']));
    }

    public function destroyCategory(int $id): JsonResponse
    {
        $category = ServiceCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Categorie supprimee.']);
    }

    public function storeSubcategory(Request $request): JsonResponse
    {
        $data = $this->validateSubcategory($request);
        $this->normalizeTranslatableStructureFields($data);
        $data['slug'] = $this->uniqueSlug(ServiceSubcategory::class, $data['slug'] ?? $data['name']);

        $subcategory = ServiceSubcategory::create($data);

        return response()->json($subcategory, 201);
    }

    public function updateSubcategory(Request $request, int $id): JsonResponse
    {
        $subcategory = ServiceSubcategory::findOrFail($id);
        $data = $this->validateSubcategory($request, $subcategory->id);
        $this->normalizeTranslatableStructureFields($data, $subcategory->name, $subcategory->description);

        if (array_key_exists('slug', $data)) {
            $data['slug'] = $this->uniqueSlug(
                ServiceSubcategory::class,
                $data['slug'] ?: ($data['name'] ?? $subcategory->name),
                $subcategory->id,
            );
        }

        $subcategory->update($data);

        return response()->json($subcategory);
    }

    public function destroySubcategory(int $id): JsonResponse
    {
        $subcategory = ServiceSubcategory::findOrFail($id);
        $subcategory->delete();

        return response()->json(['message' => 'Sous-categorie supprimee.']);
    }

    public function storeAttribute(Request $request): JsonResponse
    {
        $data = $this->validateAttribute($request);
        $attribute = ServiceAttribute::create($data);
        $this->syncAttributeOptions($attribute, $request->input('options', []));

        return response()->json($attribute->load('options'), 201);
    }

    public function updateAttribute(Request $request, int $id): JsonResponse
    {
        $attribute = ServiceAttribute::findOrFail($id);
        $attribute->update($this->validateAttribute($request, $attribute->id));
        $this->syncAttributeOptions($attribute, $request->input('options', []));

        return response()->json($attribute->load('options'));
    }

    public function destroyAttribute(int $id): JsonResponse
    {
        $attribute = ServiceAttribute::findOrFail($id);
        $attribute->delete();

        return response()->json(['message' => 'Attribut supprime.']);
    }

    public function storeExtra(Request $request): JsonResponse
    {
        $extra = ServiceExtra::create($this->validateExtra($request));

        return response()->json($extra, 201);
    }

    public function updateExtra(Request $request, int $id): JsonResponse
    {
        $extra = ServiceExtra::findOrFail($id);
        $extra->update($this->validateExtra($request));

        return response()->json($extra);
    }

    public function destroyExtra(int $id): JsonResponse
    {
        $extra = ServiceExtra::findOrFail($id);
        $extra->delete();

        return response()->json(['message' => 'Extra supprime.']);
    }

    private function validateCategory(Request $request, ?int $categoryId = null): array
    {
        $this->fillPrimaryTextFromTranslations($request, 'name', 'name_translations');

        return $request->validate([
            'service_type' => [
                $categoryId ? 'sometimes' : 'required',
                'string',
                Rule::in(['ACTIVITE', 'BATEAU', 'HEBERGEMENT', 'VOITURE']),
            ],
            'name' => [$categoryId ? 'sometimes' : 'required', 'string', 'max:255'],
            'name_translations' => ['sometimes', 'array'],
            'name_translations.*' => ['nullable', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'description_translations' => ['sometimes', 'array'],
            'description_translations.*' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }

    private function validateSubcategory(Request $request, ?int $subcategoryId = null): array
    {
        $this->fillPrimaryTextFromTranslations($request, 'name', 'name_translations');

        return $request->validate([
            'service_category_id' => [
                $subcategoryId ? 'sometimes' : 'required',
                'integer',
                'exists:service_categories,id',
            ],
            'name' => [$subcategoryId ? 'sometimes' : 'required', 'string', 'max:255'],
            'name_translations' => ['sometimes', 'array'],
            'name_translations.*' => ['nullable', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'description_translations' => ['sometimes', 'array'],
            'description_translations.*' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }

    private function validateAttribute(Request $request, ?int $attributeId = null): array
    {
        return $request->validate([
            'service_category_id' => [
                $attributeId ? 'sometimes' : 'required',
                'integer',
                'exists:service_categories,id',
            ],
            'label' => [$attributeId ? 'sometimes' : 'required', 'string', 'max:255'],
            'key' => [
                $attributeId ? 'sometimes' : 'required',
                'string',
                'max:255',
                Rule::unique('service_attributes', 'key')
                    ->where(
                        'service_category_id',
                        (int) $request->input('service_category_id'),
                    )
                    ->ignore($attributeId),
            ],
            'type' => [
                $attributeId ? 'sometimes' : 'required',
                'string',
                Rule::in(['text', 'number', 'boolean', 'select']),
            ],
            'is_required' => ['sometimes', 'boolean'],
            'is_filterable' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'options' => ['sometimes', 'array'],
            'options.*.label' => ['required_with:options', 'string', 'max:255'],
            'options.*.value' => ['required_with:options', 'string', 'max:255'],
            'options.*.sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }

    private function validateExtra(Request $request): array
    {
        return $request->validate([
            'service_category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'default_price' => ['nullable', 'numeric', 'min:0'],
            'input_type' => ['required', 'string', Rule::in(['CHECKBOX', 'REQUIRED'])],
            'is_required' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }

    private function uniqueSlug(string $modelClass, string $base, ?int $ignoreId = null): string
    {
        $slug = Str::slug($base);
        $slug = $slug !== '' ? $slug : Str::random(8);
        $original = $slug;
        $counter = 1;

        while (
            $modelClass::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$original}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function syncAttributeOptions(ServiceAttribute $attribute, array $options): void
    {
        $attribute->options()->delete();

        foreach ($options as $index => $option) {
            $label = trim((string) ($option['label'] ?? ''));
            $value = trim((string) ($option['value'] ?? ''));

            if ($label === '' || $value === '') {
                continue;
            }

            $attribute->options()->create([
                'label' => $label,
                'value' => $value,
                'sort_order' => (int) ($option['sort_order'] ?? $index),
            ]);
        }
    }

    private function normalizeTranslatableStructureFields(
        array &$data,
        ?string $existingName = null,
        ?string $existingDescription = null,
    ): void {
        $nameTranslations = $this->normalizeLocalizedTextArray(
            $data['name_translations'] ?? null,
        );
        $descriptionTranslations = $this->normalizeLocalizedTextArray(
            $data['description_translations'] ?? null,
        );

        if ($nameTranslations !== null) {
            $data['name_translations'] = $nameTranslations;
            $data['name'] = $nameTranslations['fr']
                ?? Arr::first($nameTranslations)
                ?? $data['name']
                ?? $existingName
                ?? '';
        } else {
            unset($data['name_translations']);
        }

        if ($descriptionTranslations !== null) {
            $data['description_translations'] = $descriptionTranslations;
            $data['description'] = $descriptionTranslations['fr']
                ?? Arr::first($descriptionTranslations)
                ?? $data['description']
                ?? $existingDescription;
        } else {
            unset($data['description_translations']);
        }
    }

    private function normalizeLocalizedTextArray(mixed $value): ?array
    {
        if (! is_array($value)) {
            return null;
        }

        $normalized = collect($value)
            ->map(fn ($translation) => trim((string) $translation))
            ->filter(fn ($translation) => $translation !== '')
            ->all();

        return $normalized !== [] ? $normalized : null;
    }

    private function fillPrimaryTextFromTranslations(
        Request $request,
        string $field,
        string $translationsField,
    ): void {
        if (trim((string) $request->input($field, '')) !== '') {
            return;
        }

        $translations = $this->normalizeLocalizedTextArray(
            $request->input($translationsField),
        );

        if ($translations === null) {
            return;
        }

        $request->merge([
            $field => $translations['fr'] ?? Arr::first($translations),
        ]);
    }
}
