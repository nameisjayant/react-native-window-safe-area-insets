#import <React/RCTInitializing.h>
#import <React/RCTInvalidating.h>
#import <WindowSafeAreaInsetsSpec/WindowSafeAreaInsetsSpec.h>

@class SystemBarsAnchorView;

NS_ASSUME_NONNULL_BEGIN

/**
 * Owns the window side of `SystemBarsAnchorView`.
 *
 * iOS has no API for bar colors, so the JS component paints them, as it does on
 * Android. That leaves this module with the parts only UIKit has: the status bar
 * style and the insets. The home indicator picks its own color.
 *
 * The anchor methods must be called on the main thread.
 */
@interface WindowSystemBars : NativeWindowSystemBarsSpecBase <NativeWindowSystemBarsSpec, RCTInitializing, RCTInvalidating>

/** The module of the running React instance. Component views cannot look it up. */
@property (class, nonatomic, readonly, nullable) WindowSystemBars *current;

- (void)anchorShown:(SystemBarsAnchorView *)anchor;
- (void)anchorHidden:(SystemBarsAnchorView *)anchor;
- (void)anchorIconsChanged:(SystemBarsAnchorView *)anchor;

@end

NS_ASSUME_NONNULL_END
