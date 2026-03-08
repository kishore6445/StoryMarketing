# COMPLETE SYSTEM SPECIFICATION DOCUMENT
## Story-Centric Marketing Workflow Platform

**Document Version:** 1.0  
**Last Updated:** February 2026  
**For:** Backend Development Team

---

## TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Screen/Tab Descriptions](#screentab-descriptions)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Use Stories & Workflows](#use-stories--workflows)
8. [Integration Points](#integration-points)

---

## SYSTEM OVERVIEW

### What is this platform?
A comprehensive marketing workflow management system that helps teams create, manage, and track stories (content campaigns) through 7 distinct phases. The system supports task management, approvals, client feedback, metrics tracking, and collaborative workflows.

### Core Concept: "Story Phases"
Content is organized into **7 Sequential Phases**:
1. **Story Research** - Research and identify narrative elements
2. **Story Writing** - Create messaging and content
3. **Story Design & Video** - Visual content creation
4. **Story Website** - Build digital presence
5. **Story Distribution** - Multi-channel publishing
6. **Story Analytics** - Performance tracking
7. **Story Learning** - Optimization based on data

---

## USER ROLES & PERMISSIONS

### 4 Core Roles:

#### 1. **ADMIN** (Full System Access)
**Permissions:**
- view_dashboard
- view_tasks
- create_tasks
- edit_tasks
- delete_tasks
- approve_tasks
- submit_for_review
- view_approvals
- manage_workflows
- manage_users
- view_sops

**Capabilities:**
- Manage all users and teams
- Configure workflows for departments
- Access all client data
- System configuration
- View all reports and analytics

**Example Users:** Platform owners, system administrators

---

#### 2. **MANAGER** (Team & Approval Authority)
**Permissions:**
- view_dashboard
- view_tasks
- create_tasks
- edit_tasks
- approve_tasks
- submit_for_review
- view_approvals
- view_sops

**Capabilities:**
- Create and manage tasks for team
- Approve/reject content submissions
- View team performance
- Manage team meetings
- Submit phases for review
- View and acknowledge SOPs

**Example Users:** Content managers, project leads, department heads

---

#### 3. **USER** (Team Contributor)
**Permissions:**
- view_dashboard
- view_tasks
- create_tasks
- edit_tasks
- submit_for_review
- view_approvals
- view_sops

**Capabilities:**
- Create tasks within their domain
- Submit work for review
- View approval status
- Collaborate with team members
- Access SOPs and guidelines
- Cannot approve tasks

**Example Users:** Content writers, designers, researchers

---

#### 4. **CLIENT** (External Stakeholder - Limited Access)
**Permissions:**
- view_client_deliverables
- provide_feedback
- view_sops

**Capabilities:**
- View project progress and status
- See completed deliverables
- Provide feedback on work
- View weekly reports
- View action items
- Cannot edit or approve internally
- Access restricted to their own projects

**Example Users:** Client companies, external stakeholders

---

## SCREEN/TAB DESCRIPTIONS

### Main Navigation Structure

The sidebar has two main sections:
1. **Content Creation** (Story Phases)
2. **Collaboration** (Team & Workflow Tools)

---

### SECTION 1: CONTENT CREATION FLOW

#### Screen 1.1: **Dashboard Home** 
**URL:** `/`  
**Role Access:** Admin, Manager, User

**Components:**
```
┌─────────────────────────────────────────────┐
│ Dashboard Home                              │
├─────────────────────────────────────────────┤
│                                             │
│  • Today's Focus Card                       │
│    - Show 3 most urgent tasks for today     │
│    - Quick action buttons (Mark Done, etc)  │
│                                             │
│  • Phase Timeline Card                      │
│    - Visual timeline of current phase       │
│    - Next milestone date                    │
│    - Progress percentage                    │
│                                             │
│  • My Tasks Today Card                      │
│    - List of tasks assigned to current user │
│    - Status indicators (pending, approved)  │
│    - Due dates                              │
│                                             │
│  • Current Phase Card                       │
│    - Which phase are we in?                 │
│    - Phase description and tagline          │
│    - Quick action: "Start Phase" button     │
│                                             │
│  • Analytics Dashboard                      │
│    - Campaign metrics overview              │
│    - Key performance indicators             │
│    - Trending charts                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Data Dependencies:**
- Tasks (filtered by current user ID)
- Current phase from workflow_phases table
- User's daily focus preferences
- Analytics metrics from campaign_metrics table

**API Calls Needed:**
```
GET /api/tasks?userId={userId}&dateRange=today
GET /api/phases/current
GET /api/analytics/dashboard?clientId={clientId}
GET /api/user-preferences/{userId}/daily-focus
```

---

#### Screen 1.2: **Story Research Phase**
**URL:** `/phases/research`  
**Role Access:** Admin, Manager, User

**Components:**
```
┌─────────────────────────────────────────────┐
│ Story Research - Define the narrative roles │
├─────────────────────────────────────────────┤
│                                             │
│  Phase Progress: 45%  ─────○─────────      │
│                                             │
│  📋 RESEARCH TASKS                          │
│  ├─ Identify 3 core narrative roles         │
│  │  Status: In Progress | Assigned: John    │
│  │  Due: Feb 15, 2026                       │
│  │                                          │
│  ├─ Customer journey mapping                │
│  │  Status: Completed ✓                     │
│  │  Completed: Feb 10, 2026                 │
│  │                                          │
│  └─ Market research compilation             │
│     Status: Pending Review | Assigned: Sarah│
│     Due: Feb 18, 2026                       │
│                                             │
│  📎 DELIVERABLES                            │
│  • Research_Report_v2.pdf                   │
│  • Customer_Analysis.xlsx                   │
│  • Competitor_Mapping.pptx                  │
│                                             │
│  📝 PHASE NOTES                             │
│  ├─ Internal collaboration notes            │
│  └─ Client feedback (if applicable)         │
│                                             │
│  [Submit for Review →] [Save Progress]      │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Interactions:**
1. **Task Management:** Create, edit, mark complete
2. **File Upload:** Attach deliverables
3. **Notes/Comments:** Internal and client-facing
4. **Phase Submission:** Submit entire phase for approval

**Data Model:**
```
Phase {
  id: "research"
  name: "Story Research"
  status: "in_progress" | "pending_review" | "approved" | "completed"
  progress: number (0-100)
  tasks: Task[]
  deliverables: File[]
  notes: Note[]
  submittedAt?: timestamp
  approvedAt?: timestamp
  completedAt?: timestamp
}

Task {
  id: string
  phaseId: string
  title: string
  description: string
  assignedTo: userId
  status: "draft" | "in_progress" | "pending_review" | "completed"
  dueDate: timestamp
  priority: "low" | "medium" | "high"
  createdAt: timestamp
  updatedAt: timestamp
}
```

**API Calls Needed:**
```
GET /api/phases/research
GET /api/phases/research/tasks
POST /api/tasks (create new task)
PATCH /api/tasks/{taskId} (update task)
POST /api/tasks/{taskId}/complete
POST /api/phases/research/submit-for-review
GET /api/phases/research/deliverables
POST /api/files/upload
```

---

#### Screens 1.3-1.7: **Story Writing → Story Learning (Phases 2-7)**

**Same structure as Screen 1.2, with phase-specific content:**

- **Story Writing** (Phase 2)
  - Content outline
  - Copy writing tasks
  - Brand messaging guidelines
  
- **Story Design & Video** (Phase 3)
  - Design assets
  - Video production tasks
  - Visual guidelines
  
- **Story Website** (Phase 4)
  - Website development tasks
  - CMS content entry
  - Technical specifications
  
- **Story Distribution** (Phase 5)
  - Social media scheduling
  - Email campaign setup
  - Multi-channel coordination
  
- **Story Analytics** (Phase 6)
  - Performance metrics
  - KPI tracking
  - Data analysis
  
- **Story Learning** (Phase 7)
  - Insights and learnings
  - Optimization recommendations
  - Next iteration planning

---

### SECTION 2: COLLABORATION & WORKFLOW TOOLS

#### Screen 2.1: **Team Collaboration**
**URL:** `/collaboration`  
**Role Access:** Admin, Manager, User

**Components:**
```
┌─────────────────────────────────────────────┐
│ Team Collaboration Hub                      │
├─────────────────────────────────────────────┤
│                                             │
│  👥 TEAM MEMBERS (Online Status)            │
│  ├─ Sarah Chen (Manager) 🟢 Online          │
│  ├─ John Smith (Designer) 🟡 Away           │
│  └─ Emily Watson (Writer) 🔴 Offline        │
│                                             │
│  💬 RECENT ACTIVITY FEED                    │
│  ├─ Sarah approved "Design Concepts" 2h ago │
│  ├─ John commented on "Homepage Design"     │
│  └─ Emily submitted "Story Copy" for review │
│                                             │
│  🎯 TEAM FOCUS FOR TODAY                    │
│  └─ 3 tasks to complete for deadline        │
│                                             │
│  📅 TEAM MEETINGS THIS WEEK                 │
│  ├─ Monday 2 PM: Design Review              │
│  ├─ Wednesday 10 AM: Client Check-in        │
│  └─ Friday 3 PM: Weekly Sync                │
│                                             │
│  💼 TEAM PERFORMANCE                        │
│  ├─ Avg. Completion Rate: 87%               │
│  ├─ On-Time Delivery: 92%                   │
│  └─ Quality Score: 4.5/5                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Features:**
- Real-time team status
- Activity feed showing recent actions
- Meeting scheduler integration
- Team performance metrics

---

#### Screen 2.2: **Team Meetings**
**URL:** `/team-meetings`  
**Role Access:** Admin, Manager, User

**Components:**
```
┌─────────────────────────────────────────────┐
│ Team Meeting Scheduler                      │
├─────────────────────────────────────────────┤
│                                             │
│  📆 UPCOMING MEETINGS                       │
│  ├─ [Today] 2:00 PM - Design Review         │
│  │  Attendees: Sarah, John, Emily           │
│  │  Duration: 1 hour                        │
│  │                                          │
│  ├─ [Wed] 10:00 AM - Client Check-in        │
│  │  Attendees: Sarah, Client (ABC Mfg)      │
│  │  Duration: 1.5 hours                     │
│  │                                          │
│  └─ [Fri] 3:00 PM - Weekly Sync             │
│     Attendees: Team (All)                   │
│     Duration: 30 minutes                    │
│                                             │
│  📝 MEETING NOTES & DECISIONS               │
│  ├─ Last Week's Decision: Use Template A    │
│  ├─ Action Item: John to refine designs     │
│  └─ Next Week Focus: Copy review            │
│                                             │
│  [Schedule New Meeting]                     │
│                                             │
└─────────────────────────────────────────────┘
```

**Data Model:**
```
Meeting {
  id: string
  title: string
  description: string
  scheduledAt: timestamp
  duration: number (minutes)
  attendees: User[]
  notes: MeetingNote[]
  decisions: Decision[]
  actionItems: ActionItem[]
  recording?: string (URL)
  status: "scheduled" | "in_progress" | "completed"
}

Decision {
  id: string
  meetingId: string
  description: string
  decidedBy: userId
  createdAt: timestamp
  priority: "low" | "medium" | "high"
}

ActionItem {
  id: string
  meetingId: string
  title: string
  assignedTo: userId
  dueDate: timestamp
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed"
  owner: userId
}
```

---

#### Screen 2.3: **Workflow Engine**
**URL:** `/workflow`  
**Role Access:** Admin, Manager

**Components:**
```
┌─────────────────────────────────────────────┐
│ Workflow Engine - Approval Chains           │
├─────────────────────────────────────────────┤
│                                             │
│  Current Workflow: "Standard Content Flow"  │
│                                             │
│  Step 1: MANAGER REVIEW ────→ Step 2: DIRECTOR APPROVAL
│  │       (1-2 days)           │ (1-2 days)
│  ├─ Can Reject: Yes           ├─ Can Reject: Yes
│  ├─ Can Delegate: Yes         ├─ Can Delegate: No
│  ├─ Required SOPs: Gen-2      ├─ Required SOPs: Gen-3
│  └─ Timeout: 2 days          └─ Timeout: 2 days
│
│  ✓ Auto-advance to next phase
│  ✓ Escalate after 3 days
│  ✓ Notify on approval
│  ✓ Require all approvals
│
│  PENDING APPROVALS:
│  ├─ Sarah Chen (Manager): Story Writing Phase
│  │  Submitted: 2 days ago
│  │  [Approve] [Request Changes] [Delegate]
│  │
│  └─ Director Michael: Design Phase
│     Submitted: 1 day ago
│     [Approve] [Request Changes] [Delegate]
│
└─────────────────────────────────────────────┘
```

**Workflow Rules Configuration:**
```
WorkflowRule {
  id: string
  name: string
  triggerAction: "phase_submit" | "task_completion" | "content_approval" | "campaign_launch"
  approvalSteps: ApprovalStep[]
  parallelApprovals: boolean
  escalationPolicy?: {
    escalateAfterDays: number
    escalateTo: ApprovalRole
  }
  nextPhaseId?: string (auto-advance)
  requiredSOPAcknowledgement: boolean
}

ApprovalStep {
  id: string
  stepNumber: number
  role: "manager" | "director" | "client" | "compliance_officer"
  title: string
  timeoutDays: number
  canReject: boolean
  canDelegate: boolean
  requiredComments: boolean
  sopIds: string[] (SOPs to follow)
}
```

---

#### Screen 2.4: **Workflow Manager**
**URL:** `/workflow-manager`  
**Role Access:** Admin

**Components:**
```
┌─────────────────────────────────────────────┐
│ Workflow Manager - Configure Approvals      │
├─────────────────────────────────────────────┤
│                                             │
│  TEMPLATES:                                 │
│  ├─ Simple Approval (1 manager)             │
│  ├─ Standard Flow (Manager → Director)      │
│  ├─ Complex Multi-Approval                  │
│  └─ Compliance Review                       │
│                                             │
│  CREATE NEW WORKFLOW:                       │
│  ├─ Name: [________________]                │
│  ├─ Trigger Event: [Dropdown]               │
│  │  - Phase Submit                          │
│  │  - Task Completion                       │
│  │  - Campaign Launch                       │
│  │                                          │
│  ├─ Add Approval Steps:                     │
│  │  Step 1: Manager Review (2 days timeout) │
│  │  Step 2: Director Approval (2 days)      │
│  │  Step 3: Client Sign-off (optional)      │
│  │                                          │
│  ├─ Escalation: After 3 days → escalate to  │
│  ├─ Required SOPs: [Select SOPs]            │
│  ├─ Parallel Approvals: [Toggle]            │
│  ├─ Auto-Advance: [Toggle]                  │
│  │                                          │
│  [Save Workflow] [Test] [Deploy]            │
│                                             │
└─────────────────────────────────────────────┘
```

**Features:**
- Drag-and-drop workflow builder
- Template library
- Approval step configuration
- SOP linking
- Testing mode

---

#### Screen 2.5: **Client Portal**
**URL:** `/client-portal`  
**Role Access:** Client (Limited Access)

**Components:**
```
┌─────────────────────────────────────────────┐
│ CLIENT PORTAL - Project Tracking             │
├─────────────────────────────────────────────┤
│                                             │
│  📊 PROJECT STATUS REPORT                   │
│  ├─ Overall Progress: 65%                   │
│  │  ├─ Completed: 8 tasks ✓                 │
│  │  ├─ In Progress: 3 tasks 🔄              │
│  │  └─ Pending: 2 tasks ⏳                  │
│  │                                          │
│  ├─ Weekly Completion Rate: 72%             │
│  └─ Next Milestone: "Story Distribution"    │
│     Due: Feb 15, 2026                       │
│                                             │
│  📅 WEEKLY MEETING NOTES                    │
│  ├─ Week of Feb 3, 2026                     │
│  │  Attendees: Sarah, John, Client Rep      │
│  │  ✓ Decisions:                            │
│  │    - Use Template A for messaging        │
│  │    - Focus on mobile-first design        │
│  │  📋 Action Items:                        │
│  │    - Refine color palette (Due: Feb 8)   │
│  │    - Finalize copy (Due: Feb 10)         │
│  │                                          │
│  └─ Week of Jan 27, 2026 [Show Previous]    │
│                                             │
│  ✅ ACTION ITEMS TRACKING                   │
│  ├─ [OVERDUE] Refine color palette          │
│  │  Owner: John | Due: Feb 8                │
│  ├─ [IN PROGRESS] Finalize copy             │
│  │  Owner: Sarah | Due: Feb 10              │
│  └─ [PENDING] Create landing page           │
│     Owner: Emily | Due: Feb 15              │
│                                             │
│  📦 DELIVERABLES                            │
│  ├─ Story Research ✓ (Approved)             │
│  ├─ Story Writing ⏳ (Pending Review)        │
│  └─ Story Design 🔄 (In Progress)           │
│                                             │
│  [Provide Feedback] [Download Report]       │
│                                             │
└─────────────────────────────────────────────┘
```

**Client Permissions:**
- View project progress only
- See completed deliverables
- View decisions and action items
- Provide feedback on deliverables
- Cannot edit or approve internally

**Data Restrictions:**
- Only show their own projects
- Hide internal notes and rejections
- Show only decisions (not all meeting details)
- Show action items relevant to them
- No access to financial data

---

### NEW SCREEN: **Client Portal Link**
**Navigation:** Sidebar under Collaboration section

```
├─ Team Collaboration
├─ Team Meetings
├─ Workflow Engine
├─ Workflow Manager
└─ 👁️ CLIENT PORTAL [NEW] ← Opens /client-portal in new tab
   "View as client"
```

---

## DATA FLOW ARCHITECTURE

### Flow Diagram:

```
┌──────────────────────────────────────────────────────────────┐
│                      USER LOGIN                              │
│                  (Role: Admin/Manager/User/Client)           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Dashboard Home  │
                    └─────────────────┘
                         │      │      │
           ┌─────────────┴──────┴──────┴─────────┐
           ▼                                       ▼
    ┌─────────────────┐          ┌──────────────────────┐
    │ Phase Selection │          │ Collaboration Tools  │
    │ (Research → ... │          │ (Meetings, Workflow) │
    │  Learning)      │          └──────────────────────┘
    └─────────────────┘                   │
           │                              ▼
           │                    ┌──────────────────────┐
           │                    │ Team Collaboration   │
           │                    │ Team Meetings        │
           │                    │ Workflow Engine      │
           │                    │ Workflow Manager     │
           │                    │ Client Portal        │
           │                    └──────────────────────┘
           │
           ▼
    ┌────────────────────────┐
    │ Phase Details Screen   │
    ├────────────────────────┤
    │ • Tasks                │
    │ • Deliverables         │
    │ • Notes & Comments     │
    │ • File Management      │
    └────────────────────────┘
           │
           ▼
    ┌────────────────────────┐
    │ Submit for Review      │
    └────────────────────────┘
           │
           ▼
    ┌────────────────────────┐
    │ Approval Chain         │
    │ (Workflow Engine)      │
    ├────────────────────────┤
    │ Manager → Director →   │
    │ Client (optional)      │
    └────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
  APPROVED    REJECTED
     │           │
     │           ▼
     │    ┌──────────────────┐
     │    │ Rejection Details│
     │    │ • Reason         │
     │    │ • Required Changes
     │    │ • Owner Feedback │
     │    └──────────────────┘
     │           │
     │           ▼
     │    [Resubmit Revised]
     │
     ▼
┌────────────────────────┐
│ Phase Completed        │
│ Auto-Advance to Next   │
│ Phase (Optional)       │
└────────────────────────┘
     │
     ▼
┌────────────────────────┐
│ Update Client Portal   │
│ • Progress updated     │
│ • Milestone advanced   │
│ • Metrics recorded     │
└────────────────────────┘
```

---

### Real-Time Data Flow:

**When Phase is Submitted:**
1. Task status → "pending_approval"
2. Create ApprovalRequest record
3. Notify Manager (email + in-app)
4. Start approval timer (if timeout enabled)
5. Update dashboard metrics
6. Broadcast to all users (real-time)

**When Manager Approves:**
1. ApprovalRequest → "approved"
2. Phase status → "approved"
3. If auto-advance enabled → Create next phase
4. Record metrics (completion date)
5. Send notification to team
6. Update Client Portal progress

**When Manager Rejects:**
1. ApprovalRequest → "rejected"
2. Phase status → "changes_requested"
3. Create RejectionReason record with:
   - Reason for rejection
   - Required changes list
   - Approver comments
   - Feedback items
4. Notify assignees of required changes
5. Show RejectionDetailsCard on phase screen
6. Track rejection in analytics

---

## DATABASE SCHEMA

### Core Tables:

#### 1. **users** table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user', 'client'),
  password_hash VARCHAR(255),
  avatar_url VARCHAR(255),
  department_id UUID,
  client_id UUID, -- For client users
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  INDEX (role),
  INDEX (email)
);
```

#### 2. **clients** table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  industry VARCHAR(100),
  website VARCHAR(255),
  logo_url VARCHAR(255),
  status ENUM('active', 'inactive', 'archived'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX (status),
  INDEX (name)
);
```

#### 3. **projects** table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  current_phase_id VARCHAR(50), -- research, writing, design, etc.
  status ENUM('draft', 'in_progress', 'on_hold', 'completed', 'archived'),
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (client_id),
  INDEX (status),
  INDEX (current_phase_id)
);
```

#### 4. **workflow_phases** table
```sql
CREATE TABLE workflow_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  phase_type VARCHAR(50) NOT NULL, -- research, writing, design, etc.
  phase_name VARCHAR(255) NOT NULL,
  phase_description TEXT,
  phase_order INT,
  status ENUM('draft', 'in_progress', 'pending_approval', 'approved', 'completed', 'rejected'),
  progress_percentage INT DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID,
  rejected_at TIMESTAMP,
  rejected_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id),
  INDEX (project_id),
  INDEX (status),
  INDEX (phase_type)
);
```

#### 5. **tasks** table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL,
  project_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  created_by UUID NOT NULL,
  status ENUM('draft', 'in_progress', 'pending_review', 'completed', 'blocked'),
  priority ENUM('low', 'medium', 'high', 'urgent'),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (phase_id) REFERENCES workflow_phases(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (phase_id),
  INDEX (assigned_to),
  INDEX (status)
);
```

#### 6. **approval_requests** table
```sql
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL,
  project_id UUID NOT NULL,
  workflow_rule_id UUID,
  submission_type ENUM('phase_submit', 'task_completion', 'content_approval'),
  status ENUM('pending', 'approved', 'rejected', 'escalated', 'expired'),
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  submitted_data JSONB, -- The content being approved
  
  -- Approval chain tracking
  current_step INT DEFAULT 1,
  total_steps INT,
  parallel_approvals BOOLEAN DEFAULT false,
  
  -- Escalation
  escalated_at TIMESTAMP,
  escalated_from UUID,
  
  -- Completion
  approved_at TIMESTAMP,
  approved_by UUID,
  rejected_at TIMESTAMP,
  rejected_by UUID,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (phase_id) REFERENCES workflow_phases(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id),
  INDEX (status),
  INDEX (phase_id),
  INDEX (submitted_by)
);
```

#### 7. **approval_steps** table
```sql
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL,
  step_number INT NOT NULL,
  assigned_role VARCHAR(50), -- manager, director, client
  assigned_to UUID,
  status ENUM('pending', 'approved', 'rejected', 'delegated', 'expired'),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  can_reject BOOLEAN DEFAULT true,
  can_delegate BOOLEAN DEFAULT true,
  required_comments BOOLEAN DEFAULT false,
  comments TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  INDEX (approval_request_id),
  INDEX (status)
);
```

#### 8. **rejection_details** table
```sql
CREATE TABLE rejection_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL,
  rejected_by UUID NOT NULL,
  rejected_at TIMESTAMP DEFAULT NOW(),
  reason VARCHAR(255) NOT NULL,
  required_changes TEXT, -- JSON array of changes
  approver_comments TEXT,
  approver_guidance TEXT,
  
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id),
  INDEX (approval_request_id)
);
```

#### 9. **files** table
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID,
  project_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- pdf, doc, image, video
  file_size INT, -- in bytes
  storage_url VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (phase_id) REFERENCES workflow_phases(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX (phase_id),
  INDEX (project_id)
);
```

