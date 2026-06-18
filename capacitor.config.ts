import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cruzx.miaosic",
  appName: "Miaosic",
  webDir: "dist",
  bundledWebRuntime: false,
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0f2530"
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      overlaysWebView: true,
      backgroundColor: "#0f2530"
    }
  }
};

export default config;
