// @flow
import {
  basePlacements,
  top,
  left,
  right,
  bottom,
  surfaces,
  edges,
  center,
} from '../enums';
import type { Tether } from '../enums';
import type { ModifierArguments, Modifier, Padding } from '../types';
import getBasePlacement from '../utils/getBasePlacement';
import getMainAxisFromPlacement from '../utils/getMainAxisFromPlacement';
import getAltAxis from '../utils/getAltAxis';
import mergePaddingObject from '../utils/mergePaddingObject';
import expandToHashMap from '../utils/expandToHashMap';
import within from '../utils/within';

type Options = {
  /* Prevents boundaries overflow on the main axis */
  mainAxis: boolean,
  /* Prevents boundaries overflow on the alternate axis */
  altAxis: boolean,
  /**
   * Allows the popper to overflow from its boundaries to keep it near its reference element:
   * - false: popper can never overflow, will detach from reference to stay visible;
   * - "center": popper can overflow once the center of the popper is at the edge of the reference;
   * - "edges": popper can overflow once the opposite edges are level;
   * - "surfaces":  popper can overflow once the surfaces are level;
   */
  tether: Tether,
  /* Sets a padding to the provided boundary */
  padding: Padding,
};

export function preventOverflow({
  state,
  options = {},
  getModifierData,
}: ModifierArguments<Options>) {
  const {
    mainAxis: checkMainAxis = true,
    altAxis: checkAltAxis = false,
    tether = center,
    padding = 0,
  } = options;
  const overflow = getModifierData('detectOverflow');
  const basePlacement = getBasePlacement(state.placement);
  const mainAxis = getMainAxisFromPlacement(basePlacement);
  const altAxis = getAltAxis(mainAxis);
  const popperOffsets = getModifierData('popperOffsets');
  const referenceRect = state.measures.reference;
  const popperRect = state.measures.popper;
  const paddingObject = mergePaddingObject(
    typeof padding !== 'number'
      ? padding
      : expandToHashMap(padding, basePlacements)
  );

  if (checkMainAxis) {
    const mainSide = mainAxis === 'y' ? top : left;
    const altSide = mainAxis === 'y' ? bottom : right;
    const len = mainAxis === 'y' ? 'height' : 'width';
    const offset = popperOffsets[mainAxis];

    const min =
      popperOffsets[mainAxis] + overflow[mainSide] + paddingObject[mainSide];
    const max =
      popperOffsets[mainAxis] - overflow[altSide] - paddingObject[altSide];

    const additive =
      tether === surfaces
        ? popperRect[len] / 2
        : tether === edges
        ? -popperRect[len] / 2
        : 0;

    const tetherMin =
      popperOffsets[mainAxis] - referenceRect[len] / 2 + additive;
    const tetherMax =
      popperOffsets[mainAxis] + referenceRect[len] / 2 - additive;

    const lenCondition =
      referenceRect[len] > popperRect[len] || tether !== surfaces;

    // FIXME: find a proper API to modify these
    state.modifiersData.popperOffsets[mainAxis] = within(
      tether ? Math.min(min, lenCondition ? tetherMax : tetherMin) : min,
      offset,
      tether ? Math.max(max, lenCondition ? tetherMin : tetherMax) : max
    );
  }

  if (checkAltAxis) {
    const mainSide = mainAxis === 'x' ? top : left;
    const altSide = mainAxis === 'x' ? bottom : right;

    // FIXME: find a proper API to modify these
    state.modifiersData.popperOffsets[altAxis] = within(
      popperOffsets[altAxis] + overflow[mainSide] + paddingObject[mainSide],
      popperOffsets[altAxis],
      popperOffsets[altAxis] - overflow[altSide] - paddingObject[altSide]
    );
  }

  return state;
}

export default ({
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requires: ['detectOverflow'],
}: Modifier<Options>);