#### 10. **campaign_metrics** table
```sql
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  metric_name VARCHAR(100), -- views, clicks, engagement, etc.
  metric_value DECIMAL(10, 2),
  metric_date DATE,
  recorded_by UUID,
  recorded_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  INDEX (project_id),
  INDEX (metric_date)
);
```

#### 11. **team_meetings** table
```sql
CREATE TABLE team_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INT,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
  created_by UUID NOT NULL,
  recording_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (scheduled_at),
  INDEX (status)
);
```

#### 12. **meeting_decisions** table
```sql
CREATE TABLE meeting_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL,
  description TEXT NOT NULL,
  decided_by UUID NOT NULL,
  priority ENUM('low', 'medium', 'high'),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (meeting_id) REFERENCES team_meetings(id),
  FOREIGN KEY (decided_by) REFERENCES users(id),
  INDEX (meeting_id)
);
```

#### 13. **action_items** table
```sql
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  due_date TIMESTAMP NOT NULL,
  priority ENUM('low', 'medium', 'high'),
  status ENUM('pending', 'in_progress', 'completed', 'blocked'),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (meeting_id) REFERENCES team_meetings(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  INDEX (meeting_id),
  INDEX (assigned_to),
  INDEX (status)
);
```

#### 14. **workflow_rules** table
```sql
CREATE TABLE workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_action VARCHAR(50), -- phase_submit, task_completion
  config JSONB, -- Approval steps, escalation, etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (trigger_action),
  INDEX (is_active)
);
```

