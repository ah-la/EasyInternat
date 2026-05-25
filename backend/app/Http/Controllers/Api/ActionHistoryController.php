<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionHistory;
use Illuminate\Http\Request;

class ActionHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ActionHistory::with('user:id,name,email,role,category')->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->target_type);
        }

        return $query->paginate(100);
    }
}
