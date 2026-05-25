<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ResponsableController extends Controller {
    public function index() {
        return User::where('role', 'responsable')->latest()->paginate(20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'category' => 'required|in:filles,garcons',
        ]);

        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'] ?? 'password'),
            'role' => 'responsable',
            'category' => $data['category'],
        ]);
    }

    public function update(Request $request, User $responsable) {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $responsable->id,
            'password' => 'nullable|string|min:6',
            'category' => 'sometimes|in:filles,garcons',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $responsable->update($data + ['role' => 'responsable']);
        return $responsable;
    }

    public function destroy(User $responsable) {
        abort_if($responsable->role !== 'responsable', 404);
        $responsable->delete();
        return response()->noContent();
    }
}
