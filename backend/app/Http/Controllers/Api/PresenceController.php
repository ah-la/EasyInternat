<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presence;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;
        $query = Presence::with('stagiaire.chambre')
            ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));

        if ($request->filled('date')) $query->whereDate('date', $request->date);

        return $query->latest()->paginate(100);
    }

    public function mark(Request $request)
    {
        $stagiaire = $request->user()->stagiaire;

        if (!$stagiaire) {
            return response()->json(['message' => 'Compte stagiaire introuvable'], 404);
        }

        $ip = $request->ip();
        $allowedPrefix = env('INTERNAT_WIFI_PREFIX', '192.168.1.');

        if (!str_starts_with($ip, $allowedPrefix) && app()->environment('production')) {
            return response()->json(['message' => 'Connectez-vous au WiFi internat'], 403);
        }

        return Presence::updateOrCreate(
            ['stagiaire_id' => $stagiaire->id, 'date' => today()],
            ['statut' => 'present', 'ip_address' => $ip]
        )->load('stagiaire.chambre');
    }
}
