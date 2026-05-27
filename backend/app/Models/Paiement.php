<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = ['stagiaire_id', 'mois', 'montant', 'statut', 'mode_paiement', 'numero_recu', 'date_paiement'];

    public function stagiaire()
    {
        return $this->belongsTo(Stagiaire::class);
    }
}
