const queryKeys = {
  all: ["seed-stock"],

  businesses: () => ["seed-stock", "businesses"],
  seasons: () => ["seed-stock", "seasons"],
  seedTypes: () => ["seed-stock", "seedTypes"],
  qualities: () => ["seed-stock", "qualities"],
  suppliers: () => ["seed-stock", "suppliers"],
  customers: () => ["seed-stock", "customers"],
  sellPoints: () => ["seed-stock", "sellPoints"],
  purchases: () => ["seed-stock", "purchases"],
  dryingBatches: () => ["seed-stock", "dryingBatches"],
  packagingBatches: () => ["seed-stock", "packagingBatches"],
  sales: () => ["seed-stock", "sales"],
  supplierPayments: () => ["seed-stock", "supplierPayments"],
  customerPayments: () => ["seed-stock", "customerPayments"],
  expenses: () => ["seed-stock", "expenses"],
  otherIncomes: () => ["seed-stock", "otherIncomes"],
};

export default queryKeys;
