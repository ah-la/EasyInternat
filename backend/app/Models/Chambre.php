<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Chambre extends Model { protected $fillable=['numero','etage','category','capacite','statut']; public function stagiaires(){return $this->hasMany(Stagiaire::class);} }