---

## API ENDPOINTS

### Dashboard APIs

```
GET /api/dashboard
GET /api/dashboard/today-focus
GET /api/dashboard/phase-timeline
GET /api/dashboard/my-tasks
GET /api/dashboard/analytics
```

### Phase Management APIs

```
GET /api/phases/{phaseId}
GET /api/phases/{phaseId}/tasks
GET /api/phases/{phaseId}/deliverables
POST /api/phases/{phaseId}/tasks
PATCH /api/tasks/{taskId}
POST /api/tasks/{taskId}/complete
POST /api/phases/{phaseId}/submit-for-review
POST /api/files/upload
```

### Approval & Workflow APIs

```
GET /api/approval-requests
GET /api/approval-requests/{requestId}
GET /api/approval-requests/{requestId}/steps
POST /api/approval-requests/{requestId}/approve
POST /api/approval-requests/{requestId}/reject
POST /api/approval-requests/{requestId}/delegate
GET /api/workflows
POST /api/workflows
PATCH /api/workflows/{workflowId}
```

### Client Portal APIs

```
GET /api/client-portal/dashboard
GET /api/client-portal/projects/{projectId}
GET /api/client-portal/project-metrics
GET /api/client-portal/meetings
GET /api/client-portal/action-items
POST /api/client-portal/feedback
```

