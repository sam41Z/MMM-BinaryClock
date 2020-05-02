Module.register("MMM-BinaryClock", {

  defaults: {
    hourBorderColor: "white",
    hourBackgroundColor: "white",
    minuteBorderColor: "white",
    minuteBackgroundColor: "white",
    dateBorderColor: "white",
    dateBackgroundColor: "white"
  },

  getScripts: function () {
    return ["moment.js"];
  },

  // Define styles.
  getStyles: function () {
    return ["binary_clock_styles.css"];
  },

  // Define start sequence.
  start: function () {
    Log.info("Starting module: " + this.name);

    // Schedule update interval.
    let self = this;
    self.second = moment().second();
    self.minute = moment().minute();

    //Calculate how many ms should pass until next update depending on if seconds is displayed or not
    let delayCalculator = function(reducedSeconds) {
        return ((60 - reducedSeconds) * 1000) - moment().milliseconds();
    };

    //A recursive timeout function instead of interval to avoid drifting
    let notificationTimer = function() {
      self.updateDom();

      //If minute changed or seconds isn't displayed send CLOCK_MINUTE-notification
      self.minute = (self.minute + 1) % 60;
      self.sendNotification("CLOCK_MINUTE", self.minute);
      setTimeout(notificationTimer, delayCalculator(0));
    };

    //Set the initial timeout with the amount of seconds elapsed as reducedSeconds so it will trigger when the minute changes
    setTimeout(notificationTimer, delayCalculator(self.second));
  },

  // Override dom generator.
  getDom: function() {
    let now = moment();

    let wrapper = document.createElement("div");
    wrapper.className = "binaryClock";
    let timeSize = 40;

    let drawBinary = function (digits, value, size, border, borderColor,
        backgroundColor) {
      let container = document.createElement("div");
      container.className = "binaryRow";
      for (let i = 0; i < digits; i++) {
        let digit = document.createElement("div");
        let bit = value & (1 << i);
        digit.style.border = border + "px solid " + borderColor;
        digit.style.borderRadius = "50%";
        digit.style.boxShadow = "0 0 1px black";
        digit.style.backgroundColor = bit ? backgroundColor : "";
        digit.style.marginLeft = size / 2 + "px";
        digit.style.height = size + "px";
        digit.style.width = size + "px";
        container.appendChild(digit);
      }
      return container;
    }

    let hourWrapper = drawBinary(5, now.hour(), timeSize, 3,
        this.config.hourBorderColor, this.config.hourBackgroundColor);
    let minuteWrapper = drawBinary(6, now.minute(), timeSize, 3,
        this.config.minuteBorderColor, this.config.minuteBackgroundColor);
    minuteWrapper.style.marginTop = timeSize / 2 + "px";

    let dateWrapper = document.createElement("div");
    dateWrapper.className = "dateWrapper";
    dateWrapper.style.marginTop = timeSize / 2 + "px";
    let dateSize = 16;
    let dayWrapper = drawBinary(5, now.date(), dateSize, 2,
        this.config.dateBorderColor, this.config.dateBackgroundColor);
    let monthWrapper = drawBinary(4, now.month() + 1, dateSize, 2,
        this.config.dateBorderColor, this.config.dateBackgroundColor);
    dateWrapper.appendChild(dayWrapper);
    dateWrapper.appendChild(monthWrapper);

    wrapper.appendChild(hourWrapper);
    wrapper.appendChild(minuteWrapper);
    wrapper.appendChild(dateWrapper);
    return wrapper;
  }
});
