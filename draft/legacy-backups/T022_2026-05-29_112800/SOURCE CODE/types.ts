// ============================================
// Meter Verse - TypeScript Types & Interfaces
// ============================================

// ---- Enums / Union Types ----

export type UserRole =
  | "super_admin"
  | "project_admin"
  | "operator"
  | "technician"
  | "finance"
  | "support"
  | "customer";

export type MeterType = "electricity" | "main_water" | "child_water";

export type MeterStatus =
  | "available"
  | "assigned"
  | "active"
  | "offline"
  | "faulty"
  | "replaced"
  | "terminated"
  | "retired";

export type SimStatus =
  | "available"
  | "assigned"
  | "active"
  | "suspended"
  | "old"
  | "reusable"
  | "retired";

export type ReadingStatus =
  | "valid"
  | "pending_review"
  | "estimated"
  | "suspicious"
  | "corrected"
  | "rejected";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type PaymentStatus = "pending" | "confirmed" | "reversed" | "cancelled";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
  | "online_payment"
  | "cheque"
  | "mobile_wallet";

export type ProjectStatus = "active" | "inactive" | "completed" | "archived";

export type CustomerType = "residential" | "commercial" | "government" | "industrial";

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertType =
  | "offline_meter"
  | "missing_reading"
  | "high_consumption"
  | "zero_consumption"
  | "water_difference"
  | "overdue_invoice"
  | "communication_failure"
  | "sim_ip_issue";

export type ReadingSource = "manual" | "automated" | "estimated";

export type UnitType = "apartment" | "office" | "shop" | "warehouse" | "studio";

// ---- Core Entities ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  area: string;
  buildings: number;
  units: number;
  customers: number;
  activeMeters: number;
  tariff: string;
  status: ProjectStatus;
  createdAt: string;
  description?: string;
}

export interface Building {
  id: string;
  projectId: string;
  name: string;
  floors: number;
  units: number;
  createdAt: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  number: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  buildingId: string;
  projectId: string;
  floorNumber: number;
  unitNumber: string;
  unitType: UnitType;
  customerId?: string;
  electricityMeterId?: string;
  waterMeterId?: string;
  status: "vacant" | "occupied" | "maintenance";
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  projectId: string;
  projectName?: string;
  units: string[];
  activeMeters: number;
  currentBalance: number;
  totalPaid: number;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  address?: string;
}

export interface Meter {
  id: string;
  serialNumber: string;
  meterType: MeterType;
  brand: string;
  model: string;
  projectId?: string;
  projectName?: string;
  buildingId?: string;
  buildingName?: string;
  floorNumber?: number;
  unitId?: string;
  unitNumber?: string;
  customerId?: string;
  customerName?: string;
  simCardId?: string;
  ipAddress?: string;
  lastReading?: number;
  lastReadingDate?: string;
  lastCommunication?: string;
  status: MeterStatus;
  installedDate?: string;
  createdAt: string;
}

export interface SimCard {
  id: string;
  iccid: string;
  msisdn: string;
  ipAddress: string;
  ipType: "static" | "dynamic";
  provider: string;
  assignedMeterId?: string;
  assignedMeterSerial?: string;
  status: SimStatus;
  assignmentStartDate?: string;
  assignmentEndDate?: string;
  createdAt: string;
}

export interface Reading {
  id: string;
  meterId: string;
  meterSerial: string;
  meterType: MeterType;
  customerId?: string;
  customerName?: string;
  unitId?: string;
  unitNumber?: string;
  projectId?: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingDate: string;
  source: ReadingSource;
  status: ReadingStatus;
  anomaly: boolean;
  enteredBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  unitId?: string;
  unitNumber?: string;
  meterSerial: string;
  meterType: MeterType;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  consumption: number;
  tariff: number;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentDate: string;
  method: PaymentMethod;
  amount: number;
  collectedBy: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface Balance {
  customerId: string;
  customerName: string;
  customerCode: string;
  projectId: string;
  projectName: string;
  totalInvoiced: number;
  totalPaid: number;
  adjustments: number;
  outstandingBalance: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  aging90plus: number;
  state: "zero" | "positive" | "credit";
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityType: "meter" | "customer" | "invoice" | "sim" | "reading";
  entityId: string;
  entityLabel: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  customerName?: string;
  meterId?: string;
  meterSerial?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  assigneeName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumptionRecord {
  date: string;
  electricity: number;
  water: number;
}

export interface WaterBalanceRecord {
  date: string;
  mainMeterConsumption: number;
  childMetersTotal: number;
  difference: number;
  differencePercent: number;
  threshold: number;
}

// ---- Dashboard Types ----

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: "reading" | "invoice" | "payment" | "ticket" | "alert" | "assignment";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

// ---- Table Types ----

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableFilter {
  key: string;
  label: string;
  type: "search" | "select" | "date" | "multi-select";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ---- Report Types ----

export interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  lastGenerated?: string;
}

// ---- Navigation Types ----

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface RolePermissions {
  [role: string]: string[]; // array of nav hrefs
}
