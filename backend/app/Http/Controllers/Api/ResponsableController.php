<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stagiaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ResponsableController extends Controller
{
    private function ensureResponsable(User $user): void
    {
        abort_if($user->role !== 'responsable', 404);
    }

    private function decorate(User $user): User
    {
        $user->setAttribute('managed_stagiaires_count', Stagiaire::where('category', $user->category)->count());
        return $user;
    }

    public function index()
    {
        $responsables = User::where('role', 'responsable')->latest()->paginate(20);
        $responsables->getCollection()->transform(fn (User $user) => $this->decorate($user));
        return $responsables;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:30',
            'password' => 'required|string|min:6|confirmed',
            'category' => 'required|in:filles,garcons',
            'is_active' => 'sometimes|boolean',
        ]);

        return $this->decorate(User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'telephone' => $data['telephone'],
            'password' => Hash::make($data['password']),
            'role' => 'responsable',
            'category' => $data['category'],
            'is_active' => $data['is_active'] ?? true,
        ]));
    }

    public function update(Request $request, User $responsable)
    {
        $this->ensureResponsable($responsable);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $responsable->id,
            'telephone' => 'sometimes|required|string|max:30',
            'password' => 'nullable|string|min:6|confirmed',
            'category' => 'sometimes|in:filles,garcons',
            'is_active' => 'sometimes|boolean',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $responsable->update($data + ['role' => 'responsable']);
        return $this->decorate($responsable);
    }

    public function destroy(User $responsable)
    {
        $this->ensureResponsable($responsable);
        $responsable->delete();
        return response()->noContent();
    }
}