### Team & Collaboration APIs

```
GET /api/team/members
GET /api/team/activity-feed
GET /api/meetings
POST /api/meetings
GET /api/meetings/{meetingId}/decisions
POST /api/meetings/{meetingId}/decisions
GET /api/meetings/{meetingId}/action-items
POST /api/meetings/{meetingId}/action-items
```

---

## USE STORIES & WORKFLOWS

### USE STORY 1: Manager Reviews and Approves Phase

**Actor:** Manager (Sarah)  
**Trigger:** Phase submitted for review  
**Goal:** Review content and approve or request changes

**Flow:**

```
1. Sarah sees notification: "Story Writing Phase awaiting your approval"
2. Sarah clicks notification → Goes to approval screen
3. Sarah views:
   - Phase content (all tasks and deliverables)
   - Current approval step (Manager Review)
   - Approval chain preview (Manager → Director)
   - Required SOPs to acknowledge
4. Sarah reads SOPs:
   - "Content Guideline Gen-2" ✓ Acknowledged
5. Sarah reviews all deliverables:
   - Story_Copy_v3.docx
   - Brand_Messaging.pdf
   - Tone_Guide.pdf
6. Sarah adds internal notes: "Copy looks good. Ready for director review."
7. Sarah clicks "Approve"
8. System:
   - Marks approval_step as "approved"
   - Advances to next step (Director Approval)
   - Creates new approval_request for Director
   - Sends notification to Director
   - Updates phase status to "pending_approval" (next step)
   - Updates client portal progress
   - Records metrics
9. Sarah sees toast: "Approval sent to Director Michael"
10. Sarah can view status: "Awaiting Director Approval (Due in 2 days)"
```

