<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Stagiaire extends Model { protected $fillable=['user_id','nom','prenom','cin','telephone','genre','filiere','chambre_id','category']; public function user(){return $this->belongsTo(User::class);} public function chambre(){return $this->belongsTo(Chambre::class);} }
