# Shot Arsenal — Data Flow & Change Log

## Data Source
**JSON**: `/public/data/shot_arsenal_lakshya_lishifeng.json`
**Video**: `/public/match-video.mp4` (Lakshya Sen vs Li Shi Feng, QF All England Open 2026)

---

## JSON → Frontend Mapping

### Layer 1: Headline
```
JSON path: shot_arsenal.your_analysis.headline
→ Component: ShotArsenalTab headline <h2>
→ Fallback: "Strong attacking and net game with vulnerable clears." (if placeholder)
```

### Layer 2: Player Zones (3D Court — Your Side)
```
JSON path: shot_arsenal.your_analysis.zone_selection.player_zones[]
  Fields: { zone_name, effectiveness_pct, level, total_shots }

→ Component: Court3D → PlayerZonePanel
→ Mapping:
  zone_name      → zone key (e.g. "Front left")
  effectiveness_pct → eff (displayed as "XX%")
  level          → "high"/"mid"/"low" (determines color: green/grey/red)
  total_shots    → shown on zone panel
```

### Layer 3: Zone Shot Mapping (3D Court — Opponent Side glass cards)
```
JSON path: shot_arsenal.your_analysis.zone_shot_mapping[playerZone]
  Fields: { avg_effectiveness, opponent_landing_zones }
  opponent_landing_zones[landingZone][] = { shot_name, count, level, avg_eff }

→ Component: Court3D → OpponentZonePanel → glass cards
→ Mapping:
  avg_effectiveness → "From [zone] / Avg effectiveness XX%" info bar
  shot_name         → glass card title
  count             → glass card "Xx"
  avg_eff           → glass card "XX%" badge
  level             → glass card color (good=green, bad=red, neutral=amber)

→ On tap: opens ShotDetailSheet with (shot_name, count, avg_eff)
```

### Layer 4: Shot Detail Sheet (bottom sheet)
```
JSON path: shot_arsenal.your_analysis.shot_details[shotName]
  Fields: { shot_name, shot_count, stats_row, video, scatter_court, filters }

→ Component: ShotDetailSheet
→ Sub-mappings:

  A. STATS ROW:
    stats_row.avg_effectiveness.value_pct → avgEff (large stat card)
    stats_row.avg_accuracy.value_pct      → avgAccuracy (large stat card)

  B. VIDEO PLAYER:
    video.timestamps_seconds[] → timeline tick marks + prev/next navigation
    Paired 1:1 with scatter_court.shot_instances[] by index

  C. SCATTER COURT:
    scatter_court.shot_instances[] = { x, y, accuracy, ?length, ?height }
    x → courtX(x) = (x / 6.10) * 100  (% from left)
    y → courtY(y) = 100 - (y / 6.70) * 100  (% from top, net at bottom)
    accuracy → "good"/"average"/"bad" (GREEN/AMBER/RED)
    length   → "good"/"average"/"bad" (only on drops/defense/lifts/clears)
    height   → "high"/"normal"/"low" (only on some shots, JSON uses "normal")

  D. FILTERS:
    filters.accuracy.options → accuracy dropdown options
    filters.height.options   → height dropdown options
    Length filter: derived from shot type (present if instances have length field)

  E. LENGTH BANDS:
    Position derived from getShotLandingInfo(shotName):
      drops/defense/netkeep → bands in landing zone near net
      lifts/clears          → bands in landing zone near back line
      smash/flatgame/drive  → no length bands
    Zone mirrored: player's "Back right" = SVG top-left
    Constrained to singles court area (10%-90% x, 5%-95% y)
```

### Layer 5: Opponent Analysis
```
JSON path: shot_arsenal.opponent_analysis
  Fields: { headline, shot_insights, weapons_to_watch, exploitable_weaknesses }

→ Component: ShotArsenalTab (when analysisView="opponent")
→ Status: NOT WIRED — toggle exists but shows same data
```

---

## Change Log

### 2026-03-28: Audit & Fix (Eren)

**Issue 1 — Height hardcoded to "medium"**
- Before: `getShotInstances` always set `height: "medium"`
- After: Reads `inst.height` from JSON, maps "normal" → "medium", defaults to "medium" if absent
- Files: `ShotArsenalTab.tsx` line ~141