**Data Changes:**
```
approval_steps (manager step):
  status: "pending" → "approved"
  completed_at: NOW()

approval_requests:
  current_step: 1 → 2
  status: "pending" (still, waiting for director)

workflow_phases:
  status: "pending_approval" → "pending_approval"
  (stays same, waiting for all steps)

notification (new):
  type: "approval_requested"
  recipient: director_id
```

---

### USE STORY 2: Manager Rejects Phase with Required Changes

**Actor:** Manager (Sarah)  
**Trigger:** Phase submitted, Sarah finds issues  
**Goal:** Request specific changes with detailed feedback

**Flow:**

```
1. Sarah reviews Story Writing Phase
2. Sarah notices:
   - Copy lacks emotional depth
   - Missing customer testimonial
   - Title doesn't match brand voice
3. Sarah clicks "Request Changes"
4. Modal appears with:
   - Reason dropdown: "Content Quality Issue"
   - Required Changes (checklist):
     ☐ Add 3 emotional customer stories
     ☐ Revise main title to match brand voice
     ☐ Add data points supporting claims
   - Comments field: "The narrative is too generic. Need more personal touches."
   - Guidance field: "Review our brand guidelines for tone. Check competitor examples."
5. Sarah clicks "Submit Rejection"
6. System:
   - Creates rejection_details record:
     - reason: "Content quality issue"
     - required_changes: [array of changes]
     - approver_comments: "The narrative is too generic..."
     - approver_guidance: "Review our brand guidelines..."
   - Marks approval_step as "rejected"
   - Marks workflow_phases as "rejected"
   - Creates task for assignee with rejection details
   - Shows RejectionDetailsCard on phase screen
   - Sends notification to content owner
   - Records rejection in analytics
7. Content owner receives notification:
   - "Your Story Writing Phase was rejected"
   - Can view detailed rejection reason
   - Can see required changes
   - Can see approver guidance
   - Shows required actions with checkboxes
8. Content owner revises and resubmits
```

