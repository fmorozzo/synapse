# 🎯 Cumulative Scoring System

## The Problem with Old System

**Old approach**: Each criterion had a fixed score (85, 90, 95). Pick the highest.

```
Track A:
- Same label = 85 points
- BPM match = 80 points
→ Final score: 85 (highest)

Track B:
- Same label = 85 points
→ Final score: 85

Both get same score! ❌
```

## The New Cumulative Approach

**New approach**: Score = SUM of ALL matching criteria!

```
Track A:
- Same label = +15 points
- BPM within ±3 = +25 points
- Compatible key = +20 points
- 2 shared genres = +20 points
→ Final score: 80 ✨

Track B:
- Same label = +15 points
→ Final score: 15

Track A is MUCH better! ✅
```

---

## 📊 Scoring System (Priority Order)

### 1. My Relations (+100) - HIGHEST PRIORITY
**If you created a relation A→B**:
- Worked well (👍): +100 points
- Instant top recommendation

**Why**: Your own experience is the best signal!

### 2. Same Playlist/Session (+90) - VERY HIGH
**If tracks are in the same session**:
- +90 points

**Why**: You've grouped them together for a reason!

### 3. Key + BPM Combo (Up to +45) - HIGH
**BPM matching**:
- Within ±3 BPM: +25 points
- Within ±5 BPM: +15 points
- Within ±10 BPM: +5 points

**Key matching**:
- Compatible key: +20 points

**Total possible**: 45 points (if both match perfectly)

**Why**: Technical mixing compatibility matters!

### 4. Genre Matching (+10 per genre) - MODERATE-HIGH
**Shared genres**:
- Each shared genre: +10 points
- 2 shared genres: +20 points
- 3 shared genres: +30 points
- (Excludes "Electronic" - too generic)

**Why**: More shared genres = more similar vibe!

### 5. Label Network (+5 to +25) - MODERATE
**Complex label relationships**:

**a) Same label, same artist**: +25 points total
- Same label: +15
- Same artist bonus: +10

**b) Same label, different artist**: +15 points

**c) Different label, same artist**: +8 points

**d) Different label, but artist has releases on your label**: +5 points
- Creates network connection
- "If you like Label A, you might like this artist who also releases on Label A"

**Why**: Labels curate similar sounds!

### 6. Year (Up to +3) - LOW PRIORITY
**Year matching**:
- Same year (±0): +3 points
- Same era (±2 years): +1 point

**Why**: Era matters less than sound!

---

## 🎯 Example Scenarios

### Scenario 1: Perfect Match
```
Current: "Deep Pressure" - Ben Klock, Ostgut Ton, 132 BPM, Am, Techno

Candidate: "Subzero" - Ben Klock, Ostgut Ton, 133 BPM, Em, Techno

Score:
✅ Same label: +15
✅ Same artist: +10
✅ BPM ±3: +25
✅ Compatible key (Am→Em): +20
✅ Shared genre (Techno): +10
✅ Same year (2015): +3
────────────────
Total: 83 points

Reason: "🏷️ Same label (Ostgut Ton) • 🎤 Same artist • 🎵 BPM 133 (±3) • 🔑 Compatible key (Em) • 🎨 Shared genre: Techno • 📅 Same year (2015)"
```

### Scenario 2: Label Only
```
Current: "Deep Pressure" - Ben Klock, Ostgut Ton, 132 BPM, Am, Techno

Candidate: "Speaker Attack" - Different Artist, Ostgut Ton, 145 BPM, C, Techno

Score:
✅ Same label: +15
✅ Shared genre (Techno): +10
────────────────
Total: 25 points

Reason: "🏷️ Same label (Ostgut Ton) • 🎨 Shared genre: Techno"
```

**Track 1 (83 pts) >> Track 2 (25 pts)** ✅

### Scenario 3: Key + BPM + Genre (No Label)
```
Current: "Track A" - Artist X, Label A, 128 BPM, C, House, Deep House

Candidate: "Track B" - Artist Y, Label B, 129 BPM, G, House, Deep House

Score:
✅ BPM ±3: +25
✅ Compatible key (C→G): +20
✅ 2 shared genres: +20
────────────────
Total: 65 points

Reason: "🎵 BPM 129 (±3) • 🔑 Compatible key (G) • 🎨 2 shared genres: House, Deep House"
```

**Good score even without label match!** ✅

### Scenario 4: Label Network
```
Current: "Track A" - Artist X, Label A, 128 BPM, Am, Techno

Candidate: "Track B" - Artist Y, Label B, 135 BPM, Dm, Techno

But: Artist Y also has releases on Label A!

Score:
✅ Artist also on Label A: +5
✅ Shared genre (Techno): +10
────────────────
Total: 15 points

Reason: "🔗 Artist also releases on Label A • 🎨 Shared genre: Techno"
```

**Creates network connections!** ✅

---

## 🎨 Match Reason Display

Each recommendation shows **ALL** matching criteria:

```
"Subzero" by Ben Klock
Score: 83

🏷️ Same label (Ostgut Ton) • 
🎤 Same artist • 
🎵 BPM 133 (±3) • 
🔑 Compatible key (Em) • 
🎨 Shared genre: Techno • 
📅 Same year (2015)
```

You can SEE why it's recommended!

---

## 📈 Score Ranges

**90-110**: Perfect match (has direct relation)
**70-89**: Excellent (multiple strong matches)
**50-69**: Very good (key+BPM+genre or label+genre+BPM)
**30-49**: Good (some matches)
**15-29**: Okay (single match like label only)
**1-14**: Weak (year only or minor connection)

---

## 🎯 Why This Works Better

### Old System Problems:
❌ "Same label" = 85 points for everyone
❌ "BPM match" = 80 points for everyone
❌ Can't tell why one 85 is better than another 85
❌ Year was too prominent

### New System Benefits:
✅ Multiple matches = higher score (cumulative)
✅ Can see exactly WHY a track scores high
✅ Year is low priority (+1 to +3)
✅ Key + BPM + Genre combo is rewarded
✅ Label network creates smart connections
✅ More shared genres = better score

---

## 🔮 Future Enhancements

- [ ] Session/playlist bonus (+90)
- [ ] Friend-of-friend relations (+85)
- [ ] Style matching (more specific than genre)
- [ ] Energy level matching
- [ ] Audio similarity (waveform analysis)
- [ ] Play history patterns
- [ ] Time of day patterns
- [ ] Crowd response data

---

## 💡 Pro Tips

1. **Create Relations**: +100 points is instant top recommendation
2. **Use Sessions**: Group tracks together (+90 bonus coming)
3. **Import Metadata**: More data = better matching
4. **Multiple Genres**: Tracks with 3+ genres get better matches
5. **Label Network**: Artists on multiple labels create connections
6. **BPM Range**: ±3 is tight mixing, ±10 still gets some points
7. **Key Matters**: Compatible keys add +20 points
8. **Year is Minor**: Don't worry if years don't match

---

**The more criteria that match, the better the recommendation!** 🎯

