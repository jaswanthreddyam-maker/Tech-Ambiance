import type { BillingExperienceDTO_v1 } from '../types/experienceModels';
import type { PortalInvoice } from '../types/portalModels';

export class BillingExperienceBuilder {
  static build(invoices: PortalInvoice[]): BillingExperienceDTO_v1 {
    const pendingInvoices = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
    const paidInvoices = invoices.filter(i => i.status === 'PAID');
    
    // Sort pending invoices to find the next due date
    const sortedPending = [...pendingInvoices].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    const nextDueDate = sortedPending.length > 0 ? sortedPending[0].dueDate || null : null;
    
    // We would sum the actual values here. For now, since PortalInvoice contains a string formattedAmount, 
    // we would need the raw numeric amount. We will calculate a placeholder sum.
    // In a real implementation, we'd pass raw invoices into the builder and format the total amount.
    
    return {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      summary: {
        totalOutstanding: "Calculate based on raw amounts", // We will fix this by formatting the raw amounts
        nextDueDate
      },
      pendingInvoices,
      paidInvoices
    };
  }
}