**Data Changes:**
```
rejection_details (new):
  approval_request_id: {requestId}
  rejected_by: sarah_id
  reason: "Content quality issue"
  required_changes: ["Add 3 emotional stories", ...]
  approver_comments: "..."

approval_steps (manager step):
  status: "pending" → "rejected"
  completed_at: NOW()

workflow_phases:
  status: "pending_approval" → "rejected"

approval_requests:
  status: "pending" → "rejected"
  rejected_at: NOW()
  rejected_by: sarah_id
  rejection_reason: "Content quality issue"

notification (new):
  type: "phase_rejected"
  recipient: content_owner_id
```

---

### USE STORY 3: Client Views Project Progress from Client Portal

**Actor:** Client (ABC Manufacturing representative)  
**Trigger:** Weekly check-in  
**Goal:** View project status, decisions, and action items

**Flow:**

```
1. Client logs in to /client-portal
2. Client sees "Project Status Report":
   - Overall Progress: 65%
   - Completed Tasks: 8
   - In Progress: 3
   - Pending: 2
   - Weekly Completion Rate: 72%
   - Next Milestone: "Story Distribution" due Feb 15
3. Client scrolls to "Weekly Meeting Notes":
   - Week of Feb 3, 2026
   - Meeting: "Project Check-in"
   - Attendees: Sarah (Manager), John (Designer), Client Rep
   - Decisions:
     ✓ Use Template A for messaging
     ✓ Focus on mobile-first design
     ✓ Launch Feb 20 instead of Feb 15
   - Action Items:
     ⏳ Refine color palette (John, Due: Feb 8)
     🔄 Finalize copy (Sarah, Due: Feb 10)
4. Client sees "Action Items Tracker":
   - [OVERDUE] Refine color palette (2 days overdue)
   - [IN PROGRESS] Finalize copy (due in 2 days)
   - [PENDING] Create landing page (due in 7 days)
5. Client sees "Deliverables":
   - Story Research ✓ (Approved)
   - Story Writing ⏳ (Pending Review)
   - Story Design 🔄 (In Progress)
6. Client can click "Provide Feedback" on any deliverable
7. Client provides feedback: "Love the design direction. Can we explore one more color variant?"
8. Feedback is recorded and sent to team
9. Client can download reports or export data
```

