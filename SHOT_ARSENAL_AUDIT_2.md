# Shot Arsenal Audit #2 — Full Data Flow Graph

## Date: 2026-03-28

---

## COMPLETE DATA FLOW: JSON → Frontend (3 Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│ JSON: /public/data/shot_arsenal_lakshya_lishifeng.json          │
│                                                                 │
│  shot_arsenal.your_analysis                                     │
│    ├── headline ─────────────────→ ShotArsenalTab <h2>          │
│    ├── zone_selection                                           │
│    │     └── player_zones[] ────→ LAYER 1                       │
│    ├── zone_shot_mapping{} ─────→ LAYER 2                       │
│    └── shot_details{} ──────────→ LAYER 3                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## LAYER 1: Zone Selection (3D Court — Player Side)

```
JSON: zone_selection.player_zones[]
  { zone_name, effectiveness_pct, level, total_shots }

  ┌──────────────┬──────────┬───────┬───────┐
  │ Zone         │ Eff %    │ Level │ Shots │
  ├──────────────┼──────────┼───────┼───────┤
  │ Front left   │ 49.8%    │ mid   │ 112   │
  │ Front right  │ 50.1%    │ mid   │ 112   │
  │ Mid left     │ 54.9%    │ mid   │ 38    │
  │ Mid right    │ 45.3%    │ mid   │ 46    │
  │ Back left    │ 67.0%    │ high  │ 103   │
  │ Back right   │ 65.5%    │ high  │ 95    │
  └──────────────┴──────────┴───────┴───────┘

CODE PATH:
  ShotArsenalTab.tsx → useMemo(playerZones)
    → zones[z.zone_name] = { eff: z.effectiveness_pct, level: z.level }
    → Court3DCanvas(playerZones={...})
      → Court3D.tsx → PlayerZonePanel
        → Shows: zone_name, eff%, color from level

RENDERING:
  Player zones are on POSITIVE Z (player's side of court)
  col=0 → x=-ZONE_W/2 (left), col=1 → x=+ZONE_W/2 (right)
  row=0 → near net, row=2 → deep

  ZONE_KEYS order: ["Front left", "Front right", "Mid left", "Mid right", "Back left", "Back right"]
  i=0 → row=0,col=0  i=1 → row=0,col=1  i=2 → row=1,col=0 ...
```

**ISSUES:**
- ✅ Eff and level map correctly
- ⚠️ total_shots NOT shown (ignored)

---

## LAYER 2: Zone Shot Mapping (3D Court — Opponent Side Glass Cards)

```
JSON: zone_shot_mapping[selectedPlayerZone]
  { avg_effectiveness, opponent_landing_zones }
  opponent_landing_zones[landingZone][] = { shot_name, count, level, avg_eff }

CODE PATH:
  ShotArsenalTab.tsx → useMemo(landings)
    → landings[playerZone] = { avgEff, zones }
    → zones[landingZone][] = { name: shot_name, count, level, eff: avg_eff }
    → Court3DCanvas(landing={...})
      → Court3D.tsx → OpponentZonePanel(pills=[...])
        → Glass cards show: pill.name, pill.count, pill.eff

  Info bar: "From: [selectedZone]  Avg. effectiveness: [landing.avgEff]%"

RENDERING (3D opponent zones):
  Uses SAME indexing as player zones:
    col=0 → x=-ZONE_W/2 (LEFT on screen)
    col=1 → x=+ZONE_W/2 (RIGHT on screen)

  But opponent zones should be MIRRORED!
```

### 🔴 CRITICAL BUG: 3D Court Zone Mirroring

```
Current code (Court3D.tsx line 46):
  opponentZonePos(row, col):
    x = col === 0 ? -ZONE_W/2 : ZONE_W/2    ← SAME as player side

This means:
  "Front left"  (col=0) → screen LEFT
  "Front right" (col=1) → screen RIGHT

But the opponent court is viewed from the PLAYER'S perspective (looking across net).
Opponent's "left" from their view = player's "right" on screen.

SHOULD BE:
  opponentZonePos(row, col):
    x = col === 0 ? ZONE_W/2 : -ZONE_W/2    ← FLIPPED for mirror

So "Front left" (opponent's left) → screen RIGHT (player's right)
   "Front right" (opponent's right) → screen LEFT (player's left)
```

### Shot Name Matching (Glass Card → Shot Details)

