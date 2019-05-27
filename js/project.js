var app = new Vue({
  el: '#app',
  data: {
    leveling_class: '',
    error_message: '',
    success_message: '',
    leveling_class: '',
    leveling_speed: '',
    hours_per_week: '',
    start_date: '2019-08-27',
  },
  methods: {
    calcLevelingTime(skill) {
      // Scroll to messages-box div (especially useful on mobile)
      var el = document.getElementById('submitter');
      el.scrollIntoView();
    
      if (this.leveling_class.length && this.leveling_speed.length && this.hours_per_week.length && this.start_date.length) {
        // Remove error messages
        this.error_message = '';
        document.querySelector('.error-message').style.display = 'none';

        // Calc ding date and show success message
        let info = calcDingDate(this.leveling_class, this.leveling_speed, this.hours_per_week, this.start_date);
        
        document.querySelector('.success-message').style.display = 'block';
        let day_months_info = info.months > 1 ? `${roundToOne(info.months)} months` : `${Math.round(info.days)} days`;
        this.success_message = `
          A <strong>${this.leveling_class}</strong> is a ${getClassRate(this.leveling_class).descr} leveling class.
          If you are playing an average of <strong>${this.hours_per_week} hours per week</strong> and your leveling speed is <strong>${this.leveling_speed}</strong> you will probably ding level 60 somewhere around...<p>${info.ding_date_formatted}</p>
          <span class="small">(this will be ${day_months_info} from when you start playing on ${info.start_date_formatted})</span>
        `;

        // Push event to GA
        gtag('event', 'Successful', {
          'event_category': 'Calculate',
          'event_label': this.leveling_class + ' - ' + info.ding_date_formatted
        });
      }
      else {
        this.success_message = '';
        document.querySelector('.success-message').style.display = 'none';

        // Show error message
        document.querySelector('.error-message').style.display = 'block';
        this.error_message = 'Please fill in all fields to get a calculation.';
      }
    }
  }
})

function calcDingDate(leveling_class, leveling_speed, hours_per_week, start_date) {
  let class_rate = getClassRate(leveling_class);
  let leveling_speed_hours = getHoursNeeded(leveling_speed);

  if (class_rate.multiplier.length == 0 || class_rate.multiplier.length == 0) {
    return false;
  }

  // Calc amount of days it will take to become 60
  days = class_rate.multiplier * (leveling_speed_hours / hours_per_week * 7);
  
  // Add days to starting date
  let date = new Date(start_date);
  date.add(days).days();

  return {
    start_date_formatted: new Date(start_date).toString('d MMMM yyyy'),
    ding_date_formatted: date.toString('dddd d MMMM yyyy'),
    // month average is 30,4
    months: days / 30.4,
    days: days
  };
}

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
      multiplier: 1.1,
      descr: 'medium-speed'
    },
    'shaman': {
      multiplier: 1.2,
      descr: 'medium-slow'
    },
    'druid': {
      multiplier: 1.05,
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

function getHoursNeeded(leveling_speed) {
  const leveling_speed_days = {
    'very-slow': 24,
    'slow': 17,
    'normal': 13,
    'fast': 9,
    'super-fast': 6.5
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