import {
  TurboModuleRegistry,
  type CodegenTypes,
  type TurboModule,
} from 'react-native';

export type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** All values are density-independent pixels. */
export type WindowInsets = {
  statusBar: EdgeInsets;
  navigationBar: EdgeInsets;
  displayCutout: EdgeInsets;
};

export type ActiveBars = {
  /** The `barsId` of the wrapper in charge of the window, -1 when none is. */
  barsId: CodegenTypes.Int32;
  /** Wrappers in a window of their own, such as inside a Modal. */
  foreignBarsIds: ReadonlyArray<CodegenTypes.Int32>;
};

export interface Spec extends TurboModule {
  getInsets(): WindowInsets;
  getActiveBars(): ActiveBars;

  readonly onInsetsChange: CodegenTypes.EventEmitter<WindowInsets>;
  readonly onActiveBarsChange: CodegenTypes.EventEmitter<ActiveBars>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('WindowSystemBars');
