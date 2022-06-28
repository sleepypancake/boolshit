class FeedbackPopup {
    constructor(element) {
      this.feedbackPopup = element
    }
  
  
    buildCache() {
      this.feedbackOpeners = document.querySelectorAll('[data-open="feedback-popup"]')
      this.feedbackCloser = this.feedbackPopup.querySelector('.calc-popup__close')
      this.feedbackContent = this.feedbackPopup.querySelector('.calc-popup__content')
      this.feedbackForm = this.feedbackPopup.querySelector('form[name="feedback_form"]')
      this.formInputs = this.feedbackForm.querySelectorAll('input')
      this.inputName = this.feedbackForm.querySelector('[name="name"]')
      this.inputPhone = this.feedbackForm.querySelector('[name="phone"]')
      this.submitBtn = this.feedbackPopup.querySelector('.submit-btn')
    }
  
    bindEvents() {
        $(this.feedbackOpeners).on('click', (e) => {
            e.preventDefault()
            this.feedbackPopup.classList.add('calc-popup--active')
        })

        $(this.feedbackCloser).on('click', (e) => {
          e.preventDefault()
          this.feedbackPopup.classList.remove('calc-popup--active')
        })

        $(this.inputName).on('input', (e) => {
          e.target.value = e.target.value.replace(/[^a-zа-яё\s]/gi, '');
        })

        $(this.formInputs).on('change', (e) => {
          if(this.inputPhone.value && this.inputName.value) {
            this.submitBtn.disabled = false
          } else {
            this.submitBtn.disabled = true
          }
        })

        $(this.feedbackForm).on('submit', (e) => {
          e.preventDefault()
          const data = {
            name: this.inputName.value,
            phone: this.inputPhone.value
          }
          const url = this.feedbackForm.action
          this.sendFeedbackData(data, url)
        })
    }

    sendFeedbackData(data, url) {
      $.ajax({
        url,
        method: 'post', 
        dataType: 'json',
        data,
        success: () => {
           this.thanksContent()
        },
        error: ({err}) => {
          alert('Что-то пошло не так...')
          throw Error(err)
        }
      });
    }

    clearInputs() {
      this.submitBtn.disabled = true
      $(this.inputPhone).mask("+7(999) 999-99-99")
    }

    thanksContent() {
      const thanksHTML = `
        <p class="calc-popup__title">Спасибо за Ваше обращение!</p>
        <p class="calc-popup__message">В ближайшее время с Вами свяжется наш менеджер.</p>
      `
      this.feedbackContent.innerHTML = thanksHTML
      setTimeout(() => {
        this.feedbackPopup.classList.remove('calc-popup--active')
      }, 5000)
    }


    init() {
      this.buildCache()
      this.bindEvents()
      this.clearInputs()
      
    }
    
  }
  
export const initFeedbackPopup = (el = document.querySelectorAll('.calculator__feedback-popup')) => {
    el.forEach(item => {
        if (item) {
            const _ = new FeedbackPopup(item);
            _.init()
        }
    })
}

  