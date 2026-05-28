<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sortie extends Model {
    protected $fillable = ['stagiaire_id','date_sortie','date_retour','contact','motif','statut'];

    protected $appends = ['statut_effectif'];

    protected $casts = [
        'date_sortie' => 'date',
        'date_retour' => 'date',
    ];

    public function getStatutEffectifAttribute(): string
    {
        if ($this->statut === 'retourne') {
            return 'retourne';
        }

        if ($this->date_retour && $this->statut === 'sorti' && today()->gt($this->date_retour)) {
            return 'retard';
        }

        return 'sorti';
    }

    public function stagiaire() {
        return $this->belongsTo(Stagiaire::class);
    }
}
