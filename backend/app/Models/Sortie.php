<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sortie extends Model {
    protected $fillable = ['stagiaire_id','date_sortie','heure_sortie','date_retour','heure_retour_prevue','contact','motif','statut'];

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

        if (
            $this->date_retour &&
            $this->heure_retour_prevue &&
            $this->statut === 'sorti' &&
            today()->equalTo($this->date_retour) &&
            now()->format('H:i:s') > $this->heure_retour_prevue
        ) {
            return 'retard';
        }

        return 'sorti';
    }

    public function stagiaire() {
        return $this->belongsTo(Stagiaire::class);
    }
}