**Data Query (What to fetch):**
```
GET /api/client-portal/projects/{clientId}
Returns:
- project metrics (completed, in_progress, pending counts)
- team_meetings (last 4 weeks)
- meeting_decisions (from those meetings)
- action_items (all, with status)
- workflow_phases (all, with status)
- campaign_metrics (this week vs last week)

FILTERING (Important):
- Only show this client's projects
- Hide internal notes, rejections, full rejection reasons
- Hide confidential approvals
- Filter action items to relevant ones
```

---

### USE STORY 4: Admin Creates Custom Approval Workflow

**Actor:** Admin  
**Trigger:** New department onboarding  
**Goal:** Set up approval workflow for new team

**Flow:**

```
1. Admin goes to /workflow-manager
2. Admin clicks "Create New Workflow"
3. Form opens:
   - Name: "Compliance Review Workflow"
   - Trigger: "Phase Submit"
   - Description: "For finance-related content"
4. Admin adds approval steps:
   
   Step 1: Manager Review
   - Role: Manager
   - Duration: 2 days
   - Can Reject: Yes
   - Can Delegate: Yes
   - Required SOPs: [Select "Compliance-Gen-3", "Compliance-Gen-4"]
   - Require Acknowledgement: Yes
   
   Step 2: Compliance Officer Review
   - Role: Compliance Officer
   - Duration: 1 day
   - Can Reject: Yes
   - Can Delegate: No
   - Required SOPs: [Select "Compliance-Framework-GDPR"]
   - Require Acknowledgement: Yes
   - Require Comments: Yes
   
   Step 3: Client Approval (Optional)
   - Role: Client
   - Duration: 3 days
   - Can Reject: No
   - Can Delegate: Yes
   
5. Admin enables:
   - Parallel Approvals: No
   - Escalation: After 2 days → escalate to Compliance Director
   - Auto-Advance to Next Phase: Yes
   - Auto-Reject on Timeout: No
6. Admin clicks "Test" to preview workflow
7. Admin clicks "Deploy" to activate
8. System:
   - Saves workflow_rules record
   - Associates with appropriate phases
   - Notifies team of new workflow
   - Updates dashboard
9. Next time someone submits a phase, this workflow is used
```

