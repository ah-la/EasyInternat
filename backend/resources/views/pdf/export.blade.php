<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        h1 { font-size: 22px; margin: 0 0 4px; color: #073b5c; }
        .meta { margin-bottom: 18px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #eaf8ff; color: #073b5c; text-align: left; }
        th, td { border: 1px solid #cdeeff; padding: 8px; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
        .empty { padding: 18px; border: 1px solid #cdeeff; color: #64748b; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <div class="meta">Genere le {{ $generatedAt }} - EasyInternat</div>

    @if(count($rows))
        <table>
            <thead>
                <tr>
                    @foreach($columns as $column)
                        <th>{{ $column }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach($rows as $row)
                    <tr>
                        @foreach($row as $cell)
                            <td>{{ $cell }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty">Aucune donnee disponible.</div>
    @endif
</body>
</html>
