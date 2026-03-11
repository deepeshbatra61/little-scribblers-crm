export const TICKET_TYPES = [
  { value: 'new_enrolment',   label: 'New Enrolment',   abbr: 'NE', desc: 'Enrol a new child into the program' },
  { value: 'payroll',         label: 'Payroll',          abbr: 'PR', desc: 'Salary, wages, or payment issues' },
  { value: 'supply_order',    label: 'Supply Order',     abbr: 'SO', desc: 'Order supplies or equipment' },
  { value: 'budget_approval', label: 'Budget Approval',  abbr: 'BA', desc: 'Request approval for an expense' },
  { value: 'compliance',      label: 'Compliance',       abbr: 'CO', desc: 'Regulatory or compliance matter' },
  { value: 'staff_matter',    label: 'Staff Matter',     abbr: 'SM', desc: 'HR or staffing issue' },
  { value: 'maintenance',     label: 'Maintenance',      abbr: 'MN', desc: 'Facility or equipment repair' },
  { value: 'miscellaneous',   label: 'Miscellaneous',    abbr: 'MI', desc: 'Other requests' },
];

export const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', desc: 'Requires immediate attention', color: 'var(--urgent)',  bg: 'var(--urgent-bg)',  border: 'var(--urgent-border)' },
  { value: 'high',   label: 'High',   desc: 'Action needed soon',           color: 'var(--high)',    bg: 'var(--high-bg)',    border: 'var(--high-border)' },
  { value: 'medium', label: 'Medium', desc: 'Standard priority',            color: 'var(--medium)',  bg: 'var(--medium-bg)',  border: 'var(--medium-border)' },
  { value: 'low',    label: 'Low',    desc: 'When time permits',            color: 'var(--low)',     bg: 'var(--low-bg)',     border: 'var(--low-border)' },
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

// Fix: SQLite stores datetime('now') as UTC without 'Z' suffix.
// Appending 'Z' ensures JS parses it as UTC, not local time.
export const formatDate = iso => {
  if (!iso) return '';
  const utc = iso.includes('Z') || iso.includes('+') ? iso : iso.replace(' ', 'T') + 'Z';
  const d   = new Date(utc);
  const now = new Date();
  const diff  = now - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: days > 365 ? 'numeric' : undefined });
};
