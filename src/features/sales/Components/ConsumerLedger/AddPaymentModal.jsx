import { useState } from "react";
import Modal from "../../../../components/common/Modal";

const getToday = () => new Date().toISOString().split("T")[0];

const formatAmount = (amount) => `৳${Number(amount || 0).toLocaleString()}`;

const getInitialPaymentData = () => ({
  date: getToday(),
  amount: "",
  note: "",
});

const AddPaymentModal = ({ open, consumer, currentDue, onClose, onSave }) => {
  const [paymentData, setPaymentData] = useState(getInitialPaymentData());

  const [error, setError] = useState("");

  const paymentAmount = Number(paymentData.amount) || 0;

  const due = Number(currentDue) || 0;

  const remainingDue = Math.max(0, due - paymentAmount);

  const handleChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  const resetForm = () => {
    setPaymentData(getInitialPaymentData());
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!consumer) return;

    if (!paymentData.date) {
      setError("Payment date is required.");
      return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (due <= 0) {
      setError("This consumer has no outstanding due.");
      return;
    }

    if (paymentAmount > due) {
      setError(
        `Payment cannot be greater than current due of ${formatAmount(due)}.`,
      );
      return;
    }

    onSave({
      date: paymentData.date,
      amount: paymentAmount,
      note: paymentData.note.trim(),
    });

    resetForm();
  };

  if (!consumer) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Payment"
      actions={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-seed-border px-4 py-2 text-sm font-medium text-seed-text transition hover:bg-seed-background"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-payment-form"
            className="rounded-lg bg-seed-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Save Payment
          </button>
        </>
      }
    >
      <form id="add-payment-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Consumer */}
        <div className="rounded-xl border border-seed-border bg-seed-background p-4">
          <p className="text-xs text-seed-muted">Consumer</p>

          <p className="mt-1 text-sm font-semibold text-seed-text">
            {consumer.name}
          </p>

          <p className="mt-0.5 text-xs text-seed-muted">{consumer.phone}</p>
        </div>

        {/* Current Due */}
        <div className="rounded-xl border border-seed-border bg-seed-background p-4">
          <p className="text-xs text-seed-muted">Current Due</p>

          <p className="mt-1 text-xl font-semibold text-red-600">
            {formatAmount(due)}
          </p>
        </div>

        {/* Payment Date */}
        <div>
          <label
            htmlFor="payment-date"
            className="mb-1.5 block text-sm font-medium text-seed-text"
          >
            Payment Date
          </label>

          <input
            id="payment-date"
            type="date"
            value={paymentData.date}
            onChange={(event) => handleChange("date", event.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* Payment Amount */}
        <div>
          <label
            htmlFor="payment-amount"
            className="mb-1.5 block text-sm font-medium text-seed-text"
          >
            Amount
          </label>

          <input
            id="payment-amount"
            type="number"
            min="0"
            max={due}
            step="0.01"
            value={paymentData.amount}
            onChange={(event) => handleChange("amount", event.target.value)}
            placeholder="Enter payment amount"
            className="input input-bordered w-full"
          />
        </div>

        {/* Note */}
        <div>
          <label
            htmlFor="payment-note"
            className="mb-1.5 block text-sm font-medium text-seed-text"
          >
            Note
            <span className="ml-1 text-xs font-normal text-seed-muted">
              (Optional)
            </span>
          </label>

          <input
            id="payment-note"
            type="text"
            value={paymentData.note}
            onChange={(event) => handleChange("note", event.target.value)}
            placeholder="Example: Cash payment"
            className="input input-bordered w-full"
          />
        </div>

        {/* Remaining Due */}
        {paymentAmount > 0 && (
          <div className="rounded-xl border border-seed-border bg-seed-background p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-seed-muted">Current Due</span>

              <span className="font-medium text-seed-text">
                {formatAmount(due)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-seed-muted">Payment</span>

              <span className="font-medium text-seed-primary">
                - {formatAmount(paymentAmount)}
              </span>
            </div>

            <div className="mt-3 border-t border-seed-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-seed-text">
                  Remaining Due
                </span>

                <span
                  className={`text-sm font-semibold ${
                    remainingDue > 0 ? "text-red-600" : "text-seed-primary"
                  }`}
                >
                  {formatAmount(remainingDue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AddPaymentModal;
