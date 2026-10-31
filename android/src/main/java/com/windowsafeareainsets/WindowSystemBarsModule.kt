package com.windowsafeareainsets

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowManager
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.views.view.isEdgeToEdgeFeatureFlagOn
import com.facebook.react.views.view.setEdgeToEdgeFeatureFlagOn

/**
 * Owns the window side of [SystemBarsAnchorView].
 *
 * The bars are made transparent and the JS component paints their colors, because
 * `Window.setStatusBarColor` does nothing on Android 15+ for apps targeting 35+. That leaves
 * this module with the parts only the window has: edge-to-edge layout, bar icon colors, and insets.
 */
@ReactModule(name = WindowSystemBarsModule.NAME)
class WindowSystemBarsModule(reactContext: ReactApplicationContext) :
  NativeWindowSystemBarsSpec(reactContext), LifecycleEventListener {

  /** On-screen anchors in the activity window, newest last. The last one is in charge. */
  private val anchors = ArrayList<SystemBarsAnchorView>()

  /** On-screen anchors in another window, such as a Modal's. */
  private val foreignAnchors = ArrayList<SystemBarsAnchorView>()

  private var lastInsets: Insets3? = null
  private var lastActiveBars: List<Int>? = null

  @Volatile private var insetsSnapshot: Insets3? = null

  @Volatile private var activeBarsSnapshot = listOf(NO_BARS)

  private var observedDecorView: View? = null
  private val onDecorLayout =
    View.OnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> publishInsets() }

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun invalidate() {
    reactApplicationContext.removeLifecycleEventListener(this)
    UiThreadUtil.runOnUiThread {
      observedDecorView?.removeOnLayoutChangeListener(onDecorLayout)
      observedDecorView = null
      anchors.clear()
      foreignAnchors.clear()
    }
    super.invalidate()
  }

  override fun getInsets(): WritableMap {
    val insets = insetsSnapshot ?: reactApplicationContext.currentActivity?.let(::readInsets)
    return (insets ?: Insets3.ZERO).toWritableMap()
  }

  override fun getActiveBars(): WritableMap = activeBarsToMap(activeBarsSnapshot)

  override fun onHostResume() {
    // The activity can differ from the last resume, and the window state goes with it.
    if (anchors.isNotEmpty()) {
      prepareWindow()
      applyIconColors()
    }
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() = Unit

  fun onAnchorShown(anchor: SystemBarsAnchorView) {
    UiThreadUtil.assertOnUiThread()
    if (anchor in anchors || anchor in foreignAnchors) return
    prepareWindow()

    // A wrapper inside a Modal lives in the Modal's own window. It must not take
    // the activity window's bars away from the screen behind it.
    val activity = reactApplicationContext.currentActivity
    if (anchor.rootView === activity?.window?.decorView) {
      anchors.add(anchor)
    } else {
      foreignAnchors.add(anchor)
    }
    anchorsChanged()
  }

  fun onAnchorHidden(anchor: SystemBarsAnchorView) {
    UiThreadUtil.assertOnUiThread()
    if (anchors.remove(anchor) or foreignAnchors.remove(anchor)) {
      anchorsChanged()
    }
  }

  fun onAnchorIconsChanged(anchor: SystemBarsAnchorView) {
    UiThreadUtil.assertOnUiThread()
    if (anchors.lastOrNull() === anchor) {
      applyIconColors()
    }
  }

  fun publishInsets() {
    UiThreadUtil.assertOnUiThread()
    val activity = reactApplicationContext.currentActivity ?: return
    val insets = readInsets(activity) ?: return
    insetsSnapshot = insets
    if (insets != lastInsets) {
      lastInsets = insets
      emitOnInsetsChange(insets.toWritableMap())
    }
  }

  private fun anchorsChanged() {
    applyIconColors()
    publishInsets()

    // The active id comes first, the foreign ids follow.
    val activeBars =
      listOf(anchors.lastOrNull()?.barsId ?: NO_BARS) + foreignAnchors.map { it.barsId }
    activeBarsSnapshot = activeBars
    if (activeBars != lastActiveBars) {
      lastActiveBars = activeBars
      emitOnActiveBarsChange(activeBarsToMap(activeBars))
    }
  }

  private fun activeBarsToMap(activeBars: List<Int>): WritableMap =
    Arguments.createMap().apply {
      putInt("barsId", activeBars.first())
      putArray("foreignBarsIds", Arguments.fromList(activeBars.drop(1)))
    }

  private fun applyIconColors() {
    val window = reactApplicationContext.currentActivity?.window ?: return
    val anchor = anchors.lastOrNull() ?: return
    WindowCompat.getInsetsController(window, window.decorView).run {
      isAppearanceLightStatusBars = anchor.darkStatusBarIcons
      isAppearanceLightNavigationBars = anchor.darkNavigationBarIcons
    }
  }

  private fun prepareWindow() {
    val activity = reactApplicationContext.currentActivity ?: return
    if (activity.isFinishing || activity.isDestroyed) return
    val window = activity.window ?: return

    // Keeps React Native's own measurements (Dimensions, Modal, viewport offsets)
    // in step when the app has not set edgeToEdgeEnabled=true. It has no off switch,
    // so the window stays edge-to-edge once a wrapper has mounted.
    if (!isEdgeToEdgeFeatureFlagOn) {
      setEdgeToEdgeFeatureFlagOn()
    }

    window.drawEdgeToEdge()

    val decorView = window.decorView
    if (observedDecorView !== decorView) {
      observedDecorView?.removeOnLayoutChangeListener(onDecorLayout)
      decorView.addOnLayoutChangeListener(onDecorLayout)
      observedDecorView = decorView
    }
  }

  @Suppress("DEPRECATION")
  private fun Window.drawEdgeToEdge() {
    WindowCompat.setDecorFitsSystemWindows(this, false)

    // A theme with windowTranslucentStatus/Navigation would otherwise keep its scrim.
    clearFlags(
      WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS or
        WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION
    )
    addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)

    // No-ops on Android 15+ for apps targeting 35+, where the bars are already transparent.
    statusBarColor = Color.TRANSPARENT
    navigationBarColor = Color.TRANSPARENT

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      // Without these the system draws its own scrim over the painted colors.
      isStatusBarContrastEnforced = false
      isNavigationBarContrastEnforced = false
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      val mode =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
        } else {
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }
      if (attributes.layoutInDisplayCutoutMode != mode) {
        attributes = attributes.apply { layoutInDisplayCutoutMode = mode }
      }
    }
  }

  private fun readInsets(activity: Activity): Insets3? {
    val decorView = activity.window?.peekDecorView() ?: return null
    val insets = ViewCompat.getRootWindowInsets(decorView) ?: return null
    return Insets3(
      statusBar =
        insets.getInsets(
          WindowInsetsCompat.Type.statusBars() or WindowInsetsCompat.Type.captionBar()
        ),
      navigationBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars()),
      displayCutout = insets.getInsets(WindowInsetsCompat.Type.displayCutout()),
    )
  }

  private data class Insets3(
    val statusBar: Insets,
    val navigationBar: Insets,
    val displayCutout: Insets,
  ) {
    fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putMap("statusBar", statusBar.toWritableMap())
        putMap("navigationBar", navigationBar.toWritableMap())
        putMap("displayCutout", displayCutout.toWritableMap())
      }

    private fun Insets.toWritableMap(): ReadableMap =
      Arguments.createMap().apply {
        putDouble("top", PixelUtil.toDIPFromPixel(top.toFloat()).toDouble())
        putDouble("right", PixelUtil.toDIPFromPixel(right.toFloat()).toDouble())
        putDouble("bottom", PixelUtil.toDIPFromPixel(bottom.toFloat()).toDouble())
        putDouble("left", PixelUtil.toDIPFromPixel(left.toFloat()).toDouble())
      }

    companion object {
      val ZERO = Insets3(Insets.NONE, Insets.NONE, Insets.NONE)
    }
  }

  companion object {
    const val NAME = NativeWindowSystemBarsSpec.NAME
    private const val NO_BARS = -1
  }
}
