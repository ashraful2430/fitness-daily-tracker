# Lending Feature Implementation Guide

## Overview

A complete lending management frontend has been implemented for the Money Tracker. This feature allows users to:
- Create and track loans with borrowers
- Process loan repayments
- Track external debts owed to creditors
- View financial summaries including lending activities
- Access transaction history for all loans

## Architecture

### File Structure

```
components/lending/
├── LendingDashboard.tsx          # Main dashboard orchestrator
├── FinancialSummaryPanel.tsx      # Quick stats display
├── LoansList.tsx                  # List of all loans
├── LoanCard.tsx                   # Individual loan card
├── CreateLoanModal.tsx            # Form to create new loans
├── LoanDetailsModal.tsx           # Detailed view of a loan
├── RepaymentModal.tsx             # Form to process repayments
├── ExternalDebtsPanel.tsx         # View debts owed to creditors
└── LendingSummaryPanel.tsx        # Summary widget for money dashboard

hooks/
└── useLending.ts                  # State management hook

types/money.ts                     # Lending type definitions

lib/api.ts                         # API wrapper functions

app/(app)/lending/
└── page.tsx                       # Lending page route
```

### Key Components

#### 1. **LendingDashboard** (Main Container)
- Orchestrates all lending components
- Manages modal states (create loan, view details, repayment)
- Handles loan selection and navigation
- Displays error banners and loading states

#### 2. **FinancialSummaryPanel** (Quick Stats)
Displays 5 key financial metrics:
- **Personal Balance**: Available funds
- **Total Lent**: Sum of all loans given
- **Outstanding Loans**: Money still owed by borrowers
- **Borrowed Liability**: Total money owed to creditors
- **Net Position**: Balance minus liability

#### 3. **LoansList** (Main List View)
- Displays all loans in card format
- Shows status indicators (Active, Partially Paid, Closed)
- Displays progress bars for repayment progress
- Clickable to view loan details

#### 4. **LoanCard** (Individual Loan)
- Shows borrower name and amount
- Progress bar showing repayment progress
- Status badge (color-coded)
- Quick stats: repaid, remaining, type
- Clickable for details

#### 5. **CreateLoanModal** (New Loan Form)
Form fields:
- Borrower name (required, 2-50 chars)
- Amount (required, > 0)
- Funding source (PERSONAL or BORROWED)
- Creditor name (required if BORROWED)
- Note (optional, max 500 chars)

Validation:
- Client-side validation before submission
- Server-side validation error handling
- Real-time error display

#### 6. **LoanDetailsModal** (Loan Details)
- Shows full loan information
- Displays transaction history
- Shows repayment progress and remaining amount
- Lists all disbursements and repayments
- "Process Repayment" button for active loans

#### 7. **RepaymentModal** (Repayment Form)
- Shows borrower and remaining balance
- Input field for repayment amount
- Max value validation
- Shows loan status after repayment
- Success/error handling

#### 8. **ExternalDebtsPanel** (Debts Owed)
- Lists creditors you owe money to
- Shows total liability and remaining amounts
- Progress bars for repayment progress
- Clear status for paid-off debts

#### 9. **LendingSummaryPanel** (Money Dashboard Widget)
- Quick summary card for money dashboard
- Shows active loan count
- Displays total lent and outstanding loans
- Link to full lending page

### State Management

**useLending Hook** manages:
```typescript
{
  loans: Loan[];                    // All loans
  debts: ExternalDebt[];            // All debts owed
  summary: FinancialSummary;        // Financial metrics
  stats: LendingStats;              // Lending statistics
  selectedLoan: Loan | null;        // Currently selected loan
  selectedLoanTransactions: [];     // Transactions for selected loan
  isLoading: boolean;               // Initial data loading
  isCreatingLoan: boolean;          // Creating new loan
  isProcessingRepayment: boolean;   // Processing repayment
  error: string | null;             // Error messages
}
```

### API Integration

All API calls are wrapped in `lendingAPI` object:

```typescript
// Loan Management
lendingAPI.createLoan(payload)
lendingAPI.getAllLoans()
lendingAPI.getLoanDetails(id)
lendingAPI.repayLoan(id, payload)
lendingAPI.getLoanTransactions(id)

// Financial Data
lendingAPI.getFinancialSummary()
lendingAPI.getExternalDebts()
lendingAPI.getLendingStats()
```

## Features

### 1. Create Loan
```typescript
// Creates a new loan from personal balance or external borrowing
POST /api/loans
{
  borrowerName: string;      // Required
  amount: number;            // Required, > 0
  sourceType: "PERSONAL" | "BORROWED";  // Required
  borrowedFromName?: string; // Required if BORROWED
  note?: string;             // Optional
}
```

### 2. Process Repayment
```typescript
// Records a repayment for a loan
POST /api/loans/:id/repay
{
  repaymentAmount: number;   // Required, <= remaining balance
}
```

### 3. View Financial Summary
```typescript
// Gets all financial metrics
GET /api/financial-summary
{
  personalBalance: number;
  totalLent: number;
  totalOutstandingLoans: number;
  totalBorrowedLiability: number;
  netPosition: number;
  activeDebts: ExternalDebt[];
}
```

### 4. Track External Debts
```typescript
// Gets all debts owed to creditors
GET /api/debts
{
  creditorName: string;
  totalAmount: number;
  remainingAmount: number;
  isCleared: boolean;
}
```

