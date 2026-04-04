// FinancialRecord model (for reference, logic handled in db.js for now)
export const RecordTypes = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const FinancialRecordSchema = {
  userId: 'number',
  amount: 'number',
  type: Object.values(RecordTypes),
  category: 'string',
  date: 'string', // ISO date
  notes: 'string',
};
