

## Fix: Player image not displaying due to broken CSS height chain

### Root Cause
In `UnifiedPlayerImage.tsx`, when `difficulty` is set (always the case in the quiz), the image container uses `h-full` but its parent and grandparent divs lack `h-full`. This breaks the CSS percentage height chain, causing the image container to collapse to 0px height. All children are absolutely positioned, so nothing provides intrinsic height.

```text
AdaptivePlayerImage container:  w-56 h-56 (224px) ✓
  └─ UnifiedPlayerImage outer:  w-full max-w-md    ✗ height=auto
      └─ Inner wrapper:         relative            ✗ height=auto
          └─ Image container:   w-full h-full       ✗ h-full of auto = 0
              └─ img:           absolute inset-0    → invisible
```

### Fix (1 file)

**`src/components/player-image/UnifiedPlayerImage.tsx`**

1. **Line 384** — Add `h-full` when difficulty is set:
   ```tsx
   <div className={cn("w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto", difficulty && "h-full", className)}>
   ```

2. **Line 385-389** — Add `h-full` when difficulty is set:
   ```tsx
   <div className={cn(
     "relative rounded-lg overflow-hidden bg-muted/10",
     difficulty && "h-full",
     effects?.borderColor && `border-4 ${effects.borderColor}`,
     ...
   )}>
   ```

This restores the height chain so `h-full` on the image container correctly inherits from the 224px parent in `AdaptivePlayerImage`.

### Secondary cleanup (same file)
- Change `fetchPriority` to `fetchpriority` (line 449) to fix the React DOM warning visible in console logs.

