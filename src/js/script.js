//--------------------------------------------------------------------------------------------------------------------------------------
// ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ MAP ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃
//--------------------------------------------------------------------------------------------------------------------------------------
// Глобальные переменные для карты
let map
let currentPosition
let arrOfMarkers = []

//prettier-ignore
const months = [
  'Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
  'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня',
]

// DOM элементы
const containerWorkouts = document.querySelector('.workouts')
const everyWorkout = document.querySelectorAll('.workout')
const form = document.querySelector('.form')
const formInput = document.querySelectorAll('.form__input')
const inputType = document.querySelector('.form__input--type')
const inputDistance = document.querySelector('.form__input--distance')
const inputDuration = document.querySelector('.form__input--duration')
const inputCadence = document.querySelector('.form__input--cadence')
const inputPulse = document.querySelector('.form__input--pulse')
const sidebar = document.querySelector('.sidebar')
const header = document.querySelector('.header')
const mapElement = document.getElementById('map')
const errorMessage = document.querySelector('.header__error-input-message-wrap')
const focusOnHiddenElement = document.querySelector('.hidden-focus')
const sortButton = document.querySelector('.header__sort-wrap')
const sortCheckBox = document.querySelector('.header__checkbox-wrap')
const logo = document.querySelector('.header__icons-and-title-wrap')
const trainingNothing = document.querySelector('.sidebar__training-none-wrap')
const disclosureWorkoutsContainer = document.querySelector('.sidebar__disclosure-training')
const disclosureArrow = document.querySelector('.sidebar__arrow-icons')

// Если в локальном хранилище нет данных, то создать пустой массив, чтобы не было ошибок в консоли.
if (!localStorage.getItem('myWorkouts')) {
  localStorage.setItem('myWorkouts', JSON.stringify([]))
}
// Присваивание данных из локального хранилища в переменную dataLocalStorage
const dataLocalStorage = JSON.parse(localStorage.getItem('myWorkouts'))

const filterItemsUnderline = () => {
  sortCheckBox.addEventListener('click', (e) => {
    const checkboxes = sortCheckBox.querySelectorAll('.header__item-running, .header__item-cycling')

    checkboxes.forEach((checkbox) => {
      checkbox.classList.remove('filter-item-focus')
    })

    if (e.target.innerText === 'Біг' || e.target.innerText === 'Велосипед') {
      e.target.classList.add('filter-item-focus')
    }
  })
}

filterItemsUnderline()

// При кліку на логотип мапа переміщується до currentPosition
const logoClick = () => {
  logo.addEventListener('click', () => {
    map.setZoom(14)
    map.panTo(currentPosition, 500)
  })
}

logoClick()

const disclosureWorkouts = (state) => {
  sidebar.classList[state]('disclosure-workouts')
  disclosureArrow.classList[state]('rotate-arrow')
  disclosureWorkoutsContainer.classList[state]('background-close-workouts')
}

disclosureWorkoutsContainer.addEventListener('click', () => {
  disclosureWorkouts('toggle')
})

//-------------------------------------------------------------------------------------------------------------------

// Функция для отображения карты
const initializeMap = async () => {
  // Получение объекта карты из библиотеки
  const { Map } = await google.maps.importLibrary('maps')

  // Опции карты
  const mapOptions = {
    center: currentPosition, // Центр карты, координаты текущей позиции
    zoom: 14, // Уровень масштабирования карты
    mapId: 'a1c415ef104b9ec4', // Идентификатор карты
    mapTypeControl: false, // Отображение элемента управления типом карты
    streetViewControl: false, // Отображение элемента управления уличным видом
    fullscreenControl: false, // Отображение элемента управления полноэкранным режимом
    gestureHandling: 'greedy',
  }

  // Присваивание экземпляра переменной map
  map = new Map(document.getElementById('map'), mapOptions)

  // Инструкция для новичков
  instructionForNewUser(map)

  // Вызов функции markersOnMap и передача в эту функцию аргумента map
  clickedOnMap(map)

  // Вызов функции loadMarkers и передача в эту функцию аргумента map
  loadMarkers(map)
}
//-------------------------------------------------------------------------------------------------------------------

// Функция для обработки успешной геолокации.
const handleGeolocationSuccess = (position) => {
  // Получение объекта внутри которого координаты моего местоположения
  const coordinates = position.coords

  // Получение из объекта coordinates широты и долготы моего местоположения
  currentPosition = {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
  }

  // Создание карты только после получения координат
  initializeMap()
}
//------------------------------------------------------------------------------------------------------------------

