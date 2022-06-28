class TabsSwitcher {
    constructor(elements) {
      this.tabSwitchers = elements
    }
  
  
    buildCache() {
      this.tabsData = document.querySelectorAll(`.calculator__data`)
      this.calculatorForm = document.querySelector('form[name="calculator_form"]')
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
            
        });
    }

    appendDataToTabs(data, tab) {
        for (let item in data) {
            const { month_payment,  percent, subsidy_period, overpayment } = data[item]
            const card = tab.querySelector(`[data-type="${item}"]`)
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
     * возвращает число, преобразованное в строку с разделителем в соответствии с текущей локалью
     * this.getLocaleStringFromNumber('898246') // '898 246'
     * @param {string} num 
     * @returns {string}
     */
     getLocaleStringFromNumber(num) {
        return parseInt([...num].map(item => item.trim()).join('')).toLocaleString()
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

  