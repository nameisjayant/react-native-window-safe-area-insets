package com.windowsafeareainsets

import android.content.Context
import android.view.View
import android.view.WindowInsets
import com.facebook.react.uimanager.ThemedReactContext

/**
 * An invisible view rendered by every `SystemBarsView`.
 *
 * Bar icon colors belong to the window, and a window has one wrapper it follows: the one on
 * screen. React cannot say which that is, because inactive tabs and screens stay mounted. This view
 * can, since navigators detach them or hide them, and either way it stops being shown.
 */
class SystemBarsAnchorView(context: Context) : View(context) {

  var barsId: Int = 0

  var darkStatusBarIcons: Boolean = false
    set(value) {
      field = value
      notifyIconsChanged()
    }

  var darkNavigationBarIcons: Boolean = false
    set(value) {
      field = value
      notifyIconsChanged()
    }

  private val module: WindowSystemBarsModule?
    get() =
      (context as? ThemedReactContext)
        ?.reactApplicationContext
        ?.getNativeModule(WindowSystemBarsModule::class.java)

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    syncShown()
  }

  override fun onDetachedFromWindow() {
    module?.onAnchorHidden(this)
    super.onDetachedFromWindow()
  }

  /** Also called when an ancestor changes visibility, which is how `display: none` arrives. */
  override fun onVisibilityChanged(changedView: View, visibility: Int) {
    super.onVisibilityChanged(changedView, visibility)
    if (isAttachedToWindow) {
      syncShown()
    }
  }

  private fun syncShown() {
    if (isShown) {
      module?.onAnchorShown(this)
    } else {
      module?.onAnchorHidden(this)
    }
  }

  override fun onApplyWindowInsets(insets: WindowInsets): WindowInsets {
    // Posted because the root insets are only up to date once this dispatch is over.
    post { module?.publishInsets() }
    return super.onApplyWindowInsets(insets)
  }

  private fun notifyIconsChanged() {
    if (isAttachedToWindow) {
      module?.onAnchorIconsChanged(this)
    }
  }
}
