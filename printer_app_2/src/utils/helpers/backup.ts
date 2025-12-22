import RNFS from "react-native-fs";
import Realm from "realm";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { store, RootState } from "../../redux/store"; // <-- import store
import AppToast, { Toast } from "@/src/widgets/CustomToast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { DevSettings } from "react-native";
import { Buffer } from "buffer";
import axios from "axios";
import { axiosInstance } from "../axios";

const WRITE_THRESHOLD = 5; // Auto backup after 50 writes
const MAX_BACKUPS = 1; // Keep last 10 backups only

export class Backup {
  static isTokenExpired = (
    expiresAt: number | string | null,
    bufferMs = 2 * 60 * 1000, // 2 minutes
  ): boolean => {
    if (!expiresAt) return true;

    const expiryTime = Number(expiresAt);
    const now = Date.now();

    return now >= expiryTime - bufferMs;
  };

  // static increaseWriteCounter = async () => {
  //   const countStr = await AsyncStorage.getItem("realmWriteCounter");
  //   const count = countStr ? parseInt(countStr) : 0;
  //   const newCount = count + 1;

  //   console.log("GG:::::", newCount);

  //   await AsyncStorage.setItem("realmWriteCounter", newCount.toString());

  //   if (newCount >= WRITE_THRESHOLD) {
  //     console.log("GG:::::11", newCount);
  //     // await Backup.triggerAutoBackup();
  //     // await AsyncStorage.setItem("realmWriteCounter", "0");
  //   }
  // };

  // static triggerAutoBackup = async () => {
  //   console.log("GG:::::22");
  //   const internet = await NetInfo.fetch();
  //   if (!internet.isConnected) {
  //     console.log("GG:::::33", internet.isConnected);
  //     AppToast.error("Oops!", "Please check your internet connection and try again later.");
  //     return;
  //   }

  //   console.log("GG:::::44", internet.isConnected);

  //   await Backup.backupRealmFile();
  //   return { needPopup: false };
  // };

  // static backupRealmFile = async () => {
  //   try {
  //     const state: RootState = store.getState();
  //     const { GAuth } = state.user;

  //     console.log("useruser:::", GAuth);

  //     if (!GAuth?.accessToken) {
  //       console.log("No access token found for user");
  //       return;
  //     }

  //     const gdrive = Backup.initGDrive(GAuth?.accessToken);

  //     console.log("useruser:::11");

  //     const folderId = await Backup.getOrCreateBackupFolder(gdrive);

  //     console.log("useruser:::22");

  //     const res = await Backup.backupRealmToDrive(gdrive, folderId);

  //     if (res === "UPLOAD_ABORTED_BUT_SUCCESS" || res) {
  //       await Backup.deleteOldBackups(gdrive, folderId);

  //       await AsyncStorage.setItem("lastBackupAt", Date.now().toString());

  //       AppToast.success("Backup Completed", "Your POS data is safely stored.");
  //     }
  //   } catch (error: any) {
  //     console.log("❌ Backup failed:", error);
  //     AppToast.error("Backup Failed", error.message || "Something went wrong");
  //   }
  // };

  static initGDrive(accessToken: string) {
    const gdrive = new GDrive();
    gdrive.accessToken = accessToken;
    return gdrive;
  }

