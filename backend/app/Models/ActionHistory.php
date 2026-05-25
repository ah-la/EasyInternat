<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActionHistory extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(?User $user, string $action, Model $target, ?string $description = null, array $metadata = []): self
    {
        return self::create([
            'user_id' => $user?->id,
            'action' => $action,
            'target_type' => get_class($target),
            'target_id' => $target->getKey(),
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}
