---

`markdown
<p align="center">
  <picture>
    <source media="(min-width: 1024px)" srcset="./public/lca_mark.svg" />
    <img src="./public/lca_mark.svg" alt="Limpopo Chess Academy" style="max-width: 820px; width: 90%; height: auto;" />
  </picture>

  <br />
  <strong>Tournament File Parser for Limpopo Chess Academy</strong>
  <br />
</p>

---

📁 Project Structure

`
limpopo-chess-parser/
├── public/
│   └── lca_mark.svg              # Academy logo
├── src/
│   ├── parser/
│   │   ├── strictMode.ts         # Strict parsing logic
│   │   ├── adaptiveMode.ts       # Adaptive parsing for messy layouts
│   │   └── utils.ts              # Table detection, text cleanup
│   ├── validation/
│   │   └── schema.ts             # Field validation and error handling
│   ├── api/
│   │   └── uploadHandler.ts      # File upload and processing endpoint
│   └── frontend/
│       ├── highlightMissing.ts   # UI feedback for missing fields
│       └── summaryView.ts        # Parsed data summary display
├── tests/
│   └── parser.test.ts            # Unit tests for parsing logic
├── supabase/
│   └── schema.sql                # Optional: DB schema for storing results
├── README.md
└── package.json
`

---

