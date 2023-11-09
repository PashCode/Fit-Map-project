// Функция для замены ненужных символов на точку между цифрами.
const validateZeroAndSymbols = () => {
  formInput.forEach((el) => {
    el.addEventListener('input', (e) => {
      e.preventDefault()

      // Проверяем, что элемент является <input>.
      if (el.nodeName === 'INPUT') {
        // Если первый символ - цифра от 1 до 9, заменяем все символы, отличные от точки, на точку.
        if (/^[1-9]$/.test(el.value.charAt(0))) {
          el.value = el.value.replace(/[^0-9.]/g, '.')
        }
        // Если первый символ не является цифрой от 1 до 9, не разрешаем ввод других символов.
        else {
          el.value = ''
        }
      }
    })
  })
}

// Вызываем функцию для валидации '0', '+', '-', '*', '/', '=', а также для разрешения ввода ',' и '.' после числа.
validateZeroAndSymbols()

// Функция для обработки отправки формы
const handleFormSubmit = (e) => {
  e.preventDefault()
  let hasEmptyInput = false

  formInput.forEach((el) => {
    if (el.value === '' && !el.parentElement.classList.contains('form__row--hidden')) {
      hasEmptyInput = true
      markInvalidInput(el)
    } else {
      resetInputStyles(el)
    }
  })

  if (!hasEmptyInput) {
    createMarker(clickedPosition, map)
    controlFormRowVisibility()
    transformSubmitForm()
    resetForm()

    if (bouncingMark) {
      bouncingMark.setMap(null)
      bouncingMark = null
    }
  }
}

// Функция для пометки недопустимого ввода
const markInvalidInput = (el) => {
  el.style.background = '#CD5C5C'
  el.classList.remove('correct-input-text-color')
  el.classList.add('invalid-animation-input', 'invalid-input-text-color')
  // Перерисовка анимации дрожания
  el.classList.remove('invalid-animation-input')
  window.getComputedStyle(el).getPropertyValue('transform')
  el.classList.add('invalid-animation-input')
}

// Функция для сброса стилей инпута
const resetInputStyles = (el) => {
  el.style.background = 'rgb(214, 222, 224)'
  el.classList.remove('invalid-input-text-color', 'correct-input-text-color', 'invalid-animation-input')
}

// Функция которая после отправки формы сдвигает её вправо и потом возвращает обратно на место
const transformSubmitForm = () => {
  form.style.transform = 'translateX(50%)'
  form.style.height = '9.25rem'

  setTimeout(() => {
    form.style.transform = null
    form.style.height = null
  }, 600)
}

// Функция для добавления всем ненужным инпутам класса hidden. Остаются видимыми только 4 первых в Беге.
const controlFormRowVisibility = () => {
  // Найти все элементы с классом form__row
  const formRows = document.querySelectorAll('.form__row')

  // Пройти по всем элементам начиная с пятого (индекс 4) и добавить им класс form__row--hidden
  formRows.forEach((row, index) => {
    if (index >= 4) {
      row.classList.add('form__row--hidden')
    } else {
      row.classList.remove('form__row--hidden')
    }
  })
}

// Функция для сброса формы
const resetForm = () => {
  form.reset()
  form.classList.add('hidden')
  formInput.forEach((el) => resetInputStyles(el))
}

// Меняет инпут с метров на высоту и обратно
const changeInput = () => {
  inputType.addEventListener('change', (e) => {
    // Очищает заполненные инпуты при переключении вида тренировок
    formInput.forEach((el) => {
      if (el.nodeName === 'INPUT') {
        el.value = ''
        el.style.background = 'rgb(214, 222, 224)'
        el.classList.remove('invalid-animation-input')
        el.classList.replace('invalid-input-text-color', 'correct-input-text-color')
      }
    })

    if (e.target.value === 'cycling') {
      inputCadence.parentNode.classList.add('form__row--hidden')
      inputElevation.parentNode.classList.remove('form__row--hidden')
    }

    if (e.target.value === 'running') {
      inputElevation.parentNode.classList.add('form__row--hidden')
      inputCadence.parentNode.classList.remove('form__row--hidden')
    }
  })
}
// Вызываем функцию для изменения инпутов с метров на высоту и обратно
changeInput()

// Вызываем обработчик отправки формы
form.addEventListener('submit', handleFormSubmit)
