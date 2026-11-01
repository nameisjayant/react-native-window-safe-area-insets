# react-native-window-safe-area-insets

Read window safe area insets in React Native

## Installation


```sh
npm install react-native-window-safe-area-insets
```


## Usage

`SystemBarsView` is a parent view. It keeps its children clear of the status bar, the navigation bar and the display cutout, and colors those bars.

```jsx
import { SystemBarsView } from 'react-native-window-safe-area-insets';

export default function App() {
  return (
    <SystemBarsView statusBarColor="#1565C0" navigationBarColor="#2E7D32">
      <Navigation />
    </SystemBarsView>
  );
}
```

### Different bars per screen

Wrap a screen on its own, or put one wrapper in `App.js` and another in each screen that differs. The screen's props win while it is on screen, and any prop it leaves out comes from the wrapper above it.

```jsx
function ProfileScreen() {
  return (
    <SystemBarsView statusBarColor="#FFEB3B">
      <Profile />
    </SystemBarsView>
  );
}
```

If you have a tab bar outside your screens, keep a wrapper in `App.js`, around the navigator. Without one, the navigation bar padding lands above the tab bar instead of below it.

### Full screen

By default content stops below the status bar. `fullScreen` draws it behind the status bar and the display cutout instead. The status bar stays visible, and content still stops at the navigation bar.

```jsx
<SystemBarsView fullScreen>
  <Image source={photo} style={StyleSheet.absoluteFill} />
</SystemBarsView>
```

### Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `statusBarColor` | color | background of `style` | Ignored while `fullScreen` is on. |
| `navigationBarColor` | color | background of `style` | |
| `fullScreen` | boolean | `false` | Draw content behind the status bar and the cutout. |
| `statusBarStyle` | `auto`, `dark-content`, `light-content` | `auto` | Icon color. `auto` picks whichever is readable. |
| `navigationBarStyle` | `auto`, `dark-content`, `light-content` | `auto` | On Android 7 the icons are always light, so a light bar is dimmed to keep them visible. No effect on iOS. |
| `style` | view style | | Applied to the view holding the children. |

`useWindowInsets()` returns the current `statusBar`, `navigationBar` and `displayCutout` insets, for example to keep a header clear of the status bar in `fullScreen`.

### Android notes

- Requires the New Architecture. Android support follows React Native's own minimum, which is Android 7 (API 24) on React Native 0.88.
- The window stays edge-to-edge from the first time a `SystemBarsView` mounts, so wrap every screen, or wrap once in `App.js`.
- Avoid `StatusBar` from React Native for `barStyle` alongside this component. Both set the same window state.

### iOS notes

- Requires the New Architecture.
- The navigation bar is the area around the home indicator. `navigationBarColor` colors that area, and on iPhones with a home button there is nothing to color. iOS picks the color of the indicator itself.
- `displayCutout` is the safe area on the top, left and right, so it covers the notch and the Dynamic Island.
- `statusBarStyle` needs `UIViewControllerBasedStatusBarAppearance` set to `NO` in `Info.plist`, as the React Native template does. With `YES`, iOS ignores it and a warning is logged.
- Avoid `StatusBar` from React Native for `barStyle` alongside this component. Both set the same app state.
- Inside a `Modal`, `statusBarStyle` has no effect. iOS keeps its default icon color while a Modal is up, so choose a `statusBarColor` that works with it. `statusBarColor` itself works as usual.
- Insets are those of the window, so a `Modal` shown as a `pageSheet` or `formSheet` gets more padding than it needs. Modals that cover the screen are fine.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
