# `factsheet_excel_full.json` — Structure Reference

> **File size:** ~3.2 MB | **Origin:** Excel workbook exported to JSON (via pandas `read_excel` with `sheet_name=None`)
>
> This file is the raw data source for the Talent naar de Top Charter monitoring factsheet and report. It contains survey data on gender diversity (m/v) in Dutch charter organizations for years 2008–2024.

---

## Top-Level Structure

The JSON is a **dictionary of sheet names → arrays of row objects**. Each key is an Excel tab name, and each value is an array where every element represents one spreadsheet row.

```json
{
  "Sheet Name": [
    { "Column A Header": value, "Column B Header": value, ... },
    { "Column A Header": value, "Column B Header": value, ... }
  ]
}
```

### Key characteristics

- **Column names** come from the first row of each Excel tab. Many are `"Unnamed: 0"`, `"Unnamed: 1"`, etc. because the Excel sheets use merged cells and layout-oriented formatting rather than proper table headers.
- **NaN and null values** are pervasive — most cells in a row are empty. Only non-null values carry meaning.
- **The first column key** often contains a long descriptive text (the original merged header cell from Excel), e.g. `"IN DEZE TAB ALLE FIGUREN DIE IN HET RAPPORT GEPLAATST ZIJN..."`.
- **Data types** are mixed: numbers (integers and floats/percentages), strings, `null`, and `NaN`.

---

## Sheet Inventory (28 sheets)

| # | Sheet Name | Rows | Cols | Description |
|---|-----------|------|------|-------------|
| 1 | `FIGUREN FACTSHEET Q` | 231 | 4 | Figures for the summary factsheet (Figuur 1–8 with titles) |
| 2 | `Figuren rapport Q` | 517 | 20 | **Main figures sheet** — all figures (1–25) used in the full report, with their data tables |
| 3 | `Respons en bijlage1 Q` | 188 | 26 | Response rates & participation data per year (2018–2024), plus duration analysis |
| 4 | `Aandeel vrouwen Q` | 135 | 54 | Share of women in top/subtop/organization, broken down by year and sector |
| 5 | `Aantal MW'ers Q` | 94 | 20 | Number of employees (medewerkers) across sectors in 2024 (n=84) |
| 6 | `Omvang Q ` | 49 | 31 | Organization size categories for all 2024 participants (N=84) |
| 7 | `Best practices uitdraai Q` | 177 | 29 | Best practices / qualitative data from organizations |
| 8 | `Bijlage tabel Q` | 144 | 19 | Appendix table data |
| 9 | `(actueel) streefcijfer Q` | 101 | 30 | Current target figures (streefcijfers) per organization |
| 10 | `streefkwal Q` | 128 | 2 | Qualitative descriptions of how organizations set their targets |
| 11 | `INCLUSIE Q` | 248 | 32 | Inclusion data for 2024 participants (N=84) — inclusion dimensions |
| 12 | `recruteren Q` | 69 | 40 | Recruitment-related diversity data |
| 13 | `TOELICHTING INCLUSIE Q` | 80 | 3 | Explanatory text / qualitative responses on inclusion |
| 14 | `Groei-daling Q` | 69 | 18 | Growth and decline analysis of women's share |
| 15 | `WIQ Q algemeen` | 437 | 22 | General WIQ (Women in Quota?) data — RvB, RvC, RvT presence in 2023–2024 (n=82) |
| 16 | `% RVB Q` | 48 | 25 | % women in RvB (Raad van Bestuur / Executive Board), N=69 |
| 17 | `% RVT Q` | 62 | 33 | % women in RvT (Raad van Toezicht / Supervisory Board), N=20 |
| 18 | `% RVC Q` | 40 | 26 | % women in RvC (Raad van Commissarissen / Supervisory Board), N=37 |
| 19 | `rvb c t overzicht Q` | 40 | 35 | Overview of changes in RvB/RvC/RvT 2024 vs 2023 |
| 20 | `30% MV Overzicht Q` | 86 | 34 | Overview: which orgs reach 30% women in RvB, RvC, RvT |
| 21 | `Jaarverslag Q` | 33 | 14 | Annual report data for 2024 participants (N=84) |
| 22 | `Verklaringen Q` | 66 | 45 | Explanations for non-balanced boards |
| 23 | `Trend 2008 2024 Q` | 118 | 34 | Historical trend data 2008–2024 |
| 24 | `definitie 2024 Q` | 201 | 7 | Definitions of "top" and "subtop" per organization in 2024 |
| 25 | `Leiderschap Q` | 70 | 29 | Leadership dimension scores 2024 (N=84) |
| 26 | `Strategie+Man Q` | 78 | 21 | Strategy & Management dimension scores |
| 27 | `HR Q` | 84 | 20 | HR dimension scores 2024 (N=84) |
| 28 | `Communicatie Q` | 72 | 33 | Communication dimension scores 2024 (N=84) |
| 29 | `Kennis Q` | 70 | 32 | Knowledge & Skills dimension scores 2024 (N=84) |
| 30 | `Klimaat Q` | 70 | 32 | Climate (workplace culture) dimension scores 2024 (N=84) |
| 31 | `Totalen dimensies Q` | 188 | 31 | Totals per development dimension in 2024 (N=84) — feeds Figures 13–18 |
| 32 | `Trend dimensies Q` | 424 | 10 | Trend data for dimensions over time — feeds Figures 19–20 |
| 33 | `kwalitatief vragen Q` | 126 | 6 | Qualitative survey questions and responses |
| 34 | `extra open Q` | 106 | 9 | Extra open-ended responses per company |

