# Role-Based Access Control (RBAC) System

## Overview
A comprehensive role-based access control system with 6 user roles, each with specific permissions and data visibility restrictions. This system includes a dedicated client role with a separate dashboard view.

## User Roles

### 1. Admin
**Description**: Full system access  
**Permissions**: All 22 permissions including user management, workflow management, and financial data  
**Can View**: Internal notes, rejection reasons, all users, financial data  
**Use Case**: System administrators and super users  

### 2. Manager
**Description**: Team management and approval authority  
**Permissions**: Most permissions except user management  
**Can View**: Internal notes, rejection reasons, other users  
**Cannot View**: Financial data  
**Use Case**: Department managers and team leads  

### 3. Director
**Description**: Strategic approval and oversight  
**Permissions**: Strategic permissions, approval authority  
**Can View**: Internal notes, rejection reasons, financial data  
**Cannot View**: Other users  
**Use Case**: Executive oversight and strategic decisions  

### 4. Team Member
**Description**: Standard team contributor  
**Permissions**: Basic task creation and submission permissions  
**Can View**: Rejection reasons only  
**Cannot View**: Internal notes, other users, financial data  
**Use Case**: Content creators, designers, regular staff  

### 5. Client (NEW)
**Description**: Client access - view deliverables and provide feedback  
**Permissions**: Limited to 4 permissions:
  - `view_client_deliverables` - See project deliverables
  - `provide_feedback` - Submit client feedback
  - `view_approval_status` - Track approval progress
  - `view_sops` - Access guidelines
**Can View**: Nothing beyond their own project data  
**Cannot View**: Internal notes, rejection reasons, other users, financial data  
**Use Case**: External clients and stakeholders  
**UI**: Separate Client Dashboard at `/client-portal`  

### 6. Viewer
**Description**: Read-only access  
**Permissions**: 2 permissions - view dashboard and approval status only  
**Can View**: Nothing private  
**Use Case**: Audit, compliance review  

## Permissions

| Permission | Admin | Manager | Director | Team Member | Client | Viewer |
|-----------|-------|---------|----------|-------------|--------|--------|
| view_dashboard | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| view_tasks | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| create_tasks | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| edit_tasks | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| delete_tasks | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| submit_for_approval | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| approve_tasks | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| reject_tasks | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| delegate_approval | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| view_workflow | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| manage_workflow | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| view_sops | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| edit_sops | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| view_all_clients | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| manage_users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| view_analytics | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| export_data | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| view_client_deliverables | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| provide_feedback | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| view_approval_status | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Implementation

### Files Created
- `/lib/rbac.ts` - Role definitions, permissions, and access control functions
- `/hooks/use-user-context.ts` - Hook for accessing current user and checking permissions
- `/components/permission-guard.tsx` - Components for conditional rendering based on permissions
- `/components/client-dashboard.tsx` - Client-only dashboard for viewing deliverables
- `/components/role-based-layout.tsx` - Layout wrapper that hides/shows UI based on role
- `/app/client-portal/page.tsx` - Client portal entry point

### Using the RBAC System

#### Check Permissions in Components
```tsx
import { useUserContext } from "@/hooks/use-user-context"

export function MyComponent() {
  const { checkPermission, canApproveContent, isClient } = useUserContext()
  
  if (isClient()) {
    return <ClientView />
  }
  
  if (canApproveContent()) {
    return <ApprovalView />
  }
  
  return <ReadOnlyView />
}
```

#### Use Permission Guards
```tsx
import { PermissionGuard, ClientOnly, InternalOnly } from "@/components/permission-guard"

export function Dashboard() {
  return (
    <div>
      {/* Only shown if user has approval permission */}
      <PermissionGuard permission="approve_tasks">
        <ApprovalSection />
      </PermissionGuard>
      
      {/* Only shown for client users */}
      <ClientOnly>
        <ClientFeedbackForm />
      </ClientOnly>
      
      {/* Only shown for internal users */}
      <InternalOnly>
        <AdminControls />
      </InternalOnly>
    </div>
  )
}
```

#### Check User Role Directly
```tsx
import { hasPermission, canApprove, canViewInternalNotes } from "@/lib/rbac"

const userRole = "manager"

if (hasPermission(userRole, "approve_tasks")) {
  // Show approval buttons
}

if (canViewInternalNotes(userRole)) {
  // Show internal notes
}
```

## Client Role Features

### Client Dashboard (`/client-portal`)
- **Deliverables Overview**: See all project deliverables with status
- **Status Tracking**: Visual indicators for:
  - Approved (green)
  - Pending Review (orange)
  - In Progress (blue)
  - Revisions Needed (red)
- **Feedback System**: Provide feedback on pending deliverables
- **Document Links**: Direct access to Google Drive/Docs for review
- **Statistics**: Total, approved, pending, and revisions needed counts

### Limitations for Client Role
- Cannot see internal notes or team communication
- Cannot reject deliverables (only provide feedback)
- Cannot create or edit tasks
- Cannot approve workflow transitions
- Cannot see other clients' data (filtered by clientId)
- Cannot access analytics or reports
- No access to SOPs beyond guidelines

## Next Steps for Full Implementation

1. **Database Integration**: Store user roles and permissions
2. **Authentication**: Integrate with auth system to load user role on login
3. **Session Management**: Preserve role in secure sessions
4. **Middleware**: Add auth middleware to protect routes
5. **API Routes**: Implement permission checks in API endpoints
6. **Audit Logging**: Track permission-based actions
7. **Custom Roles**: Allow creating custom roles with specific permissions

## Security Considerations

- Always check permissions on the backend (never trust client-side checks alone)
- Use permission guards in UI, but implement permission validation in API routes
- Implement proper authentication before using roles
- Log access attempts to sensitive data
- Regularly audit role assignments and permissions
- Consider implementing session timeout for client access
