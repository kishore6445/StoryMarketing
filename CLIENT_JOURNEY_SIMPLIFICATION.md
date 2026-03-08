# Client Journey Simplification Strategy

## Current State Issues
1. **Scattered Information**: Client data spread across dashboard-home, client-detail-view, and multiple detail pages
2. **Multiple Navigation Paths**: Users can get to client info from top nav, sidebar, or dashboard cards
3. **Duplicate Displays**: Same data shown in multiple locations (tasks, phases, meetings, reports all separate)
4. **Cognitive Overload**: 7 phases × multiple views = too many entry points

## Simplified Client Journey - 3 Core Flows

### Flow 1: Client Selection → Dashboard (Single Source of Truth)
**Entry Point**: Top navigation or sidebar client selector
- Shows: Client name, current phase, progress, due tasks, team
- Actions: View phase details, add task, access meetings, generate reports

### Flow 2: Phase Navigation (Linear Progress)
**Current Phase → Next Phase**
- Visual timeline showing: Completed | In Progress | Upcoming
- Each phase shows: Tasks, team, deliverables, exit criteria
- One-click phase transition with approval workflow

### Flow 3: Task Management (Always Available)
**Quick Access Sidebar**
- My Tasks (assigned to me)
- Due Today (filtered by date)
- Blocked Tasks (need immediate attention)
- Filter: By client, by phase, by status

## Recommended UI Structure

### Top Nav (Client Context)
- Logo + Client Selector + Search + Notifications + Settings

### Left Sidebar (Smart Navigation)
**Main**: Dashboard | My Tasks | Calendar | Analytics
**Current Client Section**: Phase Progress | Team | Meetings
**Admin**: Workflows | Templates | Settings

### Main Content (Context-Aware)
- **If on Dashboard**: Show selected client card with 4 key tabs (Overview | Phase Details | Tasks | Reports)
- **If on Tasks**: Show filtered task list for selected client
- **If on Phase**: Show phase detail in full-screen modal or dedicated view

## Specific Improvements

1. **Replace client-detail-view complexity** with single expandable card in dashboard
2. **Consolidate tabs** (meetings, tasks, reports) into one modal per action
3. **Remove duplicate navigation paths** - one way to reach each view
4. **Add breadcrumbs** showing: Client > Phase > Section
5. **Implement progressive disclosure** - hide advanced options by default
6. **Add quick actions** - floating action button for common tasks

## Implementation Components
- `client-dashboard-card.tsx` - Unified client card with smart tabs
- `phase-detail-modal.tsx` - Single modal for all phase information
- `quick-actions-fab.tsx` - Floating action button for common tasks
- `simplified-sidebar.tsx` - Context-aware navigation
