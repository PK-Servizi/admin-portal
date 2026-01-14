# Shared Components Library

Complete set of reusable React components for the PK Servizi admin portal and frontend.

## 📦 Components Overview

### Basic UI Components

#### Button
Customizable button with variants, sizes, loading states, and icons.

```tsx
import { Button } from '@/components/shared';

<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: React.ReactNode
- `fullWidth`: boolean

#### Input
Text input with label, error handling, and icons.

```tsx
import { Input } from '@/components/shared';

<Input
  label="Email"
  type="email"
  error={errors.email}
  leftIcon={<EmailIcon />}
  required
/>
```

#### Select
Dropdown select with label and error handling.

```tsx
import { Select } from '@/components/shared';

<Select
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>
```

#### Textarea
Multi-line text input with label and error handling.

#### Checkbox
Checkbox input with label.

#### Card
Container component with optional header and footer.

```tsx
import { Card } from '@/components/shared';

<Card
  title="User Details"
  subtitle="Manage user information"
  headerActions={<Button size="sm">Edit</Button>}
  footer={<Button fullWidth>Save</Button>}
>
  <p>Content goes here</p>
</Card>
```

#### Badge
Small badge for status, labels, and counts.

```tsx
import { Badge } from '@/components/shared';

<Badge variant="success" dot>Active</Badge>
```

#### Alert
Notification/alert messages.

```tsx
import { Alert } from '@/components/shared';

<Alert variant="success" closable title="Success">
  Your changes have been saved.
</Alert>
```

---

### Data Display Components

#### Table
Feature-rich data table with sorting, selection, and customization.

```tsx
import { Table } from '@/components/shared';

<Table
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (value) => <Badge>{value}</Badge> }
  ]}
  data={users}
  keyField="id"
  onRowClick={(row) => handleEdit(row)}
  selectable
  selectedRows={selected}
  onSelectionChange={setSelected}
/>
```

#### Pagination
Pagination controls for lists and tables.

```tsx
import { Pagination } from '@/components/shared';

