import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import Table from "../../../components/common/Table";
import Modal from "../../../components/common/Modal";
import AddPaymentModal from "../Components/ConsumerLedger/AddPaymentModal";

const initialConsumers = [
  {
    id: 1,
    name: "Rahim Traders",
    phone: "01712345678",
    address: "Dhaka",
    totalSales: 55500,
    initialPaid: 23000,
  },
  {
    id: 2,
    name: "Karim Store",
    phone: "01812345678",
    address: "Gazipur",
    totalSales: 40000,
    initialPaid: 40000,
  },
  {
    id: 3,
    name: "M/S Hasan Enterprise",
    phone: "01912345678",
    address: "Mymensingh",
    totalSales: 82000,
    initialPaid: 50000,
  },
  {
    id: 4,
    name: "Al-Amin Traders",
    phone: "01612345678",
    address: "Tangail",
    totalSales: 35000,
    initialPaid: 15000,
  },
];

const initialTransactions = [
  {
    id: 1,
    consumerId: 1,
    date: "2026-08-25",
    type: "Sale",
    description: "Paddy / BORO",
    amount: 25500,
  },
  {
    id: 2,
    consumerId: 1,
    date: "2026-08-25",
    type: "Payment",
    description: "Initial payment",
    amount: 10000,
  },
  {
    id: 3,
    consumerId: 1,
    date: "2026-08-28",
    type: "Sale",
    description: "Paddy / BORO",
    amount: 30000,
  },
  {
    id: 4,
    consumerId: 1,
    date: "2026-08-30",
    type: "Payment",
    description: "Cash payment",
    amount: 8000,
  },
  {
    id: 5,
    consumerId: 1,
    date: "2026-08-31",
    type: "Payment",
    description: "Cash payment",
    amount: 5000,
  },

  {
    id: 6,
    consumerId: 2,
    date: "2026-08-26",
    type: "Sale",
    description: "Wheat / AMON",
    amount: 40000,
  },
  {
    id: 7,
    consumerId: 2,
    date: "2026-08-26",
    type: "Payment",
    description: "Full payment",
    amount: 40000,
  },

  {
    id: 8,
    consumerId: 3,
    date: "2026-08-22",
    type: "Sale",
    description: "Paddy / BORO",
    amount: 45000,
  },
  {
    id: 9,
    consumerId: 3,
    date: "2026-08-22",
    type: "Payment",
    description: "Initial payment",
    amount: 25000,
  },
  {
    id: 10,
    consumerId: 3,
    date: "2026-08-29",
    type: "Sale",
    description: "Wheat / AMON",
    amount: 37000,
  },
  {
    id: 11,
    consumerId: 3,
    date: "2026-08-29",
    type: "Payment",
    description: "Initial payment",
    amount: 25000,
  },

  {
    id: 12,
    consumerId: 4,
    date: "2026-08-24",
    type: "Sale",
    description: "Paddy / AMON",
    amount: 35000,
  },
  {
    id: 13,
    consumerId: 4,
    date: "2026-08-24",
    type: "Payment",
    description: "Initial payment",
    amount: 15000,
  },
];

function calculateLedger(consumer) {
  const totalSales = Number(consumer.totalSales) || 0;

  const totalPaid = Number(consumer.initialPaid) || 0;

  return {
    totalSales,
    totalPaid,
    due: Math.max(0, totalSales - totalPaid),
  };
}

