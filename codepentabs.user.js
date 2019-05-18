// ==UserScript==
// @name		Codepen Tabs
// @version		1.20190518.8
// @description		Replaces Codepen.io resizable code editors with editor tabs
// @author		rovyko
// @namespace		https://github.com/rovyko/codepen-tabs
// @downloadURL		https://github.com/rovyko/codepen-tabs/raw/master/codepentabs.user.js
// @updateURL		https://github.com/rovyko/codepen-tabs/raw/master/codepentabs.user.js
// @grant		none
// @include		/https?:\/\/codepen\.io\/(?:[^\/]*\/)?pen/
// ==/UserScript==

/*
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// configuration
const prefix = "cdpntb";
// query selectors
const qs = {
  editorWrapper: ".top-boxes.editor-parent",
  editors: ".box",
  resizerNode: ".editor-resizer",
  dragHandleNode: ".powers-drag-handle",
  inputNode: "input",
  labelNode: "label",
  nameNode: ".box-title-name",
  contentNode: `.${prefix}-content`,
}

// add global style
const styler = document.createElement("style");
styler.innerHTML = 
`
.${prefix}-noselect {
	/* https://stackoverflow.com/a/4407335 */
	-webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none
  user-select: none;
}

.${prefix}-wrap {
	height: 100%;
	width: 100%;
}

.${prefix}-tabs {
	position: relative;
	min-height: 100%;
	clear: both;
}

.${prefix}-tab {
	float: left;
}

.${prefix}-tab label {
  background: #444857;
	padding: 8px 20px;
	margin-left: -1px;
	position: relative;
	top: 6px;
	left: 1px;
}

.${prefix}-tab > input[type=radio] {
	display: none;
}

.${prefix}-content {
	position: absolute;
	top: 31px;
	left: 0;
	background: #1a1b1f;
	right: 0;
	bottom: 0;
	visibility: hidden;
}

.${prefix}-tab > input[type=radio]:checked ~ label {
  background: #17181c;
  border-bottom: 1px solid #1a1b1f;
  z-index: 2;
}

.${prefix}-tab > input[type=radio]:checked ~ .${prefix}-content {
	visibility: visible;
}
`;
document.head.appendChild(styler);

// setup tabs template
const tempTab = document.createElement("template");
tempTab.innerHTML =
`
<div class="${prefix}-tab">
    <input type="radio" name="${prefix}-tabgroup">
    <label class="${prefix}-noselect"></label>
    <div class="${prefix}-content"></div>
</div>
`;

// find current nodes
const editorWrapper = document.querySelector(qs.editorWrapper);
const editors = editorWrapper.querySelectorAll(qs.editors);

// remove editor resizers
const resizers = editorWrapper.querySelectorAll(qs.resizerNode);
console.log(editorWrapper, resizers);
for (const resizer of resizers) {
  resizer.remove(); 
}

// remove drag handles
const dragHandles = editorWrapper.querySelectorAll(qs.dragHandleNode);
for (const dragHandle of dragHandles) {
 dragHandle.remove(); 
}

// create and deploy tabs wrapper into editor wrapper
const tabsWrapper = document.createElement("div");
tabsWrapper.className = `${prefix}-wrap`;
editorWrapper.insertBefore(tabsWrapper, editorWrapper.firstChild);
console.log("deployed");
const tabsBox = document.createElement("div");
tabsBox.className = `${prefix}-tabs`;
tabsWrapper.appendChild(tabsBox);

// create a tab for each editor and add to tabs wrapper
for (const [i, editor] of [...editors].entries()) {
  
  // get editor name
  const nameNode = editor.querySelector(qs.nameNode);
  const name = nameNode.textContent;
  
  // clone the tab template
  const cloneTab = document.importNode(tempTab.content, true);
  
  // format the hidden radio input
  const inputNode = cloneTab.querySelector(qs.inputNode);
  const linkId = `${prefix}-tab-${i}`;
  inputNode.id = linkId;
  if (i === 0) {
    inputNode.setAttribute("checked", "");
  }
  
  // format the label tab
  const labelNode = cloneTab.querySelector(qs.labelNode);
  labelNode.innerHTML = name;
  labelNode.setAttribute("for", linkId);
  
  // format the content div
  const contentNode = cloneTab.querySelector(qs.contentNode);
  editor.style.height = "100%";
  
  // move all children of editor to tab content
  // this prevents the content from being vertically resized  
  while (editor.childNodes.length > 0) {
    contentNode.appendChild(editor.childNodes[0]);
	}

  editor.remove();  
  tabsBox.appendChild(cloneTab);  
}


