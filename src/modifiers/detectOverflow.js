// @flow
import type { ModifierArguments, Modifier } from '../types';
import getBoundingClientRect from '../dom-utils/getBoundingClientRect';
import getClippingParent from '../dom-utils/getClippingParent';
import getDocumentRect from '../dom-utils/getDocumentRect';
import getDocumentElement from '../dom-utils/getDocumentElement';
import computeOffsets from '../utils/computeOffsets';
import rectToClientRect from '../utils/rectToClientRect';

type Options = {
  boundaryElement: HTMLElement,
};

// if the number is positive, the popper is overflowing by that number of pixels
// when 0, or negative, the popper is within its boundaries
type ModifierData = {
  top: number,
  bottom: number,
  right: number,
  left: number,
};

export function detectOverflow({
  state,
  options = {
    boundaryElement: getClippingParent(state.elements.popper),
  },
  setOwnData,
}: ModifierArguments<Options>) {
  const popperElement = state.elements.popper;
  const referenceElement = state.elements.reference;
  const popperRect = state.measures.popper;
  const documentElement = getDocumentElement(options.boundaryElement);

  if (!options.boundaryElement.contains(popperElement)) {
    if (__DEV__) {
      console.error(
        'Popper: "detectOverflow" can accept as `boundaryElement` only a parent node of the provided popper.'
      );
    }
    return state;
  }

  const boundaryClientRect =
    documentElement === options.boundaryElement
      ? rectToClientRect(getDocumentRect(documentElement))
      : getBoundingClientRect(options.boundaryElement);

  const referenceClientRect = getBoundingClientRect(referenceElement);

  const popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: state.placement,
    scroll: {
      scrollTop: 0,
      scrollLeft: 0,
    },
  });

  const popperClientRect = rectToClientRect({
    ...popperRect,
    ...popperOffsets,
  });

  setOwnData(
    ({
      top: boundaryClientRect.top - popperClientRect.top,
      bottom: popperClientRect.bottom - boundaryClientRect.bottom,
      left: boundaryClientRect.left - popperClientRect.left,
      right: popperClientRect.right - boundaryClientRect.right,
    }: ModifierData)
  );

  return state;
}

export default ({
  name: 'detectOverflow',
  enabled: true,
  phase: 'read',
  fn: detectOverflow,
  requires: ['popperOffsets'],
  data: {},
}: Modifier<Options>);