<Pagination
  currentPage={page}
  totalPages={10}
  totalItems={250}
  itemsPerPage={25}
  onPageChange={setPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

#### ProgressBar
Visual progress indicator.

```tsx
import { ProgressBar } from '@/components/shared';

<ProgressBar value={75} label="Upload Progress" color="blue" />
```

---

### Form Components

#### FormGroup
Wrapper for form fields with consistent spacing.

#### FormRow
Grid layout for horizontal form fields.

```tsx
import { FormRow, FormGroup, Input } from '@/components/shared';

<FormRow columns={2} gap="md">
  <FormGroup>
    <Input label="First Name" />
  </FormGroup>
  <FormGroup>
    <Input label="Last Name" />
  </FormGroup>
</FormRow>
```

#### FormActions
Container for form buttons.

```tsx
import { FormActions, Button } from '@/components/shared';

<FormActions align="right">
  <Button variant="ghost">Cancel</Button>
  <Button variant="primary" type="submit">Save</Button>
</FormActions>
```

---

### Modal & Dialog Components

#### Modal
Full-featured modal dialog.

```tsx
import { Modal, Button } from '@/components/shared';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit User"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  <p>Modal content</p>
</Modal>
```

#### ConfirmDialog
Simple confirmation dialog.

```tsx
import { ConfirmDialog } from '@/components/shared';

<ConfirmDialog
  isOpen={confirmDelete}
  onClose={() => setConfirmDelete(false)}
  onConfirm={handleDelete}
  title="Delete User"
  message="Are you sure you want to delete this user? This action cannot be undone."
  variant="danger"
/>
```

---

### Layout Components

#### MainLayout
Complete layout with sidebar, header, and content area.

```tsx
import { MainLayout } from '@/components/shared';

<MainLayout
  menuItems={[
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/users', label: 'Users', icon: <UsersIcon /> }
  ]}
  userName="John Doe"
  userMenu={[
    { label: 'Profile', onClick: () => navigate('/profile') },
    { label: 'Settings', onClick: () => navigate('/settings') },
    { label: 'Logout', onClick: handleLogout, divider: true }
  ]}
>
  <YourPageContent />
</MainLayout>
```

#### Sidebar
Collapsible navigation sidebar.

#### Header
Top navigation bar with actions and user menu.

---

### Status Components

#### Status Badges
Pre-configured badges for entity statuses.

```tsx
import { 
  ServiceRequestStatusBadge,
  SubscriptionStatusBadge,
  PaymentStatusBadge,
  AppointmentStatusBadge,
  DocumentStatusBadge,
  UserRoleBadge,
  PriorityBadge
} from '@/components/shared';

<ServiceRequestStatusBadge status="completed" />
<SubscriptionStatusBadge status="active" />
<PaymentStatusBadge status="completed" />
<UserRoleBadge role="admin" />
<PriorityBadge priority="high" />
```

---

### Loading & Error States

#### LoadingSpinner
Animated loading spinner.

```tsx
import { LoadingSpinner } from '@/components/shared';

<LoadingSpinner size="lg" />
```

#### LoadingOverlay
Full-screen loading overlay.

```tsx
import { LoadingOverlay } from '@/components/shared';

<LoadingOverlay message="Saving changes..." />
```

#### Skeleton
Placeholder loading states.

```tsx
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/shared';

<Skeleton width="200px" height="24px" />
<SkeletonText lines={3} />
<SkeletonCard showAvatar />
```

#### EmptyState
Display when no data is available.

```tsx
import { EmptyState } from '@/components/shared';

<EmptyState
  title="No users found"
  description="Get started by creating your first user."
  action={{ label: 'Add User', onClick: handleAdd }}
/>
```

#### ErrorDisplay
Display error messages.

```tsx
import { ErrorDisplay } from '@/components/shared';

<ErrorDisplay
  title="Failed to load data"
  message="Unable to fetch users from the server."
  retry={refetch}
  showDetails={isDev}
/>
```

#### NoResults
Display when search returns no results.

```tsx
import { NoResults } from '@/components/shared';

<NoResults query={searchTerm} onClearFilters={clearFilters} />
```

---

### Search & Filter Components

#### SearchBar
Debounced search input.

```tsx
import { SearchBar } from '@/components/shared';

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Search users..."
  loading={isSearching}
/>
```

#### FilterPanel
Advanced filtering panel.

```tsx
import { FilterPanel } from '@/components/shared';

<FilterPanel
  filters={[
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      id: 'role',
      label: 'Role',
      type: 'multiselect',
      options: roleOptions
    }
  ]}
  values={filterValues}
  onChange={(id, value) => setFilterValues({ ...filterValues, [id]: value })}
  onApply={applyFilters}
  onClear={clearFilters}
/>
```

#### DateRangePicker
Date range selector.

```tsx
import { DateRangePicker } from '@/components/shared';

<DateRangePicker
  value={{ startDate: '2024-01-01', endDate: '2024-12-31' }}
  onChange={setDateRange}
  label="Select Date Range"
/>
```

---

### Dashboard Components

#### StatCard
Display key metrics.

```tsx
import { StatCard } from '@/components/shared';

<StatCard
  title="Total Users"
  value="1,234"
  change={{ value: 12.5, trend: 'up' }}
  subtitle="vs last month"
  icon={<UsersIcon />}
  color="blue"
/>
```

#### ChartCard
Container for charts.

```tsx
import { ChartCard } from '@/components/shared';

<ChartCard
  title="Revenue Over Time"
  subtitle="Last 12 months"
  actions={<Button size="sm">Export</Button>}
>
  <YourChartComponent />
</ChartCard>
```

#### ListCard
Display lists of items.

```tsx
import { ListCard } from '@/components/shared';

<ListCard
  title="Recent Activity"
  items={[
    {
      id: '1',
      title: 'New user registered',
      subtitle: '2 minutes ago',
      value: <Badge>New</Badge>
    }
  ]}
  onItemClick={handleClick}
/>
```

#### ActivityFeed
Timeline of activities.

```tsx
import { ActivityFeed } from '@/components/shared';

<ActivityFeed
  activities={[
    {
      id: '1',
      title: 'John Doe created a new service request',
      timestamp: '2 hours ago',
      icon: <FileIcon />
    }
  ]}
/>
```

---

### Additional UI Components

#### Tabs
Tabbed content navigation.

```tsx
import { Tabs } from '@/components/shared';

<Tabs
  tabs={[
    { id: 'overview', label: 'Overview', content: <Overview /> },
    { id: 'details', label: 'Details', content: <Details /> },
    { id: 'history', label: 'History', badge: '5', content: <History /> }
  ]}
  defaultTab="overview"
/>
```

#### Dropdown
Dropdown menu.

```tsx
import { Dropdown, Button } from '@/components/shared';

<Dropdown
  trigger={<Button variant="ghost">Actions</Button>}
  items={[
    { id: '1', label: 'Edit', onClick: handleEdit },
    { id: '2', label: 'Delete', onClick: handleDelete, variant: 'danger', divider: true }
  ]}
/>
```

#### Toast
Temporary notifications.

```tsx
import { ToastContainer } from '@/components/shared';

<ToastContainer
  toasts={toastList}
  onRemove={removeToast}
  position="top-right"
/>
```

---

## 🎨 Styling

All components use Tailwind CSS utility classes and support custom className props for additional styling.

## 📋 TypeScript Support

All components are fully typed with TypeScript interfaces exported for your convenience.

## 🔧 Usage Best Practices

1. **Import from the index**: Always import from `@/components/shared` for tree-shaking benefits
2. **Combine components**: Use composition to build complex UIs
3. **Leverage status badges**: Use pre-configured status badges for consistency
4. **Use loading states**: Always show loading indicators during async operations
5. **Handle errors gracefully**: Use ErrorDisplay and EmptyState components

## 📖 Examples

See the components in action in the various admin pages:
- Dashboard: StatCards, ChartCards, ActivityFeed
- Users List: Table, Pagination, SearchBar, FilterPanel
- User Edit: Modal, Form components, Tabs
- Service Requests: Table, StatusBadges, ConfirmDialog

---

## 🤝 Contributing

When adding new shared components:
1. Create the component in `/components/shared/`
2. Export it from `/components/shared/index.ts`
3. Add TypeScript interfaces for all props
4. Include proper documentation in this README
5. Ensure components are fully responsive
6. Test with different data states (loading, error, empty)
