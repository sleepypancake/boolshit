class TabsSwitcher {
    constructor(elements) {
      this.tabSwitchers = elements
    }
  
  
    buildCache() {
      this.tabsData = document.querySelectorAll(`.calculator__data`)
      this.calculatorForm = document.querySelector('form[name="calculator_form"]')
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
        $(this.tabSwitchers).on('click', (e) => {
            e.preventDefault()
            this.tabSwitchers.forEach(item => {
                if (item.classList.contains('calculator__tab--active')) {
                    item.classList.remove('calculator__tab--active')
                }
            })
            this.tabsData.forEach(item => {
                if (item.classList.contains('calculator__data--active')) {
                    item.classList.remove('calculator__data--active')
                }
                if (item.id === e.target.dataset.tab) {
                    this.getTabData(item)
                    item.classList.add('calculator__data--active')
                }
            })
            e.target.classList.add('calculator__tab--active')
            
        })
    }

    getTabData(item) {
        const {flat_price, first_payment, subsidy_period} = this.calculatorForm

        const data = {
            subsidy_type: item.id,
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
               this.appendDataToTabs(data, item)
            },
            error: ({err}) => {
                alert('Что-то пошло не так...')
                throw Error(err)
            }
            
        });
    }

    appendDataToTabs(data, tab) {
        for (let item in data) {
            const { month_payment,  percent, subsidy_period, overpayment } = data[item]
            const cardWrapper = tab.querySelector('.calculator__cards')
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
      this.buildCache()
      this.bindEvents()
    }
    
  }
  
  export const initTabs = (items = document.querySelectorAll('.calculator__tab')) => {
    if (items.length) {
        const _ = new TabsSwitcher(items);
        _.init()
    }
}

  