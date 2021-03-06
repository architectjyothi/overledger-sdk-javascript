"use strict";
exports.__esModule = true;
/**
 * Transform the string first letter to uppercase
 *
 * @param {string} str
 */
function ucFirst(str) {
    if (str.length > 0) {
        return str[0].toUpperCase() + str.substring(1);
    }
    return str;
}
exports["default"] = ucFirst;
