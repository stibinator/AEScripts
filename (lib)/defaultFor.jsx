// @target aftereffects
function defaultFor(arg, val, replaceNullandEmptyVals) { //eslint-disable-line no-unused-vars
  if (replaceNullandEmptyVals) {
    return ((typeof(arg) !== 'undefined') || (arg === null) || (arg === [])) ? val : arg;
  }
  return (typeof(arg) !== 'undefined') ? arg : val;
}
