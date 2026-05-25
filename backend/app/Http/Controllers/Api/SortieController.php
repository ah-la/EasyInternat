<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sortie;
use Illuminate\Http\Request;

class SortieController extends Controller {
    public function index(Request $request) {
        $query = Sortie::with('stagiaire');
        $user = $request->user();

        if ($user && $user->role === 'responsable' && $user->category) {
            $query->whereHas('stagiaire', fn($q) => $q->where('category', $user->category));
        }

        if ($user && $user->role === 'stagiaire') {
            $query->whereHas('stagiaire', fn($q) => $q->where('user_id', $user->id));
        }

        return $query->latest()->paginate(20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'stagiaire_id' => 'nullable|exists:stagiaires,id',
            'date_sortie' => 'required|date',
            'date_retour' => 'required|date|after_or_equal:date_sortie',
            'contact' => 'nullable|string|max:30',
            'motif' => 'nullable|string',
        ]);

        if (empty($data['stagiaire_id'])) {
            $data['stagiaire_id'] = $request->user()->stagiaire?->id;
        }

        if (!$data['stagiaire_id']) {
            return response()->json(['message' => 'Compte stagiaire introuvable'], 404);
        }

        return Sortie::create($data + ['statut' => 'en_attente']);
    }

    public function update(Request $request, Sortie $sortie) {
        $data = $request->validate([
            'date_sortie' => 'sometimes|date',
            'date_retour' => 'sometimes|date|after_or_equal:date_sortie',
            'contact' => 'nullable|string|max:30',
            'motif' => 'nullable|string',
            'statut' => 'sometimes|string',
        ]);

        $sortie->update($data);
        return $sortie->load('stagiaire');
    }

    public function destroy(Sortie $sortie) {
        $sortie->delete();
        return response()->noContent();
    }
}