// Функция для обработки ошибок геолокации
const handleGeolocationError = (error) => {
  // Код помилки при недоступній геолокації [error.code: 1]
  const errorCodeGeolocation = error.code === 1

  // html код, который вставляется на странице в случае какой-то ошибки
  const errorHtml = `
  <div class="errors-window">
    <div class="errors-window__content">
      <div class="errors-window__icon-wrap">
        <img class="errors-window__icon" src="icons/error-geolocation.svg" alt="" />
      </div>
      <p class="errors-window__text">
      ${
        errorCodeGeolocation
          ? `Неможливо отримати доступ до вашої геолокації. Будь ласка, надайте доступ і перезавантажте сторінку.`
          : `Виникла непередбачена помилка: код помилки - ${error.code}.
          <br> Перевірте підключення до інтернету.`
      }
      </p>
    </div>
  </div>
`

  // Убираю карту и инструкции для новичков, если геолокация недоступна.
  const hiddenMapAndInstruction = () => {
    startWindow1.classList.add('instruction-hidden')
    startWindow2.classList.add('instruction-hidden')
    startWindow3.classList.add('instruction-hidden')

    mapElement.classList.add('map-hidden')
  }

  // Добавляємо на мапу html розмітку про помилку
  if (errorCodeGeolocation) {
    mapElement.insertAdjacentHTML('beforeend', errorHtml)
    sidebar.classList.add('hidden-sidebar')
    hiddenMapAndInstruction()
  }
  // } else {
  //   mapElement.insertAdjacentHTML('afterend', errorHtml)
  // }
}
//-------------------------------------------------------------------------------------------------------------------

// Запрос текущего местоположения пользователя и обработка результатов
navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError)
//-------------------------------------------------------------------------------------------------------------------

let bouncingMark // Мітка кліка на мапу
let clickedPosition // Геолокація клікнутого місця на мапі

// Всё, что связано с кликом на карту. Параметр принимает map из функции initializeMap.
const clickedOnMap = (map) => {
  // Если метка при клике уже существует, удаляем ее
  const deleteMarkIfVisible = () => {
    if (bouncingMark) {
      bouncingMark.setMap(null)
    }
  }

  // Добавляю обработчик события клика по карте
  map.addListener('click', (e) => {
    // Получение координат кликнутой позиции
    clickedPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }

    // Если метка при клике уже существует, удаляем ее
    deleteMarkIfVisible()

    // Создаем новую метку ГДЕ КЛИКНУЛИ МЫШКОЙ [для удобства отображения клика перед постановкой метки]
    bouncingMark = new google.maps.Marker({
      position: clickedPosition, // Кликнутая позиция
      map, // Карта
      animation: google.maps.Animation.BOUNCE, // Анимация прыжков
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, // Иконка метки
        scale: 4, // Размер метки
        fillColor: 'transparent', // Цвет метки
        strokeWeight: 1, // Толщина границы
        strokeColor: 'white', // Цвет границы
      },
    })

    // Удаляем класс hidden при клике на карту, чтобы отобразить форму
    form.classList.remove('hidden')
  })

  // Удалить метку и спрятать форму при нажатии клавиши "Escape"
  const keydownHandler = (e) => {
    if (e.key === 'Escape') {
      // Прячу фокус на форму
      focusOnHiddenElement.focus()

      // Если метка  уже существует, удаляем ее
      deleteMarkIfVisible()

      // Очищаю стили незаполненных инпутов (красного цвета)
      formInput.forEach((everyInput) => {
        if (everyInput.nodeName === 'INPUT') {
          everyInput.value = ''
        }
        resetInputStyles(everyInput)
      })

      // Убираю текст ошибки над формой про незаполненные данные
      incorrectInputsError('remove')

      // Добавляю класс hidden, чтобы убрать форму
      form.classList.add('hidden')
    }
  }

  // Вызываю функцию
  document.addEventListener('keydown', keydownHandler)
}
//-------------------------------------------------------------------------------------------------------------------

