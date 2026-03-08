# StoryOPS Typography System

## Overview
A clean, consistent 4-level typography hierarchy has been implemented to reduce visual chaos and ensure professional, cohesive design across the application.

## Typography Levels

### 1. **H1 (Heading 1)** - `.type-h1`
- **Size:** 30px (1.875rem)
- **Weight:** 700 (Bold)
- **Line Height:** 1.2
- **Letter Spacing:** -0.015em
- **Usage:** Page titles, major section headers
- **Example:** "Client Dashboard", "My Tasks"

```html
<h1 class="type-h1">Page Title</h1>
```

### 2. **H2 (Heading 2)** - `.type-h2`
- **Size:** 20px (1.25rem)
- **Weight:** 600 (Semibold)
- **Line Height:** 1.3
- **Letter Spacing:** -0.01em
- **Usage:** Section headers, card titles, modal headers
- **Example:** "Create New Task", "Sprint Tasks"

```html
<h2 class="type-h2">Section Title</h2>
```

### 3. **Body** - `.type-body`
- **Size:** 15px (0.9375rem)
- **Weight:** 400 (Regular)
- **Line Height:** 1.5
- **Letter Spacing:** 0 (normal)
- **Usage:** Main content, descriptions, form fields, labels
- **Example:** "Add a new task to your workflow"

```html
<p class="type-body">Main content text</p>
<label class="type-body font-medium">Form Label</label>
```

### 4. **Caption** - `.type-caption`
- **Size:** 13px (0.8125rem)
- **Weight:** 500 (Medium)
- **Line Height:** 1.4
- **Color:** `var(--muted-foreground)` (#86868B)
- **Usage:** Labels, metadata, secondary text, hints, timestamps
- **Example:** "Client Dashboard", "Sprint progress", "3 tasks completed this week"

```html
<div class="type-caption">Secondary text</div>
<span class="type-caption text-[#86868B]">Metadata</span>
```

## CSS Variables

All typography properties are defined as CSS variables in `globals.css`:

```css
--type-h1-size: 1.875rem;
--type-h1-weight: 700;
--type-h1-line: 1.2;

--type-h2-size: 1.25rem;
--type-h2-weight: 600;
--type-h2-line: 1.3;

--type-body-size: 0.9375rem;
--type-body-weight: 400;
--type-body-line: 1.5;

--type-caption-size: 0.8125rem;
--type-caption-weight: 500;
--type-caption-line: 1.4;
```

## Color Guidance

- **H1, H2, Body:** Use `text-[#1D1D1F]` (foreground) for primary text
- **Caption:** Inherits `var(--muted-foreground)` (#86868B) by default
- **For emphasis:** Add `font-semibold` or adjust color as needed

## Implementation Examples

### Page Header
```html
<h1 class="type-h1">Story Marketing</h1>
<p class="type-caption text-[#86868B] mt-1">Client Dashboard</p>
```

### Stat Card
```html
<div class="type-caption text-[#6B7280] mb-2">Completion</div>
<div class="text-2xl font-bold text-[#1D1D1F]">85%</div>
<div class="type-caption text-[#86868B] mt-2">Sprint progress</div>
```

### Modal Header
```html
<h2 class="type-h2">Create New Task</h2>
<p class="type-caption text-[#86868B] mt-1">Add a new task to your workflow</p>
```

### Form Label
```html
<label class="type-body font-medium text-[#1D1D1F] block mb-2">Task Title *</label>
<input class="type-body bg-white border border-[#E5E5E7]..." />
```

### Section Label
```html
<div class="type-caption text-[#6B7280] mb-3">Sprint Tasks</div>
```

## Benefits

✓ **Consistency:** All typography uses one of 4 defined levels  
✓ **Clarity:** Clear visual hierarchy reduces cognitive load  
✓ **Maintainability:** CSS variables make global updates easy  
✓ **Accessibility:** Proper sizing (15px min) and contrast ratios  
✓ **Professional:** Polished, crafted appearance aligned with design philosophy  

## Migration Notes

Components have been standardized to use the new system:
- `/app/page.tsx` - Main dashboard
- `/app/account-manager/page.tsx` - Client overview page
- `/components/my-tasks-today.tsx` - Task management interface

Future components should follow this system by default.
