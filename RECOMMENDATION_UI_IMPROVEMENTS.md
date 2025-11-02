# Recommendation UI Improvements

## Changes Made (2025-11-02)

### 🎨 **Display Improvements**

#### 1. **Album Cover**
- ✅ Fixed: Now shows actual Discogs album art
- Uses `cover_image_url` from records table
- Fallback to Music2 icon if no image available

#### 2. **Information Hierarchy**
```
[Album Cover] Album Name (prominent, bold)
             Artist - Track Title (smaller)
             [Tags] [Tags] [Tags]
             Score: 83
```

- **Album name** is now the primary focus (bold, larger)
- **Artist - Track** as subtitle
- Clean, scannable layout

#### 3. **Smart Tags**

Tags are now parsed and displayed separately:

- **Label/Artist Context**: 
  - "Same Label"
  - "Same Artist"
  - "Related Artist"

- **Genre/Style**: Split into individual tags
  - Example: "Funk Soul" and "Folk World" → Two separate tags
  - Excludes generic tags like "Electronic", "Dance"
  - Max 2 genre tags to avoid clutter

- **Decade Tags** (only for pre-1999):
  - 80s, 90s, 00s, 10s, 20s

- **Technical Info**:
  - BPM (e.g., "128 BPM")
  - Key (e.g., "Am")

- **Max 5 tags** shown per recommendation

#### 4. **Decades vs Years**
- Years < 1999: Show decade (e.g., "80s", "90s")
- Years ≥ 1999: No year tag shown
- Reduces visual noise for modern releases

---

### 🎯 **Recommendation Scoring Improvements**

#### **Increased Label Weight**

Label-based recommendations are now more prominent:

| Match Type | Old Score | New Score |
|------------|-----------|-----------|
| Same label | +15 | **+20** |
| Same artist on same label | +10 | **+15** |
| Same artist, different label | +8 | **+12** |
| Artist also on current label | +5 | **+8** |

#### **Complete Scoring System**

1. **My Relations**: +100 (Highest priority)
2. **Friend-of-Friend**: +90
3. **BPM + Key Combo**: +5 to +45
4. **Genre Match**: +10 per genre
5. **Label Network**: +8 to +35
6. **Year**: +1 to +3 (Lowest priority)

---

### 📊 **Data Flow**

```
API Route (recommendations/route.ts)
  ↓
Fetches: cover_image_url, genres, styles, label, year
  ↓
Returns: Full recommendation data with metadata
  ↓
UI Component (album-detail-drawer.tsx)
  ↓
Parses tags & decade from data
  ↓
Displays: Cover + Album + Artist-Song + Tags + Score
```

---

### 🎵 **Example Display**

```
┌─────────────────────────────────────────────────┐
│ [Album Art] Ostgut Ton 04                       │
│            Ben Klock - Subzero                  │
│            [Same Label] [Techno] [133 BPM] [Em] │
│            Score: 83                            │
│                                         [Add]   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ [Album Art] Electric Avenue                     │
│            Alkalino - Track Name                │
│            [Same Artist] [Funk] [Soul] [90s]    │
│            Score: 67                            │
│                                         [Add]   │
└─────────────────────────────────────────────────┘
```

---

### 🚀 **Performance**

- **Loading State**: Shows spinner while fetching
- **Immediate Clear**: Old recommendations removed instantly
- **Progressive Load**: New results appear as calculated
- **Optimized Queries**: Max 150 tracks analyzed for speed

---

### 🔧 **Technical Changes**

#### API Route
- Added `cover_image_url`, `genres`, `styles` to response
- Increased label scoring weights
- Returns complete metadata for UI parsing

#### UI Component
- Parses genres/styles into separate tags
- Calculates decades from years
- Extracts source indicators from match_reason
- Limits to 5 tags for clean display

---

### ✅ **Testing Checklist**

- [ ] Album covers display correctly
- [ ] Album name is prominent
- [ ] Tags are split properly (multiple genres)
- [ ] Decade tags show for <1999 years
- [ ] "Same Label", "Related Artist" tags appear
- [ ] Label-based recommendations rank higher
- [ ] Loading state shows when switching tracks
- [ ] Max 5 tags displayed per recommendation

