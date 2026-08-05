/* Copyright 2016 Mozilla Foundation
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

/** @typedef {import("./event_utils.js").EventBus} EventBus */

import {
  DEFAULT_SCALE,
  DEFAULT_SCALE_VALUE,
  MAX_SCALE,
  MIN_SCALE,
} from "./ui_utils.js";
import { internalOpt } from "./internal_evt.js";
import { noContextMenu } from "pdfjs-lib";

class Toolbar {
  #opts;

  constructor(options, eventBus, toolbarDensity = 0) {
    this.#opts = options;
    this.eventBus = eventBus;
    const buttons = [
      { element: options.previous, eventName: "previouspage" },
      { element: options.next, eventName: "nextpage" },
      { element: options.zoomIn, eventName: "zoomin" },
      { element: options.zoomOut, eventName: "zoomout" },
    ];

    this.#bindListeners(buttons);
    this.#updateToolbarDensity({ value: toolbarDensity });
    this.reset();
  }

  #updateToolbarDensity({ value }) {
    let name = "normal";
    switch (value) {
      case 1:
        name = "compact";
        break;
      case 2:
        name = "touch";
        break;
    }
    document.documentElement.setAttribute("data-toolbar-density", name);
  }

  setPageNumber(pageNumber, pageLabel) {
    this.pageNumber = pageNumber;
    this.pageLabel = pageLabel;
    this.#updateUIState(false);
  }

  setPagesCount(pagesCount, hasPageLabels) {
    this.pagesCount = pagesCount;
    this.hasPageLabels = hasPageLabels;
    this.#updateUIState(true);
  }

  setPageScale(pageScaleValue, pageScale) {
    this.pageScaleValue = (pageScaleValue || pageScale).toString();
    this.pageScale = pageScale;
    this.#updateUIState(false);
  }

  reset() {
    this.pageNumber = 0;
    this.pageLabel = null;
    this.hasPageLabels = false;
    this.pagesCount = 0;
    this.pageScaleValue = DEFAULT_SCALE_VALUE;
    this.pageScale = DEFAULT_SCALE;
    this.#updateUIState(true);
    this.updateLoadingIndicatorState();
  }

  #bindListeners(buttons) {
    const { eventBus } = this;
    const { pageNumber, scaleSelect } = this.#opts;
    const self = this;

    for (const { element, eventName, eventDetails, telemetry } of buttons) {
      element?.addEventListener("click", evt => {
        if (eventName !== null) {
          eventBus.dispatch(eventName, {
            source: this,
            ...eventDetails,
            isFromKeyboard: evt.detail === 0,
          });
        }
        if (telemetry) {
          eventBus.dispatch("reporttelemetry", {
            source: this,
            details: telemetry,
          });
        }
      });
    }

    pageNumber.addEventListener("click", function () {
      this.select();
    });
    pageNumber.addEventListener("change", function () {
      eventBus.dispatch("pagenumberchanged", {
        source: self,
        value: this.value,
      });
    });

    scaleSelect.addEventListener("change", function () {
      if (this.value === "custom") {
        return;
      }
      eventBus.dispatch("scalechanged", {
        source: self,
        value: this.value,
      });
    });
    scaleSelect.addEventListener("click", function ({ target }) {
      if (
        this.value === self.pageScaleValue &&
        target.tagName.toUpperCase() === "OPTION"
      ) {
        this.blur();
      }
    });
    scaleSelect.oncontextmenu = noContextMenu;

    eventBus.on(
      "toolbardensity",
      this.#updateToolbarDensity.bind(this),
      internalOpt
    );
  }

  #updateUIState(resetNumPages = false) {
    const { pageNumber, pagesCount, pageScaleValue, pageScale } = this;
    const opts = this.#opts;

    if (resetNumPages) {
      if (this.hasPageLabels) {
        opts.pageNumber.type = "text";
        opts.numPages.setAttribute("data-l10n-id", "pdfjs-page-of-pages");
      } else {
        opts.pageNumber.type = "number";
        opts.numPages.setAttribute("data-l10n-id", "pdfjs-of-pages");
        opts.numPages.setAttribute(
          "data-l10n-args",
          JSON.stringify({ pagesCount })
        );
      }
      opts.pageNumber.max = pagesCount;
    }

    if (this.hasPageLabels) {
      opts.pageNumber.value = this.pageLabel;
      opts.numPages.setAttribute(
        "data-l10n-args",
        JSON.stringify({ pageNumber, pagesCount })
      );
    } else {
      opts.pageNumber.value = pageNumber;
    }

    opts.previous.disabled = pageNumber <= 1;
    opts.next.disabled = pageNumber >= pagesCount;

    opts.zoomOut.disabled = pageScale <= MIN_SCALE;
    opts.zoomIn.disabled = pageScale >= MAX_SCALE;

    let predefinedValueFound = false;
    for (const option of opts.scaleSelect.options) {
      if (option.value !== pageScaleValue) {
        option.selected = false;
        continue;
      }
      option.selected = true;
      predefinedValueFound = true;
    }
    if (!predefinedValueFound) {
      opts.customScaleOption.selected = true;
      opts.customScaleOption.setAttribute(
        "data-l10n-args",
        JSON.stringify({
          scale: Math.round(pageScale * 10000) / 100,
        })
      );
    }
  }

  updateLoadingIndicatorState(loading = false) {
    const { pageNumber } = this.#opts;
    pageNumber.classList.toggle("loading", loading);
  }
}

export { Toolbar };
