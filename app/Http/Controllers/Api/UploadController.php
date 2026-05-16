<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/uploads/presign
     * Retourne une URL locale d'upload direct.
     */
    public function presign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fileName' => 'required|string',
            'contentType' => 'required|string|in:image/jpeg,image/png,image/webp,application/pdf',
            'folder' => 'required|string|in:services,blog,avatars,uploads',
        ]);

        $user = $request->user();

        if (! $user instanceof Authenticatable) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        $folder = $data['folder'];
        $extension = strtolower(pathinfo($data['fileName'], PATHINFO_EXTENSION) ?: 'bin');
        $fileName = Str::uuid() . '.' . $extension;
        $key = $folder . '/' . $fileName;
        $expiresAt = now()->addMinutes(10);
        $uploadUrl = URL::temporarySignedRoute(
            'uploads.direct',
            $expiresAt,
            [
                'key' => $key,
                'issuedFor' => (string) $user->getAuthIdentifier(),
            ],
            absolute: false,
        );

        return response()->json([
            'uploadUrl' => $uploadUrl,
            'publicUrl' => Storage::disk('public')->url($key),
            'key' => $key,
            'expiresAt' => $expiresAt->toIso8601String(),
        ]);
    }

    /**
     * POST /api/uploads/direct?key=services/xxx.png
     * Stockage local uniquement via le disque public.
     */
    public function directUpload(Request $request): JsonResponse
    {
        if (! $request->hasValidRelativeSignature()) {
            return response()->json(['message' => 'Invalid or expired upload URL.'], 403);
        }

        $user = $request->user();
        $issuedFor = (string) $request->query('issuedFor', '');

        if (
            ! $user instanceof Authenticatable
            || $issuedFor === ''
            || (string) $user->getAuthIdentifier() !== $issuedFor
        ) {
            return response()->json(['message' => 'Upload URL does not belong to the current user.'], 403);
        }

        $key = (string) $request->query('key', '');
        $key = ltrim(str_replace(['\\', '..'], ['/', ''], $key), '/');

        if ($key === '') {
            return response()->json(['message' => 'Missing upload key.'], 422);
        }

        if (! preg_match('#^(services|blog|avatars|uploads)/[a-f0-9-]+\.[a-z0-9]+$#', $key)) {
            return response()->json(['message' => 'Invalid upload key.'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimetypes:image/jpeg,image/png,image/webp,application/pdf|max:10240',
        ]);

        $folder = dirname($key);
        $fileName = basename($key);

        try {
            Storage::disk('public')->makeDirectory($folder);
            $path = Storage::disk('public')->putFileAs($folder, $request->file('file'), $fileName);

            if (!$path) {
                throw new \Exception('Failed to write file to storage.');
            }

            return response()->json([
                'publicUrl' => Storage::disk('public')->url($key),
                'key' => $key,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
