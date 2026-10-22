import api from "../mockApi/api/axios";
import createResourceService from "../mockApi/services/resourceService";

const resource = createResourceService("/purchases");

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateItem = (item) => {
  const wetWeightKg = Number(item.wetWeightKg);
  const ratePerKg = Number(item.ratePerKg);

  if (!item.seedTypeId || !item.qualityId) {
    throw new Error("Every item needs a seed type and quality.");
  }

  if (!Number.isFinite(wetWeightKg) || wetWeightKg <= 0) {
    throw new Error("Wet weight must be greater than zero.");
  }

  if (!Number.isFinite(ratePerKg) || ratePerKg < 0) {
    throw new Error("Rate per kg cannot be negative.");
  }

  return {
    ...item,
    wetWeightKg,
    ratePerKg,
    totalAmount: roundMoney(wetWeightKg * ratePerKg),
  };
};

const purchaseService = {
  ...resource,

  createPurchase: async (purchaseData) => {
    const {
      businessId,
      seasonId,
      supplierId,
      purchaseDate,
      items,
      notes = "",
    } = purchaseData;

    if (!businessId || !seasonId || !supplierId || !purchaseDate) {
      throw new Error(
        "Business, season, supplier and purchase date are required.",
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("A purchase must contain at least one item.");
    }

    // Confirm that the selected seed types belong to the season.
    const [seedTypesResponse, qualitiesResponse] = await Promise.all([
      api.get("/seedTypes"),
      api.get("/qualities"),
    ]);

    const seedTypes = seedTypesResponse.data;
    const qualities = qualitiesResponse.data;

    const calculatedItems = items.map((item) => {
      const seedType = seedTypes.find((seed) => seed.id === item.seedTypeId);

      if (!seedType || !seedType.isActive) {
        throw new Error(`Invalid or inactive seed type: ${item.seedTypeId}`);
      }

      if (!seedType.seasonIds?.includes(seasonId)) {
        throw new Error(
          `${seedType.name} is not configured for the selected season.`,
        );
      }

      if (!seedType.qualityIds?.includes(item.qualityId)) {
        throw new Error(
          `Selected quality is not allowed for ${seedType.name}.`,
        );
      }

      if (!qualities.some((quality) => quality.id === item.qualityId)) {
        throw new Error(`Unknown quality: ${item.qualityId}`);
      }

      return calculateItem(item);
    });

    const totalAmount = roundMoney(
      calculatedItems.reduce((sum, item) => sum + item.totalAmount, 0),
    );

    const purchase = {
      businessId,
      seasonId,
      supplierId,
      purchaseDate,
      items: calculatedItems.map((item, index) => ({
        ...item,
        id: item.id ?? `item-${Date.now()}-${index}`,
      })),
      totalAmount,
      notes,
      createdAt: new Date().toISOString(),
    };

    const response = await api.post("/purchases", purchase);

    return response.data;
  },

  getBySupplier: async (supplierId) => {
    const purchases = await resource.getAll({ supplierId });
    return purchases;
  },

  getBySeason: async (seasonId) => {
    const purchases = await resource.getAll({ seasonId });
    return purchases;
  },
};

export default purchaseService;