```
When user taps glass card:
  onShotClick(pill.name, pill.count, pill.eff)
  → selectedShot = { name: pill.name, count, eff }
  → findShotDetail(pill.name) looks up shot_details

MISSING MATCHES (in zone_mapping but NOT in shot_details):
  ❌ BH Dribble Cross (2x in Front right zone)
  ❌ FH Dribble Cross (10x in Front right zone)
  ❌ BH Drop (appears in Back left zone)
  ❌ BH Drop Cross (appears in Back left zone)
  ❌ BH Clear Cross (appears in Back left zone)
  ❌ BH Pulldrop Cross (appears in Back right zone)
  ❌ FH Drive Cross (appears in Back left zone)
  ❌ FH Pulldrop (appears in Back left zone)

→ Tapping these shows empty sheet (0% stats, 0 instances)

ORPHAN DETAILS (in shot_details but never in zone_mapping):
  ⚠️ BH Flatgame, BH Flatgame Cross, FH Dribble, FH Drive, FH Flatgame Cross
  → These have full data but are never shown on the opponent court
```

---

## LAYER 3: Shot Detail Sheet (Bottom Sheet)

```
Triggered by: glass card tap → onShotClick(name, count, eff)

JSON: shot_details[shotName]
  { shot_name, shot_count, stats_row, video, scatter_court, filters }

CODE PATH:
  ShotArsenalTab.tsx:
    findShotDetail(shotName) → exact match, then case-insensitive, then fuzzy
    getShotStats(shotName) → { avgEff, avgAccuracy } from stats_row
    getShotInstances(shotName) → ShotInstanceData[] from scatter_court + timestamps
    shotHasLength(shotName) → boolean from instance keys

  ShotDetailSheet props:
    shotName       ← selectedShot.name (from glass card)
    shotCount      ← selectedShot.count (from glass card, ZONE-SPECIFIC)
    avgEff         ← getShotStats().avgEff (GLOBAL from shot_details)
    avgAccuracy    ← getShotStats().avgAccuracy (GLOBAL)
    shots          ← getShotInstances() (ALL instances, GLOBAL)
    videoSrc       ← "/match-video.mp4"
    hasLength      ← shotHasLength() (true if any instance has length field)
```

### Instance Mapping

```
JSON instance: { x, y, accuracy, ?length, ?height }
JSON timestamps: timestamps_seconds[i] (paired by index)

→ ShotInstanceData:
    x         ← inst.x (metres)
    y         ← inst.y (metres)
    height    ← inst.height mapped: "normal"→"medium", default "medium"
    accuracy  ← inst.accuracy, default "average"
    length    ← inst.length, default undefined (not "good")
    videoTime ← timestamps_seconds[i]

→ Court rendering:
    courtX(x) = (x / 6.10) * 100     (% from left)
    courtY(y) = 100 - (y / 6.70) * 100  (% from top, net at bottom)
```

### Filter Mapping

```
JSON: filters = { accuracy: { options }, height: { options } }

Frontend (ShotDetailSheet):
  ACCURACY dropdown: always shown, options ["all","good","average","bad"]
  LENGTH dropdown:   shown only when hasLength=true
  HEIGHT dropdown:   always shown, options ["all","high","medium","low"]

⚠️ JSON height uses "normal" but dropdown shows "medium"
   → Filtering works because instances are mapped "normal"→"medium" at ingestion

⚠️ JSON doesn't have "length" in filters.options — length filter is derived from data
```

---

## STATS DISCREPANCY: Zone-Specific vs Global

```
Glass card (Layer 2):
  count = zone-specific (e.g. FH Lift: 14 from Front right only)
  eff   = zone-specific (e.g. FH Lift: 34.4% from Front right only)

ShotDetailSheet (Layer 3):
  count = GLOBAL (FH Lift: 34 total across all zones)
  eff   = GLOBAL (FH Lift: 36.1% across all zones)
  scatter = GLOBAL (shows all 34 instances, not just 14)

⚠️ User taps "FH Lift 14x 34.4%" but sheet shows "34 shots, 36.1%"
   This is because shot_details contains ALL instances of that shot type.
   The zone_shot_mapping count is a subset.
```

---

## ALL DISCREPANCIES SUMMARY

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | **3D opponent zones NOT mirrored** — col=0 goes left but should go right | 🔴 CRITICAL | ✅ FIXED — flipped x in opponentZonePos |
| 2 | **8 shot names in zone_mapping missing from shot_details** — empty sheets | 🟡 HIGH | DATA ISSUE |
| 3 | **Stats: zone-specific count/eff on card vs global in sheet** | 🟡 MEDIUM | BY DESIGN (document) |
| 4 | **5 orphan shot_details never shown** in any zone mapping | 🟢 LOW | DATA ISSUE |
| 5 | **total_shots per zone not displayed** on player zone panels | 🟢 LOW | COSMETIC |
| 6 | **ShotDetailSheet length band mirroring** — uses separate OPPONENT_ZONES dict | 🟡 MEDIUM | VERIFY |
| 7 | **Headline is placeholder** "[narrative: arsenal_headline]" | 🟢 LOW | NEEDS NARRATIVE |
