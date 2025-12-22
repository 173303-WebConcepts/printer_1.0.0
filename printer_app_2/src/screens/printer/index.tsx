import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, PermissionsAndroid, Alert } from "react-native";
import { BluetoothManager, BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";

const Printer = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestBluetoothPermission();
  }, []);

  const requestBluetoothPermission = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    } catch (err) {
      console.warn(err);
    }
  };



const scanDevices = async () => {
  setLoading(true);
  try {
    await BluetoothManager.enableBluetooth();

    let devicesResult = await BluetoothManager.scanDevices();


    // Parse top-level string if necessary
    if (typeof devicesResult === "string") {
      devicesResult = JSON.parse(devicesResult);
    }



    const paired = devicesResult.paired || [];
    const found = devicesResult.found || [];



    const allDevices = [...paired, ...found].filter(d => d.address);


    setDevices(allDevices);

    if (!allDevices || allDevices.length === 0) {
      Alert.alert(
        "No device found",
        "Please make sure your printer is turned on and in pairing mode."
      );
    }
  } catch (err) {
    console.warn(err);
    Alert.alert("Error", "Failed to scan devices. Make sure Bluetooth is enabled.");
  } finally {
    setLoading(false);
  }
};




  const connectPrinter = async (address: string) => {
    try {
      await BluetoothManager.connect(address);
      setConnected(true);
      Alert.alert("Printer connected!");
    } catch (err) {
      Alert.alert("Connection failed", String(err));
    }
  };


const printReceipt = async () => {
  if (!connected) {
    Alert.alert("Not connected to printer!");
    return;
  }

  try {
    // 1. Header
    await BluetoothEscposPrinter.printText("☕ My Coffee Shop ☕\n\r", {
      encoding: "GBK",
      widthtimes: 2,
      heigthtimes: 2,
      fonttype: 1,
      align: BluetoothEscposPrinter.ALIGN.CENTER,
    });
    await BluetoothEscposPrinter.printText("123 Coffee St, City\nTel: 123-456-789\n\r", {
      encoding: "GBK",
      align: BluetoothEscposPrinter.ALIGN.CENTER,
    });
    await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

    // 2. Date and Receipt Number
    const date = new Date();
    await BluetoothEscposPrinter.printText(
      `Date: ${date.toLocaleDateString()}  ${date.toLocaleTimeString()}\nReceipt: #00123\n\r`,
      { encoding: "GBK", align: BluetoothEscposPrinter.ALIGN.LEFT }
    );
    await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

    // 3. Items
    const items = [
      { name: "Cappuccino", qty: 2, price: 3.5 },
      { name: "Latte", qty: 1, price: 4.0 },
      { name: "Croissant", qty: 3, price: 2.5 },
    ];

    let totalAmount = 0;
    for (let item of items) {
      const lineTotal = item.qty * item.price;
      totalAmount += lineTotal;
      const line = `${item.name.padEnd(16)}${item.qty.toString().padStart(3)}  $${item.price
        .toFixed(2)
        .padEnd(5)} $${lineTotal.toFixed(2)}\n\r`;
      await BluetoothEscposPrinter.printText(line, { encoding: "GBK" });
    }

    await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

    // 4. Total
    await BluetoothEscposPrinter.printText(`TOTAL: $${totalAmount.toFixed(2)}\n\r`, {
      encoding: "GBK",
      widthtimes: 2,
      heigthtimes: 2,
      fonttype: 1,
      align: BluetoothEscposPrinter.ALIGN.RIGHT,
    });

    // 5. QR Code
    const qrData = "https://mycoffee.com/payment?id=00123"; // dynamic URL
    await BluetoothEscposPrinter.printText("\nScan QR code to pay:\n\r", {
      encoding: "GBK",
      align: BluetoothEscposPrinter.ALIGN.CENTER,
    });
    await BluetoothEscposPrinter.printQRCode(qrData, 6, BluetoothEscposPrinter.ERROR_CORRECTION.M);

    // 6. Footer
    await BluetoothEscposPrinter.printText("\nThank you for visiting!\n\r\n\r", {
      encoding: "GBK",
      align: BluetoothEscposPrinter.ALIGN.CENTER,
    });

  } catch (err) {
    console.warn(err);
    Alert.alert("Printing failed", String(err));
  }
};




  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title={loading ? "Scanning..." : "Scan Devices"} onPress={scanDevices} disabled={loading} />

      {devices.length === 0 && !loading ? (
        <Text style={{ marginTop: 20, textAlign: "center", color: "gray" }}>
          No devices found. Tap "Scan Devices" to search again.
        </Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item: any) => item.address}
          renderItem={({ item }) => (
            <Button
             title={`Connect: ${item.name || item.address}`}
              onPress={() => connectPrinter(item.address)}
            />
          )}
          style={{ marginTop: 20 }}
        />
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Print Test Receipt" onPress={printReceipt} />
      </View>
    </View>
  );
};

export default Printer;
