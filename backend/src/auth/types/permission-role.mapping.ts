import { Role } from './role.enum';
import { Permission } from './permission.enum';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),

  [Role.SYSTEM_ADMIN]: [
    Permission.USER_MANAGE, Permission.USER_READ,
    Permission.ROLE_MANAGE,
    Permission.AREA_MANAGE,
    Permission.PROJECT_MANAGE, Permission.PROJECT_READ,
    Permission.CUSTOMER_MANAGE, Permission.CUSTOMER_READ, Permission.CUSTOMER_WRITE,
    Permission.METER_MANAGE, Permission.METER_READ, Permission.METER_WRITE,
    Permission.METER_ASSIGN, Permission.METER_TERMINATE,
    Permission.READING_MANAGE, Permission.READING_READ, Permission.READING_WRITE, Permission.READING_APPROVE,
    Permission.INVOICE_MANAGE, Permission.INVOICE_READ, Permission.INVOICE_WRITE, Permission.INVOICE_ISSUE, Permission.INVOICE_CANCEL,
    Permission.PAYMENT_MANAGE, Permission.PAYMENT_READ, Permission.PAYMENT_WRITE, Permission.PAYMENT_REVERSE,
    Permission.SIM_MANAGE, Permission.SIM_READ, Permission.SIM_WRITE,
    Permission.BILLING_MANAGE, Permission.BILLING_READ,
    Permission.REPORT_READ, Permission.REPORT_MANAGE,
    Permission.ALERT_READ, Permission.ALERT_MANAGE,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
    Permission.AUDIT_VIEW, Permission.CONFIG_MANAGE,
    Permission.SETTLEMENT_RUN, Permission.NOTIFICATION_SEND,
    Permission.ADMIN_ACCESS,
  ],

  [Role.ADMIN]: [
    Permission.USER_READ,
    Permission.PROJECT_MANAGE, Permission.PROJECT_READ,
    Permission.AREA_MANAGE,
    Permission.CUSTOMER_MANAGE, Permission.CUSTOMER_READ, Permission.CUSTOMER_WRITE,
    Permission.METER_MANAGE, Permission.METER_READ, Permission.METER_WRITE,
    Permission.METER_ASSIGN, Permission.METER_TERMINATE,
    Permission.READING_MANAGE, Permission.READING_READ, Permission.READING_WRITE, Permission.READING_APPROVE,
    Permission.INVOICE_MANAGE, Permission.INVOICE_READ, Permission.INVOICE_WRITE, Permission.INVOICE_ISSUE, Permission.INVOICE_CANCEL,
    Permission.PAYMENT_MANAGE, Permission.PAYMENT_READ, Permission.PAYMENT_WRITE, Permission.PAYMENT_REVERSE,
    Permission.SIM_MANAGE, Permission.SIM_READ, Permission.SIM_WRITE,
    Permission.BILLING_MANAGE, Permission.BILLING_READ,
    Permission.REPORT_READ,
    Permission.ALERT_READ, Permission.ALERT_MANAGE,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
    Permission.AUDIT_VIEW,
    Permission.SETTLEMENT_RUN, Permission.NOTIFICATION_SEND,
  ],

  [Role.AREA_MANAGER]: [
    Permission.PROJECT_READ,
    Permission.CUSTOMER_READ, Permission.CUSTOMER_WRITE,
    Permission.METER_READ, Permission.METER_WRITE, Permission.METER_ASSIGN,
    Permission.READING_READ, Permission.READING_WRITE, Permission.READING_APPROVE,
    Permission.INVOICE_READ, Permission.INVOICE_WRITE, Permission.INVOICE_ISSUE,
    Permission.PAYMENT_READ, Permission.PAYMENT_WRITE,
    Permission.SIM_READ, Permission.SIM_WRITE,
    Permission.BILLING_READ,
    Permission.REPORT_READ,
    Permission.ALERT_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
  ],

  [Role.TEAM_LEADER]: [
    Permission.PROJECT_READ,
    Permission.CUSTOMER_READ,
    Permission.METER_READ, Permission.METER_WRITE,
    Permission.READING_READ, Permission.READING_WRITE, Permission.READING_APPROVE,
    Permission.INVOICE_READ,
    Permission.PAYMENT_READ,
    Permission.SIM_READ,
    Permission.BILLING_READ,
    Permission.REPORT_READ,
    Permission.ALERT_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
  ],

  [Role.OPERATOR]: [
    Permission.PROJECT_READ,
    Permission.CUSTOMER_READ, Permission.CUSTOMER_WRITE,
    Permission.METER_READ, Permission.METER_WRITE, Permission.METER_ASSIGN,
    Permission.READING_READ, Permission.READING_WRITE,
    Permission.INVOICE_READ, Permission.INVOICE_WRITE, Permission.INVOICE_ISSUE,
    Permission.PAYMENT_READ, Permission.PAYMENT_WRITE,
    Permission.SIM_READ, Permission.SIM_WRITE,
    Permission.BILLING_READ,
    Permission.ALERT_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
  ],

  [Role.TECHNICIAN]: [
    Permission.METER_READ,
    Permission.READING_READ, Permission.READING_WRITE,
    Permission.SIM_READ,
    Permission.ALERT_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
  ],

  [Role.FINANCE]: [
    Permission.CUSTOMER_READ,
    Permission.INVOICE_READ, Permission.INVOICE_WRITE, Permission.INVOICE_ISSUE, Permission.INVOICE_CANCEL,
    Permission.PAYMENT_READ, Permission.PAYMENT_WRITE, Permission.PAYMENT_REVERSE,
    Permission.BILLING_READ, Permission.BILLING_MANAGE,
    Permission.REPORT_READ, Permission.REPORT_MANAGE,
    Permission.SETTLEMENT_RUN,
  ],

  [Role.SUPPORT]: [
    Permission.CUSTOMER_READ,
    Permission.READING_READ,
    Permission.INVOICE_READ,
    Permission.PAYMENT_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
    Permission.ALERT_READ,
    Permission.NOTIFICATION_SEND,
  ],

  [Role.CUSTOMER]: [
    Permission.READING_READ,
    Permission.INVOICE_READ,
    Permission.PAYMENT_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
  ],

  [Role.COLLECTOR]: [
    Permission.CUSTOMER_READ,
    Permission.METER_READ,
    Permission.PAYMENT_READ, Permission.PAYMENT_WRITE,
    Permission.INVOICE_READ,
  ],

  [Role.METER_READER]: [
    Permission.METER_READ,
    Permission.READING_READ, Permission.READING_WRITE,
  ],

  [Role.INSPECTOR]: [
    Permission.METER_READ,
    Permission.READING_READ,
    Permission.TICKET_READ, Permission.TICKET_MANAGE,
    Permission.ALERT_READ,
    Permission.REPORT_READ,
  ],

  [Role.SUPERVISOR]: [
    Permission.PROJECT_READ,
    Permission.CUSTOMER_READ,
    Permission.METER_READ,
    Permission.READING_READ, Permission.READING_APPROVE,
    Permission.INVOICE_READ,
    Permission.PAYMENT_READ,
    Permission.REPORT_READ,
    Permission.ALERT_READ,
    Permission.TICKET_READ,
  ],

  [Role.ACCOUNTANT]: [
    Permission.INVOICE_READ, Permission.INVOICE_WRITE,
    Permission.PAYMENT_READ, Permission.PAYMENT_WRITE,
    Permission.BILLING_READ,
    Permission.REPORT_READ,
    Permission.SETTLEMENT_RUN,
  ],

  [Role.VIEWER]: [
    Permission.PROJECT_READ,
    Permission.CUSTOMER_READ,
    Permission.METER_READ,
    Permission.READING_READ,
    Permission.INVOICE_READ,
    Permission.PAYMENT_READ,
    Permission.REPORT_READ,
    Permission.ALERT_READ,
    Permission.TICKET_READ,
  ],
};
