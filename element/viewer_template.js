/* Copyright 2026 wbw121124
 *
 * This file is generated from `web/viewer.html` by the `gulp element` target,
 * and contains the (trimmed) viewer markup used by the
 * `<pdf-viewer-element>` Custom Element.
 *
 * NOTE: The text is *not* a complete document, but the markup of the viewer
 * body. The `id` attributes are transformed to instance-specific ids and
 * corresponding CSS classes (used for styling multiple instances) by the
 * Custom Element implementation itself.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const viewerHtml = `
    <div id="outerContainer">
      <span id="viewer-alert" class="visuallyHidden" role="alert"></span>

      <div id="mainContainer">
        <div class="toolbar">
          <div id="toolbarContainer">
            <div id="toolbarViewer" class="toolbarHorizontalGroup">
              <div id="toolbarViewerLeft" class="toolbarHorizontalGroup">
                <button
                  id="viewsManagerToggleButton"
                  class="toolbarButton"
                  type="button"
                  tabindex="0"
                  data-l10n-id="pdfjs-toggle-views-manager-button1"
                  aria-expanded="false"
                  aria-haspopup="true"
                  aria-controls="viewsManager"
                >
                  <span data-l10n-id="pdfjs-toggle-views-manager-button1-label"></span>
                </button>
                <div
                  id="viewsManager"
                  class="menuContainer sidebar"
                  hidden="true"
                  role="dialog"
                  aria-describedby="viewsManagerHeaderLabel"
                  data-l10n-id="pdfjs-views-manager-sidebar"
                >
                  <div id="viewsManagerHeader">
                    <div id="viewsManagerTitle">
                      <div id="viewsManagerSelector">
                        <button
                          class="toolbarButton viewsManagerButton hasPopupMenu"
                          type="button"
                          id="viewsManagerSelectorButton"
                          tabindex="0"
                          data-l10n-id="pdfjs-views-manager-view-selector-button"
                          aria-expanded="false"
                          aria-haspopup="listbox"
                          aria-controls="viewsManagerSelectorOptions"
                        >
                          <span data-l10n-id="pdfjs-views-manager-view-selector-button-label"></span>
                        </button>
                        <menu id="viewsManagerSelectorOptions" role="listbox" class="popupMenu withMark">
                          <button id="thumbnailsViewMenu" role="option" type="button" tabindex="-1">
                            <span data-l10n-id="pdfjs-views-manager-pages-option-label"></span>
                          </button>
                          <button id="outlinesViewMenu" role="option" type="button" tabindex="-1">
                            <span data-l10n-id="pdfjs-views-manager-outlines-option-label"></span>
                          </button>
                          <button id="attachmentsViewMenu" role="option" type="button" tabindex="-1">
                            <span data-l10n-id="pdfjs-views-manager-attachments-option-label"></span>
                          </button>
                          <button id="layersViewMenu" role="option" type="button" tabindex="-1">
                            <span data-l10n-id="pdfjs-views-manager-layers-option-label"></span>
                          </button>
                        </menu>
                      </div>
                      <span id="viewsManagerHeaderLabel" class="viewsManagerLabel" role="heading" aria-level="2"></span>
                      <button
                        id="viewsManagerCurrentOutlineButton"
                        class="toolbarButton viewsManagerButton"
                        type="button"
                        tabindex="0"
                        data-l10n-id="pdfjs-current-outline-item-button"
                        hidden="true"
                      >
                        <span data-l10n-id="pdfjs-current-outline-item-button-label"></span>
                      </button>
                    </div>
                  </div>
                  <div id="viewsManagerContent" tabindex="-1">
                    <div id="thumbnailsView" class="thumbnailsView hidden" tabindex="-1"></div>
                    <div id="outlinesView" class="treeView hidden"></div>
                    <div id="attachmentsView" class="hidden"></div>
                    <div id="layersView" class="treeView hidden"></div>
                  </div>
                  <div
                    id="viewsManagerResizer"
                    class="sidebarResizer"
                    role="separator"
                    aria-controls="viewsManager"
                    tabindex="0"
                    data-l10n-id="pdfjs-views-manager-sidebar-resizer"
                  ></div>
                </div>
                <!-- sidebarContainer -->

                <div class="toolbarButtonSpacer"></div>
                <div class="toolbarButtonWithContainer">
                  <button
                    id="viewFindButton"
                    class="toolbarButton"
                    type="button"
                    tabindex="0"
                    data-l10n-id="pdfjs-findbar-button"
                    aria-expanded="false"
                    aria-controls="findbar"
                  >
                    <span data-l10n-id="pdfjs-findbar-button-label"></span>
                  </button>
                  <div class="hidden doorHanger toolbarHorizontalGroup" id="findbar">
                    <div id="findInputContainer" class="toolbarHorizontalGroup">
                      <span class="loadingInput end toolbarHorizontalGroup">
                        <input id="findInput" class="toolbarField" tabindex="0" data-l10n-id="pdfjs-find-input" aria-invalid="false" />
                      </span>
                      <div class="toolbarHorizontalGroup">
                        <button id="findPreviousButton" class="toolbarButton" type="button" tabindex="0" data-l10n-id="pdfjs-find-previous-button">
                          <span data-l10n-id="pdfjs-find-previous-button-label"></span>
                        </button>
                        <div class="splitToolbarButtonSeparator"></div>
                        <button id="findNextButton" class="toolbarButton" type="button" tabindex="0" data-l10n-id="pdfjs-find-next-button">
                          <span data-l10n-id="pdfjs-find-next-button-label"></span>
                        </button>
                      </div>
                    </div>

                    <div id="findbarOptionsOneContainer" class="toolbarHorizontalGroup">
                      <div class="toggleButton toolbarLabel">
                        <input type="checkbox" id="findHighlightAll" tabindex="0" />
                        <label for="findHighlightAll" data-l10n-id="pdfjs-find-highlight-checkbox"></label>
                      </div>
                      <div class="toggleButton toolbarLabel">
                        <input type="checkbox" id="findMatchCase" tabindex="0" />
                        <label for="findMatchCase" data-l10n-id="pdfjs-find-match-case-checkbox-label"></label>
                      </div>
                    </div>
                    <div id="findbarOptionsTwoContainer" class="toolbarHorizontalGroup">
                      <div class="toggleButton toolbarLabel">
                        <input type="checkbox" id="findMatchDiacritics" tabindex="0" />
                        <label for="findMatchDiacritics" data-l10n-id="pdfjs-find-match-diacritics-checkbox-label"></label>
                      </div>
                      <div class="toggleButton toolbarLabel">
                        <input type="checkbox" id="findEntireWord" tabindex="0" />
                        <label for="findEntireWord" data-l10n-id="pdfjs-find-entire-word-checkbox-label"></label>
                      </div>
                    </div>

                    <div id="findbarMessageContainer" class="toolbarHorizontalGroup" aria-live="polite">
                      <span id="findResultsCount" class="toolbarLabel"></span>
                      <span id="findMsg" class="toolbarLabel"></span>
                    </div>
                  </div>
                  <!-- findbar -->
                </div>
                <div class="toolbarHorizontalGroup hiddenSmallView">
                  <button class="toolbarButton" type="button" id="previous" tabindex="0" data-l10n-id="pdfjs-previous-button">
                    <span data-l10n-id="pdfjs-previous-button-label"></span>
                  </button>
                  <div class="splitToolbarButtonSeparator"></div>
                  <button class="toolbarButton" type="button" id="next" tabindex="0" data-l10n-id="pdfjs-next-button">
                    <span data-l10n-id="pdfjs-next-button-label"></span>
                  </button>
                </div>
                <div class="toolbarHorizontalGroup">
                  <span class="loadingInput start toolbarHorizontalGroup">
                    <input
                      type="number"
                      id="pageNumber"
                      class="toolbarField"
                      value="1"
                      min="1"
                      tabindex="0"
                      data-l10n-id="pdfjs-page-input"
                      autocomplete="off"
                    />
                  </span>
                  <span id="numPages" class="toolbarLabel"></span>
                </div>
              </div>
              <div id="toolbarViewerMiddle" class="toolbarHorizontalGroup">
                <div class="toolbarHorizontalGroup">
                  <button id="zoomOutButton" class="toolbarButton" type="button" tabindex="0" data-l10n-id="pdfjs-zoom-out-button">
                    <span data-l10n-id="pdfjs-zoom-out-button-label"></span>
                  </button>
                  <div class="splitToolbarButtonSeparator"></div>
                  <button id="zoomInButton" class="toolbarButton" type="button" tabindex="0" data-l10n-id="pdfjs-zoom-in-button">
                    <span data-l10n-id="pdfjs-zoom-in-button-label"></span>
                  </button>
                </div>
                <span id="scaleSelectContainer" class="dropdownToolbarButton">
                  <select id="scaleSelect" tabindex="0" data-l10n-id="pdfjs-zoom-select">
                    <option id="pageAutoOption" value="auto" selected="selected" data-l10n-id="pdfjs-page-scale-auto"></option>
                    <option id="pageActualOption" value="page-actual" data-l10n-id="pdfjs-page-scale-actual"></option>
                    <option id="pageFitOption" value="page-fit" data-l10n-id="pdfjs-page-scale-fit"></option>
                    <option id="pageWidthOption" value="page-width" data-l10n-id="pdfjs-page-scale-width"></option>
                    <option
                      id="customScaleOption"
                      value="custom"
                      disabled="disabled"
                      hidden="true"
                      data-l10n-id="pdfjs-page-scale-percent"
                      data-l10n-args='{ "scale": 0 }'
                    ></option>
                    <option value="0.5" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 50 }'></option>
                    <option value="0.75" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 75 }'></option>
                    <option value="1" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 100 }'></option>
                    <option value="1.25" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 125 }'></option>
                    <option value="1.5" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 150 }'></option>
                    <option value="2" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 200 }'></option>
                    <option value="3" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 300 }'></option>
                    <option value="4" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 400 }'></option>
                  </select>
                </span>
              </div>
              <div id="toolbarViewerRight" class="toolbarHorizontalGroup">
                <div id="secondaryToolbarToggle" class="toolbarButtonWithContainer">
                  <button
                    id="secondaryToolbarToggleButton"
                    class="toolbarButton"
                    type="button"
                    tabindex="0"
                    data-l10n-id="pdfjs-tools-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    aria-controls="secondaryToolbar"
                  >
                    <span data-l10n-id="pdfjs-tools-button-label"></span>
                  </button>
                  <div id="secondaryToolbar" class="hidden doorHangerRight menu">
                    <div id="secondaryToolbarButtonContainer" class="menuContainer">
                      <button id="secondaryOpenFile" class="toolbarButton labeled" type="button" tabindex="0" data-l10n-id="pdfjs-open-file-button">
                        <span data-l10n-id="pdfjs-open-file-button-label"></span>
                      </button>

                      <div class="visibleMediumView">
                      </div>

                      <div class="horizontalToolbarSeparator"></div>

                      <button id="presentationMode" class="toolbarButton labeled" type="button" tabindex="0" data-l10n-id="pdfjs-presentation-mode-button">
                        <span data-l10n-id="pdfjs-presentation-mode-button-label"></span>
                      </button>

                      <a href="#" id="viewBookmark" class="toolbarButton labeled" tabindex="0" data-l10n-id="pdfjs-bookmark-button">
                        <span data-l10n-id="pdfjs-bookmark-button-label"></span>
                      </a>

                      <div id="viewBookmarkSeparator" class="horizontalToolbarSeparator"></div>

                      <button id="firstPage" class="toolbarButton labeled" type="button" tabindex="0" data-l10n-id="pdfjs-first-page-button">
                        <span data-l10n-id="pdfjs-first-page-button-label"></span>
                      </button>
                      <button id="lastPage" class="toolbarButton labeled" type="button" tabindex="0" data-l10n-id="pdfjs-last-page-button">
                        <span data-l10n-id="pdfjs-last-page-button-label"></span>
                      </button>

                      <div class="horizontalToolbarSeparator"></div>

                      <button id="pageRotateCw" class="toolbarButton labeled" type="button" tabindex="0" data-l10n-id="pdfjs-page-rotate-cw-button">
                        <span data-l10n-id="pdfjs-page-rotate-cw-button-label"></span>
                      </button>
                      <button id="pageRotateCcw" class="toolbarButton labeled" type="button" tabindex="0" data-l10n-id="pdfjs-page-rotate-ccw-button">
                        <span data-l10n-id="pdfjs-page-rotate-ccw-button-label"></span>
                      </button>

                      <div class="horizontalToolbarSeparator"></div>

                      <div id="cursorToolButtons" role="radiogroup">
                        <button
                          id="cursorSelectTool"
                          class="toolbarButton labeled toggled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-cursor-text-select-tool-button"
                          role="radio"
                          aria-checked="true"
                        >
                          <span data-l10n-id="pdfjs-cursor-text-select-tool-button-label"></span>
                        </button>
                        <button
                          id="cursorHandTool"
                          class="toolbarButton labeled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-cursor-hand-tool-button"
                          role="radio"
                          aria-checked="false"
                        >
                          <span data-l10n-id="pdfjs-cursor-hand-tool-button-label"></span>
                        </button>
                      </div>

                      <div class="horizontalToolbarSeparator"></div>

                      <div id="scrollModeButtons" role="radiogroup">
                        <button
                          id="scrollPage"
                          class="toolbarButton labeled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-scroll-page-button"
                          role="radio"
                          aria-checked="false"
                        >
                          <span data-l10n-id="pdfjs-scroll-page-button-label"></span>
                        </button>
                        <button
                          id="scrollVertical"
                          class="toolbarButton labeled toggled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-scroll-vertical-button"
                          role="radio"
                          aria-checked="true"
                        >
                          <span data-l10n-id="pdfjs-scroll-vertical-button-label"></span>
                        </button>
                        <button
                          id="scrollHorizontal"
                          class="toolbarButton labeled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-scroll-horizontal-button"
                          role="radio"
                          aria-checked="false"
                        >
                          <span data-l10n-id="pdfjs-scroll-horizontal-button-label"></span>
                        </button>
                        <button
                          id="scrollWrapped"
                          class="toolbarButton labeled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-scroll-wrapped-button"
                          role="radio"
                          aria-checked="false"
                        >
                          <span data-l10n-id="pdfjs-scroll-wrapped-button-label"></span>
                        </button>
                      </div>

                      <div class="horizontalToolbarSeparator"></div>

                      <div id="spreadModeButtons" role="radiogroup">
                        <button
                          id="spreadNone"
                          class="toolbarButton labeled toggled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-spread-none-button"
                          role="radio"
                          aria-checked="true"
                        >
                          <span data-l10n-id="pdfjs-spread-none-button-label"></span>
                        </button>
                        <button
                          id="spreadOdd"
                          class="toolbarButton labeled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-spread-odd-button"
                          role="radio"
                          aria-checked="false"
                        >
                          <span data-l10n-id="pdfjs-spread-odd-button-label"></span>
                        </button>
                        <button
                          id="spreadEven"
                          class="toolbarButton labeled"
                          type="button"
                          tabindex="0"
                          data-l10n-id="pdfjs-spread-even-button"
                          role="radio"
                          aria-checked="false"
                        >
                          <span data-l10n-id="pdfjs-spread-even-button-label"></span>
                        </button>
                      </div>

                      <div id="imageAltTextSettingsSeparator" class="horizontalToolbarSeparator hidden"></div>
                      <button
                        id="imageAltTextSettings"
                        type="button"
                        class="toolbarButton labeled hidden"
                        tabindex="0"
                        data-l10n-id="pdfjs-image-alt-text-settings-button"
                        aria-controls="altTextSettingsDialog"
                      >
                        <span data-l10n-id="pdfjs-image-alt-text-settings-button-label"></span>
                      </button>

                      <div class="horizontalToolbarSeparator"></div>

                      <button
                        id="documentProperties"
                        class="toolbarButton labeled"
                        type="button"
                        tabindex="0"
                        data-l10n-id="pdfjs-document-properties-button"
                        aria-controls="documentPropertiesDialog"
                      >
                        <span data-l10n-id="pdfjs-document-properties-button-label"></span>
                      </button>
                    </div>
                  </div>
                  <!-- secondaryToolbar -->
                </div>
              </div>
            </div>
            <div id="loadingBar">
              <div class="progress">
                <div class="glimmer"></div>
              </div>
            </div>
          </div>
        </div>

        <div id="viewerContainer" tabindex="0">
          <div id="viewer" class="pdfViewer"></div>
        </div>
      </div>
      <!-- mainContainer -->

      <div id="dialogContainer">
        <dialog id="passwordDialog">
          <div class="row">
            <label for="password" id="passwordText" data-l10n-id="pdfjs-password-label"></label>
          </div>
          <div class="row">
            <input type="password" id="password" class="toolbarField" />
          </div>
          <div class="buttonRow">
            <button id="passwordCancel" class="secondaryButton" type="button"><span data-l10n-id="pdfjs-password-cancel-button"></span></button>
            <button id="passwordSubmit" class="primaryButton" type="button"><span data-l10n-id="pdfjs-password-ok-button"></span></button>
          </div>
        </dialog>
        <dialog id="documentPropertiesDialog">
          <div class="row">
            <span id="fileNameLabel" data-l10n-id="pdfjs-document-properties-file-name"></span>
            <p id="fileNameField" aria-labelledby="fileNameLabel">-</p>
          </div>
          <div class="row">
            <span id="fileSizeLabel" data-l10n-id="pdfjs-document-properties-file-size"></span>
            <p id="fileSizeField" aria-labelledby="fileSizeLabel">-</p>
          </div>
          <div class="separator"></div>
          <div class="row">
            <span id="titleLabel" data-l10n-id="pdfjs-document-properties-title"></span>
            <p id="titleField" aria-labelledby="titleLabel">-</p>
          </div>
          <div class="row">
            <span id="authorLabel" data-l10n-id="pdfjs-document-properties-author"></span>
            <p id="authorField" aria-labelledby="authorLabel">-</p>
          </div>
          <div class="row">
            <span id="subjectLabel" data-l10n-id="pdfjs-document-properties-subject"></span>
            <p id="subjectField" aria-labelledby="subjectLabel">-</p>
          </div>
          <div class="row">
            <span id="keywordsLabel" data-l10n-id="pdfjs-document-properties-keywords"></span>
            <p id="keywordsField" aria-labelledby="keywordsLabel">-</p>
          </div>
          <div class="row">
            <span id="creationDateLabel" data-l10n-id="pdfjs-document-properties-creation-date"></span>
            <p id="creationDateField" aria-labelledby="creationDateLabel">-</p>
          </div>
          <div class="row">
            <span id="modificationDateLabel" data-l10n-id="pdfjs-document-properties-modification-date"></span>
            <p id="modificationDateField" aria-labelledby="modificationDateLabel">-</p>
          </div>
          <div class="row">
            <span id="creatorLabel" data-l10n-id="pdfjs-document-properties-creator"></span>
            <p id="creatorField" aria-labelledby="creatorLabel">-</p>
          </div>
          <div class="separator"></div>
          <div class="row">
            <span id="producerLabel" data-l10n-id="pdfjs-document-properties-producer"></span>
            <p id="producerField" aria-labelledby="producerLabel">-</p>
          </div>
          <div class="row">
            <span id="versionLabel" data-l10n-id="pdfjs-document-properties-version"></span>
            <p id="versionField" aria-labelledby="versionLabel">-</p>
          </div>
          <div class="row">
            <span id="pageCountLabel" data-l10n-id="pdfjs-document-properties-page-count"></span>
            <p id="pageCountField" aria-labelledby="pageCountLabel">-</p>
          </div>
          <div class="row">
            <span id="pageSizeLabel" data-l10n-id="pdfjs-document-properties-page-size"></span>
            <p id="pageSizeField" aria-labelledby="pageSizeLabel">-</p>
          </div>
          <div class="separator"></div>
          <div class="row">
            <span id="linearizedLabel" data-l10n-id="pdfjs-document-properties-linearized"></span>
            <p id="linearizedField" aria-labelledby="linearizedLabel">-</p>
          </div>
          <div class="buttonRow">
            <button id="documentPropertiesClose" class="secondaryButton" type="button">
              <span data-l10n-id="pdfjs-document-properties-close-button"></span>
            </button>
          </div>
        </dialog>

      </div>
      <!-- dialogContainer -->
    </div>
    <!-- outerContainer -->
`;

export { viewerHtml };