//prettier-ignore
const createMarkerAndInfoWindow  = (position, typeTraining, distance, duration, cadence, pulse, dateTraining, map, markerId, animate)  => { 
  
  const iconPath = typeTraining === 'running' ? 'marker-running.svg' : 'marker-cycling.svg'

  // Определим анимацию на основе параметра `animate`
  const animation = animate ? google.maps.Animation.DROP : null

  const infoWindowRunning = `
  <span class="info-window-style-metrics">Показники &#10095;</span> ${distance} км • ${Number(duration).toFixed(2).replace('.', ':')} хв •
  ${cadence} кроків • ${(duration / distance).toFixed(2).replace('.', ':')} хв/км
  `

  const infoWindowCycling = `
  <span class="info-window-style-metrics">Показники &#10095;</span> ${distance} км • ${duration} хв •
  ${pulse} уд/хв • ${(distance / (duration / 60)).toFixed(2)} км/ч
  `

  const content = `<div class="info-window-style">
    <p class="info-window-style__item"><span class="info-window-style-metrics">Дата тренування ❯</span> ${dateTraining}</p>
    <p class="info-window-style__item">${typeTraining === 'running' ? infoWindowRunning : infoWindowCycling}</p>

    <div class="info-window-style-wrap">
  ${
    typeTraining === 'running'
      ? '<span class="info-window-style__purple"></span>'
      : '<span class="info-window-style__orange"></span>'
  }
  </div>
  </div>`

  // Создаем маркер
const marker = new google.maps.Marker({
  map, // К какой карте будет привязан маркер
  position, // Позиция маркера на карте (широта и долгота)
  icon: `icons/${iconPath}`, // Изображение, которое будет использоваться в качестве иконки маркера
  animation: `${animation}`, // Анимация маркера из переменной animation
  optimized: true, // Оптимизация маркера для повышения производительности
  markerID: markerId, // Уникальный идентификатор маркера
  typeTraining: typeTraining, // Тип создаваемой тренировки
})

// Добавляет маркер в массив
  arrOfMarkers.push(marker)

  // Создаем информационное окно
  const infowindow = new google.maps.InfoWindow({
    content,
  })

  // Инициализируем переменную для отслеживания состояния маркера
  let isOpen
  // Добавляем обработчик события клика на маркер
  {
    marker.addListener('click', () => {
      focusOnHiddenElement.focus()
      // Если маркер закрыт, открываем его
      if (!isOpen) {
        infowindow.open(map, marker)
        isOpen = true
      } else {
        // Если маркер открыт, закрываем его
        infowindow.close()
        isOpen = false
      }
    })
  }

  // Добавляем обработчик события закрытия информационного окна
  infowindow.addListener('closeclick', () => {
    isOpen = false // Устанавливаем флаг isOpen в false при закрытии окна

    // При закрытии информационного окна, установить фокус на инпут, иначе фокус будет на метке и будет её обводить.
    focusOnHiddenElement.focus()
  })
}
//-------------------------------------------------------------------------------------------------------------------

// Функция для создания маркера на основе последней тренировки в локальном хранилище
const createNewMarker = (map) => {
  const workoutForMarkerAndWindow = JSON.parse(localStorage.getItem('myWorkouts'))
  const lastWorkout = workoutForMarkerAndWindow[workoutForMarkerAndWindow.length - 1]

  createMarkerAndInfoWindow(
    lastWorkout.latLng, // Широта и долгота последней тренировки
    lastWorkout.typeTraining, // Тип последней тренировки
    lastWorkout.distance, // Дистанция последней тренировки
    lastWorkout.duration, // Длительность последней тренировки
    lastWorkout.cadence, // Темп последней тренировки
    lastWorkout.pulse, // Пульс последней тренировки
    lastWorkout.dateTraining, // Дата последней тренировки
    map, // Карта
    lastWorkout.trainingId, // Айди последней тренировки
    true // Аргумент для понимания нужна ли анимация для создания маркера [в данном случае анимация нужна]
  )
}

// Функция для загрузки маркеров при загрузке страницы
const loadMarkers = (map) => {
  // Пройдитесь по списку маркеров и создайте их на карте
  dataLocalStorage.forEach((workout) => {
    createMarkerAndInfoWindow(
      workout.latLng, // Широта и долгота тренировки
      workout.typeTraining, // Тип тренировки
      workout.distance, // Дистанция тренировки
      workout.duration, // Длительность тренировки
      workout.cadence, // Темп тренировки
      workout.pulse, // Пульс тренировки
      workout.dateTraining, // Дата тренировки
      map, // Карта
      workout.trainingId, // Айди тренировки
      false // Аргумент для понимания нужна ли анимация для создания маркера [в данном случае анимация не нужна]
    )

    form.insertAdjacentHTML('afterend', workout.insertTypeHtml) // Отображение каждой тренировки на странице
  })
}
//-------------------------------------------------------------------------------------------------------------------

