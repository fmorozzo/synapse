# Label Matching Debug Guide

## Issues Fixed

### 1. **Track Limit Issue** ✅
**Problem**: Only analyzing 1000 tracks (Supabase default limit)
**Solution**: Increased limit to 10,000 tracks

### 2. **Label Matching Not Working** 🔍
**Problem**: Not finding tracks from same label
**Solution**: Added comprehensive debugging to diagnose the issue

---

## What to Look For in Console

When you click a track, you'll now see detailed output:

```
📀 Current track: {
  title: 'Beat Line',
  artist: 'Francisco',
  label: 'Slow Motion Records (2)',
  ...
}

📊 Analyzing 1500 tracks in your collection (total: 1500)...

🏷️  Prioritizing tracks from label: "Slow Motion Records (2)"
   📀 Total releases in DB with this label: X
   📚 Releases YOU own from "Slow Motion Records (2)": 
       ["Album 1" by Artist A, "Album 2" by Artist B]
   Found X tracks from those releases
   ✅ Added X tracks from same label to priority list
```

---

## Diagnostic Questions

### Case 1: No Other Albums from Label
```
⚠️  You don't own any other albums from "Slow Motion Records (2)"
```
**Meaning**: You only have ONE album from this label in your collection
**Solution**: This is expected! The system will fall back to other matching criteria

### Case 2: Label Name Mismatch
```
📀 Total releases in DB with this label: 0
```
**Meaning**: The label name doesn't match exactly
**Possible causes**:
- Label stored as "Slow Motion Records" (without "(2)")
- Different label variations in Discogs
- Typos or encoding issues

**Check**: Look at your other albums - do they have the EXACT same label name?

### Case 3: Albums Found but Not in Your Collection
```
📀 Total releases in DB with this label: 10
📚 Releases YOU own from "Slow Motion Records (2)": []
```
**Meaning**: Albums from this label exist in DB, but you don't own them
**Solution**: Import more from your Discogs collection

### Case 4: Should Be Working!
```
📀 Total releases in DB with this label: 5
📚 Releases YOU own from "Slow Motion Records (2)": 
    ["Album X" by Francisco, "Album Y" by Another Artist]
Found 15 tracks from those releases
✅ Added 15 tracks from same label to priority list
```
**Meaning**: Everything is working correctly
**Expected**: You should see recommendations from these albums with high scores (20+)

---

## How to Test

1. **Refresh browser** (hard refresh: Cmd+Shift+R)
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Go to Collection page**
4. **Click on "Beat Line" album**
5. **Click the "Beat Line" track**
6. **Watch the console output**
7. **Copy the output** and share it with me

---

## What the Output Tells Us

### If you see:
```
📚 Releases YOU own from "Slow Motion Records (2)": 
    ["Album X" by Francisco]
```

**This means**: 
- ✅ The label matching IS working
- ✅ It found other albums you own
- ✅ Tracks from these albums should appear in recommendations

### If recommendations still don't show:
- Check the **final scores** in the recommendations
- Look for tracks from "Album X" in the results
- They should have scores like:
  - Same label: +20 points
  - Same artist on same label: +35 points

---

## Expected vs Actual

### Expected Output (if you have other albums):
```
1. "Track from Album X" - Score: 35
   🏷️ Same label (Slow Motion Records (2))
   🎤 Same artist on same label
   
2. "Track from Album Y" - Score: 23
   🏷️ Same label (Slow Motion Records (2))
   🎨 1 shared genre(s): Electronic
```

### Actual Output (if no other albums):
```
1. "Day One" - Score: 3
   📅 Same year (2015)
```

---

## Next Steps

**Please share the console output so we can see:**
1. How many albums you own from "Slow Motion Records (2)"
2. If the label name matches exactly
3. If tracks are being added to the priority list
4. If final recommendations include those tracks

This will tell us exactly what's happening! 🔍

