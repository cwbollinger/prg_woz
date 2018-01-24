import $ from 'jquery';
window.$ = window.jQuery = $;
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/slider';
import { Foundation } from 'foundation-sites/js/foundation.core';
Foundation.addToJquery($);
import adapter from 'webrtc-adapter';
window.adapter = adapter;
import init from './customize.js';

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