## User Workflows

### Creating a Loan (Personal Balance)
1. Click "Create Loan" button
2. Fill in borrower name
3. Enter amount
4. Select "From Personal Balance"
5. (Optional) Add a note
6. Click "Create Loan"
7. ✓ Personal balance decreases
8. ✓ Loan appears in list
9. ✓ Outstanding loans amount updates

### Creating a Loan (Borrowed Funds)
1. Click "Create Loan" button
2. Fill in borrower name
3. Enter amount
4. Select "From Borrowed (External Debt)"
5. Enter creditor name
6. (Optional) Add a note
7. Click "Create Loan"
8. ✓ Personal balance unchanged
9. ✓ Borrowed liability increases
10. ✓ Loan appears in list

### Processing a Repayment
1. Click on a loan to view details
2. Click "Process Repayment"
3. Enter repayment amount (≤ remaining)
4. Review status (will show if loan closes)
5. Click "Process Repayment"
6. ✓ Balance updates
7. ✓ Loan status updates
8. ✓ Transaction recorded
9. ✓ Summary refreshes

### Viewing Loan Details
1. Click on a loan in the list
2. See full loan information:
   - Total amount borrowed
   - Amount repaid so far
   - Remaining balance
   - Repayment progress bar
   - All transactions (disbursements & repayments)
   - Source type (personal or borrowed)
   - Date created
   - Creditor (if applicable)

## Data Types

### Loan Status
- `ACTIVE`: No repayments made yet
- `PARTIALLY_PAID`: Some repayments made, balance remains
- `CLOSED`: Fully repaid

### Source Type
- `PERSONAL`: Loaned from personal balance
- `BORROWED`: Loaned from external funds (increases liability)

### Transaction Type
- `DISBURSEMENT`: Initial loan creation
- `REPAYMENT`: Loan repayment

## Error Handling

All errors are handled gracefully:
- Form validation errors show inline
- API errors display in error banner
- Toast notifications for success/failure
- Buttons disabled during processing
- Unauthorized errors redirect to login

### Common Errors
```
"Insufficient balance" 
→ Personal balance not enough for loan

"Creditor name is required for BORROWED source type"
→ Must provide creditor for borrowed loans

"Repayment amount exceeds remaining loan amount"
→ Trying to repay more than owed

"Amount must be greater than zero"
→ Amount validation failed
```

## UI/UX Features

### Visual Indicators
- **Status Badges**: Color-coded (blue, orange, green)
- **Progress Bars**: Show repayment progress
- **Icons**: Visual indicators for transaction types
- **Dark Mode**: Full dark mode support
- **Animations**: Smooth transitions and interactions

### Responsive Design
- Desktop: Full grid layout (loans on left, debts on right)
- Tablet: Adjusted grid, stacked components
- Mobile: Full-width, stacked layout

### Real-time Updates
- Summary updates after loan creation
- Loan list refreshes after repayment
- Statistics update in real-time
- Transaction history updates immediately

## Integration with Money Dashboard

The `LendingSummaryPanel` can be added to the Money Dashboard:

```typescript
import LendingSummaryPanel from "@/components/lending/LendingSummaryPanel";

// In MoneyDashboard.tsx
<LendingSummaryPanel />
```

This displays:
- Active loan count
- Total lent amount
- Outstanding loans amount
- Quick link to full lending page

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Dark mode support across all browsers

## Performance Considerations

- Lazy loading of loan details
- Memoized components to prevent unnecessary re-renders
- Debounced form submissions
- Optimized API calls with Promise.all()
- Toast notifications for feedback

## Future Enhancements

1. **Search/Filter**: Filter loans by status, borrower, date range
2. **Sorting**: Sort by date, amount, remaining balance
3. **Export**: Download loans as CSV/PDF
4. **Charts**: Visualize lending distribution
5. **Notifications**: Reminders for upcoming repayments
6. **Multi-currency**: Support for different currencies
7. **Recurring Payments**: Automatic repayment schedules
8. **Loan Categories**: Categorize loans (business, personal, family)
9. **Interest Tracking**: Track interest on loans
10. **Document Upload**: Attach loan agreements

## Testing Checklist

- [x] Create personal loan with sufficient balance
- [x] Show error for insufficient balance
- [x] Create borrowed loan with creditor
- [x] Show error when creditor missing
- [x] View all loans with correct status
- [x] View loan details with transactions
- [x] Process partial repayment
- [x] Process full repayment (status → CLOSED)
- [x] Verify balance updates
- [x] View financial summary with correct calculations
- [x] View external debts
- [x] Handle API errors gracefully
- [x] Show loading states
- [x] Responsive design on mobile

## Troubleshooting

### Loans not loading?
- Check authentication (user must be logged in)
- Verify API endpoints are accessible
- Check browser console for errors

### Balance not updating?
- Refresh the page
- Clear browser cache
- Check API response in network tab

### Cannot create loan?
- Verify personal balance is sufficient (for PERSONAL source)
- Ensure all required fields are filled
- Check creditor name field for BORROWED loans

### Modals not closing?
- Try refreshing the page
- Clear browser cache
- Check browser console for errors

## Support

For issues or feature requests, contact the development team or file an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: May 2, 2026  
**Status**: Production Ready
