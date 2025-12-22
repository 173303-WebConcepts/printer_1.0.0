import AppToast from "../widgets/CustomToast";
import { axiosInstance } from "./axios";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";
import { PermissionsAndroid, Platform } from "react-native";
import { BluetoothStateManager, ThermalPrinter } from "@finan-me/react-native-thermal-printer";
import { getLocalProfile } from "../database/services/profile.service";
import { getNextTokenNumber } from "../database/services/TokenCounter.service";
import uuid from "react-native-uuid";
import { createOfflineTransaction } from "../database/services/transaction.service";
import { updateOfflineProductStocks } from "../database/services/productService";
import { store } from "../redux/store";
import { setPrinterDisconnected } from "../redux/slices/printerSlice";
import NetInfo from "@react-native-community/netinfo";

export class Helper {
  static res = (res: any) => {
    if (res?.data?.success) return AppToast.success("Success!", res?.data?.message);
    if (res?.data?.success === false) return AppToast.error("Oops!", res?.data?.message);
    if (res?.response?.data?.success === false) return AppToast.error("Oops!", res?.response?.data?.message);
  };

  static getDaysLeft(expiryDateStr: string): number {
    if (!expiryDateStr) return 0;

    const expiryDate = new Date(expiryDateStr);
    const today = new Date();

    // Set both dates to midnight (ignore time)
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert ms → days

    return diffDays; // can be negative if expired
  }

  static isPrinterConnected = async () => {
    if (!connectedPrinter) return false;
    try {
      const status = await connectedPrinter.getStatus(); // or any 'ping' method your library provides
      return status === "connected" || status === 0; // depends on SDK
    } catch (err) {
      return false;
    }
  };

