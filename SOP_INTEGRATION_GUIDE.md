## SOP Integration Guide - Complete Implementation

### What's Been Created

**1. SOP Configuration System** (`/lib/sop-config.ts`)
- Complete type system for SOPs with Google Drive and web link support
- Generic SOP categories (SEO, Content, Social, Analytics)
- Brand-specific SOP categories (Colors, Typography, Logo, Brand Voice)
- Task, Phase, and Workflow step SOP associations
- EnhancedTask type supporting SOP linking

### System Architecture

```
SOP Management System
├── Generic SOPs (shared across all clients)
│   ├── SEO Best Practices (Google Drive link)
│   ├── Content Guidelines (webpage)
│   ├── LinkedIn Posting Rules (webpage)
│   └── Analytics Reporting (Google Drive)
│
├── Brand-Specific SOPs (per brand/client)
│   ├── ABC Manufacturing Colors (Google Drive)
│   ├── ABC Manufacturing Typography (webpage)
│   ├── TechStart Brand Voice (Google Drive)
│   └── TechStart Logo Usage (webpage)
│
└── Phase-Level SOPs
    ├── Story Research Phase SOPs
    ├── Story Writing Phase SOPs
    ├── Story Design Phase SOPs
    └── Story Distribution Phase SOPs
```

### Key Features Implemented

**1. Two-Tier SOP Hierarchy**
- Generic SOPs: Used across all brands (accessible to all users)
- Brand-Specific SOPs: Customized per client/brand (visible only to relevant teams)

**2. Multiple Link Types**
- Google Drive: `https://drive.google.com/file/d/{id}/view`
- Webpage: `https://example.com/sop/{name}`
- Internal: Links to internal wiki/documentation

**3. Task-Level SOP Assignment**
When creating a task, you can:
- Select 1 or more SOPs to attach
- Mark SOPs as "required" for task completion
- Order SOPs by importance/sequence

**4. Workflow-Level SOP Assignment**
In the Workflow Builder/Manager:
- Assign SOPs to each workflow step
- Mark SOPs as "required for approval"
- Users see these SOPs before completing task in that phase
- Users must acknowledge SOP before advancing to next phase

**5. Phase-Level Auto-Assignment**
- Define default SOPs for each story phase
- When task enters a phase, auto-attach phase SOPs
- Auto-populate next phase SOPs in task metadata

### Integration Points

1. **Task Creation** → Attach SOPs when creating task
2. **Task Display** → Show SOP links in task detail view
3. **Workflow Steps** → Show SOP requirements before approval
4. **Phase Transition** → Auto-assign next phase SOPs
5. **Dashboard** → Display SOP requirements in My Tasks view

### Database Schema Required

```sql
-- SOP Master Table
CREATE TABLE sops (
  id PRIMARY KEY,
  name, description, type, category,
  link_type, link, brand_id, client_id,
  created_by, created_at, updated_at, version,
  is_active
);

-- Task SOPs (Junction Table)
CREATE TABLE task_sops (
  id PRIMARY KEY,
  task_id, sop_id, is_required, order,
  added_at, added_by
);

-- Phase SOPs
CREATE TABLE phase_sops (
  id PRIMARY KEY,
  phase_id, sop_id, stage_description, order,
  created_at
);

-- Workflow Step SOPs
CREATE TABLE workflow_step_sops (
  id PRIMARY KEY,
  workflow_step_id, sop_id, required_for_approval, order,
  added_at
);

-- Task Workflow Tracking
ALTER TABLE tasks ADD COLUMN (
  workflow_phase VARCHAR,
  next_phase_workflow VARCHAR,
  sop_acknowledgement BOOLEAN
);
```

### How Users See SOPs

**1. In "My Tasks Today" View**
```
Task: "Finalize primary color palette"
├─ SOP: ABC Manufacturing Color Palette [Google Drive]
├─ SOP: Brand Colors Best Practices [Webpage]
└─ SOP: Color Accessibility Guide [Webpage]
```

**2. In Task Detail**
```
Current Task Details
├─ Title, Description, Owner
├─ Due Date, Priority
└─ Associated SOPs (expandable)
    ├─ [REQUIRED] ABC Manufacturing Colors
    ├─ [OPTIONAL] Design System Guide
    └─ [View] [Download] [Print]
```

**3. In Workflow Approval**
```
Before approving task in workflow:
"This task requires review of these SOPs"
├─ ☑ Brand Voice Guidelines (checked)
├─ ☑ Content Standards (checked)
└─ ☐ Quality Checklist (unchecked) ← Cannot approve until checked
```

### Implementation Steps for Frontend

1. **Update SectionTasks Component**
   - Add SOP selector when creating task
   - Display SOP icons/links in task list

2. **Update MyTasksToday Component**
   - Show SOP links below task title
   - Add "View SOPs" expandable section

3. **Update WorkflowBuilder**
   - Add SOP assignment per workflow step
   - Show SOP requirements preview

4. **Create TaskDetailView Enhancement**
   - Full SOP details with link buttons
   - Open in new tab option for Google Drive/web

5. **Create SOPLibraryAdmin**
   - Manage generic SOPs
   - Manage brand-specific SOPs
   - Version control for SOPs

### Benefits

✓ Centralized SOP management (no scattered documents)
✓ Google Drive integration (use existing brand docs)
✓ Web links (link to published SOPs)
✓ Context-aware SOPs (right SOP for right task)
✓ Workflow compliance (must acknowledge before proceeding)
✓ Brand consistency (brand-specific SOPs enforced)
✓ Auto-routing (next phase SOPs pre-loaded)
