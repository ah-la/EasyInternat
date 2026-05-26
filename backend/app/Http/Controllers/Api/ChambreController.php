<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chambre;
use Illuminate\Http\Request;

class ChambreController extends Controller
{
    private function scoped(Request $request)
    {
        $query = Chambre::with('stagiaires')->withCount('stagiaires');
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->where('category', $user->category);
        }

        return $query;
    }

    private function ensureVisible(Request $request, Chambre $chambre): void
    {
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category && $chambre->category !== $user->category) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('category') && $request->user()?->role === 'admin') {
            $query->where('category', $request->category);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('chambre')) {
            $query->where('numero', 'like', '%'.$request->chambre.'%');
        }

        return $query->orderBy('numero')->paginate(100);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero' => 'required|string|max:50|unique:chambres,numero',
            'etage' => 'nullable|string|max:100',
            'category' => 'required|in:filles,garcons',
            'capacite' => 'required|integer|min:1|max:4',
            'statut' => 'nullable|in:disponible,complete',
        ]);

        if ($request->user()?->role === 'responsable' && $request->user()->category !== $data['category']) {
            abort(403, 'Acces refuse pour cette categorie');
        }

        $data['statut'] = $data['statut'] ?? 'disponible';

        return Chambre::create($data)->load('stagiaires');
    }

    public function show(Request $request, Chambre $chambre)
    {
        $this->ensureVisible($request, $chambre);
        return $chambre->load('stagiaires');
    }

    public function update(Request $request, Chambre $chambre)
    {
        $this->ensureVisible($request, $chambre);

        $data = $request->validate([
            'numero' => 'sometimes|string|max:50|unique:chambres,numero,'.$chambre->id,
            'etage' => 'nullable|string|max:100',
            'category' => 'sometimes|in:filles,garcons',
            'capacite' => 'sometimes|integer|min:1|max:4',
            'statut' => 'sometimes|in:disponible,complete',
        ]);

        if (isset($data['category']) && $request->user()?->role === 'responsable' && $request->user()->category !== $data['category']) {
            abort(403, 'Acces refuse pour cette categorie');
        }

        if (isset($data['capacite']) && $chambre->stagiaires()->count() > $data['capacite']) {
            return response()->json(['message' => 'La capacite est inferieure au nombre de stagiaires affectes'], 422);
        }

        $chambre->update($data);

        return $chambre->load('stagiaires');
    }

    public function destroy(Request $request, Chambre $chambre)
    {
        $this->ensureVisible($request, $chambre);
        if ($chambre->stagiaires()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer une chambre occupée.'], 422);
        }

        $chambre->delete();
        return response()->noContent();
    }
}
