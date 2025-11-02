# 🎯 Improved Recommendations System

## What Changed?

The recommendation system has been completely rewritten with a **much smarter algorithm** that uses:

1. **Relation Graph Traversal** - Network effects from your mixing history
2. **Label Intelligence** - Curated connections through record labels
3. **Style Specificity** - "Deep House" not just "Electronic"
4. **Multi-Factor Scoring** - BPM + Key + Label combinations
5. **Deduplication** - Always keeps the highest score for each track

---

## 🎨 Recommendation Priority (High to Low)

### 1. Direct Relations (Score: 95-100) ⭐⭐⭐⭐⭐
**What it does**: Shows tracks you've already marked as good transitions

**Logic**:
- You created A → B with "Works" (👍) = Score 100
- You created A → B with "Doesn't Work" (👎) = Score 95 (still shows, but lower)

**Why it's important**: Your own mixing experience is the best signal!

### 2. Friend-of-Friend Relations (Score: 85) ⭐⭐⭐⭐⭐
**What it does**: Shows tracks connected through your mixing network

**Logic**:
```
Current track: A
A → B (you marked this)
B → C, D, E (you also marked these)
→ Recommend C, D, E (even though no direct A→C relation)
```

**Why it's important**: Network effects! Your mixing knowledge compounds.

**Example**:
- You know "Track 1" mixes into "Track 2"
- You know "Track 2" mixes into "Track 3", "Track 4", "Track 5"
- When viewing Track 1, you'll see Track 3, 4, 5 as recommendations!

### 3. Same Label + BPM/Key (Score: 90-95) ⭐⭐⭐⭐⭐
**What it does**: Finds tracks from the same record label with compatible mixing parameters

**Logic**:
- Same label + BPM within ±3 = Score 95
- Same label + BPM within ±5 = Score 90
- Same label + Compatible key = Score 90
- Same label only = Score 85

**Why it's important**: Labels curate music with similar vibes. Huge signal!

**Example**:
- Your track: "Deep House Track" on **Anjunadeep**, 122 BPM, Am
- Recommends: Other Anjunadeep tracks at 120-125 BPM with compatible keys

### 4. Artist Label Network (Score: 80) ⭐⭐⭐⭐
**What it does**: Finds tracks from other labels the same artist releases on

**Logic**:
```
Artist X releases on:
- Label A (10 releases) ← Primary label
- Label B (5 releases)
- Label C (2 releases)

Recommend tracks from all three labels
```

**Why it's important**: Artists maintain consistent styles across labels.

**Example**:
- Your track: "Artist X" on **Drumcode**
- Recommends: Other tracks from Artist X on **Intec**, **Terminal M**

### 5. Style-Based (Score: 75-85) ⭐⭐⭐⭐
**What it does**: Matches specific musical styles, not vague genres

**Style Specificity Scores**:
- **Deep House**: 1.0 (very specific)
- **Tech House**: 1.0
- **Melodic Techno**: 1.0
- **Progressive House**: 1.0
- **House**: 0.7 (somewhat specific)
- **Techno**: 0.7
- **Electronic**: 0.3 (too vague)
- **Dance**: 0.2 (almost useless)

**Why it's important**: "Deep House" is a useful signal. "Electronic" is not.

**Example**:
- "Deep House" track → other "Deep House" tracks (Score 85)
- "Electronic" track → skipped unless desperate (Score 45)

### 6. BPM + Key Combo (Score: 80-90) ⭐⭐⭐⭐
**What it does**: Perfect harmonic mixing matches

**Logic**:
- BPM within ±3 + Compatible key = Score 90 (Perfect mix!)
- Compatible key + BPM within ±5 = Score 85
- BPM within ±3 only = Score 80
- BPM within ±5 only = Score 70-75

**Compatible Keys** (Harmonic Mixing):
- **C major** → G, F, Am, Em, Dm
- **Am minor** → Em, Dm, C, G, F
- *(Full circle of fifths implemented)*

**Why it's important**: Technical mixing compatibility.

### 7. Same Artist (Score: 70) ⭐⭐⭐
**What it does**: Other tracks by the same artist

**Why it's important**: Consistent sound, but lower priority than label/style.

### 8. Generic Genre (Score: 40) ⭐ FALLBACK ONLY
**What it does**: Very basic genre matching

**Only used if**: You have less than 10 recommendations from above methods

**Why it's low**: "Electronic" matches everything. Not useful.

---

## 🚀 Key Improvements Over Old System

### Before (Old System)
```
❌ Always same 5 tracks
❌ "Electronic" matched everything
❌ No label intelligence
❌ No relation graph
❌ BPM ±5 was too broad
❌ Scores didn't combine factors
```

### After (New System)
```
✅ Diverse recommendations
✅ Style specificity (Deep House vs Electronic)
✅ Label network analysis
✅ Friend-of-friend relations
✅ BPM ±3 for tight matching
✅ Multi-factor scoring (Label + BPM + Key)
```

---

## 📊 Example Recommendations

### Example 1: Deep House Track with Relations

**Current Track**:
- "Lonely Days" by Lane 8
- Label: **This Never Happened**
- BPM: 120
- Key: Am
- Style: Deep House

**Recommendations** (in order):