function formatAmount(amount) {
  return `৳${Number(amount || 0).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "-";

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

export default function ConsumerLedgerPage() {
  const [consumers, setConsumers] = useState(initialConsumers);

  const [transactions, setTransactions] = useState(initialTransactions);

  const [selectedConsumer, setSelectedConsumer] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const summary = useMemo(() => {
    return consumers.reduce(
      (result, consumer) => {
        const ledger = calculateLedger(consumer);

        result.totalSales += ledger.totalSales;

        result.totalPaid += ledger.totalPaid;

        result.totalDue += ledger.due;

        return result;
      },
      {
        totalSales: 0,
        totalPaid: 0,
        totalDue: 0,
      },
    );
  }, [consumers]);

  const selectedTransactions = useMemo(() => {
    if (!selectedConsumer) return [];

    return transactions
      .filter((transaction) => transaction.consumerId === selectedConsumer.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedConsumer, transactions]);

  const selectedLedger = selectedConsumer
    ? calculateLedger(selectedConsumer)
    : null;

  const handleViewLedger = (consumer) => {
    setSelectedConsumer(consumer);
  };

  const handleCloseDetails = () => {
    setSelectedConsumer(null);
    setPaymentModalOpen(false);
  };

  const handleOpenPayment = () => {
    if (!selectedConsumer) return;

    const ledger = calculateLedger(selectedConsumer);

    if (ledger.due <= 0) return;

    setPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentModalOpen(false);
  };

  const handlePaymentSubmit = (payment) => {
    if (!selectedConsumer) return;

    const paymentAmount = Number(payment.amount) || 0;

    if (paymentAmount <= 0) return;

    const currentLedger = calculateLedger(selectedConsumer);

    if (paymentAmount > currentLedger.due) {
      return;
    }

    const newPayment = {
      id: Date.now(),
      consumerId: selectedConsumer.id,
      date: payment.date,
      type: "Payment",
      description: payment.note || "Later payment",
      amount: paymentAmount,
    };

    // Add payment transaction
    setTransactions((prev) => [...prev, newPayment]);

    // Update consumer paid amount
    setConsumers((prev) =>
      prev.map((consumer) => {
        if (consumer.id !== selectedConsumer.id) {
          return consumer;
        }

        return {
          ...consumer,
          initialPaid: Number(consumer.initialPaid || 0) + paymentAmount,
        };
      }),
    );

    // Update selected consumer
    setSelectedConsumer((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        initialPaid: Number(prev.initialPaid || 0) + paymentAmount,
      };
    });

    setPaymentModalOpen(false);
  };

  const columns = [
    {
      key: "name",
      header: "Consumer",
      render: (row) => (
        <div>
          <p className="font-medium text-seed-text">{row.name}</p>

          <p className="mt-0.5 text-xs text-seed-muted">{row.phone}</p>
        </div>
      ),
    },

    {
      key: "totalSales",
      header: "Total Sale",
      render: (row) => {
        const ledger = calculateLedger(row);

        return (
          <span className="font-medium text-seed-text">
            {formatAmount(ledger.totalSales)}
          </span>
        );
      },
    },

    {
      key: "totalPaid",
      header: "Total Paid",
      render: (row) => {
        const ledger = calculateLedger(row);

        return (
          <span className="text-seed-text">
            {formatAmount(ledger.totalPaid)}
          </span>
        );
      },
    },

    {
      key: "due",
      header: "Current Due",
      render: (row) => {
        const ledger = calculateLedger(row);

        return (
          <span
            className={
              ledger.due > 0
                ? "font-semibold text-red-600"
                : "font-medium text-seed-text"
            }
          >
            {formatAmount(ledger.due)}
          </span>
        );
      },
    },

    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleViewLedger(row)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-seed-text transition hover:bg-seed-background"
          title="View Ledger"
          aria-label={`View ledger for ${row.name}`}
        >
          <Eye size={16} strokeWidth={1.8} />

          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-seed-text">
          Consumer Ledger
        </h1>

        <p className="mt-1 text-sm text-seed-muted">
          Track consumer sales, payments and outstanding dues.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Consumers</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {consumers.length}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Sales</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {formatAmount(summary.totalSales)}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Paid</p>

          <p className="mt-2 text-2xl font-semibold text-seed-primary">
            {formatAmount(summary.totalPaid)}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Due</p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            {formatAmount(summary.totalDue)}
          </p>
        </div>
      </div>

      {/* Consumer Table */}
      <div className="overflow-hidden rounded-xl border border-seed-border bg-white">
        <Table
          columns={columns}
          data={consumers}
          emptyMessage="No consumers available"
        />
      </div>

      {/* Consumer Details Modal */}
      <Modal
        open={Boolean(selectedConsumer)}
        onClose={handleCloseDetails}
        title={selectedConsumer ? selectedConsumer.name : "Consumer Details"}
        actions={
          <>
            {selectedConsumer && selectedLedger && selectedLedger.due > 0 && (
              <button
                type="button"
                onClick={handleOpenPayment}
                className="rounded-lg bg-seed-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                + Add Payment
              </button>
            )}

            <button
              type="button"
              onClick={handleCloseDetails}
              className="rounded-lg border border-seed-border px-4 py-2 text-sm font-medium text-seed-text transition hover:bg-seed-background"
            >
              Close
            </button>
          </>
        }
      >
        {selectedConsumer && selectedLedger && (
          <div className="space-y-5">
            {/* Consumer Information */}
            <div className="rounded-xl border border-seed-border bg-seed-background p-4">
              <p className="text-sm font-semibold text-seed-text">
                Consumer Information
              </p>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-seed-muted">Name</span>

                  <span className="font-medium text-seed-text">
                    {selectedConsumer.name}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-seed-muted">Phone</span>

                  <span className="font-medium text-seed-text">
                    {selectedConsumer.phone}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-seed-muted">Address</span>

                  <span className="font-medium text-seed-text">
                    {selectedConsumer.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Ledger Summary */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-seed-border bg-white p-4">
                <p className="text-xs text-seed-muted">Total Sale</p>

                <p className="mt-1 text-lg font-semibold text-seed-text">
                  {formatAmount(selectedLedger.totalSales)}
                </p>
              </div>

              <div className="rounded-xl border border-seed-border bg-white p-4">
                <p className="text-xs text-seed-muted">Total Paid</p>

                <p className="mt-1 text-lg font-semibold text-seed-primary">
                  {formatAmount(selectedLedger.totalPaid)}
                </p>
              </div>

              <div className="rounded-xl border border-seed-border bg-white p-4">
                <p className="text-xs text-seed-muted">Current Due</p>

                <p
                  className={`mt-1 text-lg font-semibold ${
                    selectedLedger.due > 0 ? "text-red-600" : "text-seed-text"
                  }`}
                >
                  {formatAmount(selectedLedger.due)}
                </p>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-seed-text">
                  Transaction History
                </h3>

                <p className="mt-1 text-xs text-seed-muted">
                  Sales and payments for this consumer.
                </p>
              </div>

              {selectedTransactions.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-seed-border">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-sm">
                      <thead>
                        <tr className="border-b border-seed-border bg-seed-background">
                          <th className="px-4 py-3 text-left font-semibold text-seed-muted">
                            Date
                          </th>

                          <th className="px-4 py-3 text-left font-semibold text-seed-muted">
                            Type
                          </th>

                          <th className="px-4 py-3 text-left font-semibold text-seed-muted">
                            Description
                          </th>

                          <th className="px-4 py-3 text-right font-semibold text-seed-muted">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-seed-border last:border-b-0"
                          >
                            <td className="px-4 py-3 text-seed-text">
                              {formatDate(transaction.date)}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  transaction.type === "Sale"
                                    ? "bg-seed-background text-seed-text"
                                    : "bg-green-50 text-green-700"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-seed-text">
                              {transaction.description}
                            </td>

                            <td
                              className={`px-4 py-3 text-right font-medium ${
                                transaction.type === "Sale"
                                  ? "text-seed-text"
                                  : "text-seed-primary"
                              }`}
                            >
                              {formatAmount(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-seed-border bg-seed-background p-6 text-center">
                  <p className="text-sm text-seed-muted">
                    No transactions found.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Payment Modal */}
      <AddPaymentModal
        open={paymentModalOpen}
        consumer={selectedConsumer}
        currentDue={selectedLedger?.due || 0}
        onClose={handleClosePayment}
        onSave={handlePaymentSubmit}
      />
    </div>
  );
}
