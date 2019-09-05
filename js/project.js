var app = new Vue({
  el: '#app',
  data: {
    leveling_class: '',
    error_message: '',
    success_message: '',
    leveling_class: '',
    leveling_speed: '',
    already_playing: 1,
    current_level: '',
    hours_per_week: '',
    start_date: currentDate(),
  },
  methods: {
    calcLevelingTime(skill) {
      // Scroll to messages-box div (especially useful on mobile)
      var el = document.getElementById('submitter');
      el.scrollIntoView();

      // Validate fields input
      if(this.validateFields() == false) {
        return;
      }

      // Remove error messages
      this.error_message = '';
      document.querySelector('.error-message').style.display = 'none';

      // Calc ding date and day_months_info
      let info = this.calcDingDate();
      let day_months_info = info.months > 1 ? `${roundToOne(info.months)} months` : `${Math.round(info.days)} days`;
      
      // Show success message with calculated info
      document.querySelector('.success-message').style.display = 'block';
      message = `
        A <strong>${this.leveling_class}</strong> is a ${getClassRate(this.leveling_class).descr} leveling class.
        If you are playing an average of <strong>${this.hours_per_week} hours per week</strong> and your leveling speed is <strong>${this.leveling_speed}</strong> you will probably ding level 60 somewhere around...<p>${info.ding_date_formatted}</p>
      `;

      if(this.already_playing == 0) {
        message += `<span class="small">(this will be ${day_months_info} from when you start playing on ${info.start_date_formatted})</span>`; 
      }
      else {
        message += `<span class="small">(this will be ${day_months_info} from today - ${info.today_date_formatted})</span>`;
      }

      this.success_message = message

      // Push event to GA
      if(this.already_playing == 0) {
        gtag('event', 'Successful', {
          'event_category': 'Calculate',
          'event_label': `${this.leveling_class} - ${Math.round(info.days)} days - ${info.ding_date_formatted}`
        });
      }
      else {
        gtag('event', 'Successful', {
          'event_category': 'Calculate - playing',
          'event_label': `${this.leveling_class} - ${Math.round(info.days)} days - ${info.ding_date_formatted} (current level: ${this.current_level})`
        });
      }
    },
    validateFields() {
      if(this.start_date.length == 0) {
        this.error_message = this.toggleErrorMessage('Starting date cannot be empty.');
        return false;
      }
      else if(!this.start_date.match(/^\d{4}([./-])\d{2}\1\d{2}$/)) {
        this.error_message = this.toggleErrorMessage('Date format should be YYYY-MM-DD.');
        return false;
      }
      else if(this.start_date < '2019-08-26') {
        this.error_message = this.toggleErrorMessage('Start date cannot be before release..');
        return false;
      }
      else if (this.leveling_class.length == 0 || this.leveling_speed.length == 0 || this.hours_per_week.length == 0) {
        this.error_message = this.toggleErrorMessage('Please fill in all fields to get a calculation.');
        return false;
      }

      return true;
    },
    toggleErrorMessage(error_text) {
      // Hide success message
      this.success_message = '';
      document.querySelector('.success-message').style.display = 'none';

      // Show error message
      document.querySelector('.error-message').style.display = 'block';

      return error_text;
    },
    calcDingDate() {
      let dingDate = null;
      let class_rate = getClassRate(this.leveling_class);
      let leveling_speed_hours = getHoursNeeded(this.leveling_speed);

      if (class_rate.multiplier.length == 0 || class_rate.multiplier.length == 0) {
        return false;
      }

      // Check if player has already started
      if(this.already_playing == 0) {
        // Calc amount of days it will take to become 60
        days = class_rate.multiplier * (leveling_speed_hours / this.hours_per_week * 7);
        
        // Add days to starting date
        dingDate = new Date(this.start_date);
        dingDate.add(days).days();
      }
      else {
        // Player is already playing: calc amount of days it will take to become 60
        days = class_rate.multiplier * (leveling_speed_hours / this.hours_per_week * 7);
        let percentage = getPercentageDone(this.current_level);
        
        if(percentage !== false) {
          let daysDone = (percentage * days) / 100;
          
          // Add days to today's date
          days -= daysDone;
        }

        dingDate = new Date();
        dingDate.add(days).days();
      }

      return {
        start_date_formatted: new Date(this.start_date).toString('d MMMM yyyy'),
        ding_date_formatted: dingDate.toString('dddd d MMMM yyyy'),
        today_date_formatted: new Date().toString('dddd d MMMM yyyy'),
        // month average is 30,4
        months: days / 30.4,
        days: days
      };
    }
  }
})

function getClassRate(leveling_class) {
  const rates = {
    'warrior': {
      multiplier: 1.3,
      descr: 'slow',
    },
    'rogue': {
      multiplier: 1.2,
      descr: 'medium-slow'
    },
    'hunter': {
      multiplier: 1,
      descr: 'fast'
    },
    'warlock': {
      multiplier: 1.1,
      descr: 'medium-fast'
    },
    'mage': {
      multiplier: 1.1,
      descr: 'medium-fast'
    },
    'priest': { 
      multiplier: 1.15,
      descr: 'medium-speed'
    },
    'shaman': {
      multiplier: 1.2,
      descr: 'medium-slow'
    },
    'druid': {
      multiplier: 1.1,
      descr: 'fast'
    },
    'paladin': {
      multiplier: 1.25,
      descr: 'slow'
    },
  };

  if (rates[leveling_class]) {
    return rates[leveling_class];
  }

  return false;
}


function getPercentageDone(current_level) {
  const multipliers = {
    1: 0.3,
    2: 0.5,
    3: 0.9,
    4: 1.2,
    5: 1.5,
    6: 1.8,
    7: 2.1,
    8: 2.3,
    9: 2.7,
    10: 3.1,
    11: 3.5,
    12: 4,
    13: 4.5,
    14: 4.9,
    15: 5.3,
    16: 5.9, // One-sixteenth way
    17: 6.8,
    18: 7.6,
    19: 8.5,
    20: 9.4,
    21: 10.3,
    22: 11.3, 
    23: 12.5, // One-eight way
    24: 13.7,
    25: 14.9,
    26: 16.3,
    27: 17.8,
    28: 19.2,
    29: 20.7,
    30: 22.1,
    31: 23.5,
    32: 25, // Quarter way
    33: 27,
    34: 28.3,
    35: 29.8,
    36: 31.6,
    37: 33.4,
    38: 35.2,
    39: 37,
    40: 39,
    41: 41.4,
    42: 44.2,
    43: 47,
    44: 50, // Half way
    45: 52.1,
    46: 54.1,
    47: 56.2,
    48: 59.4,
    49: 61.9,
    50: 64.5,
    51: 68.3,
    52: 71.5,
    53: 75, // Three-quarter way
    54: 79.5,
    55: 82,
    56: 85,
    57: 88.1,
    58: 91.8,
    59: 95.5,
  }

  if (multipliers[current_level]) {
    return multipliers[current_level];
  }

  return false;
}

function getHoursNeeded(leveling_speed) {
  const leveling_speed_days = {
    'very-slow': 17,
    'slow': 13,
    'normal': 9,
    'fast': 6,
    'super-fast': 4
  }

  if (leveling_speed_days[leveling_speed]) {
    // Convert to hours
    return leveling_speed_days[leveling_speed] * 24;
  }
  
  return false;
}

function roundToOne(num) {    
  return +(Math.round(num + "e+1")  + "e-1");
}


function currentDate() {
  var d = new Date(),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}