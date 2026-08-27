import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";
import Modal from "../../../components/common/Modal";

// --- Dummy data (porer step e backend theke asbe) ---
const initialSellers = [
  { id: 1, name: "Abdul Karim", area: "Rangpur", phone: "017XXXXXXXX" },
  { id: 2, name: "Rahim Mia", area: "Dinajpur", phone: "018XXXXXXXX" },
  { id: 3, name: "Salam Sheikh", area: "Bogura", phone: "019XXXXXXXX" },
];

const initialPurchases = [
  {
    id: 1,
    sellerId: 1,
    date: "2026-05-10",
    season: "BORO",
    seedType: "Paddy",
    wetWeight: 500,
    rate: 100,
    totalAmount: 50000,
    paidAmount: 30000,
  },
  {
    id: 2,
    sellerId: 1,
    date: "2026-05-15",
    season: "BORO",
    seedType: "Paddy",
    wetWeight: 200,
    rate: 100,
    totalAmount: 20000,
    paidAmount: 20000,
  },
  {
    id: 3,
    sellerId: 2,
    date: "2026-05-12",
    season: "BORO",
    seedType: "Wheat",
    wetWeight: 150,
    rate: 100,
    totalAmount: 15000,
    paidAmount: 0,
  },
];

const dummyPayments = [{ id: 1, sellerId: 1, amount: 5000 }];

const seasons = ["BORO", "AMON"];

let nextSellerId = initialSellers.length + 1;
let nextPurchaseId = initialPurchases.length + 1;

const emptySellerValues = { name: "", area: "", phone: "" };
const emptyPurchaseValues = {
  sellerId: "",
  season: "BORO",
  seedType: "",
  date: "",
  wetWeight: "",
  rate: "",
  paidAmount: "",
};

const SELLER_FORM_ID = "seller-form";
const PURCHASE_FORM_ID = "purchase-form";

function calculateDue(sellerId, purchases, payments) {
  const purchaseDue = purchases
    .filter((p) => p.sellerId === sellerId)
    .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);

  const laterPayments = payments
    .filter((p) => p.sellerId === sellerId)
    .reduce((sum, p) => sum + p.amount, 0);

  return purchaseDue - laterPayments;
}

