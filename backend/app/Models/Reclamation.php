<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    use HasFactory;

    protected $fillable = ['stagiaire_id', 'type', 'sujet', 'message', 'reponse_admin', 'reponse_at', 'reponse_by_id', 'statut'];

    protected $casts = [
        'reponse_at' => 'datetime',
    ];

    public function stagiaire()
    {
        return $this->belongsTo(Stagiaire::class);
    }

    public function reponseBy()
    {
        return $this->belongsTo(User::class, 'reponse_by_id');
    }
}
