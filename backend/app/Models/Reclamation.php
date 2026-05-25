<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Reclamation extends Model { protected $fillable=['stagiaire_id','type','sujet','message','reponse_admin','statut']; public function stagiaire(){return $this->belongsTo(Stagiaire::class)->with('chambre','user');} }
