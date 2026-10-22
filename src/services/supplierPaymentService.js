import api from "../mockApi/api/axios";
import createResourceService from "../mockApi/services/resourceService";

const resource = createResourceService("/supplierPayments");

const supplierPaymentService = {
  ...resource,

  createPayment: async (paymentData) => {
    const {
      businessId,
      supplierId,
      purchaseId,
      paymentDate,
      amount,
      method = "cash",
      notes = "",
    } = paymentData;

    if (!businessId || !supplierId || !purchaseId || !paymentDate) {
      throw new Error(
        "Business, supplier, purchase and payment date are required.",
      );
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      throw new Error("Payment amount must be greater than zero.");
    }

    const [purchaseResponse, payments] = await Promise.all([
      api.get(`/purchases/${encodeURIComponent(purchaseId)}`),
      resource.getAll({ purchaseId }),
    ]);

    const purchase = purchaseResponse.data;

    if (
      purchase.businessId !== businessId ||
      purchase.supplierId !== supplierId
    ) {
      throw new Error(
        "Payment business or supplier does not match the purchase.",
      );
    }

    const alreadyPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );

    const dueAmount =
      Math.round(
        (Number(purchase.totalAmount) - alreadyPaid + Number.EPSILON) * 100,
      ) / 100;

    if (paymentAmount > dueAmount) {
      throw new Error(
        `Payment exceeds the outstanding amount of ${dueAmount}.`,
      );
    }

    return resource.create({
      businessId,
      supplierId,
      purchaseId,
      paymentDate,
      amount: paymentAmount,
      method,
      notes,
      createdAt: new Date().toISOString(),
    });
  },
};

export default supplierPaymentService;
