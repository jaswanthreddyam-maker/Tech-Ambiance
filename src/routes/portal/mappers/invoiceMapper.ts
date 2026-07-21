import type { PortalInvoice } from '../types/portalModels';
import { formatMoney } from '../utils/moneyFormatter';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'amber' },
  PAID: { label: 'Paid', color: 'emerald' },
  OVERDUE: { label: 'Overdue', color: 'red' },
  CANCELLED: { label: 'Cancelled', color: 'gray' },
};

const DEFAULT_STATUS = { label: 'Unknown', color: 'gray' };

export function mapInvoiceToPortal(row: any): PortalInvoice {
  const rawStatus = (row.status || 'PENDING').toUpperCase();
  const config = STATUS_CONFIG[rawStatus] || DEFAULT_STATUS;
  const currency = row.currency || 'USD';

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    title: row.title,
    amount: Number(row.amount) || 0,
    formattedAmount: formatMoney(Number(row.amount) || 0, currency),
    currency,
    status: rawStatus,
    statusLabel: config.label,
    statusColor: config.color,
    dueDate: row.due_date,
    paidAt: row.paid_at || null,
  };
}