export default function SellerListPage() {
  const [sellers, setSellers] = useState(initialSellers);
  const [purchases, setPurchases] = useState(initialPurchases);

  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const sellerForm = useForm({ defaultValues: emptySellerValues });
  const purchaseForm = useForm({ defaultValues: emptyPurchaseValues });

  const [watchedWeight, watchedRate, watchedPaid] = useWatch({
    control: purchaseForm.control,
    name: ["wetWeight", "rate", "paidAmount"],
  });

  const previewTotal =
    (Number(watchedWeight) || 0) * (Number(watchedRate) || 0);
  const previewDue = previewTotal - (Number(watchedPaid) || 0);

  const columns = [
    { key: "name", header: "Naam" },
    { key: "area", header: "Area" },
    { key: "phone", header: "Phone" },
    {
      key: "due",
      header: "Total Due",
      render: (row) =>
        `৳${calculateDue(row.id, purchases, dummyPayments).toLocaleString()}`,
    },
  ];

  function onSellerSubmit(data) {
    const newSeller = {
      id: nextSellerId++,
      name: data.name.trim(),
      area: data.area.trim(),
      phone: data.phone.trim(),
    };
    setSellers((prev) => [...prev, newSeller]);
    sellerForm.reset();
    setSellerModalOpen(false);
  }

  function handleSellerCancel() {
    sellerForm.reset();
    setSellerModalOpen(false);
  }

  function onPurchaseSubmit(data) {
    const wetWeight = Number(data.wetWeight);
    const rate = Number(data.rate);
    const paidAmount = Number(data.paidAmount) || 0;

    const newPurchase = {
      id: nextPurchaseId++,
      sellerId: Number(data.sellerId),
      date: data.date,
      season: data.season,
      seedType: data.seedType.trim(),
      wetWeight,
      rate,
      totalAmount: wetWeight * rate,
      paidAmount,
    };
    setPurchases((prev) => [...prev, newPurchase]);
    purchaseForm.reset();
    setPurchaseModalOpen(false);
  }

  function handlePurchaseCancel() {
    purchaseForm.reset();
    setPurchaseModalOpen(false);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Sellers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPurchaseModalOpen(true)}>
            + New Purchase
          </Button>
          <Button onClick={() => setSellerModalOpen(true)}>+ New Seller</Button>
        </div>
      </div>

      <Table columns={columns} data={sellers} />

      <Modal
        open={sellerModalOpen}
        onClose={handleSellerCancel}
        title="Notun Seller Add Koro"
        actions={
          <>
            <Button type="button" variant="ghost" onClick={handleSellerCancel}>
              Cancel
            </Button>
            <Button type="submit" form={SELLER_FORM_ID}>
              Save
            </Button>
          </>
        }
      >
        <form
          id={SELLER_FORM_ID}
          onSubmit={sellerForm.handleSubmit(onSellerSubmit)}
          className="flex flex-col gap-3"
        >
          <div>
            <label htmlFor="seller-name" className="label">
              Naam
            </label>
            <input
              id="seller-name"
              {...sellerForm.register("name", { required: "Naam lagbe" })}
              className="input input-bordered w-full"
              placeholder="Seller-er naam"
            />
            {sellerForm.formState.errors.name && (
              <p className="text-error text-sm mt-1">
                {sellerForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="seller-area" className="label">
              Area
            </label>
            <input
              id="seller-area"
              {...sellerForm.register("area")}
              className="input input-bordered w-full"
              placeholder="Village/Area"
            />
          </div>
          <div>
            <label htmlFor="seller-phone" className="label">
              Phone
            </label>
            <input
              id="seller-phone"
              {...sellerForm.register("phone")}
              className="input input-bordered w-full"
              placeholder="017XXXXXXXX"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={purchaseModalOpen}
        onClose={handlePurchaseCancel}
        title="Notun Purchase Add Koro"
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={handlePurchaseCancel}
            >
              Cancel
            </Button>
            <Button type="submit" form={PURCHASE_FORM_ID}>
              Save
            </Button>
          </>
        }
      >
        <form
          id={PURCHASE_FORM_ID}
          onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)}
          className="flex flex-col gap-3"
        >
          <div>
            <label htmlFor="purchase-seller" className="label">
              Seller
            </label>
            <select
              id="purchase-seller"
              {...purchaseForm.register("sellerId", {
                required: "Seller select koro",
              })}
              className="select select-bordered w-full"
              defaultValue=""
            >
              <option value="" disabled>
                Seller select koro
              </option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {purchaseForm.formState.errors.sellerId && (
              <p className="text-error text-sm mt-1">
                {purchaseForm.formState.errors.sellerId.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Season</label>
            <div className="flex gap-4">
              {seasons.map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={s}
                    {...purchaseForm.register("season", { required: true })}
                    className="radio radio-sm"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="purchase-seedType" className="label">
              Seed Type
            </label>
            <input
              id="purchase-seedType"
              {...purchaseForm.register("seedType", {
                required: "Seed type lagbe",
              })}
              className="input input-bordered w-full"
              placeholder="Jemon: Paddy, Wheat"
            />
            {purchaseForm.formState.errors.seedType && (
              <p className="text-error text-sm mt-1">
                {purchaseForm.formState.errors.seedType.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="purchase-date" className="label">
              Date
            </label>
            <input
              id="purchase-date"
              type="date"
              {...purchaseForm.register("date", { required: "Date lagbe" })}
              className="input input-bordered w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="purchase-weight" className="label">
                Wet Weight (kg)
              </label>
              <input
                id="purchase-weight"
                type="number"
                step="0.01"
                {...purchaseForm.register("wetWeight", {
                  required: "Weight lagbe",
                  min: 0,
                })}
                className="input input-bordered w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="purchase-rate" className="label">
                Rate (৳/kg)
              </label>
              <input
                id="purchase-rate"
                type="number"
                step="0.01"
                {...purchaseForm.register("rate", {
                  required: "Rate lagbe",
                  min: 0,
                })}
                className="input input-bordered w-full"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="purchase-paid" className="label">
              Ekhon Koto Dila (৳)
            </label>
            <input
              id="purchase-paid"
              type="number"
              step="0.01"
              {...purchaseForm.register("paidAmount")}
              className="input input-bordered w-full"
              placeholder="0"
            />
          </div>

          <div className="bg-base-200 rounded-lg p-3 flex justify-between text-sm">
            <span>
              Total: <strong>৳{previewTotal.toLocaleString()}</strong>
            </span>
            <span>
              Due: <strong>৳{previewDue.toLocaleString()}</strong>
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
