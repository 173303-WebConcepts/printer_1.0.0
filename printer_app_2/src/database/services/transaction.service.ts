import uuid from "react-native-uuid";
import { getRealm } from "../realmInstance";
import { store } from "@/src/redux/store";

// Helper to convert "hh:mm AM/PM" to hour and minute
const parseTimeString = (timeStr: string) => {
  const [time, meridiem] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
};

export async function getEarningStats() {
  try {
    const realm = getRealm();

    // 1️⃣ Fetch settings
    const settings = store?.getState().common?.settings;
    if (!settings) throw new Error("Settings not found");

    const { dayStart, dayEnd } = settings;

    // 2️⃣ Parse dayStart and dayEnd
    const startTime = parseTimeString(dayStart);
    const endTime = parseTimeString(dayEnd);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime.hours, startTime.minutes, 0, 0);
    let todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime.hours, endTime.minutes, 59, 999);

    if (todayEnd <= todayStart) {
      todayEnd.setDate(todayEnd.getDate() + 1);
    }

    // 3️⃣ Query transactions
    const transactions = realm.objects("Transaction");

    // Today earning (respect dayStart/dayEnd)
    const todayTransactions = transactions.filtered(
      "createdAt >= $0 AND createdAt <= $1 AND syncStatus != 'deleted'",
      todayStart,
      todayEnd,
    );
    const todayEarning = todayTransactions.sum("total") ?? 0;

    // This month earning
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthTransactions = transactions.filtered("createdAt >= $0 AND createdAt <= $1", monthStart, monthEnd);
    const monthEarning = monthTransactions.sum("total") ?? 0;

    // This year earning
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const yearTransactions = transactions.filtered("createdAt >= $0 AND createdAt <= $1", yearStart, yearEnd);
    const yearEarning = yearTransactions.sum("total") ?? 0;

    return {
      todayEarning,
      monthEarning,
      yearEarning,
    };
  } catch (error) {
    console.error("❌ getEarningStats error:", error);
    return {
      todayEarning: 0,
      monthEarning: 0,
      yearEarning: 0,
    };
  }
}

export function createOfflineTransaction(realm: any, transactionData: any) {
  try {
    let createdTransaction = null;

    realm.write(() => {
      createdTransaction = realm.create("Transaction", {
        localId: uuid.v4(),
        serverId: null,

        receiptNumber: transactionData.receiptNumber || null,

        // Embedded list of purchased items
        products: transactionData.products.map((item: any) => ({
          localId: item.localId,
          name: item.name,
          // image: item.image,
          quantity: Number(item.quantity),
          sellingPrice: Number(item.sellingPrice),
          total: Number(item.quantity) * Number(item.sellingPrice),
        })),

        subtotal: Number(transactionData.subtotal),
        tax: Number(transactionData.tax),
        total: Number(transactionData.total),

        createdAt: new Date(),
        updatedAt: new Date(),

        syncStatus: "pending", // 🔥 Needed for sync
      });
    });

    return createdTransaction;
  } catch (error) {
    console.error("❌ Failed to create offline transaction:", error);
    return null;
  }
}

export async function getLocalTransactions(realm: any, page?: number, search: string = "", status: "active" | "deleted" = "active") {
  try {
    let results = realm.objects("Transaction");

    // Filter based on status
    if (status === "active") {
      results = results.filtered(`syncStatus != "deleted"`);
    } else if (status === "deleted") {
      results = results.filtered(`syncStatus == "deleted"`);
    }

    // Apply search filter (receipt number or customer name)
    if (search.trim() !== "") {
      results = results.filtered(`receiptNumber CONTAINS[c] $0`, search.trim());
    }

    // Sort by updatedAt (desc)
    const sorted = results.sorted("createdAt", true);

    // 🔥 If no page provided → return all
    if (!page) {
      return {
        transactions: sorted,
        paginationData: null,
      };
    }

    // Pagination
    const PAGE_SIZE = 10;
    const total = sorted.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const pageData = sorted.slice(start, end);

    return {
      transactions: pageData.map((t: any) => t.toJSON()),
      paginationData: {
        currentPage: page,
        totalPages,
        documentCount: total,
      },
    };
  } catch (error: any) {
    console.error("❌ getLocalTransactions error:", error.message || error);
    return {
      transactions: [],
      paginationData: null,
    };
  }
}

export async function deleteOfflineTransaction(realm: any, localId: string, products: any) {
  try {
    let deleted = false;

    realm.write(() => {
      const transaction = realm.objectForPrimaryKey("Transaction", localId);

      if (!transaction) return;

      // 1️⃣ Restore product stock
      products.forEach((p: any) => {
        const product = realm.objectForPrimaryKey("Product", p.localId);
        if (product) {
          product.stock += p.quantity; // add back quantity sold
          product.updatedAt = new Date();
        }
      });

      // Soft delete (for offline sync)
      transaction.syncStatus = "deleted";
      transaction.updatedAt = new Date();
      deleted = true;
    });

    return deleted;
  } catch (error: any) {

    return false;
  }
}