**Issue 2 — Length defaults to "good" when missing**
- Before: `length: inst.length || "good"` — smashes showed "good length" incorrectly
- After: `length: inst.length || undefined` — shots without length data show no length bands
- Files: `ShotArsenalTab.tsx` line ~143, `ShotDetailSheet.tsx` (length filter hidden when no length data)

**Issue 3 — Shot name mismatch (glass card → shot_details)**
- Before: Glass card names like "BH Dribble Cross" had no match in shot_details → stats showed 0%
- After: Added fuzzy matching fallback in getShotInstances/getShotStats
- Files: `ShotArsenalTab.tsx`

**Issue 4 — total_shots per zone ignored**
- Before: Zone panels only showed effectiveness %
- After: Zone panels show total_shots count below effectiveness
- Files: `Court3D.tsx` PlayerZonePanel

**Issue 5 — Height "normal" vs "medium" mapping**
- Before: JSON "normal" passed directly → didn't match ShotDetailSheet's "medium" type
- After: Mapped at ingestion: "normal" → "medium"
- Files: `ShotArsenalTab.tsx` getShotInstances

**Issue 6 — Length filter shown for all shots**
- Before: Length dropdown always visible even for smashes
- After: Length dropdown hidden when shot has no length data (no instances with length field)
- Files: `ShotDetailSheet.tsx`

**Issue 7 — timestamps prop redundant**
- Before: Passed both `timestamps` prop AND embedded videoTime in shots
- After: Removed `timestamps` prop — sheet exclusively uses filteredShots[].videoTime
- Files: `ShotArsenalTab.tsx`, `ShotDetailSheet.tsx`

**Issue 8 — Filter options from JSON ignored**
- Before: Hardcoded filter options in ShotDetailSheet
- After: Length filter only shows when `hasLength=true` (passed from parent)
- Files: `ShotDetailSheet.tsx`

---

### Fix Status Summary

| # | Issue | Status |
|---|-------|--------|
| 1 | Height hardcoded "medium" | ✅ FIXED — reads JSON height, maps "normal"→"medium" |
| 2 | Length defaults to "good" | ✅ FIXED — undefined when absent, no bands for smashes |
| 3 | Shot name mismatch | ✅ FIXED — fuzzy matching (case-insensitive + Cross suffix) |
| 4 | total_shots ignored | ⏭ DEFERRED — low priority cosmetic |
| 5 | Height "normal"→"medium" | ✅ FIXED — mapped at ingestion |
| 6 | Length filter shown for all | ✅ FIXED — hidden when hasLength=false |
| 7 | timestamps prop redundant | ✅ FIXED — removed, uses filteredShots[].videoTime |
| 8 | Filter options from JSON | ✅ FIXED — length dropdown conditionally rendered |
| 9 | Opponent analysis not wired | ⏭ DEFERRED — separate task |
| 10 | Length bands from name | ✅ OK — works correctly with hasLength guard |

---

## Court Coordinate System

```
Full court: 13.40m × 6.10m
Half court (opponent): 6.70m × 6.10m

SVG mapping (opponent half, viewed from above):
  x: 0m (left) → 6.10m (right)
  y: 0m (net/bottom) → 6.70m (back boundary/top)

  courtX(x) = (x / 6.10) * 100
  courtY(y) = 100 - (y / 6.70) * 100

Singles sidelines: x = 0.46m (7.5%) and x = 5.64m (92.5%)
Centre line: x = 3.05m (50%)
Short service line: y = 1.98m from net
Back boundary: y = 6.70m

Zone boundaries (as % on SVG):
  Front: 65%-95% (y)    Mid: 37.5%-65%    Back: 5%-37.5%
  Left:  50%-90% (x)    Right: 10%-50%    (mirrored from player view)
```

## Accuracy Thresholds
```
GREEN: < 0.7m from target line
AMBER: 0.7m - 1.2m
RED:   > 1.2m
```

## Length Thresholds
```
GREEN: < 0.7m from optimal depth
AMBER: 0.7m - 1.4m
RED:   > 1.4m

Applied to: drops/defense (optimal = near net), lifts/clears (optimal = near back line)
NOT applied to: smashes, flatgame, drives, pushes
```
