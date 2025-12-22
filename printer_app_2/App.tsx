/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Dimensions, StatusBar, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import "./global.css";
import ShopSetupScreen from "./src/screens/ShopType";
import LoginScreen from "./src/screens/auth/Login";
import RegisterScreen from "./src/screens/auth/Register";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPassword";
import OtpScreen from "./src/screens/auth/OTP";
import BottomTabs from "./src/components/Nav/BottomNav";
import { NavigationContainer, DefaultTheme, DarkTheme, useRoute } from "@react-navigation/native";
import TopBottomNav from "./src/layouts/TopBottomNav";
import KeypadScreen from "./src/screens/counter/keypad/Keypad";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "./src/screens/dashboard/Dashboard";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import AddProduct from "./src/screens/dashboard/product/add";
import ProductList from "./src/screens/dashboard/product/list";
import Toast from "react-native-toast-message";
import { useToastConfig } from "./src/widgets/CustomToast";
import { persistor, store } from "./src/redux/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemedText } from "./src/widgets/ThemeText";
import CategoryList from "./src/screens/dashboard/category/list";
import AddCategory from "./src/screens/dashboard/category/add";
import AddBrand from "./src/screens/dashboard/brand/add";
import BrandList from "./src/screens/dashboard/brand/list";
import useAuth from "./src/hooks/useAuth";
import { Spinner } from "./components/ui/spinner";
import { setUser } from "./src/redux/slices/userSlice";
import { realmConfig } from "./src/database/RealmConfig";
import { RealmProvider, useRealm } from "@realm/react";
import { useOnlineStatus } from "./src/hooks/useOnlineStatus";
import { useEffect, useState } from "react";
import { initializeOfflineSync } from "./src/database/offlineSyncHandler";
import { syncCategories } from "./src/database/services/category.service";
import { syncProducts } from "./src/database/services/productService";
import TransactionList from "./src/screens/dashboard/transaction/list";
import BackupSettingsScreen from "./src/screens/auth/BackupSettings";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";
import Providers from "./src/providers";
import ConnectPrinter from "./src/components/Nav/ConnectPrinter";
import { createNavigationContainerRef } from "@react-navigation/native";
import { useTrackRoute } from "./src/hooks/useTrackRoute";
import ProfileScreen from "./src/screens/dashboard/profile/ProfileScreen";
import TransactionDetails from "./src/screens/dashboard/transaction/details";
import ChangePIN from "./src/screens/auth/ChangePIN";
import CounterScreen from "./src/screens/counter";
import Settings from "./src/screens/dashboard/settings";
// import Config from "react-native-config";

const notToshowTopBar = ["BackupSettings"];

export const navigationRef = createNavigationContainerRef();

export let currentRouteName = "";

export function onNavigationReady() {
  currentRouteName = navigationRef.getCurrentRoute()?.name || "";
}

export function onNavigationStateChange() {
  currentRouteName = navigationRef.getCurrentRoute()?.name || "";
}

GoogleSignin.configure({
  scopes: ["https://www.googleapis.com/auth/drive.file"],
  webClientId: "391322722774-3cb1h9ifi3klf7i2e8o7sv8mn4dfh186.apps.googleusercontent.com",
  offlineAccess: true, // optional but recommended for refresh tokens
  forceCodeForRefreshToken: true, // <-- VERY IMPORTANT
});
// console.log("ENV CONFIG:", Config);
// console.log("WEB CLIENT ID:", Config?.WEB_CLIENT_ID);
// import { config } from '@gluestack-ui/config';

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0F1112", // black / dark background
    // card: "#232526",       // tab bar bg
    // text: "#FFFFFF",       // default text color
  },
};

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <Provider store={store}>
      <PersistGate loading={<ThemedText>Store Loading...</ThemedText>} persistor={persistor}>
        <GluestackUIProvider mode={"dark"}>
          {/* <OverlayProvider> */}

          <SafeAreaProvider>
            {/* <SafeAreaView style={{ flex: 1 }}> */}
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <RealmProvider {...realmConfig}>
              <AppContent />
            </RealmProvider>

            {/* </SafeAreaView> */}
          </SafeAreaProvider>
          {/* </OverlayProvider> */}
        </GluestackUIProvider>
      </PersistGate>
    </Provider>
  );
}

function AppContent() {
  useTrackRoute();
  const toastConfig = useToastConfig();

  // const { isAuth, loading } = useAuth();
  const isOnline = useOnlineStatus();
  const realm = useRealm();
  const { currentRouteName } = useSelector((state: any) => state.common);

  const dispatch = useDispatch();

  const { user } = useSelector((State: any) => State.user);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const syncAndFetch = async () => {
      try {
        // await syncCategories(realm);
        // await syncProducts(realm);
        // await syncUpdatedCategoriesToServer(realm);
        // await syncDeletedCategoriesToServer(realm);
        // await syncCategoriesToServer(realm); // PUSH offline → server
        // await fetchAndStoreServerCategories(realm); // PULL server → local
      } catch (error) {}
    };

    // if (hasPendingCategoryChanges(realm)) {
    syncAndFetch();
    // }
  }, [isOnline, realm]);

  useEffect(() => {
    if (user) {
      const expirationTime = user.loginTime + user.expiresIn * 1000; // convert sec → ms
      const isExpired = Date.now() > expirationTime;

      if (isExpired) {
        dispatch(setUser({ user: null }));
      }
    }
  }, [user, dispatch]);

  // useEffect(() => {
  //   if (isAuth !== null && !isAuth) {
  //     dispatch(setUser({ user: null }));
  //   }
  // }, [dispatch, isAuth]);

  // if (loading)
  //   return (
  //     <View className={`bg-base-100 flex justify-center items-center h-full`}>
  //       <Spinner size="large" />
  //     </View>
  //   );

  return (
    <View style={styles.container} className={`bg-base-100`}>
      {/* <View  className="absolute top-3 z-[99999] w-full flex-1 justify-center items-center">
        <ThemedText>Width: {dimensions.width}</ThemedText>
        <ThemedText>Height: {dimensions.height}</ThemedText>
      </View> */}
      {user && !notToshowTopBar.includes(currentRouteName) && <ConnectPrinter />}
      <NavigationContainer theme={MyTheme} ref={navigationRef} onReady={onNavigationReady} onStateChange={onNavigationStateChange}>
        <Stack.Navigator
          initialRouteName={user ? (!user?.email ? "BackupSettings" : "Counter") : "Login"}
          screenOptions={{
            headerShown: false, // hide top bar
          }}
        >
          <Stack.Screen name="ConnectPrinter" component={ConnectPrinter} />
          <Stack.Screen name="ShopSetup" component={ShopSetupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Change PIN" component={ChangePIN} />
          <Stack.Screen name="BackupSettings" component={BackupSettingsScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
         

          {/* Dashboard */}
          {/* <Stack.Screen name="DashboardHome" component={DashboardScreen} /> */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={Settings} />
           <Stack.Screen name="Counter" component={CounterScreen} />
          <Stack.Screen name="Brand List" component={BrandList} />
          <Stack.Screen name="Add Brand" component={AddBrand} />
          <Stack.Screen name="Category List" component={CategoryList} />
          <Stack.Screen name="Add Category" component={AddCategory} />
          <Stack.Screen name="Product List" component={ProductList} />
          <Stack.Screen name="Bill List" component={TransactionList} />
          <Stack.Screen name="Bills Details" component={TransactionDetails} />
          <Stack.Screen name="Add Product" component={AddProduct} />
          <Stack.Screen name="Edit Product" component={AddProduct} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />

      {user && <Providers />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
