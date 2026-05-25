<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sortie extends Model {
    protected $fillable = ['stagiaire_id','date_sortie','date_retour','contact','motif','statut'];

    public function stagiaire() {
        return $this->belongsTo(Stagiaire::class);
    }
}
