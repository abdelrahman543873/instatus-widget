import axios from "axios";
import { addUniqueObject } from "./utils/add-unique-object";
export class InstatusWidget {
  page;
  removedStatuses = [];
  activeIncidents = [];
  activeMaintenances = [];
  activeIncidentsState = 0;
  activeMaintenancesState = 0;
  constructor() {
    this._updatePageStatus();
    this._periodicUpdate();
  }

  _periodicUpdate() {
    setInterval(() => {
      this._updatePageStatus();
    }, 3000);
  }

  _updatePageStatus() {
    axios.get(process.env.STATUS_PAGE).then((response) => {
      const data = response.data;
      if (!this.page) this.page = data.page;
      if (data.activeIncidents)
        addUniqueObject(
          data.activeIncidents,
          this.activeIncidents,
          "started",
          this.removedStatuses
        );
      if (data.activeMaintenances)
        addUniqueObject(
          data.activeMaintenances,
          this.activeMaintenances,
          "start",
          this.removedStatuses
        );
      if (
        this.activeIncidentsState !== this.activeIncidents.length ||
        !this.activeIncidents.length
      ) {
        this._updateWidgets(this.activeIncidents, "started");
        this.activeIncidentsState = this.activeIncidents.length;
      }
      if (
        this.activeMaintenancesState !== this.activeMaintenances.length ||
        !this.activeMaintenances.length
      ) {
        this._updateWidgets(this.activeMaintenances, "start");
        this.activeMaintenancesState = this.activeMaintenances.length;
      }
    });
  }

  _updateWidgets(arrayElements, filter) {
    for (let arrayElement of arrayElements) {
      const isElementAlreadyRemoved = arrayElements.some((arrayLoopElement) => {
        return arrayLoopElement[filter] === arrayElement[filter];
      });
      if (!isElementAlreadyRemoved || !this.removedStatuses.length)
        this._initializeWidget(
          this.page.name,
          arrayElement,
          arrayElement[filter]
        );
    }
  }

  _initializeWidget(page, incident, date) {
    const iframe = document.createElement("iframe");
    iframe.className = "widget";
    iframe.style.backgroundColor = incident.started ? "orange" : "blue";
    document.body.appendChild(iframe);
    const iframeHead = iframe.contentDocument.querySelector("head");
    iframeHead.appendChild(
      this._addScript("https://kit.fontawesome.com/a076d05399.js")
    );
    iframe.contentDocument.body.appendChild(this._addWarningIcon());
    iframe.contentDocument.body.appendChild(
      this._addWidgetTitle(incident.name, page.name)
    );
    iframe.contentDocument.body.appendChild(
      this._addingCloseSign(iframe, incident)
    );
    iframe.contentDocument.body.appendChild(this._addWidgetBody(date));
    iframe.contentDocument.body.appendChild(this._addWidgetUrl(page.url));
  }

  _addWidgetTitle(problem, page) {
    const widgetTitle = document.createElement("h5");
    widgetTitle.innerText = `there is a ${problem} problem on page ${page}`;
    widgetTitle.style.color = "white";
    widgetTitle.style.display = "inline";
    return widgetTitle;
  }

  _addWidgetBody(date) {
    const widgetTitle = document.createElement("p");
    const numberOfDays =
      (Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000);
    widgetTitle.innerText = `last update ${parseInt(numberOfDays)} days ago`;
    return widgetTitle;
  }

  _addWidgetUrl(url) {
    const widgetUrl = document.createElement("a");
    widgetUrl.innerText = "view latest updates";
    widgetUrl.href = url;
    widgetUrl.style.color = "white";
    return widgetUrl;
  }

  _addScript(src) {
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    return script;
  }

  _addWarningIcon() {
    const icon = document.createElement("i");
    icon.className = "fas fa-exclamation-triangle";
    icon.style.margin = "5px";
    return icon;
  }

  _addingCloseSign(parent, incident) {
    const icon = document.createElement("i");
    icon.innerHTML = "&#10006";
    icon.style.margin = "5px";
    icon.onclick = () => {
      parent.style.display = "none";
      this.removedStatuses.push(incident);
    };
    icon.style.cursor = "pointer";
    return icon;
  }
}