// Получение массива маркеров асинхронно, чтобы использовать их дальше в коде
function waitForMarkersToLoad() {
  return new Promise((resolve) => {
    // Проверяйте, заполнен ли массив arrOfMarkers, и если да, то выполните resolve
    const checkMarkers = () => {
      if (arrOfMarkers.length > 0) {
        resolve()
      } else {
        setTimeout(checkMarkers, 100) // Проверьте снова через 100 миллисекунд
      }
    }
    checkMarkers()
  })
}

//-------------------------------------------------------------------------------------------------------------------

// Что делать карте и маркерам при нажатии на какую-то тренировку
const movingMapToMarker = () => {
  containerWorkouts.addEventListener('click', (e) => {
    // Получение конкретно нажатой тренировки
    if (e.target.classList.contains('workout')) {
      // Получение dataset айди нажатой тренировки
      const workoutItem = e.target
      const workoutId = workoutItem.dataset.workoutId

      // Сравнение айди тренировки и айди маркера
      const matchingMarker = arrOfMarkers.find((marker) => marker.markerID === workoutId)

      if (matchingMarker) {
        // Получение широты и долготы маркера тренировки, которая нажимается
        const markerPosition = matchingMarker.getPosition()

        // Центрирование маркера по дефолту, по центру карты [но у меня центр должен быть смещен левее, так как справа есть sidebar]
        map.setCenter(markerPosition)

        const currentCenter = map.getCenter() // Получение центра карты

        const horizontalOffset = -0.025 // Смещение карты левее от дефолтного map.setCenter(markerPosition)
        const newCenterLng = currentCenter.lng() - horizontalOffset // Высчитывание новых нужных мне координат центра карты
        const newCenterDesktop = new google.maps.LatLng(currentCenter.lat(), newCenterLng) // Создание новой LatLng позиции с кастомными координатами

        const verticalOffset = 0.006 // Смещение карты выше от дефолтного map.setCenter(markerPosition)
        const newCenterLat = currentCenter.lat() - verticalOffset // Высчитывание новых нужных мне координат центра карты
        const newCenterMobile = new google.maps.LatLng(newCenterLat, currentCenter.lng()) // Создание новой LatLng позиции с кастомными координатами

        // Уровень зума карты при перемещении карты на нужный маркер
        map.setZoom(14)

        if (window.innerWidth >= 1279) {
          // Установка нового кастомного центра карты с анимацией за 0.5 секунды
          map.panTo(newCenterDesktop, 500)
        } else {
          map.panTo(newCenterMobile, 1500)
          disclosureWorkouts('remove')
        }

        // Анимация для маркера к которому переместилась карта
        matchingMarker.setAnimation(google.maps.Animation.BOUNCE)

        // Через сколько анимация маркера остановится
        setTimeout(() => {
          matchingMarker.setAnimation(null)
        }, 2150)

        // Отключение анимации для всех других маркеров
        arrOfMarkers.forEach((marker) => {
          if (marker !== matchingMarker) {
            marker.setAnimation(null)
          }
        })
      }
    }
  })
}
movingMapToMarker()

