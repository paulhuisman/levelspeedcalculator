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
      var el = document.getElementById('messages-box');
      el.scrollIntoView();
    
      if (this.leveling_class.length && this.leveling_speed.length && this.hours_per_week.length && this.start_date.length) {
        // Remove error messages
        this.error_message = '';
        document.querySelector('.error-message').style.display = 'none';

        // Calc ding date and show success message
        let ding_date = calcDingDate(this.leveling_class, this.leveling_speed, this.hours_per_week, this.start_date);
        
        document.querySelector('.success-message').style.display = 'block';
        this.success_message = `
          A <strong>${this.leveling_class}</strong> is a ${getClassRate(this.leveling_class).descr} leveling class.
          If you are playing an average of <strong>${this.hours_per_week} hours per week</strong> and your leveling speed is <strong>${this.leveling_speed}</strong> you will probably ding level 60 somewhere around...<p>${ding_date}</p>
        `;
      }
      else {
        this.success_message = '';
        document.querySelector('.success-message').style.display = 'none';

        // Show error message
        document.querySelector('.error-message').style.display = 'block';
        this.error_message = 'Please fill in all fields to get a calculation.';
      }

    },
    removeSkill(index) {
      if (this.skills[index]) {
        this.skills.splice(index, 1);
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
  return date.toString('dddd d MMMM yyyy');  
}

function getClassRate(leveling_class) {
  const rates = {
    'warrior': {
      multiplier: 1.4,
      descr: 'slow',
    },
    'rogue': {
      multiplier: 1.3,
      descr: 'medium-slow'
    },
    'hunter': {
      multiplier: 1,
      descr: 'fast'
    },
    'warlock': {
      multiplier: 1.15,
      descr: 'medium-fast'
    },
    'mage': {
      multiplier: 1.15,
      descr: 'medium-fast'
    },
    'priest': { 
      multiplier: 1.2,
      descr: 'medium'
    },
    'shaman': {
      multiplier: 1.3,
      descr: 'medium-slow'
    },
    'druid': {
      multiplier: 1.1,
      descr: 'fast'
    },
    'paladin': {
      multiplier: 1.35,
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
    'very-slow': 25,
    'slow': 18,
    'normal': 14,
    'fast': 10,
    'super-fast': 7
  }

  if (leveling_speed_days[leveling_speed]) {
    // Convert to hours
    return leveling_speed_days[leveling_speed] * 24;
  }
  
  return false;
}