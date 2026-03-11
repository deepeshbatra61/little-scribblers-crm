export const TICKET_TYPES = [
  { value: 'new_enrolment',  label: 'New Enrolment',    icon: '👶', desc: 'Enrol a new child into the program' },
  { value: 'payroll',        label: 'Payroll',           icon: '💰', desc: 'Salary, wages, or payment issues' },
  { value: 'supply_order',   label: 'Supply Order',      icon: '🛒', desc: 'Order supplies or equipment' },
  { value: 'budget_approval',label: 'Budget Approval',   icon: '📊', desc: 'Request approval for an expense' },
  { value: 'compliance',     label: 'Compliance',        icon: '📋', desc: 'Regulatory or compliance matter' },
  { value: 'staff_matter',   label: 'Staff Matter',      icon: '👥', desc: 'HR or staffing issue' },
  { value: 'maintenance',    label: 'Maintenance',       icon: '🔧', desc: 'Facility or equipment repair' },
  { value: 'miscellaneous',  label: 'Miscellaneous',     icon: '📌', desc: 'Other requests' },
];

export const PRIORITIES = [
  { value: 'urgent', label: 'Urgent',  icon: '🔴', desc: 'Requires immediate attention', color: 'var(--urgent)',  bg: 'var(--urgent-bg)',  border: 'var(--urgent-border)' },
  { value: 'high',   label: 'High',    icon: '🟠', desc: 'Action needed soon',           color: 'var(--high)',    bg: 'var(--high-bg)',    border: 'var(--high-border)' },
  { value: 'medium', label: 'Medium',  icon: '🟡', desc: 'Standard priority',            color: 'var(--medium)',  bg: 'var(--medium-bg)',  border: 'var(--medium-border)' },
  { value: 'low',    label: 'Low',     icon: '🟢', desc: 'When time permits',            color: 'var(--low)',     bg: 'var(--low-bg)',     border: 'var(--low-border)' },
];

export const STATUSES = [
  { value: 'open',         label: 'Open',         color: 'var(--status-open)' },
  { value: 'in_progress',  label: 'In Progress',  color: 'var(--status-progress)' },
  { value: 'pending_info', label: 'Pending Info', color: 'var(--status-pending)' },
  { value: 'resolved',     label: 'Resolved',     color: 'var(--status-resolved)' },
  { value: 'closed',       label: 'Closed',       color: 'var(--status-closed)' },
];

export const BRANCHES = ['Ashfield', 'Burwood', 'Strathfield', 'Newtown', 'Marrickville'];

export const getPriority = val => PRIORITIES.find(p => p.value === val) || PRIORITIES[2];
export const getStatus   = val => STATUSES.find(s => s.value === val)   || STATUSES[0];
export const getType     = val => TICKET_TYPES.find(t => t.value === val);

export const formatDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: days > 365 ? 'numeric' : undefined });
};
