import qualityService from "../mockApi/services/qualityService";
import seedTypeService from "../services/seedTypeService";
import seasonService from "../services/seasonService";
import createResourceService from "../mockApi/services/resourceService";

export { qualityService, seedTypeService, seasonService };

export const businessService = createResourceService("businesses");
export const supplierService = createResourceService("suppliers");
export const customerService = createResourceService("customers");
export const sellPointService = createResourceService("sellPoints");

export { default as purchaseService } from "./purchaseService";
export const dryingBatchService = createResourceService("dryingBatches");
export const packagingBatchService = createResourceService("packagingBatches");
export const salesService = createResourceService("sales");

export { default as supplierPaymentService } from "./supplierPaymentService";

export const customerPaymentService = createResourceService("customerPayments");

export const expenseService = createResourceService("expenses");
export const otherIncomeService = createResourceService("otherIncomes");