  static uploadImages = async (formData: FormData) => {
    try {
      const res = await axiosInstance.post("/common/upload_images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res;
    } catch (error: any) {
      console.error("Upload failed:", error?.response?.data || error.message);
      throw error;
    }
  };

  static formatFullDate = (date: any) => {
    if (!date) return "";

    const d = new Date(date);

    const day = d.getDate().toString().padStart(2, "0");

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];

    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // 12-hour format

    return `${day} ${month}, ${year}  ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  static readImageAsBinary = async (uri: string) => {
    try {
      const base64 = await RNFS.readFile(uri, "base64");

      const uint8 = Uint8Array.from(Buffer.from(base64, "base64"));
      const arrayBuffer = uint8.buffer; // <-- REQUIRED BY REALM
      return arrayBuffer;
    } catch (error) {
      console.error("Error reading image:", error);
      return null; // or throw error
    }
  };

  static binaryToBase64 = (binary: ArrayBuffer): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        if (!binary) {
          return reject(new Error("Binary data is null or undefined"));
        }

        // Convert ArrayBuffer → Uint8Array → Base64
        const base64 = Buffer.from(new Uint8Array(binary)).toString("base64");

        resolve(base64);
      } catch (error) {
        reject(error);
      }
    });
  };

  static requestBtPermissions = async () => {
    try {
      if (Platform.OS === "android" && Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const fine = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return fine === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (e) {
      return false;
    }
  };

  static ensureBluetoothOn = async () => {
    try {
      const state = await BluetoothStateManager.getState();

      if (state === "PoweredOff") {
        return state;
        // const res = await BluetoothStateManager.enable();

        // console.log("BluetoothStateManager::11", res);
      }
    } catch (error) {
      // console.log("BluetoothStateManager::11", error);
    }
  };

  static downloadImageToLocal = async (url: string) => {
    const filename = url.split("/").pop();
    const localPath = `${RNFS.CachesDirectoryPath}/${filename}`;
    const exists = await RNFS.exists(localPath);

    if (!exists) {
      const result = await RNFS.downloadFile({ fromUrl: url, toFile: localPath }).promise;
      if (result.statusCode !== 200) {
        throw new Error(`Failed to download image, status: ${result.statusCode}`);
      }
    }

    return localPath;
  };

  static mimeToExt = (mimeType: string) => {
    if (!mimeType) return "jpg";

    const match = mimeType.match(/image\/(.+)/);
    if (!match) return "jpg";

    let ext = match[1].toLowerCase();

    // Normalize common variations
    if (ext === "jpeg" || ext === "jpg") ext = "jpg";
    if (ext.includes("svg")) ext = "png"; // SVG not supported → convert to png
    if (ext.includes("heic")) ext = "jpg"; // HEIC images must be converted
    if (ext.includes("webp")) ext = "png"; // Some printers fail with webp

    return ext;
  };

  static saveBase64ImageToFile = async (base64Data: string, mimeType: string) => {
    try {
      const ext = Helper.mimeToExt(mimeType);
      const filePath = `${RNFS.CachesDirectoryPath}/profile_avatar.${ext}`;

      await RNFS.writeFile(filePath, base64Data, "base64");

      return filePath;
    } catch (err) {
      return null;
    }
  };

  static printReceipt = async ({ isKOT = false, setIsLoading = false, address, data, realm, connected }: any) => {
    try {
      setIsLoading(true);
      const settings = store.getState().common?.settings;

      const printerAddress = `bt:${address}`;
      let localImagePath: any = null;

      if (!isKOT) {
        const profileData: any = await getLocalProfile();

        if (profileData?.avatar?.binary) {
          const base64 = await Helper.binaryToBase64(profileData.avatar.binary);

          localImagePath = await Helper.saveBase64ImageToFile(base64, profileData.avatar.mimeType);
        }
      }

      // fake order data for example
      const items = data?.products?.filter((p: any) => p.quantity > 0) || [];
      if (items.length === 0) {
        return AppToast.error("Oops!", "No items to print!");
      }

      let tokenNumber;

      if (settings?.isTokenNumber) tokenNumber = getNextTokenNumber();

      const date = new Date();
      const receiptNumber = BigInt("0x" + uuid.v4().replace(/-/g, ""))
        .toString()
        .slice(0, 10);

      const totalAmount = items.reduce((t, i) => t + i.quantity * i.sellingPrice, 0);
      let taxAmount = 0;
      let payable = totalAmount;

      if (settings?.tax > 0) {
        taxAmount = totalAmount - totalAmount / (1 + settings.tax / 100);
        payable = totalAmount + taxAmount;
      }

      const doc: any[] = [];

      // HEADER
      if (!isKOT && localImagePath) {
        doc.push({
          type: "image",
          imagePath: localImagePath,
          options: { align: "center", marginMm: 2 },
        });
      }

      doc.push({ type: "feed", lines: 1 });
      doc.push({ type: "line", style: "dashed" });

      // TOKEN NUMBER
      if (settings?.isTokenNumber) {
        doc.push({
          type: "text",
          content: `Token no. ${tokenNumber}`,
          style: { align: "center", bold: true, size: 2 },
        });
      }

      doc.push({ type: "line", style: "dashed" });

      // DATE + RECEIPT
      doc.push({
        type: "text",
        content: `Date: ${date.toLocaleString()}`,
        style: { align: "left" },
      });

      doc.push({
        type: "text",
        content: `Receipt: #${receiptNumber}`,
        style: { align: "left" },
      });

      doc.push({ type: "line", style: "solid" });

      // ITEMS TABLE
      doc.push({
        type: "table",
        headers: ["Item", "Qty", "Price"],
        headerStyle: { bold: true },
        rows: items.map(i => {
          const lineTotal = i.quantity * i.sellingPrice;

          return [i.name, i.quantity.toString(), lineTotal.toFixed(2)];
        }),
        columnWidths: [50, 20, 30],
        alignments: ["left", "center", "right"],
        border: {
          header: "solid",
          between: "solid",
        },
        borderCharSet: "utf8",
      });

      // TOTALS
      doc.push({ type: "line", style: "solid" });

      doc.push({
        type: "text",
        content: `Subtotal: ${totalAmount.toFixed(2)}`,
        style: { align: "right" },
      });

      // TAX
      if (settings?.tax > 0) {
        doc.push({
          type: "text",
          content: `Tax (${settings.tax}%): ${taxAmount.toFixed(2)}`,
          style: { align: "right" },
        });
      }

      doc.push({
        type: "text",
        content: `Total: ${payable.toFixed(2)}`,
        style: { align: "right", bold: true },
      });

      doc.push({ type: "feed", lines: 4 });

      const job = {
        printers: [
          {
            address: printerAddress,
            options: {
              paperWidthMm: 58,
              encoding: "CP1258",
              marginMm: 0,
              keepAlive: true,
            },
          },
        ],
        documents: [doc],
      };

      const res1 = await ThermalPrinter.printReceipt(job);

      if (!res1?.success) {
        AppToast.error("Oops!!", "Please check your printer and try again.");
        store.dispatch(setPrinterDisconnected());
        return;
      }

      const transactionData = {
        receiptNumber,

        products: items.map(i => ({
          localId: i.localId,
          name: i.name,
          // image: i.image,
          quantity: i.quantity,
          sellingPrice: i.sellingPrice,
        })),

        subtotal: totalAmount,
        tax: settings?.tax,
        total: payable,
      };

      if (!isKOT) {
        createOfflineTransaction(realm, transactionData);
        updateOfflineProductStocks(realm, items);
      }

      AppToast.success("🖨️ Printed", "Receipt sent to printer.");
    } catch (err) {
      AppToast.error("Oops!", "Printing failed!");
    } finally {
      setIsLoading(false);
    }
  };

  static checkInternet = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected !== true || netInfo.isInternetReachable === false) {
      AppToast.error("Oops!", "Check your internet connection and try again later.");
      return false;
    }

    try {
      await fetch("https://www.google.com", {
        method: "HEAD",
      });
      return true;
    } catch {
      AppToast.error("Oops!", "Check your internet connection and try again later.");
      return false;
    }
  };
}
