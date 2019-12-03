// @flow
import type { Modifier, ModifierArguments } from '../types';
import getNodeName from '../dom-utils/getNodeName';
import getWindow from '../dom-utils/getWindow';

// This modifier takes the styles prepared by the `computeStyles` modifier
// and applies them to the HTMLElements such as popper and arrow

export function applyStyles({
  state,
  getModifierData,
}: ModifierArguments<void>) {
  const data = getModifierData('computeStyles');

  Object.keys(state.elements).forEach(name => {
    const style = data.styles[name] || {};

    const attributes = data.attributes[name] || {};
    const element = state.elements[name];

    // arrow is optional + virtual elements
    if (
      !(element instanceof getWindow(element).HTMLElement) ||
      !getNodeName(element)
    ) {
      return;
    }

    Object.assign(element.style, style);

    Object.entries(attributes).forEach((args: [string, any]) =>
      element.setAttribute(...args)
    );
  });

  return state;
}

export function onDestroy({ state, getModifierData }: ModifierArguments<void>) {
  const data = getModifierData('computeStyles');

  Object.keys(state.elements).forEach(name => {
    const element = state.elements[name];
    const styleProperties = Object.keys(
      data.styles.hasOwnProperty(name) ? { ...data.styles[name] } : {}
    );
    const attributes = data.attributes[name] || {};

    // Set all values to an empty string to unset them
    const style = styleProperties.reduce(
      (style, property) => ({
        ...style,
        [String(property)]: '',
      }),
      {}
    );

    // arrow is optional + virtual elements
    if (
      !(element instanceof getWindow(element).HTMLElement) ||
      !getNodeName(element)
    ) {
      return;
    }

    // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowIgnore
    Object.assign(element.style, style);

    Object.keys(attributes).forEach(attribute =>
      element.removeAttribute(attribute)
    );
  });
}

export default ({
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  onDestroy,
  requires: ['computeStyles'],
}: Modifier<void>);