  static uploadWithProgress = async (gdrive: any, folderId: any, onProgress: any) => {
    const accessToken = gdrive.accessToken;
    const realmPath = Realm.defaultPath;

    const fileBase64 = await RNFS.readFile(realmPath, "base64");

    const boundary = "foo_bar_baz";
    const metadata = {
      name: `backup_${Date.now()}.realm`,
      mimeType: "application/octet-stream",
      parents: [folderId],
    };

    const body =
      `--${boundary}\r\n` +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\n` +
      "Content-Type: application/octet-stream\r\n" +
      "Content-Transfer-Encoding: base64\r\n\r\n" +
      fileBase64 +
      `\r\n--${boundary}--`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");

      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("Content-Type", `multipart/related; boundary=${boundary}`);

      xhr.upload.onprogress = event => {
        let percent = 0;
        if (event.lengthComputable && event.total > 0) {
          percent = Math.round((event.loaded / event.total) * 100);
        } else {
          percent = Math.round((event.loaded / body.length) * 100);
        }
        onProgress(percent);
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(`Upload failed: ${xhr.responseText}`);
        }
      };

      xhr.onerror = err => reject(err);

      xhr.send(body);
    });
  };

  // static backupRealmToDrive = async (gdrive: GDrive, folderId: string) => {
  //   try {
  //     const realmPath = Realm.defaultPath;
  //     const realmData = await RNFS.readFile(realmPath, "base64");

  //     console.log("gdrive:::gdrive:::", gdrive);

  //     const uploadRes = await gdrive.files
  //       .newMultipartUploader()
  //       .setData(realmData)
  //       .setIsBase64(true)
  //       .setDataMimeType("application/octet-stream")
  //       .setRequestBody({
  //         name: `backup_${Date.now()}.realm`,
  //         mimeType: "application/octet-stream",
  //         parents: [folderId],
  //       })
  //       .execute();

  //     // If Google returns empty body, treat as success
  //     console.log("Google Drive upload response:", uploadRes);

  //     // If Google returns empty body, treat as success
  //     console.log("Google Drive upload response:1111", uploadRes?.id);

  //     return uploadRes?.id ? true : false;
  //   } catch (error: any) {
  //     // THE CRITICAL FIX 🔥
  //     // 1️⃣ Handle the false error thrown AFTER upload succeeded
  //     if (error?.message?.includes("Aborted") || error?.toString().includes("Aborted")) {
  //       console.log("⚠ Upload aborted AFTER success – treating as successful.");

  //       // reset counter
  //       await AsyncStorage.setItem("realmWriteCounter", "0");

  //       return "UPLOAD_ABORTED_BUT_SUCCESS"; // marker
  //     }

  //     console.log("Realm backup failed real error:", error);
  //     throw error;
  //   }
  // };

  static listBackups = async (gdrive: GDrive, folderId: string) => {
    const res = await gdrive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      orderBy: "createdTime desc",
    });

    return res.files || [];
  };

  static deleteOldBackups = async (gdrive: GDrive, folderId: string) => {
    try {
      const backups = await Backup.listBackups(gdrive, folderId);

      if (backups.length <= MAX_BACKUPS) return;

      const toDelete = backups.slice(MAX_BACKUPS);

      for (const f of toDelete) {
        await gdrive.files.delete(f.id);
      }
    } catch (err) {
      console.error("Error deleting old backups:", err);
    }
  };

  // static refreshAccessToken = async (refreshToken: string) => {
  //   try {
  //     const data = {
  //       client_id: GOOGLE_CLIENT_ID,
  //       client_secret: GOOGLE_CLIENT_SECRET,
  //       refresh_token: refreshToken,
  //       grant_type: "refresh_token",
  //     };

  //     const res = await fetch("https://oauth2.googleapis.com/token", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //       body: new URLSearchParams(data).toString(),
  //     });

  //     if (!res.ok) {
  //       const errBody = await res.text();

  //       throw new Error(`Failed to refresh token: ${res.status}`);
  //     }

  //     const json = await res.json();

  //     return json; // contains access_token, expires_in, etc.
  //   } catch (err) {
  //     return null; // return null so caller can detect failure safely
  //   }
  // };

  // static exchangeAuthCode = async (authCode: string) => {
  //   const data = {
  //     code: authCode,
  //     client_id: GOOGLE_CLIENT_ID,
  //     client_secret: GOOGLE_CLIENT_SECRET,
  //     redirect_uri: "",
  //     grant_type: "authorization_code",
  //   };

  //   const res = await fetch("https://oauth2.googleapis.com/token", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     body: new URLSearchParams(data).toString(),
  //   });

  //   return res.json(); // contains access_token, refresh_token
  // };

  static connectGoogleDrive = async () => {
    try {
      console.log("PPP::44");
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log("PPP::55");
      const user = await GoogleSignin.signIn();
      const { user: storeUser } = store?.getState().user;
      console.log("PPP::66");
      if (storeUser?.email && user?.data?.user.email !== storeUser?.email) {
        AppToast.error("User Mismatch", `Unable to find email, please use your last signup email ${storeUser?.email}`, {
          autoHide: false,
        });
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        return null;
      }

      if (!user?.data?.serverAuthCode) {
        throw new Error("Failed to get serverAuthCode");
      }

      // Exchange auth code for Drive-enabled token
      // const tokenResponse = await Backup.exchangeAuthCode(user?.data?.serverAuthCode);
      console.log("PPP::77");

      const form_data: any = {
        authCode: user?.data?.serverAuthCode,
        ...(!storeUser?.email && { email: user?.data?.user.email }),
      };

      const res = await axiosInstance.post("/auth/g-exchange-auth-code", form_data);

      console.log("PP:::88", res);

      if (!res?.data?.success) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        AppToast.error("Oops!", `Something went wrong`, {
          autoHide: false,
        });
        return null;
      }

      return {
        email: user?.data?.user.email,
        googleId: user?.data?.user.id,
        accessToken: res?.data?.data?.access_token,
        refreshToken: res?.data?.data?.refresh_token,
        expiresIn: res?.data?.data?.expires_in,
      };
    } catch (error) {
      throw error;
    }
  };

  static getOrCreateBackupFolder = async (gdrive: GDrive) => {
    const folderName = "POS_Backups";

    try {
      const searchRes = await gdrive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      });

      if (searchRes?.files?.length > 0) {
        return searchRes.files[0].id;
      }

      const createRes = await gdrive.files
        .newMultipartUploader()
        .setRequestBody({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
        })
        .execute();

      return createRes?.id;
    } catch (error) {
      throw error; // rethrow so caller knows it failed
    }
  };

  static getLatestBackup = async (gdrive: GDrive, folderId: string) => {
    const files = await gdrive.files.list({
      q: `'${folderId}' in parents and mimeType='application/octet-stream'`,
      orderBy: "name desc", // because backup_TIMESTAMP.realm
      fields: "files(id,name,mimeType,size)", // 🔹 request the size field
    });

    if (!files || !files.files || files.files.length === 0) {
      return null;
    }

    // first item is newest because of orderBy DESC
    return files.files[0];
  };

  static restoreLatestBackup = async (gdrive: GDrive, folderId: string, setShowDrawer?: any) => {
    try {
      const latest = await Backup.getLatestBackup(gdrive, folderId);
      const fileSize = latest?.size ? parseInt(latest.size, 10) : 0; // in bytes

      if (!latest) {
        AppToast.error("Oops!", "No backup found to restore");
        return false;
      }

      AppToast.progress(0, "Recovering Data");

      // 🔹 Use the direct download method
      const binary = await Backup.downloadBackupFileDirect(gdrive, latest.id, fileSize, percent => {
        if (percent > 0) {
          setShowDrawer(false);
        }
        AppToast.progress(percent, "Recovering Data");
      });

      Toast.hide();
      AppToast.success("Download Complete", "Restoring backup...");

      await Backup.restoreRealmBackupFromDrive(binary);

      return true;
    } catch (err) {
      Toast.hide();
      AppToast.error("Restore Failed", "Something went wrong");
      console.error("Restore failed:", err);
      return false;
    }
  };

  static restoreRealmBackupFromDrive = async (binary: Uint8Array | number[]) => {
    // Convert path to string

    const realmPath = `${Realm.defaultPath}`;

    // 1) Convert to base64
    const base64 = Buffer.from(binary).toString("base64");

    // 1️⃣ Close Realm before overwriting
    try {
      // 1) shut down realm
      Realm.shutdown();

      // 2️⃣ Write backup file over Realm DB
      await RNFS.writeFile(realmPath, base64, "base64");

      AppToast.success("Success!", "Data restored successfully");

      // 3) restart app
      DevSettings.reload();
    } catch (e) {}
  };

  static downloadBackupFileDirect = async (
    gdrive: GDrive,
    fileId: string,
    totalSize: number, // pass total file size here
    onProgress: (percent: number) => void,
  ) => {
    const accessToken = gdrive.accessToken;

    return new Promise<Uint8Array>(async (resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, true);
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        xhr.responseType = "arraybuffer";

        // 🔹 Use xhr.onprogress for downloads
        xhr.onprogress = event => {
          let percent = 0;

          if (event.lengthComputable) {
            percent = Math.round((event.loaded / event.total) * 100);
          } else if (totalSize > 0) {
            // fallback if event.total is 0
            percent = Math.min(99, Math.round((event.loaded / totalSize) * 100));
          }

          percent = Math.min(100, percent * 2); // ← your x2 logic

          onProgress(percent);
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(new Uint8Array(xhr.response));
          } else {
            reject(new Error(`Download failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = err => reject(err);

        xhr.send();
      } catch (err) {
        reject(err);
      }
    });
  };
}
