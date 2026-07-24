# Hero Section Image Positioning & Scaling Guide

## Overview
The Hero section now supports dynamic image positioning and scaling through Sanity CMS. This allows fine-grained control over how each founder's image appears across all animation stages.

## Sanity Schema Fields

Add these fields to your `heroFounder` schema in Sanity:

```javascript
// In your sanity/schema/heroFounder.ts (or equivalent)
{
  name: 'scaleFactor',
  title: 'Scale Factor',
  type: 'number',
  description: 'Scale factor for image (1.0 = normal, 1.2 = 20% larger, 0.8 = 20% smaller). Range: 0.5 to 2.0',
  validation: Rule => Rule.min(0.5).max(2.0)
},
{
  name: 'positionX',
  title: 'Horizontal Position Offset (px)',
  type: 'number',
  description: 'Horizontal offset in pixels (positive = right, negative = left)',
},
{
  name: 'positionY',
  title: 'Vertical Position Offset (px)',
  type: 'number',
  description: 'Vertical offset in pixels (positive = down, negative = up)',
}
```

## Field Descriptions

### `scaleFactor` (number)
- Controls the size of the image within its container
- Default: `1.0` (normal size)
- Range: `0.5` (50% smaller) to `2.0` (200% larger)
- Examples:
  - `1.2` = Image is 20% larger
  - `0.8` = Image is 20% smaller
  - `1.5` = Image is 50% larger

### `positionX` (number)
- Horizontal position offset in pixels
- Default: `0` (centered)
- Positive values move the image to the right
- Negative values move the image to the left
- Examples:
  - `10` = Move 10px to the right
  - `-15` = Move 15px to the left

### `positionY` (number)
- Vertical position offset in pixels
- Default: `0` (centered)
- Positive values move the image down
- Negative values move the image up
- Examples:
  - `20` = Move 20px down
  - `-10` = Move 10px up

## How It Works

### Center Alignment
All images are **automatically centered** within their containers across all animation stages:
1. **Slideshow stage**: Images are centered in the viewport
2. **Deck stage**: Cards are stacked and centered
3. **Strip stage**: Cards spread horizontally but stay centered as a group
4. **Flight stage**: Hero card flies to heading slot while maintaining center alignment

### Positioning & Scaling
After automatic centering:
- `scaleFactor` adjusts the image size
- `positionX` and `positionY` fine-tune the position
- These transformations apply consistently across ALL animation stages

## Usage Examples

### Example 1: Logo that needs to be larger
```javascript
{
  name: "Titan Capital",
  role: "",
  image: "/images/hero_founders_images/titan-capital.png",
  isLogo: true,
  scaleFactor: 1.3,  // 30% larger
  positionX: 0,      // Centered horizontally
  positionY: 0       // Centered vertically
}
```

### Example 2: Portrait photo that needs slight adjustment
```javascript
{
  name: "Ruchi Kalra",
  role: "Co-Founder, Ofbusiness",
  image: "/images/herosection/Aarti Gill 2.png",
  scaleFactor: 1.1,   // 10% larger
  positionX: 5,      // Shift 5px right
  positionY: -8      // Shift 8px up
}
```

### Example 3: Photo that needs to be smaller
```javascript
{
  name: "Abhishek Bansal",
  role: "Co-Founder, Shadowfax",
  image: "/images/herosection/6. Ashtosh Valani 1.png",
  scaleFactor: 0.85, // 15% smaller
  positionX: 0,
  positionY: 10      // Shift 10px down
}
```

## Implementation Details

### Code Structure
- Type definition: `HeroFounder` interface includes optional `scaleFactor`, `positionX`, and `positionY`
- Safety: `clampScale()` ensures scale stays within safe bounds (0.5-2.0)
- Application: Positioning applied in both `HeadingPhoto` and `FounderCard` components
- Transform: Combined using `transform: scale(X) translate(Xpx, Ypx)`

### Fallback Behavior
If Sanity fields are not provided:
- `scaleFactor` defaults to `1.0`
- `positionX` defaultCentered
- `positionY` defaults to `0` (centered)

This ensures backward compatibility with existing data.

## Migration Path

1. Add the three new fields to your Sanity schema
2. Deploy schema changes to Sanity
3. Optionally update existing founder entries with custom values
4. Images will automatically use default values (scale=1, position=0,0) if fields are not set
5. No breaking changes - existing Hero section will work exactly as before

## Testing

After updating Sanity schema:
1. Check slideshow stage - images should be centered
2. Check deck/strip stages - all cards should remain centered
3. Check hero flight - hero card should fly to slot correctly
4. Adjust individual `scaleFactor`, `positionX`, `positionY` as needed for each founder image
