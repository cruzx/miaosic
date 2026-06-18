export async function setupNativeBridge() {
  if (typeof window === "undefined") return;
  if (!window.Capacitor?.isNativePlatform?.()) return;

  try {
    const [{ StatusBar, Style }, { Keyboard }, { App }, { Haptics, ImpactStyle }] = await Promise.all([
      import("@capacitor/status-bar"),
      import("@capacitor/keyboard"),
      import("@capacitor/app"),
      import("@capacitor/haptics")
    ]);

    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: true });
    await Keyboard.setResizeMode({ mode: "body" });

    document.documentElement.classList.add("native-capacitor");

    window.__meowNative = {
      App,
      Keyboard,
      StatusBar,
      Haptics,
      impact(style = ImpactStyle.Light) {
        return Haptics.impact({ style });
      }
    };
  } catch (error) {
    console.warn("Capacitor bridge setup skipped:", error);
  }
}