1. **Score 100** - "Fingerprint" (You marked A→B)
2. **Score 95** - "Atlas" (Same label + BPM 122 + Key Em)
3. **Score 85** - "Golden State" (Friend-of-friend: A→B→C)
4. **Score 85** - "Bloom" (Same label)
5. **Score 85** - "Emerge" (Deep House style)
6. **Score 80** - "Sphere" (Artist on Anjunadeep)
7. **Score 70** - "Sierra Nevada" (Same artist)

### Example 2: Techno Track without Relations

**Current Track**:
- "Function" by Dax J
- Label: **Monnom Black**
- BPM: 135
- Key: Unknown
- Style: Techno

**Recommendations** (in order):

1. **Score 90** - Other Monnom Black tracks at 133-137 BPM
2. **Score 85** - Tracks from same label (Monnom Black)
3. **Score 80** - Dax J tracks on other labels (Deeply Rooted, Soma)
4. **Score 75** - Techno tracks at 133-137 BPM
5. **Score 70** - Other Dax J tracks

---

## 🎛️ How Scoring Works

### Deduplication Logic
```typescript
// If a track matches multiple criteria, we keep the HIGHEST score
Track X matches:
- Same label (85)
- BPM ±3 (80)
- Compatible key (85)

→ Final score: 85 (highest)
→ Reason: "Same label" (most important)
```

### Why This Matters
The old system would show the same track multiple times with different reasons. Now each track appears once with its best match reason.

---

## 🔍 What the Algorithm Looks For

### 1. Your Mixing History
- Tracks you've connected
- Tracks connected to your tracks (1-hop away)
- Success rate (worked well or not)

### 2. Label Curation
- Same label = curated similarity
- Artist's other labels = artistic consistency
- Label frequency = relationship strength

### 3. Style Precision
- Specific styles (Deep House) > Generic genres (Electronic)
- Avoids showing every "Electronic" track
- Uses Discogs styles when available

### 4. Technical Compatibility
- BPM within ±3 for tight mixing
- Harmonic key compatibility
- Combination bonuses

### 5. Artistic Connections
- Same artist across labels
- Artists on same label
- Genre/style families

---

## 🎯 Best Practices

### To Get Better Recommendations:

1. **Add Relations**: Click albums, select tracks, add relations
   - The more you add, the better friend-of-friend works
   
2. **Mark "Works" or "Doesn't Work"**: Both are useful!
   - "Works" gets Score 100
   - "Doesn't Work" still shows (Score 95) for reference
   
3. **Import from Discogs**: Labels and styles come from there
   - The more metadata, the better
   
4. **Add BPM/Key Manually**: If Discogs doesn't have it
   - *(Feature coming soon)*
   
5. **Build Your Network**: More relations = more recommendations
   - A→B→C→D creates a web of suggestions

---

## 📈 Data Requirements

### Minimum for Recommendations:
- **Track must exist** in your collection
- **At least one of**: Label, Style, BPM, Relations

### Best Results:
- ✅ Label information (from Discogs)
- ✅ Style tags (Deep House, Tech House, etc.)
- ✅ BPM (from Discogs or manual)
- ✅ Key (from Discogs or manual)
- ✅ Existing relations (your mixing history)

### If Missing Data:
- No label → Can't do label matching
- No BPM → Can't do BPM matching
- No relations → Can't do network traversal
- **But**: Algorithm adapts and uses what's available!

---

## 🐛 Troubleshooting

### "Still seeing same tracks"
→ You might not have enough variety in your collection
→ Try importing more tracks from Discogs
→ Add more relations to build the network

### "No recommendations at all"
→ Current track has no metadata (no label, style, BPM)
→ Import from Discogs to get metadata
→ Or add manual relations

### "Recommendations don't seem related"
→ Check if the track has proper style tags
→ "Electronic" alone is too vague
→ Import from Discogs for better style tags

### "Friend-of-friend not working"
→ You need at least 2 relations for this to work
→ Example: Add A→B and B→C, then A will show C

---

## 🔮 Future Enhancements

### Planned:
- [ ] Machine learning from play history
- [ ] Audio similarity (analyze waveforms)
- [ ] Community recommendations (other DJs with similar taste)
- [ ] Spotify integration for audio features
- [ ] Manual BPM/Key entry
- [ ] Energy level matching
- [ ] Mood/vibe analysis

---

## 💡 Pro Tips

1. **Label is King**: Same label often means compatible vibes
2. **Build the Network**: More relations = exponentially better recommendations
3. **Style > Genre**: "Deep House" beats "Electronic"
4. **BPM Matters**: ±3 BPM is tight mixing territory
5. **Use Both Arrows**: Incoming (←) and Outgoing (→) relations both count
6. **Trust the Score**: Higher score = better match
7. **Friend-of-Friend is Powerful**: Your mixing knowledge compounds!

---

## 📚 Technical Details

### Algorithm Complexity:
- **O(1)** - Direct relations lookup
- **O(n)** - Friend-of-friend traversal (where n = # of relations)
- **O(m)** - Label/style matching (where m = # of tracks)

### Database Queries:
- ~8-10 queries per recommendation request
- Cached in Map to avoid duplicates
- Sorted once at the end

### Performance:
- Target: < 500ms response time
- Limit: 30 tracks per category
- Output: Top 20 recommendations

---

**Enjoy much smarter recommendations! 🎧✨**

