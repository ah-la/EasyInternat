<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Chambre extends Model { use HasFactory; protected $fillable=['numero','etage','category','capacite','statut']; public function stagiaires(){return $this->hasMany(Stagiaire::class);} }