**Data Created:**
```
workflow_rules (new):
  name: "Compliance Review Workflow"
  trigger_action: "phase_submit"
  config: {
    steps: [
      { step: 1, role: "manager", duration: 2, ... },
      { step: 2, role: "compliance_officer", duration: 1, ... },
      { step: 3, role: "client", duration: 3, ... }
    ],
    escalation: { afterDays: 2, escalateTo: "compliance_director" },
    parallelApprovals: false,
    autoRejectOnTimeout: false,
    autoAdvance: true
  }
  is_active: true
```

---

### USE STORY 5: Team Member Submits Phase for Approval

**Actor:** Team Member (Emily - Writer)  
**Trigger:** Story Writing phase complete  
**Goal:** Submit work for manager review

**Flow:**

```
1. Emily views Story Writing phase
2. Emily sees all tasks completed:
   ✓ Create outline
   ✓ Write hero story
   ✓ Write supporting stories
   ✓ Review messaging
3. Emily clicks "Submit for Review"
4. Approval Chain Preview appears:
   Step 1: Manager Review (Sarah)
   Step 2: Director Approval (Michael)
   Estimated Timeline: 4 days
   Required SOPs: Gen-2, Gen-3
   (Both must be acknowledged before approval)
5. Emily reviews the chain and clicks "Submit"
6. System:
   - Creates approval_requests record
   - Creates approval_steps for each step
   - Marks phase as "pending_approval"
   - Sends notification to Manager Sarah
   - Sends in-app and email notification
   - Updates dashboard
   - Records submission in audit log
7. Emily sees confirmation: "Phase submitted for review"
   Shows: "Manager Sarah will review within 2 days"
8. Emily can view status in phase screen
9. Team and Client Portal are automatically updated with status
```

**Data Created:**
```
approval_requests (new):
  phase_id: {phaseId}
  submission_type: "phase_submit"
  status: "pending"
  submitted_by: emily_id
  submitted_at: NOW()
  submitted_data: { phase content }
  current_step: 1
  total_steps: 2

approval_steps (2 records):
  1) manager_step
     assigned_to: sarah_id
     status: "pending"
     due_date: NOW() + 2 days
  
  2) director_step
     assigned_to: michael_id
     status: "pending" (waiting for manager to approve)
     due_date: NOW() + 2 days (from manager approval)

workflow_phases:
  status: "in_progress" → "pending_approval"
```

---

## INTEGRATION POINTS

### With External Systems:

1. **Social Media Integration:**
   - LinkedIn for content distribution
   - Twitter/X for updates
   - Instagram for visual content
   - API: `/api/connect-social`

2. **Email Notifications:**
   - Approval notifications
   - Task reminders
   - Meeting invites
   - Weekly summaries

3. **Calendar Integration:**
   - Team meeting scheduling
   - Deadline tracking
   - Milestone dates

4. **Analytics Integration:**
   - Campaign performance tracking
   - ROI measurement
   - Engagement metrics

5. **File Storage:**
   - Cloud storage for deliverables
   - Document management
   - Version control

---

## IMPORTANT NOTES FOR DEVELOPER

### Key Implementation Points:

1. **Real-Time Updates:**
   - Use WebSockets for live notifications
   - Update dashboards instantly when approvals change
   - Broadcast activity to all relevant users

2. **Permissions:**
   - Always check user.role in API endpoints
   - Clients should never see internal notes or rejections
   - Managers can only approve if step is assigned to them

3. **Audit Trail:**
   - Log all approvals, rejections, and changes
   - Record who did what and when
   - Keep for compliance

4. **Notifications:**
   - Email for approval requests (important)
   - In-app notifications for all actions
   - Slack integration (optional, future)

5. **Error Handling:**
   - Graceful handling of expired approvals
   - Automatic escalation after timeout
   - Rollback if workflow fails

6. **Performance:**
   - Index on frequently queried fields
   - Cache client-specific data
   - Paginate large lists

---

**END OF SPECIFICATION**

Questions? Refer to the relevant section above for detailed information on screens, workflows, databases, and APIs.
