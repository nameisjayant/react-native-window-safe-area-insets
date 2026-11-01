#import <React/RCTViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * An invisible view rendered by every `SystemBarsView`.
 *
 * The status bar style belongs to the app, and the app has one wrapper it
 * follows: the one on screen. React cannot say which that is, because inactive
 * tabs and screens stay mounted. This view can, since navigators detach them,
 * `display: none` unmounts them, and either way it leaves the window.
 */
@interface SystemBarsAnchorView : RCTViewComponentView

@property (nonatomic, readonly) int barsId;
@property (nonatomic, readonly) BOOL darkStatusBarIcons;

@end

NS_ASSUME_NONNULL_END
