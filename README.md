<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" fill="none">
  <title>Limpopo Chess Academy Mark</title>
  <!-- Pawn mark (academy blue) -->
  <g fill="#274c77">
    <circle cx="32" cy="16" r="6"/>
    <rect x="26" y="24" width="12" height="3" rx="1.5"/>
    <path d="M24 48 L40 48 L36 32 L28 32 Z"/>
    <rect x="16" y="52" width="32" height="6" rx="2"/>
  </g>
  <!-- Text lockup on two lines, tight tracking/leading -->
  <g font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" style="letter-spacing:-0.04em;">
    <text x="64" y="28" font-size="24" font-weight="800" fill="#274c77">Limpopo</text>
    <text x="64" y="52" font-size="18" font-weight="700" fill="#3a3a3a">Chess Academy</text>
  </g>
</svg>

## Limpopo Chess Parser

Upload Chess-Results Excel files, preview parsed JSON, and save to Supabase. A mini rankings dashboard is available at `/rankings` using the best-6 TB1 average per player.

### Pages
- `/` upload and parse
- `/tournaments` list tournaments
- `/rankings` rankings dashboard

