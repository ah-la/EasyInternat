<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Paiement extends Model { protected $fillable=['stagiaire_id','mois','montant','statut','date_paiement']; public function stagiaire(){return $this->belongsTo(Stagiaire::class);} }