//--------------------------------------------------------------------------------------------------------------------------------------
// ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ CREATE APP ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃
//--------------------------------------------------------------------------------------------------------------------------------------
class TrainingComponents {
  constructor() {
    // Дата и время
    const currentDate = new Date() // Получение текущей даты и времени
    this.getMinutes = currentDate.getMinutes().toString().padStart(2, '0') // Получение минут с добавлением нуля в начале, если нужно
    this.getHours = currentDate.getHours() // Получение часов
    this.getDay = currentDate.getDate() // Получение текущего дня месяца
    this.getMonth = months[currentDate.getMonth()] // Получение текущего месяца
    this.dateTraining = `${this.getDay} ${this.getMonth} ${this.getHours}:${this.getMinutes}` // Конечная дата и время тренировки

    this.timestamp = currentDate.getTime() // Получение текущей даты в формате timestamp

    this.dateTraining = `${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getHours()}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}` // Конечная дата и время тренировки

    this.trainingId = String(new Date().getTime()).slice(-5) // id тренировки

    this.typeTraining = inputType.value // Название тренировки

    this.latLng = clickedPosition // Широта и долгота маркера и тренировки

    // html код для отображения тренировки
    //prettier-ignore
    this.insertTypeHtml = `<li class="workout ${
      inputType.value === 'running' ? 'workout--running' : 'workout--cycling'
    }" data-workout-id="${this.trainingId}">

    <div class="workout__delete-wrap">
    <img class="workout__delete-icon" src="icons/cross.svg" alt="Видалити тренування" />
  </div>

    <div class="workout__title-wrap">
    <div class="workout__training-wrap">
    <span class="workout__type-training"> ${inputType.value === 'running' ? 'Біг' : 'Велосипед'} &#10095;</span>
    <div class="workout__date-training">${this.getDay} <span class="workout__style-month">${this.getMonth}</span> ${this.getHours}:${this.getMinutes}
    </div>
  </div>
    </div>

    <div class="workout__details">
    <span class="workout__icon">${inputType.value === 'running' ? '🏃🏻' : '🚴🏻'}</span>
    <span class="workout__value">${inputDistance.value}</span>
    <span class="workout__unit">км</span>
    </div>

    <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${Number(inputDuration.value).toFixed(2).replace('.', ':')}</span>
    <span class="workout__unit">хв</span>
    </div>

    <div class="workout__details">
    <span class="workout__icon">💨</span>
    <span class="workout__value">${
      inputType.value === 'running'
        ? (inputDuration.value / inputDistance.value).toFixed(2).replace('.', ':')
        : (inputDistance.value / (inputDuration.value / 60)).toFixed(2)
    } <span>
    <span class="workout__unit">${inputType.value === 'running' ? 'хв/км' : 'км/год'}</span>
    </div>

    <div class="workout__details">
    <span class="workout__icon">${inputType.value === 'running' ? '🦶🏼' : '🖤'}</span>
    <span class="workout__value">${inputType.value === 'running' ? inputCadence.value : inputPulse.value}</span>
    <span class="workout__unit">${inputType.value === 'running' ? 'кроків' : 'уд/хв'}</span>
    </li>`
  }
}
//-------------------------------------------------------------------------------------------------------------------

class Running extends TrainingComponents {
  constructor(distance, duration, cadence) {
    super()
    this.distance = distance
    this.duration = duration
    this.cadence = cadence
  }
}

class Cycling extends TrainingComponents {
  constructor(distance, duration, pulse) {
    super()
    this.distance = distance
    this.duration = duration
    this.pulse = pulse
  }
}
//-------------------------------------------------------------------------------------------------------------------
// Массив для хранения скрытых маркеров
const hiddenMarkers = []

function incorrectInputsError(state) {
  if (state === 'add') {
    errorMessage.classList[state]('visible-input-error')
    return 'Некорректно введенные данные в форме'
  }
  if (state === 'remove') {
    return errorMessage.classList[state]('visible-input-error')
  }
}

class App {
  constructor() {
    // Инициализация массива для хранения тренировок
    this.workouts = JSON.parse(localStorage.getItem('myWorkouts'))

    // Привязываю метод formSubmit к текущему экземпляру и вызываю его, когда нужно
    this.formSubmit = this.formSubmit.bind(this)
    form.addEventListener('submit', this.formSubmit)

    // Привязываю метод deleteWorkoutAndMarkers к текущему экземпляру и вызываю его, когда нужно
    this.deleteTrainingAndMarkers = this.deleteWorkoutAndMarkers.bind(this)
    containerWorkouts.addEventListener('click', (e) => {
      if (e.target.closest('.workout__delete-icon, .workout__delete-wrap')) {
        // Получи родительский элемент, который имеет класс "workout"
        const workoutItem = e.target.closest('.workout')
        const workoutId = workoutItem.dataset.workoutId // Получи ID тренировки
        this.deleteWorkoutAndMarkers(workoutItem, workoutId)
      }
    })

    // Привязываю метод sortTraining к текущему экземпляру и вызываю его, когда нужно
    this.sortTraining = this.sortTraining.bind(this)
    const actionMap = {
      'header__sort-text': () => {
        sortButton.classList.toggle('header-sort-active')
        sortCheckBox.classList.toggle('checkbox-wrap-visible')
      },
      'header__item-running': () => this.sortTraining('running'),
      'header__item-cycling': () => this.sortTraining('cycling'),
      'header__item-clear': () => this.restoreTraining(),
    }

    sidebar.addEventListener('click', (event) => {
      const targetClass = event.target.classList
      for (const className in actionMap) {
        if (targetClass.contains(className)) {
          actionMap[className]()
          break // Выход из цикла, чтобы выполнить только одно действие
        }
      }
    })

    this.availableTraining() // Добавляю надпись про пустой список тренировок если длина хранилища = 0
  }

