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

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return $query->orderBy('numero')->paginate(100);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero' => 'required|string|max:50|unique:chambres,numero',
            'etage' => 'nullable|string|max:100',
            'category' => 'required|in:filles,garcons',
            'capacite' => 'required|integer|min:1|max:8',
            'statut' => 'nullable|string|max:50',
        ]);

        $data['statut'] = $data['statut'] ?? 'disponible';

        return Chambre::create($data)->load('stagiaires');
    }

    public function show(Chambre $chambre)
    {
        return $chambre->load('stagiaires');
    }

    public function update(Request $request, Chambre $chambre)
    {
        $data = $request->validate([
            'numero' => 'sometimes|string|max:50|unique:chambres,numero,'.$chambre->id,
            'etage' => 'nullable|string|max:100',
            'category' => 'sometimes|in:filles,garcons',
            'capacite' => 'sometimes|integer|min:1|max:8',
            'statut' => 'sometimes|string|max:50',
        ]);

        $chambre->update($data);

        return $chambre->load('stagiaires');
    }

    public function destroy(Chambre $chambre)
    {
        $chambre->delete();
        return response()->noContent();
    }
}
