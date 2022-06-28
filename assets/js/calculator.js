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
      this.calculatorCardHtml = `
      <div class="calculator__card">
            <p class="calculator__card__title">Субсидирование на 1-2 года </p>
            <div class="calculator__card__info">
                <div class="calculator__card__info-col">
                    <span class="calculator__card__info-col-name">Ежемесячный платеж</span>
                    <span class="calculator__card__info-col-value card-value" data-type="month_payment">12 870 ₽</span>
                </div>
                <div class="calculator__card__info-col">
                    <span class="calculator__card__info-col-name">Процентная ставка</span>
                    <span class="calculator__card__info-col-value card-value highlighted" data-type="percent">от 0,1%</span>
                </div>
                <div class="calculator__card__info-col">
                    <span class="calculator__card__info-col-name">Срок субсидирования</span>
                    <span class="calculator__card__info-col-value card-value" data-type="subsidy_period">от 1 года</span>
                </div>
                <div class="calculator__card__info-col">
                    <span class="calculator__card__info-col-name">К стоимости квартиры</span>
                    <span class="calculator__card__info-col-value card-value" data-type="overpayment">+ 385 000 ₽</span>
                </div>
            </div>
        </div>`
        this.cardTitles = {
            partial_subsidy: 'Субсидирование на 1-2 года ',
            full_subsidy: 'Субсидирование на весь срок',
            basic: 'Базовая'
        }
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
                e.target.value = `${(e.target.value).replace(/[^0-9]/g, '')} ${this.declOfNum(e.target.value, ['год', 'года', 'лет'])}`
            } else  {
                e.target.value = this.getLocaleStringFromNumber(e.target.value)
            }
        });

        $(this.rangeInputs).on( 'change', (e) => {
            e.preventDefault();
            this.setRangeProgressFromInput(e.target)
        });

        // $(this.rangeInputs).on( 'change', (e) => {
        //     e.preventDefault();
        //     const { min, max } = this.getMinMaxValuesForInput(e.target)
        //     item.value = sliderMin
        //     $rangeProgressbar.css('width', this.rangeToPersent(sliderMin, sliderMax, sliderMin) + '%')
        //     if ( valueFromEl >= min && valueFromEl <= max) {
        //         item.classList.remove('error')
        //         $rangeSlider.val(valueFromEl)
        //         $rangeProgressbar.css('width', this.rangeToPersent(min, max, valueFromEl) + '%')
        //     }
        // });
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
        const { min, max } = this.getMinMaxValuesForInput(item)
        if ( valueFromEl >= min && valueFromEl <= max) {
            item.classList.remove('error')
            $rangeSlider.val(valueFromEl)
            $rangeProgressbar.css('width', this.rangeToPersent(min, max, valueFromEl) + '%')
            this.getTabData()
        } else {
            item.classList.add('error')
            item.value = min
            $rangeProgressbar.css('width', this.rangeToPersent(min, max, min) + '%')
            $rangeSlider.val(min)
        }

        // item.value = this.getLocaleStringFromNumber(item.value)
    }

    getMinMaxValuesForInput(item) {
        const $rangeSlider = $(item).siblings('input[type="range"]');
        const sliderMin = +$rangeSlider[0].min;
        const sliderMax = +$rangeSlider[0].max;
        return {min: sliderMin, max: sliderMax}
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
            error: ({err}) => {
                alert('Что-то пошло не так...')
                throw Error(err)
            }
        });
    }

    appendDataToTabs(data) {
        const cardWrapper = this.activeTab.querySelector('.calculator__cards')
        cardWrapper.innerHTML= ''
        for (let item in data) {
            const { month_payment,  percent, subsidy_period, overpayment } = data[item]
            const card = this.htmlToElement(this.calculatorCardHtml)
            card.classList.add(item)
            const cardTitle = card.querySelector('.calculator__card__title')
            cardTitle.innerHTML =  this.cardTitles[item]
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
            cardWrapper.appendChild(card)
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
        return parseInt([...num.replace(/[^0-9]/g, '')].map(item => item.trim()).join('')).toLocaleString()
    }

    /**
     * @param {String} HTML representing a single element
     * @return {Element}
     */
     htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
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

  