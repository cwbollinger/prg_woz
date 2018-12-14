import $ from 'jquery';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/slider';
import 'foundation-sites/js/foundation.core';
import 'foundation-sites/js/foundation.util.keyboard';
import { Triggers } from 'foundation-sites/js/foundation.util.triggers';
import 'foundation-sites/js/foundation.util.mediaQuery';
import 'foundation-sites/js/foundation.util.motion';
import { Reveal } from 'foundation-sites/js/foundation.reveal';
import adapter from 'webrtc-adapter';
import { init, updateEditTable, saveButtonActions, loadButtonActions } from './customize.js';

window.adapter = adapter;
window.$ = window.jQuery = $;

Foundation.addToJquery($);
Triggers.init($, Foundation);
Foundation.plugin(Reveal, 'Reveal');

$(document).foundation();

document.addEventListener("DOMContentLoaded", (event) => {
  const modalDiv = $('#editModal');
  let reveal = new Reveal(modalDiv);
  $('#button-edit').click(()=>{
    updateEditTable();
    reveal.open();
  });

  $('#save-mapping').click(()=>{
    reveal.close();
    saveButtonActions();
  });

  $('#load-mapping').click(()=>{
    reveal.close();
    loadButtonActions();
  });


  $("#chat-input").blur(function(event) {
      const target = event.relatedTarget;
      if(target == null || target.tagName.toUpperCase() != "INPUT") {
          setTimeout(function() { $("#chat-input").focus(); }, 10);
      }
  });
  $("#chat-input").focus();
  init();
});