---

## Row Data Pattern

Each row object maps column headers to values. Because the Excel is layout-heavy (merged cells, chart areas, spacing rows), **most rows are mostly empty**. The general pattern within each sheet is:

```
[empty rows]
[Figure/section header row]    →  e.g. {"col_0": "FIGUUR 1"}
[empty row]
[column header row]            →  e.g. {"col_1": "top", "col_2": "subtop", "col_3": "organisatie"}
[data row]                     →  e.g. {"col_0": 2024, "col_1": 0.355, "col_2": 0.428, "col_3": 0.475}
[data row]                     →  e.g. {"col_0": 2023, "col_1": 0.342, "col_2": 0.408, "col_3": 0.474}
[empty rows]
[cross-reference row]          →  e.g. {"col_0": "ZIE TAB", "col_1": "Aandeel vrouwen Q"}
[empty rows]
[next Figure/section...]
```

---

## Sample Data: `Figuren rapport Q`

### Figure 1 — Share of women in top/subtop/organization (2023–2024)

```json
// Row 0: section header
{ "col_0": "FIGUUR 1" }

// Row 2: column headers
{ "Unnamed: 1": "top", "Unnamed: 2": "subtop", "Unnamed: 3": "organisatie" }

// Row 3: data for 2024
{ "col_0": 2024, "Unnamed: 1": 0.355, "Unnamed: 2": 0.428, "Unnamed: 3": 0.475 }

// Row 4: data for 2023
{ "col_0": 2023, "Unnamed: 1": 0.342, "Unnamed: 2": 0.408, "Unnamed: 3": 0.474 }

// Row 7: cross-reference
{ "col_0": "ZIE TAB ", "Unnamed: 1": "Aandeel vrouwen Q" }
```

### Figure 2 — Share of women by organization size (2024)

```json
// Row 22: section header
{ "col_0": "FIGUUR 2" }

// Row 26: column headers
{ "col_0": "Aantal medewerkers", "Unnamed: 1": "Top", "Unnamed: 2": "Subtop", "Unnamed: 3": "Organisatie" }

// Row 27–30: data rows
{ "col_0": "1 - 249",       "Unnamed: 1": 0.384, "Unnamed: 2": 0.550, "Unnamed: 3": 0.556 }
{ "col_0": "250 - 999",     "Unnamed: 1": 0.337, "Unnamed: 2": 0.448, "Unnamed: 3": 0.482 }
{ "col_0": "1,000 - 4,999", "Unnamed: 1": 0.343, "Unnamed: 2": 0.412, "Unnamed: 3": 0.464 }
{ "col_0": "5,000 en meer",  "Unnamed: 1": 0.371, "Unnamed: 2": 0.382, "Unnamed: 3": 0.448 }
{ "col_0": "Total",         "Unnamed: 1": 0.355, "Unnamed: 2": 0.428, "Unnamed: 3": 0.475 }
```

### Figure 4 — Share of women by sector (2024)

```json
// Rows 70–81: sector breakdown
{ "col_0": "Totaal" }
{ "col_0": "Industrie & bouwnijverheid (n=6)" }
{ "col_0": "Zakelijke dienstverlening (n=28)" }
{ "col_0": "Overige dienstverlening (n=2)" }
{ "col_0": "Handel & horeca (n=4)" }
{ "col_0": "Financiële instellingen (n=9)" }
{ "col_0": "Onderwijs (n=6)" }
{ "col_0": "Vervoer & opslag (n=7)" }
{ "col_0": "Informatie & communicatie (n=3)" }
{ "col_0": "Gezondheids- & welzijnszorg (n=7)" }
{ "col_0": "Overheid (n=12)" }
```

---

## Sample Data: `definitie 2024 Q`

Contains SPSS-style frequency tables:

```json
// Row 1: variable name
{ "2024": "Qdvt_anders", "Unnamed: 2": "Kolom1", ... }

// Row 2: column headers
{ "Unnamed: 3": "Frequency", "Unnamed: 4": "Percent", "Unnamed: 5": "Valid Percent", "Unnamed: 6": "Cumulative Percent" }

// Row 3: data
{ "2024": "Valid", "Unnamed: 2": "Ja", "Unnamed: 3": 28, "Unnamed: 4": 33.3, "Unnamed: 5": 33.3, "Unnamed: 6": 33.3 }

// Row 4: data
{ "Unnamed: 2": "Nee", "Unnamed: 3": 56, "Unnamed: 4": 66.7, "Unnamed: 5": 66.7, "Unnamed: 6": 100 }

// Row 5: total
{ "Unnamed: 2": "Total", "Unnamed: 3": 84, "Unnamed: 4": 100, "Unnamed: 5": 100 }
```