  // Проверка доступности тренировок и скрытие/показ сообщения
  availableTraining() {
    !this.workouts.length
      ? trainingNothing.classList.remove('hidden-training')
      : trainingNothing.classList.add('hidden-training')
  }

  // Создание новой тренировки
  createWorkout(distance, duration, cadence, pulse) {
    try {
      let workout //

      const emptyInputs = distance !== '' && duration !== '' && (cadence !== '' || pulse !== '') // Проверяем пустые строки в каждом инпуте
      const isRunning = inputType.value === 'running' && emptyInputs // Проверяем тип тренировки и пустые строки
      const isCycling = inputType.value === 'cycling' && emptyInputs // Проверяем тип тренировки и пустые строки

      if (isRunning || isCycling) {
        workout = isRunning ? new Running(distance, duration, cadence) : new Cycling(distance, duration, pulse) // Создаем тренировку
      } else {
        throw new Error(incorrectInputsError('add')) // Если isRunning || isCycling === false, то выводим ошибку
      }

      form.insertAdjacentHTML('afterend', workout.insertTypeHtml) // Создание тренировки (вставка html кода)

      incorrectInputsError('remove') // Если isRunning || isCycling === true, то убираем ошибку

      this.workouts.push(workout) // Добавляем тренировку в массив
      localStorage.setItem('myWorkouts', JSON.stringify(this.workouts)) // Сохранение списка тренировок в LocalStorage после добавления новой тренировки

      this.availableTraining() // Убираю надпись про пустой список тренировок если длина хранилища > 0
    } catch (error) {
      console.error(error.message)
    }
  }

  // Функция для удаления тренировки
  deleteWorkoutAndMarkers(workoutItem, workoutId) {
    // Удаление маркера
    const deleteMarker = () => {
      const markerIndexToDelete = arrOfMarkers.findIndex((everyMarker) => everyMarker.markerID === workoutId) // Поиск индекса маркера по markerID

      if (markerIndexToDelete !== -1) {
        const deletedMarker = arrOfMarkers.splice(markerIndexToDelete, 1)[0] // Удаление маркера по индексу
        deletedMarker.setMap(null)
      }
    }

    // Удаление тренировки
    const deleteWorkout = () => {
      const indexToDelete = this.workouts.findIndex((workout) => workout.trainingId === workoutId) // Поиск индекса тренировки по trainingId

      if (indexToDelete !== -1) {
        workoutItem.remove() // Удаление тренировки и элемента из DOM
        this.workouts.splice(indexToDelete, 1) // Удаляем тренировку из массива this.workouts
        localStorage.setItem('myWorkouts', JSON.stringify(this.workouts)) // Сохраняем обновленный массив в локальное хранилище
      }
    }

    deleteMarker()
    deleteWorkout()
    this.availableTraining() // Добавляю надпись про пустой список тренировок если все тренировки удалены
  }

  // Сортировка тренировок по типу
  sortTraining(typeTraining) {
    // Очищаем контейнер перед добавлением отсортированных тренировок
    containerWorkouts.innerHTML = ''

    // Переместите форму перед отображенными тренировками
    containerWorkouts.insertAdjacentElement('beforeend', form)

    // Фильтр маркеров по типу тренировки. Если нажата тренировка бега, то маркеры велосипеда пропадают и наоборот
    waitForMarkersToLoad().then(() => {
      arrOfMarkers.forEach((el) => {
        if (el.typeTraining !== typeTraining) {
          el.setMap(null)
          hiddenMarkers.push(el)
        } else {
          el.setMap(map)
        }
      })
    })

    // Отображение тренировок при фильтрации. Сортировка из-за считывания тренировок в локальном хранилище снизу-вверх.
    this.workouts
      .filter((workout) => workout.typeTraining === typeTraining)
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((el) => {
        containerWorkouts.insertAdjacentHTML('beforeend', el.insertTypeHtml)
      })

    // Показать или скрыть сообщение об отсутствии тренировок
    !this.workouts.some((workout) => workout.typeTraining === typeTraining)
      ? trainingNothing.classList.remove('hidden-training')
      : trainingNothing.classList.add('hidden-training')
  }

