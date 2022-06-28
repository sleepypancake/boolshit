class Calculator {
    constructor(element) {
      this.caclulatorBlock = element
      this.buildCache()
      this.bindEvents()
    }
  
  
    buildCache() {
      this.rangeSliders = this.caclulatorBlock.querySelectorAll('input[type="range"]')
      this.rangeInputs = this.caclulatorBlock.querySelectorAll('.calculator__input-progress')
      this.tabsData = this.caclulatorBlock.querySelectorAll(`.calculator__data`)
      this.calculatorForm = this.caclulatorBlock.querySelector('form[name="calculator_form"]')
      this.activeTab = this.caclulatorBlock.querySelector('.calculator__data--active')
    }
  
    bindEvents() {
        // input events

        $(this.rangeSliders).on( 'input', (e) => {
            e.target.classList.add('active')
            this.setRangeProgressFromSlider(e.target)
        });

        $(this.rangeSliders).on( 'blur', (e) => {
            e.target.classList.remove('active')
        });

        $(this.rangeSliders).on( 'change', (e) => {
            this.getTabData()
        });

        $(this.rangeInputs).on( 'focus', (e) => {
            if ($(e.target).data("type") === "years") {
                e.target.value = e.target.value.split(' ').slice(0, -1).join(' ');
            } 
        });

        $(this.rangeInputs).on( 'blur', (e) => {
            if ($(e.target).data("type") === "years") {
                e.target.value = `${e.target.value} ${this.declOfNum(e.target.value, ['год', 'года', 'лет'])}`
            } else  {
                e.target.value = this.getLocaleStringFromNumber(e.target.value)
            }
        });

        $(this.rangeInputs).on( 'input', (e) => {
            e.preventDefault();
            this.setRangeProgressFromInput(e.target)
        });
    }

    setRangeProgressFromSlider(item) {
        const $rangeProgressbar = $(item).siblings('.range-progress');
        const $rangeOutput = $(item).siblings('.calculator__input-progress');
        $rangeOutput[0].classList.remove('error')
        if ($(item).data("type") === "years") {
            $rangeOutput.val(`${item.value} ${this.declOfNum(item.value, ['год', 'года', 'лет'])}`)
        } else  {
            $rangeOutput.val(this.getLocaleStringFromNumber(item.value))
        }
        $rangeProgressbar.css('width', this.rangeToPersent(+item.min, +item.max, +item.value) + '%')
    }

    setRangeProgressFromInput(item) {
        const valueFromEl = parseInt([...item.value].map(item => item.trim()).join(''))
        const $rangeProgressbar = $(item).siblings('.range-progress');
        const $rangeSlider = $(item).siblings('input[type="range"]');
        const sliderMin = +$rangeSlider[0].min;
        const sliderMax = +$rangeSlider[0].max;
        if ( valueFromEl >= sliderMin && valueFromEl <= sliderMax) {
            item.classList.remove('error')
            $rangeSlider.val(valueFromEl)
            $rangeProgressbar.css('width', this.rangeToPersent(sliderMin, sliderMax, valueFromEl) + '%')
        } else {
            item.classList.add('error')
        }

        // item.value = this.getLocaleStringFromNumber(item.value)
    }

    getTabData() {
        const {flat_price, first_payment, subsidy_period} = this.calculatorForm

        const data = {
            subsidy_type: this.activeTab.id,
            flat_price: flat_price.value,
            first_payment: first_payment.value,
            subsidy_period: subsidy_period.value * 12, // передавать значение в месяцах
        }

        $.ajax({
            url: './data.json',
            method: 'get', 
            dataType: 'json',
            data,
            success: (data) => {
               this.appendDataToTabs(data)
            },
            
        });
    }

    appendDataToTabs(data) {
        for (let item in data) {
            const { month_payment,  percent, subsidy_period, overpayment } = data[item]
            const card = this.activeTab.querySelector(`[data-type="${item}"]`)
            const cardValues = card.querySelectorAll('.card-value')
            cardValues.forEach(item => {
                switch (item.dataset.type) {
                    case 'month_payment': 
                        item.innerHTML = `${this.getLocaleStringFromNumber(month_payment)}  ₽`
                        break;
                    case 'percent': 
                        item.innerHTML = percent
                        break;
                    case 'subsidy_period': 
                        item.innerHTML = subsidy_period
                        break;
                    case 'overpayment': 
                        item.innerHTML = `+ ${this.getLocaleStringFromNumber(overpayment)}  ₽`
                        break;
                }
            })
        }
    }

    /**
    * вернет существительное в нужном падеже
    * declOfNum(1, ['минута', 'минуты', 'минут']); // вернёт — минута
    * @param {number} n - число, от которого зависит падеж следующего сущ-ного
    * @param {string[], length: 3} text_forms  - массив из падежных форм
    * @returns {string} - возвращает строку из массива в нужном падеже
     */
    declOfNum(n, text_forms) {
        n = Math.abs(n) % 100; 
        var n1 = n % 10;
        if (n > 10 && n < 20) { return text_forms[2]; }
        if (n1 > 1 && n1 < 5) { return text_forms[1]; }
        if (n1 == 1) { return text_forms[0]; }
        return text_forms[2];
    }

    /**
     * посчитать значение в процентах для прогрессбара
     * @param {number} min 
     * @param {number} max 
     * @param {number} val 
     * @returns  {number}
     */
    rangeToPersent(min, max, val) {
        return (val - min) * 100 / (max - min)
    }

    /**
     * возвращает число, преобразованное в строку с разделителем в соответствии с текущей локалью
     * this.getLocaleStringFromNumber('898246') // '898 246'
     * @param {string} num 
     * @returns {string}
     */
    getLocaleStringFromNumber(num) {
        return parseInt([...num].map(item => item.trim()).join('')).toLocaleString()
    }


    init() {
        for (let range of  this.rangeInputs) {
            this.setRangeProgressFromInput(range) 
        }
        this.getTabData()
    }
    
  }
  
  export const initCalculator = (el = document.querySelectorAll('.calculator')) => {
    el.forEach(item => {
        if (item) {
            const _ = new Calculator(item);
            _.init()
        }
    })
}

  