---

## Sample Data: `streefkwal Q`

Qualitative free-text responses (2 columns only):

```json
{ "Qstreefcijfer_vastgesteld": "Valid", "Unnamed: 1": "-" }
{ "Unnamed: 1": "Afgeleid van wat vroeger het wettelijk streefpercentage was (30%)" }
{ "Unnamed: 1": "Benchmark en daarop een realistisch haalbaar, maar ambitieus target vastgesteld." }
{ "Unnamed: 1": "Betreft een doel wat op global niveau is bepaald." }
```

---

## Figure Index

The report contains **25 figures** spread across multiple sheets. Key mapping:

| Figure | Topic | Data Sheet(s) |
|--------|-------|---------------|
| 1 | Share of women in top/subtop/organization 2023–2024 | `Aandeel vrouwen Q` |
| 2 | Share of women by organization size | `Aantal MW'ers Q` |
| 3 | Change in share of women by size 2023→2024 | `Aantal MW'ers Q` |
| 4 | Share of women by sector (top/subtop/org) | `Aandeel vrouwen Q` |
| 5 | Mean share of women by sector | `Aandeel vrouwen Q` |
| 6 | Growth/decline by sector | `Groei-daling Q` |
| 7 | RvB/RvC/RvT composition over time | `rvb c t overzicht Q` |
| 8 | 30% threshold in RvB/RvC/RvT | `30% MV Overzicht Q` |
| 9 | Explanations for non-balanced boards | `Verklaringen Q` |
| 10 | Target figures | `(actueel) streefcijfer Q` |
| 11 | Historical trend 2008–2024 | `Trend 2008 2024 Q` |
| 12 | Development dimensions overview 2024 | `Totalen dimensies Q` |
| 13 | Leadership dimension levels | `Totalen dimensies Q`, `Leiderschap Q` |
| 14 | Strategy & Management levels | `Totalen dimensies Q`, `Strategie+Man Q` |
| 15 | HR dimension levels | `Totalen dimensies Q`, `HR Q` |
| 16 | Communication dimension levels | `Totalen dimensies Q`, `Communicatie Q` |
| 17 | Knowledge & Skills levels | `Totalen dimensies Q`, `Kennis Q` |
| 18 | Climate dimension levels | `Totalen dimensies Q`, `Klimaat Q` |
| 19 | Trend M/V dimensions over time | `Trend dimensies Q` |
| 20 | Experienced vs. new cohort comparison | `Trend dimensies Q` |
| 21 | Inclusion dimensions | `INCLUSIE Q` |
| 22 | Inclusion details | `INCLUSIE Q` |
| 23 | Inclusion report | `INCLUSIE Q` |
| 24 | Inclusion M/V diversity vs inclusivity | `INCLUSIE Q` |
| 25 | Inclusion additional | `INCLUSIE Q` |

---

## Key Concepts / Terminology

| Dutch Term | English | Description |
|-----------|---------|-------------|
| Top | Top management | Executive board / C-suite |
| Subtop | Sub-top management | Senior management below board level |
| Organisatie | Organization | Total workforce |
| RvB | Raad van Bestuur | Executive Board |
| RvC | Raad van Commissarissen | Supervisory Board (corporate) |
| RvT | Raad van Toezicht | Supervisory Board (non-profit/semi-public) |
| Streefcijfer | Target figure | Gender diversity target percentage |
| Aandeel vrouwen | Share of women | Percentage of women in a given level |
| Charterorganisaties | Charter organizations | Organizations that signed the Talent naar de Top charter |
| MW'ers / Medewerkers | Employees | Total headcount |
| Dimensies | Dimensions | The 6 development dimensions measured by the charter tool |
| M/V | Male/Female | Gender designation |
| Evenwichtig | Balanced | At least 30% of each gender |

---

## Notes for Developers

1. **Column name `col_0`** in samples above refers to whichever the first column key is — this varies per sheet (sometimes `"Unnamed: 0"`, sometimes a long descriptive text from merged Excel headers).

2. **Cross-references**: Rows containing `"ZIE TAB"` or `"zie tab"` point to the detailed source sheet for that figure's data.

3. **Percentages** are stored as decimals (0.355 = 35.5%), not as whole numbers.

4. **Sample sizes** appear in parentheses in labels, e.g. `"Zakelijke dienstverlening (n=28)"`.

5. **NaN vs null**: Both appear in the data. `NaN` comes from pandas (numeric missing), `null` from JSON serialization of `None`. Treat both as "empty cell".

6. **Years** used in data: primarily 2023 and 2024, with historical trend data going back to 2008.