  // Сброс фильтра и возврат всех типов тренировок на страницу
  restoreTraining() {
    // Очистка контейнера от отфильтрованных тренировок
    containerWorkouts.innerHTML = ''

    // Добавление всех тренировок находящихся в локальном хранилище на страницу
    this.workouts.forEach((workout) => {
      containerWorkouts.insertAdjacentHTML('afterbegin', workout.insertTypeHtml)
    })

    // Показать оставшиеся маркеры на карте
    arrOfMarkers.forEach((el) => {
      el.setMap(map)
    })

    // Очистить массив скрытых маркеров
    hiddenMarkers.length = 0

    // Переместите форму перед отображенными тренировками
    containerWorkouts.insertAdjacentElement('afterbegin', form)

    // Убрать надпись не добавленных тренировок, если какой-то из типов тренировок не был заполнен
    this.availableTraining()
  }

  // Обработчик отправки формы
  formSubmit(e) {
    e.preventDefault()
    this.createWorkout(inputDistance.value, inputDuration.value, inputCadence.value, inputPulse.value)
  }
}

const app = new App()

//--------------------------------------------------------------------------------------------------------------------------------------
// ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ VALIDATE ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃
//--------------------------------------------------------------------------------------------------------------------------------------
// Валидация. Можно вписывать 1-9 и одну точку между ними.
function validateInputs() {
  formInput.forEach((el) => {
    el.addEventListener('input', (e) => {
      // Получаем значение элемента
      const value = el.value

      // Проверяем, что элемент является <input>.
      if (el.nodeName === 'INPUT') {
        // Заменяем все запятые на точки, кроме первой
        const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(/,/, '.')

        const parts = sanitizedValue.split('.')

        if ((parts.length === 1 && (e.data === '.' || e.data === ',')) || (parts.length > 1 && parts[0] === '')) {
          // Если введена точка или запятая в начале или после числа с уже имеющейся точкой или запятой, отменяем ввод
          el.value = parts[1] ? '0.' + parts[1] : '' // Если после 0 есть другие цифры, разрешаем только 0. и далее
        } else if (parts.length > 2 || (parts.length === 2 && (e.data === '.' || e.data === ','))) {
          // Если есть более одной точки или запятой или попытка ввести точку или запятую после числа и точка или запятая уже есть, отменяем ввод
          el.value = parts[0] + '.' + parts.slice(1).join('')
        } else {
          // Проверяем, чтобы 0 не стояло в начале значения, за исключением случая 0 после точки или запятой
          if ((parts[0] === '0' && parts[1] !== '0') || (parts[0] === '0' && e.data !== '.' && e.data !== ',')) {
            el.value = parts[1] ? '0.' + parts[1] : '' // Если после 0 есть другие цифры, разрешаем только 0. и далее
          } else {
            el.value = sanitizedValue
          }
        }
      }
    })
  })
}

// Вызываем функцию для валидации '0', '+', '-', '*', '/', '=', а также для разрешения ввода '.' после числа.
validateInputs()

//-------------------------------------------------------------------------------------------------------------------

// Функция для обработки отправки формы
const handleFormSubmit = (e) => {
  e.preventDefault()
  let hasEmptyInput = false

  formInput.forEach((input) => {
    if (input.value === '' && !input.parentElement.classList.contains('form__row--hidden')) {
      hasEmptyInput = true
      markInvalidInput(input)
    } else {
      resetInputStyles(input)
    }
  })

  if (!hasEmptyInput) {
    createNewMarker(map)
    controlFormRowVisibility()
    resetForm()

    bouncingMark.setMap(null)
  }
}
//-------------------------------------------------------------------------------------------------------------------

// Функция для пометки недопустимого ввода
const markInvalidInput = (input) => {
  // input.classList.remove('correct-input-text-color')
  input.classList.add('invalid-animation-input', 'invalid-input-text-color', 'invalid-input-background-color')
  // Перерисовка анимации дрожания
  input.classList.remove('invalid-animation-input')
  window.getComputedStyle(input).getPropertyValue('transform')
  input.classList.add('invalid-animation-input')
}
//-------------------------------------------------------------------------------------------------------------------

// Функция для сброса стилей инпута
const resetInputStyles = (input) => {
  input.classList.remove('invalid-input-text-color', 'invalid-animation-input', 'invalid-input-background-color')
}
//-------------------------------------------------------------------------------------------------------------------

