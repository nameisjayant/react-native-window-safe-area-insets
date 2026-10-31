import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';
import { SystemBarsView, useWindowInsets } from '../SystemBarsView';

describe('SystemBarsView off Android', () => {
  it('passes view props on and keeps bar props off the view', () => {
    const element = SystemBarsView({
      children: <Text>child</Text>,
      statusBarColor: 'red',
      navigationBarColor: 'blue',
      fullScreen: true,
      statusBarStyle: 'dark-content',
      navigationBarStyle: 'light-content',
      testID: 'bars',
    });

    expect(element.props.testID).toBe('bars');
    expect(element.props.children).toBeDefined();
    for (const prop of [
      'statusBarColor',
      'navigationBarColor',
      'fullScreen',
      'statusBarStyle',
      'navigationBarStyle',
    ]) {
      expect(element.props).not.toHaveProperty(prop);
    }
  });

  it('reports zero insets', () => {
    const zero = { top: 0, right: 0, bottom: 0, left: 0 };
    expect(useWindowInsets()).toEqual({
      statusBar: zero,
      navigationBar: zero,
      displayCutout: zero,
    });
  });
});
