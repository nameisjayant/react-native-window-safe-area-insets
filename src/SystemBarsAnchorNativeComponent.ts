import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  barsId: CodegenTypes.Int32;
  /** True when the status bar sits on a light color and needs dark icons. */
  darkStatusBarIcons: boolean;
  /** True when the navigation bar sits on a light color and needs dark icons. */
  darkNavigationBarIcons: boolean;
}

export default codegenNativeComponent<NativeProps>('SystemBarsAnchor');
