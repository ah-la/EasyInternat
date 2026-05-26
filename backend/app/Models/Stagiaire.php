<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stagiaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'cin',
        'telephone',
        'genre',
        'filiere',
        'chambre_id',
        'category',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chambre()
    {
        return $this->belongsTo(Chambre::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function presences()
    {
        return $this->hasMany(Presence::class);
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamation::class);
    }

    public function sorties()
    {
        return $this->hasMany(Sortie::class);
    }
}