// Функция для добавления всем ненужным инпутам класса hidden. Остаются видимыми только 4 первых.
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
//-------------------------------------------------------------------------------------------------------------------

// Функция для сброса формы
const resetForm = () => {
  form.reset()
  form.classList.add('hidden')
  formInput.forEach((input) => resetInputStyles(input))
}
//-------------------------------------------------------------------------------------------------------------------

// Меняет инпут с метров на высоту и обратно
const changeInput = () => {
  inputType.addEventListener('change', (e) => {
    e.preventDefault()

    // Очищает заполненные инпуты при переключении вида тренировок
    formInput.forEach((input) => {
      if (input.nodeName === 'INPUT') {
        // Делаю инпуты disabled на 0.5 секунд, иначе скачет клавиатура
        input.setAttribute('disabled', 'disabled')
        input.classList.add('delay-inputs-after-select')
        setTimeout(() => {
          input.removeAttribute('disabled')
          input.classList.remove('delay-inputs-after-select')
        }, 500)

        input.value = ''
        incorrectInputsError('remove')
        input.classList.remove('invalid-animation-input', 'invalid-input-background-color', 'invalid-input-text-color')
      }
    })

    const changeInputs = {
      cycling: { show: inputPulse, hide: inputCadence },
      running: { show: inputCadence, hide: inputPulse },
    }

    const { show, hide } = changeInputs[e.target.value] || { show: inputPulse, hide: inputCadence }
    show.parentNode.classList.remove('form__row--hidden')
    hide.parentNode.classList.add('form__row--hidden')
  })
}
// Вызываем функцию для изменения инпутов с метров на пульс и обратно
changeInput()

// Вызываем обработчик отправки формы
form.addEventListener('submit', handleFormSubmit)

// INSTRUCTION FOR NEW USERS
const instructionForNewUser = (map) => {
  const startWindow1 = document.querySelector('.start-instruction-window-1')
  const startWindow2 = document.querySelector('.start-instruction-window-2')
  const startWindow3 = document.querySelector('.start-instruction-window-3')

  // Проверяем, что элемент является input и заполнен.
  const checkInputs = (el) => el.nodeName === 'INPUT' && el.value !== ''
  // Функция для скрытия элемента
  const hideElement = (element) => element.classList.add('instruction-hidden')
  // Функция для отображения элемента
  const showElement = (element) => element.classList.remove('instruction-hidden')
  //prettier-ignore
  const localStorageEmpty = () => localStorage.getItem('visitedInstruction1/2') === null

  // Первая инструкция
  if (!localStorage.getItem('visitedInstruction1/2')) {
    showElement(startWindow1)
    map.addListener('click', () => {
      if (localStorageEmpty()) {
        hideElement(startWindow1)
        showElement(startWindow2)
      }
    })

    // Вторая инструкция
    formInput.forEach((el) => {
      el.addEventListener('input', (e) => {
        e.preventDefault()
        // Проверяем, что элемент является <input> и заполнен.
        if (checkInputs(el)) {
          form.addEventListener('submit', () => {
            if (localStorageEmpty()) {
              hideElement(startWindow2)
              showElement(startWindow3)
            }
            localStorage.setItem('visitedInstruction1/2', 'true')
          })
        }
      })
    })
  }

  // Третья инструкция
  if (!localStorage.getItem('visitedInstruction2/2')) {
    waitForMarkersToLoad().then(() => {
      arrOfMarkers.forEach((el) => {
        el.addListener('click', () => {
          hideElement(startWindow3)
          localStorage.setItem('visitedInstruction2/2', 'true')
        })
      })
    })
  }
}

function updatePlaceholder() {
  const windowWidth = window.innerWidth

  if (windowWidth < 561) {
    inputDistance.placeholder = 'км'
    inputDuration.placeholder = 'хв'
    inputCadence.placeholder = 'кроків'
    inputPulse.placeholder = 'уд/хв'
  } else {
    inputDistance.placeholder = 'кілометрів'
    inputDuration.placeholder = 'хвилин'
    inputCadence.placeholder = 'кроків'
    inputPulse.placeholder = 'ударів/хв'
  }
}

// Вызови функцию при загрузке страницы
updatePlaceholder()

// Также вызывай функцию при изменении размеров окна
window.addEventListener('resize', updatePlaceholder)
