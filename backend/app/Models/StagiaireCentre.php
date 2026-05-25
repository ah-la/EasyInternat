<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StagiaireCentre extends Model
{
    protected $table = 'stagiaires_centre';

    protected $fillable = [
        'nom',
        'prenom',
        'cin',
        'numero_inscription',
        'filiere',
        'genre',
    ];
}