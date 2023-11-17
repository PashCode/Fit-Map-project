// DOM елементи
const mapElement = document.getElementById('map') // Мапа

const containerWorkouts = document.querySelector('.workouts') // Контейнер зі всіма тренуваннями і формою

const form = document.querySelector('.form') // Форма вводу
const formInput = document.querySelectorAll('.form__input') // Кожний інпут форми вводу
const inputType = document.querySelector('.form__input_type') // Вибір тренування, біг чи велосипед
const inputDistance = document.querySelector('.form__input_distance') // Дистанція
const inputDuration = document.querySelector('.form__input_duration') // Тривалість
const inputCadence = document.querySelector('.form__input_cadence') // Темп
const inputPulse = document.querySelector('.form__input_pulse') // Пульс

const sidebar = document.querySelector('.sidebar') // Сайдбар
const header = document.querySelector('.header') // Хедер
const errorMessage = document.querySelector('.header__error-input-message-wrap') // Повідомлення про незаповнену форму
const filterButton = document.querySelector('.header__filter-wrap') // Напис "Фільтрувати"
const filterCheckBox = document.querySelector('.header__checkbox-wrap') // Контейнер з фільтрами тренувань та скиданням фільтрів
const logo = document.querySelector('.header__icon-and-title-wrap') // Контейнер логотипу і напису "FitMap"
const emptyTrainingList = document.querySelector('.sidebar__empty-training-list-wrap') // Напис про порожній список тренувань
const disclosureWorkoutsContainer = document.querySelector('.sidebar__disclosure-training') // Контейнер розгортання/згортання сайдбару для моб.
const disclosureArrow = document.querySelector('.sidebar__arrow-icon') // Стрілка всередині контейнера для розгортання/згортання

const focusOnHiddenElement = document.querySelector('.hidden-focus') // Порожній елемент для фокусування
//---------------------------------------------------------------------------------

// Якщо в локальному сховищі немає даних, то створити порожній масив, щоб не було помилок у консолі
if (!localStorage.getItem('myWorkouts')) {
  localStorage.setItem('myWorkouts', JSON.stringify([]))
}
// Присвоювання даних із локального сховища у змінну dataLocalStorage
const dataLocalStorage = JSON.parse(localStorage.getItem('myWorkouts'))
//---------------------------------------------------------------------------------

let map // Змінна для мапи
let currentPosition // Поточна геолокація користувача

// Функція для ініціалізації карти
const initializeMap = async () => {
  // Отримання об'єкта карти з бібліотеки
  const { Map } = await google.maps.importLibrary('maps')

  // Опції карти
  const mapOptions = {
    center: currentPosition, // Центр карти - координати поточної позиції
    zoom: 14, // Рівень масштабування карти
    mapId: 'a1c415ef104b9ec4', // Ідентифікатор карти
    mapTypeControl: false, // Відображення елемента управління типом карти
    streetViewControl: false, // Відображення елемента управління вуличним видом
    fullscreenControl: false, // Відображення елемента управління повноекранним режимом
    gestureHandling: 'greedy', // Переміщення мапи одним пальцем
  }

  // Присвоєння екземпляра змінній map
  map = new Map(document.getElementById('map'), mapOptions)

  // Виклик інструкція для новачків
  instructionForNewUser(map)

  // Виклик функції clickedOnMap та передача в неї аргумента map
  clickedOnMap(map)

  // Виклик функції loadMarkers та передача в неї аргумента map
  loadMarkers(map)
} //---------------------------------------------------------------------------------

// Функція для обробки успішного визначення геолокації.
const handleGeolocationSuccess = (position) => {
  const coordinates = position.coords // Отримання об'єкта, в якому містяться координати мого місцезнаходження

  // Витягування широти та довготи мого місцезнаходження з об'єкта coordinates
  currentPosition = {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
  }

  initializeMap() // Створення карти тільки після отримання координат
} //------------------------------------------------------------------------------------------------------------------

// Функція для обробки помилок геолокації
const handleGeolocationError = (error) => {
  const errorCodeGeolocation = error.code === 1 // Код помилки, коли геолокація недоступна [error.code: 1]

  // HTML-код, який вставляється на сторінку у випадку помилки
  const errorHtml = `
  <div class="errors-window">
    <div class="errors-window__content">
      <div class="errors-window__icon-wrap">
        <img class="errors-window__icon" src="dist/icons/error-geolocation.svg" alt="" />
      </div>
      <p class="errors-window__text">
      ${
        errorCodeGeolocation
          ? `Без доступу до геолокації неможливо користуватися додатком. Надайте доступ і перезавантажте сторінку.`
          : `Виникла непередбачена помилка: код помилки - ${error.code}.
          <br> Перевірте підключення до інтернету.`
      }
      </p>
    </div>
  </div>
`

  // Приховуємо інструкції для новачків, якщо геолокація недоступна.
  const hideMapAndInstruction = () => {
    ;[startWindow1, startWindow2, startWindow3].forEach((element) => {
      element.classList.add('instruction-hidden')
    })
  }

  // Додаємо на карту HTML-розмітку про помилку
  if (errorCodeGeolocation) {
    mapElement.insertAdjacentHTML('beforeend', errorHtml)
    sidebar.classList.add('hidden-sidebar')
    hideMapAndInstruction()
  }
} //---------------------------------------------------------------------------------

// Запит поточного місцезнаходження користувача та обробка результатів
navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError)
//---------------------------------------------------------------------------------

let bouncingMark // Мітка кліка на мапу
let clickedPosition // Геолокація клікнутого місця на мапі

// Все, що пов'язано з кліком на мапу. Параметр отримує map з функції initializeMap.
const clickedOnMap = (map) => {
  // Якщо мітка вже існує при кліку, видаляємо її
  const deleteMarkIfVisible = () => {
    if (bouncingMark) {
      bouncingMark.setMap(null)
    }
  }

  // Додаємо обробник події кліку по мапі
  map.addListener('click', (e) => {
    // Отримання координат клікнутої позиції
    clickedPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }

    deleteMarkIfVisible() // Якщо мітка вже існує при кліку, видаляємо її

    // Створюємо нову мітку, ДЕ КЛІКНУЛИ МИШЕЮ [для зручності відображення кліка перед постановкою мітки]
    bouncingMark = new google.maps.Marker({
      position: clickedPosition, // Клікнута позиція
      map, // Мапа
      animation: google.maps.Animation.BOUNCE, // Анімація стрибків
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, // Іконка мітки
        scale: 4, // Розмір мітки
        fillColor: 'transparent', // Колір мітки
        strokeWeight: 1, // Товщина обводки
        strokeColor: 'white', // Колір обводки
      },
    })

    form.classList.remove('hidden') // Видаляємо клас hidden при кліку на мапі, щоб відобразити форму

    // Якщо ширина екрану нижче 1279 [планшети], то при подвійному кліку на формі вона сховається
    if (window.innerWidth <= 1279) {
      form.addEventListener('dblclick', () => {
        resetForm() // Ховаємо форму і скидаємо всі стилі
        deleteMarkIfVisible() // Ховається bouncingMark
        incorrectInputsError('remove') // Ховається повідомлення про незаповнені інпути
      })
    }

    // Якщо я знаходжусь в кінці списку тренувань, то при появі форми прокрутити контейнер на самий верх, щоб форма була помітна
    containerWorkouts.scrollTo(0, -1)
  })

  // Видалити мітку і приховати форму при натисканні клавіші "Escape"
  const keydownHandler = (e) => {
    if (e.key === 'Escape') {
      focusOnHiddenElement.focus() // Приховую фокус з форми на невидимий елемент
      deleteMarkIfVisible() // Якщо мітка вже існує, видаляємо її

      // Очищаю стилі незаповнених інпутів [червоного кольору]
      formInput.forEach((everyInput) => {
        if (everyInput.nodeName === 'INPUT') {
          everyInput.value = ''
        }
        resetInputStyles(everyInput)
      })

      incorrectInputsError('remove') // Прибираю текст помилки над формою про незаповнені дані
      form.classList.add('hidden') // Додаю клас hidden, щоб прибрати форму
    }
  }

  document.addEventListener('keydown', keydownHandler) // Викликаю функцію при натисканні на "Escape"
} //---------------------------------------------------------------------------------

let arrOfMarkers = [] // Масив для збереження кожного маркеру

// Функція для створення маркерів та інформаційних вікон
const createMarkerAndInfoWindow = (
  position, // Широта і довгота тренування
  typeTraining, // Тип тренування
  distance, // Дистанція
  duration, // Тривалість
  cadence, // Темп
  pulse, // Пульс
  dateTraining, // Дата
  map, // Мапа
  markerId, // Айді маркера
  animate // Потрібна анімація, чи ні
) => {
  const iconPath = typeTraining === 'running' ? 'dist/icons/marker-running.svg' : 'dist/icons/marker-cycling.svg' // Який маркер поставити на мапу, в залежності від типу тренування
  const animation = animate ? google.maps.Animation.DROP : null // Визначаємо анімацію на основі параметра `animate`

  // HTML розмітка інформаційного вікна для типу "Біг"
  const infoWindowRunning = `
  <span class="info-window-style-metrics">Показники &#10095;</span> ${distance} км • ${Number(duration)
    .toFixed(2)
    .replace('.', ':')} хв •
  ${cadence} кроків • ${(duration / distance).toFixed(2).replace('.', ':')} хв/км
  `
  // HTML розмітка інформаційного вікна для типу "Велосипед"
  const infoWindowCycling = `
  <span class="info-window-style-metrics">Показники &#10095;</span> ${distance} км • ${duration} хв •
  ${pulse} уд/хв • ${(distance / (duration / 60)).toFixed(2)} км/ч
  `
  // Контент інформаційного вікна
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

  // Створюємо маркер
  const marker = new google.maps.Marker({
    map, // До якої карти буде прив'язаний маркер
    position, // Позиція маркера на карті (широта і довгота)
    icon: `${iconPath}`, // Зображення, яке буде використовуватися як іконка маркера
    animation: `${animation}`, // Анімація маркера зі змінної animation
    optimized: true, // Оптимізація маркера для підвищення продуктивності
    markerID: markerId, // Айді маркера
    typeTraining: typeTraining, // Тип створюваного тренування
  })

  arrOfMarkers.push(marker) // Додає маркер до масиву

  const infowindow = new google.maps.InfoWindow({ content }) // Створюємо інформаційне вікно
  let isOpen // Створюю змінну для відстеження стану маркера

  // Додаємо обробник події кліка на маркер
  marker.addListener('click', () => {
    // Якщо маркер закритий, відкриваємо його
    if (!isOpen) {
      infowindow.open(map, marker)
      isOpen = true
    } else {
      // Якщо маркер відкритий, закриваємо його
      infowindow.close()
      isOpen = false
      focusOnHiddenElement.focus() // При закритті інформаційного вікна кліком, встановити фокус на порожній елемент
    }
  })

  // Додаємо обробник події закриття інформаційного вікна крестиком
  infowindow.addListener('closeclick', () => {
    isOpen = false // Встановлюємо прапор isOpen в false при закритті вікна
    focusOnHiddenElement.focus() // При закритті інформаційного вікна крестиком, встановити фокус на порожній елемент
  })
} //---------------------------------------------------------------------------------

// Функція для створення нового маркера на основі останнього [тільки що створенного] тренування в локальному сховищі
const createNewMarker = (map) => {
  const workoutForMarkerAndWindow = JSON.parse(localStorage.getItem('myWorkouts'))
  const lastWorkout = workoutForMarkerAndWindow[workoutForMarkerAndWindow.length - 1]

  createMarkerAndInfoWindow(
    lastWorkout.latLng, // Широта і довгота останнього тренування
    lastWorkout.typeTraining, // Тип останнього тренування
    lastWorkout.distance, // Дистанція останнього тренування
    lastWorkout.duration, // Тривалість останнього тренування
    lastWorkout.cadence, // Темп останнього тренування
    lastWorkout.pulse, // Пульс останнього тренування
    lastWorkout.dateTraining, // Дата останнього тренування
    map, // Мапа
    lastWorkout.trainingId, // Айді останнього тренування
    true // Аргумент для розуміння, чи потрібна анімація для створення маркера [в даному випадку анімація потрібна]
  )
}

// Функція для завантаження всіх маркерів з локального сховища при завантаженні сторінки
const loadMarkers = (map) => {
  dataLocalStorage.forEach((workout) => {
    createMarkerAndInfoWindow(
      workout.latLng, // Широта і довгота тренування
      workout.typeTraining, // Тип тренування
      workout.distance, // Дистанція тренування
      workout.duration, // Тривалість тренування
      workout.cadence, // Темп тренування
      workout.pulse, // Пульс тренування
      workout.dateTraining, // Дата тренування
      map, // Карта
      workout.trainingId, // Айді тренування
      false // Аргумент для розуміння, чи потрібна анімація для створення маркера [в даному випадку анімація не потрібна]
    )

    form.insertAdjacentHTML('afterend', workout.insertTypeHtml) // Відображення кожного тренування на сторінці
  })
} //---------------------------------------------------------------------------------

// Отримання масиву маркерів асинхронно, щоб використовувати їх далі в коді
function waitForMarkersToLoad() {
  return new Promise((resolve) => {
    // Перевіряю, чи заповнений масив arrOfMarkers, і якщо так, виконую resolve
    const checkMarkers = () => {
      if (arrOfMarkers.length > 0) {
        resolve()
      } else {
        setTimeout(checkMarkers, 100) // Перевіряю ще раз через 100 мілісекунд
      }
    }
    checkMarkers()
  })
} //---------------------------------------------------------------------------------

// Дії з картою та маркерами при натисканні на конкретне тренування
const movingMapToMarker = () => {
  containerWorkouts.addEventListener('click', (e) => {
    // Отримання конкретно натиснутого тренування
    if (e.target.classList.contains('workout')) {
      const workoutId = e.target.dataset.workoutId // Отримання dataset ідентифікатора натиснутого тренування
      const matchingMarker = arrOfMarkers.find((marker) => marker.markerID === workoutId) // Порівняння ідентифікатора тренування та ідентифікатора маркера

      if (matchingMarker) {
        const markerPosition = matchingMarker.getPosition() // Отримання широти і довготи маркера тренування, яке натискається
        map.setCenter(markerPosition) // Центрування маркера по замовчуванню
        const currentCenter = map.getCenter() // Отримання центру карти

        const horizontalOffset = -0.025 // Зсув карти ліворуч від замовчування map.setCenter(markerPosition)
        const newCenterLng = currentCenter.lng() - horizontalOffset // Обчислення нових координат центру карти
        const newCenterDesktop = new google.maps.LatLng(currentCenter.lat(), newCenterLng) // Створення нової LatLng позиції з кастомними координатами

        const verticalOffset = 0.006 // Зсув карти вище від замовчування map.setCenter(markerPosition)
        const newCenterLat = currentCenter.lat() - verticalOffset // Обчислення нових координат центру карти
        const newCenterMobile = new google.maps.LatLng(newCenterLat, currentCenter.lng()) // Створення нової LatLng позиції з кастомними координатами

        map.setZoom(14) // Рівень масштабу мапи при переміщенні на маркер

        if (window.innerWidth >= 1279) {
          map.panTo(newCenterDesktop, 500) // Встановлення нового кастомного центру мапи на компьютерах з анімацією протягом 0.5 секунди
        } else {
          map.panTo(newCenterMobile, 500) // Встановлення нового кастомного центру мапи на мобільних з анімацією протягом 0.5 секунди
          disclosureWorkouts('remove') // Закриття розгорнутого сайдбару при кліку на тренування, якщо потрібно
        }

        matchingMarker.setAnimation(google.maps.Animation.BOUNCE) // Анімація для маркера, до якого перемістилась карта

        // Через який час анімація маркера зупиниться
        setTimeout(() => {
          matchingMarker.setAnimation(null)
        }, 1400)

        // Вимкнення анімації для всіх інших маркерів
        arrOfMarkers.forEach((marker) => {
          if (marker !== matchingMarker) {
            marker.setAnimation(null)
          }
        })
      }
    }
  })

  // При кліку на логотип, мапа переміщується до currentPosition
  logo.addEventListener('click', () => {
    map.setZoom(14)
    map.panTo(currentPosition, 500)
  })
}
movingMapToMarker() // Викликаю функцію переміщення мапи на маркер
//---------------------------------------------------------------------------------

//prettier-ignore
const months = [
  'Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
  'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня',
] // Місяці для тренувань, переведення числа в назву місяця

class TrainingComponents {
  constructor() {
    const removeLastDot = (value) => value.toString().replace(/\.$/, '') // Функція для видалення останньої крапки у вписаному показнику

    const currentDate = new Date() // Отримання поточної дати та часу

    // Кінцева дата та час тренування
    this.dateTraining = `${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getHours()}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`

    this.timestamp = currentDate.getTime() // Отримання поточної дати у форматі timestamp

    this.trainingId = String(new Date().getTime()).slice(-5) // id тренування

    this.typeTraining = inputType.value // Назва тренування

    this.latLng = clickedPosition // Широта і довгота маркера та тренування

    // HTML-код для вставки тренування
    this.insertTypeHtml = `<li class="workout ${
      inputType.value === 'running' ? 'workout_running' : 'workout_cycling'
    }" data-workout-id="${this.trainingId}">
  
    <div class="workout__delete-wrap">
    <img class="workout__delete-icon" src="dist/icons/delete-workout-cross.svg" alt="Видалити тренування" />
  </div>
  
    <div class="workout__title-wrap">
    <div class="workout__training-wrap">
    <span class="workout__type-training"> ${inputType.value === 'running' ? 'Біг' : 'Велосипед'} &#10095;</span>
    <div class="workout__date-training">${this.dateTraining} 
    </div>
  </div>
    </div>
  
    <div class="workout__details">
    <span class="workout__icon">${inputType.value === 'running' ? '🏃🏻' : '🚴🏻'}</span>
    <span class="workout__value">${removeLastDot(inputDistance.value)}</span>
    <span class="workout__unit">км</span>
    </div>
  
    <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${Number(inputDuration.value).toFixed(2).replace('.', ':')}</span>
    <span class="workout__unit">хв</span>
    </div>
  
    <div class="workout__details">
    <span class="workout__icon">⚡</span>
    <span class="workout__value">${
      inputType.value === 'running'
        ? (inputDuration.value / inputDistance.value).toFixed(2).replace('.', ':')
        : (inputDistance.value / (inputDuration.value / 60)).toFixed(2)
    } <span>
    <span class="workout__unit">${inputType.value === 'running' ? 'хв/км' : 'км/год'}</span>
    </div>
  
    <div class="workout__details">
    <span class="workout__icon">${inputType.value === 'running' ? '🦶🏼' : '🖤'}</span>
    <span class="workout__value">${
      inputType.value === 'running' ? removeLastDot(inputCadence.value) : removeLastDot(inputPulse.value)
    }</span>
    <span class="workout__unit">${inputType.value === 'running' ? 'кроків' : 'уд/хв'}</span>
    </li>`
  }
} //---------------------------------------------------------------------------------

// Клас Running наслідується від базового класу TrainingComponents
class Running extends TrainingComponents {
  constructor(distance, duration, cadence) {
    super() // Виклик конструктора батьківського класу
    this.distance = distance // Встановлення властивості distance
    this.duration = duration // Встановлення властивості duration
    this.cadence = cadence // Встановлення властивості cadence
  }
}

// Клас Cycling наслідується від базового класу TrainingComponents
class Cycling extends TrainingComponents {
  constructor(distance, duration, pulse) {
    super() // Виклик конструктора батьківського класу
    this.distance = distance // Встановлення властивості distance
    this.duration = duration // Встановлення властивості duration
    this.pulse = pulse // Встановлення властивості pulse
  }
}
//---------------------------------------------------------------------------------

// Масив для зберігання прихованих маркерів
const hiddenMarkers = []

class App {
  constructor() {
    this.workouts = JSON.parse(localStorage.getItem('myWorkouts')) // Ініціалізація масиву для зберігання тренувань

    // Прив'язка методу formSubmit до поточного екземпляру та виклик його при відправленні форми
    this.formSubmit = this.formSubmit.bind(this)
    form.addEventListener('submit', this.formSubmit)
    //---------------------------------------------------------------------------------

    // Прив'язка методу deleteWorkoutAndMarkers до поточного екземпляру та виклик його при видаленні тренувань
    this.deleteTrainingAndMarkers = this.deleteWorkoutAndMarkers.bind(this)
    containerWorkouts.addEventListener('click', (e) => {
      if (e.target.closest('.workout__delete-icon, .workout__delete-wrap')) {
        const workoutItem = e.target.closest('.workout') // Отримання тренування яке потрібно видалити
        const workoutId = workoutItem.dataset.workoutId // Отримання ID тренування яке потрібно видалити
        this.deleteWorkoutAndMarkers(workoutItem, workoutId) // Виклик методу видалення тренувань і маркерів
      }
    }) //---------------------------------------------------------------------------------

    // Прив'язка методу filterTraining до поточного екземпляру та виклик його при фільтрації тренувань
    this.filterTraining = this.filterTraining.bind(this)
    // Об'єкт з функціями, які спрацьовують в залежності від обраного фільтру.
    const actionMap = {
      'header__filter-text': () => {
        // При натисканні на слово "Фільтрувати" він розкривається, чи навпаки
        filterButton.classList.toggle('header-filter-active')
        filterCheckBox.classList.toggle('checkbox-wrap-visible')
      },
      'header__item-running': () => this.filterTraining('running'), // Фільтрація за типом "Біг"
      'header__item-cycling': () => this.filterTraining('cycling'), // Фільтрація за типом "Велосипед"
      'header__item-clear': () => this.restoreTraining(), // Скидання всіх фільтрів
    }

    // Обробник подій для фільтрації тренувань при кліку на елементи сайдбару.
    sidebar.addEventListener('click', (event) => {
      const targetClass = event.target.classList // Клас, на який клікнули
      for (const className in actionMap) {
        if (targetClass.contains(className)) {
          actionMap[className]()
          break // Вихід із циклу, щоб виконати лише одну дію
        }
      }
    })

    this.availableTraining() // Виведення повідомлення про порожній список тренувань, якщо довжина сховища = 0
  } //---------------------------------------------------------------------------------

  // Визначає, чи є тренування в масиві this.workouts та відображає або приховує повідомлення про порожній список тренувань
  availableTraining() {
    !this.workouts.length // Перевірка, чи довжина масиву workouts дорівнює 0
      ? emptyTrainingList.classList.remove('hidden-empty-list-training') // Відображення повідомлення, якщо масив порожній
      : emptyTrainingList.classList.add('hidden-empty-list-training') // Приховання повідомлення, якщо в масиві є тренування
  } //---------------------------------------------------------------------------------

  // Створення нового тренування
  createWorkout(distance, duration, cadence, pulse) {
    try {
      let workout // Створюю змінну і якій будуть зберігатися тренування

      const emptyInputs = distance !== '' && duration !== '' && (cadence !== '' || pulse !== '') // Перевіряємо порожні інпути для всіх типів тренувань
      const isRunning = inputType.value === 'running' && emptyInputs // Перевіряємо тип тренування і порожні інпути
      const isCycling = inputType.value === 'cycling' && emptyInputs // Перевіряємо тип тренування і порожні інпути

      // Якщо тренування "Біг", або "Велосипед", то створюємо тренування
      if (isRunning || isCycling) {
        workout = isRunning ? new Running(distance, duration, cadence) : new Cycling(distance, duration, pulse) // Створюємо тренування "Біг", або "Велосипед"
        incorrectInputsError('remove') // Видаляємо помилку про незаповнені інпути, якщо вона була
      } else {
        throw new Error(incorrectInputsError('add')) // Якщо isRunning || isCycling === false, то виводимо помилку
      }

      form.insertAdjacentHTML('afterend', workout.insertTypeHtml) // Відображення тренування на сторінці [вставка html коду]

      this.workouts.push(workout) // Додаємо тренування в масив
      localStorage.setItem('myWorkouts', JSON.stringify(this.workouts)) // Збереження списку тренувань в LocalStorage після додавання нового тренування

      this.availableTraining() // Прибираю напис про порожній список тренувань якщо довжина сховища > 0
    } catch (error) {
      console.error(error.message) // Ловлю помилку і виводжу у консоль
    }
  } //---------------------------------------------------------------------------------

  // Метод для видалення тренування
  deleteWorkoutAndMarkers(workoutItem, workoutId) {
    // Видалення маркера
    const deleteMarker = () => {
      const markerIndexToDelete = arrOfMarkers.findIndex((everyMarker) => everyMarker.markerID === workoutId) // Пошук індексу маркера за markerID

      if (markerIndexToDelete !== -1) {
        const deletedMarker = arrOfMarkers.splice(markerIndexToDelete, 1)[0] // Пошук індексу маркера, який потрібно видалити
        deletedMarker.setMap(null) // Видалення маркера за найденим індексом
      }
    }

    // Видалення тренування
    const deleteWorkout = () => {
      const indexToDelete = this.workouts.findIndex((workout) => workout.trainingId === workoutId) // Пошук індексу тренування за trainingId

      if (indexToDelete !== -1) {
        workoutItem.remove() // Видалення тренування та елемента з DOM
        this.workouts.splice(indexToDelete, 1) // Видаляємо тренування з масиву this.workouts
        localStorage.setItem('myWorkouts', JSON.stringify(this.workouts)) // Зберігаємо оновлений масив в локальне сховище
      }
    }

    deleteMarker() // Викликаю функцію видалення маркера
    deleteWorkout() // Викликаю функцію видалення тренування
    this.availableTraining() // Додаю напис про порожній список тренувань якщо всі тренування видалено
  } //---------------------------------------------------------------------------------

  // Метод фільтрування тренувань за типом
  filterTraining(typeTraining) {
    containerWorkouts.innerHTML = '' // Очищаємо контейнер перед додаванням відфільтрованих тренувань
    containerWorkouts.insertAdjacentElement('beforeend', form) // Відображення форми перед зверху всіх тренувань, інакше вона некорректно відображається

    // Якщо вибрано тренування бігу, то маркери велосипедних тренувань стають невидимими і навпаки.
    waitForMarkersToLoad().then(() => {
      arrOfMarkers.forEach((el) => {
        if (el.typeTraining !== typeTraining) {
          el.setMap(null) // Приховування маркера, якщо його тип не співпадає вибраним типом тренування
          hiddenMarkers.push(el) // Додавання у масив для маркерів, які потрібно сховати
        } else {
          el.setMap(map) // Відображення маркера на карті, якщо його тип співпадає з вибраним типом тренування
        }
      })
    })

    // Відображення тренувань при фільтрації від найновіших до найдавніших за часом.
    this.workouts
      .filter((workout) => workout.typeTraining === typeTraining) // Фільтрація тренувань за типом
      .sort((a, b) => b.timestamp - a.timestamp) // Фільтрування тренувань від найновіших до найдавніших за часом
      .forEach((el) => {
        containerWorkouts.insertAdjacentHTML('beforeend', el.insertTypeHtml) // Вставлення HTML коду тренування в кінець контейнера
      })

    // Показ або приховання повідомлення про відсутність тренувань певного типу
    !this.workouts.some((workout) => workout.typeTraining === typeTraining)
      ? emptyTrainingList.classList.remove('hidden-empty-list-training') // Відображення повідомлення, якщо немає тренувань обраного типу
      : emptyTrainingList.classList.add('hidden-empty-list-training') // Приховання повідомлення, якщо є тренування обраного типу
  } //---------------------------------------------------------------------------------

  // Метод скидання фільтра та відновлення відображення всіх типів тренувань та маркерів на сторінку.
  restoreTraining() {
    containerWorkouts.innerHTML = '' // Очищення контейнера від відфільтрованих тренувань

    // Додавання всіх тренувань, що знаходяться в локальному сховищі, на сторінку
    this.workouts.forEach((workout) => {
      containerWorkouts.insertAdjacentHTML('afterbegin', workout.insertTypeHtml)
    })

    // Показати залишені маркери на карті
    arrOfMarkers.forEach((el) => {
      el.setMap(map)
    })

    hiddenMarkers.length = 0 // Очистити масив прихованих маркерів
    containerWorkouts.insertAdjacentElement('afterbegin', form) // Переміщення форми перед показаними тренуваннями
    this.availableTraining() // Видалення напису про порожній список тренувань, якщо є хоча б одне тренування
  } //---------------------------------------------------------------------------------

  // Метод відправки форми і створення тренування
  formSubmit(e) {
    e.preventDefault()
    this.createWorkout(inputDistance.value, inputDuration.value, inputCadence.value, inputPulse.value)
  }
} //---------------------------------------------------------------------------------
const app = new App() // Створення нового тренування
//---------------------------------------------------------------------------------

// Можна вводити 1-9 і одну крапку між ними або кому, яка заміниться на крапку
// Заборонено вводити '0' першою цифрою, '+', '-', '*', '/', '=' і т.д.
function validateInputs() {
  formInput.forEach((el) => {
    el.addEventListener('input', () => {
      if (el.nodeName === 'INPUT') {
        let value = el.value

        // Замінюємо всі коми на крапки, крім першої
        value = value
          .replace(/[^0-9,.]/g, '')
          .replace(/^,/, '')
          .replace(/,/, '.')

        // Регулярний вираз для валідації формату числа
        const regex = /^(0\.)?[1-9][0-9]*(\.[0-9]*)?$/

        if (!regex.test(value)) {
          // Якщо формат числа невірний, видаляємо останній введений символ
          el.value = value.slice(0, -1)
        } else {
          // Якщо формат числа вірний, встановлюємо відформатоване значення
          el.value = value
        }
      }
    })
  })
}
// Викликаємо функцію валідації
validateInputs()
//---------------------------------------------------------------------------------

// Функція яка відображає текст з проханням заповнити всі інпути у формі
function incorrectInputsError(state) {
  if (state === 'add') {
    errorMessage.classList[state]('visible-input-error')
    return 'Некорректно введенные данные в форме'
  }
  if (state === 'remove') {
    return errorMessage.classList[state]('visible-input-error')
  }
} //---------------------------------------------------------------------------------

// Функція для обробки відправки форми
const handleFormSubmit = () => {
  let hasEmptyInput = false // Флаг, який показує пусті інпути чи ні

  // Перевірка наявності пустих полів вводу
  formInput.forEach((input) => {
    if (input.nodeName === 'INPUT' && input.value === '' && !input.parentElement.classList.contains('form__row_hidden')) {
      hasEmptyInput = true // Змінюю флаг на true, тому що якийсь інпут
      markInvalidInput(input) // Позначення невалідного поля вводу
      input.focus() // Фокусування на першому пустому полі вводу
    } else {
      resetInputStyles(input) // Скидання стилів для поля вводу
    }
  })

  // Якщо всі поля заповнені, викликаємо необхідні функції
  if (!hasEmptyInput) {
    createNewMarker(map) // Створення нового маркера на карті
    controlFormRowVisibility() // Додавання всім непотрібним інпутам класу hidden. Залишаються видимими тільки 4 перші.
    resetForm() // Скидання значень форми
    bouncingMark.setMap(null) // Видалення анімованого маркера, якщо він визначений
  }

  return !hasEmptyInput // Вертаємо флаг з протилежним значенням
} //---------------------------------------------------------------------------------

// Функція для позначення неприпустимого вводу
const markInvalidInput = (input) => {
  // Встановлення класів для неприпустимого вводу
  input.classList.add('invalid-animation-input', 'invalid-input-text-color', 'invalid-input-background-color')

  // Перемальовування анімації тремтіння
  input.classList.remove('invalid-animation-input')
  window.getComputedStyle(input).getPropertyValue('transform')
  input.classList.add('invalid-animation-input')
} //---------------------------------------------------------------------------------

// Функція для скидання стилів інпута
const resetInputStyles = (input) => {
  input.classList.remove('invalid-input-text-color', 'invalid-animation-input', 'invalid-input-background-color')
} //---------------------------------------------------------------------------------

// Функція для додавання класу hidden всім непотрібним рядкам форми. Видимими залишаються лише перші 4.
const controlFormRowVisibility = () => {
  const formRows = document.querySelectorAll('.form__row') // Знайти всі елементи з класом form__row

  // Пройтися по всіх елементах, починаючи з п'ятого [індекс 4] і додати/видалити клас form__row_hidden
  formRows.forEach((row, index) => {
    row.classList.toggle('form__row_hidden', index >= 4)
  })
} //---------------------------------------------------------------------------------

// Функція для скидання форми
function resetForm() {
  form.reset()
  form.classList.add('hidden')
  formInput.forEach((input) => resetInputStyles(input))
} //---------------------------------------------------------------------------------

// Змінює ввод з метрів на висоту і навпаки
const changeInput = () => {
  inputType.addEventListener('change', (e) => {
    e.preventDefault()

    // Очищає заповнені інпути при перемиканні виду тренувань
    formInput.forEach((input) => {
      if (input.nodeName === 'INPUT') {
        // Роблю введення неактивними на мобільних на 0.5 секунд, інакше стрибає клавіатура
        if (window.innerWidth < 1279) {
          input.setAttribute('disabled', 'disabled')
          input.classList.add('delay-inputs-after-select')
          setTimeout(() => {
            input.removeAttribute('disabled')
            input.classList.remove('delay-inputs-after-select')
          }, 500)
        }

        input.value = '' // Очищає значення введення при зміні типу тренувань
        incorrectInputsError('remove') // Видаляє повідомлення про невірний ввід [якщо потрібно]

        // Видаляє класи, що відповідають за стилізацію для невірного вводу [якщо такий стан виникав]
        input.classList.remove('invalid-animation-input', 'invalid-input-background-color', 'invalid-input-text-color')
      }
    })

    // Об'єкт, з якого зчитується, що показати, або приховати при тому чи іншому тренуванні.
    const changeInputs = {
      cycling: { show: inputPulse, hide: inputCadence },
      running: { show: inputCadence, hide: inputPulse },
    }

    // Визначає, які інпути показати та приховати в залежності від обраного типу тренувань
    const { show, hide } = changeInputs[e.target.value] || { show: inputPulse, hide: inputCadence }

    show.parentNode.classList.remove('form__row_hidden') // Показує вибраний інпут, знімаючи прихований клас [якщо він був прихований раніше]
    hide.parentNode.classList.add('form__row_hidden') // Приховує необраний інпут, додаючи клас
  })
}
changeInput() // Викликаємо функцію для зміни введень з метрів на пульс і навпаки
//---------------------------------------------------------------------------------

// Функція для надання інструкцій новим користувачам
const instructionForNewUser = (map) => {
  // Отримання елементів інструкційних вікон
  const startWindow1 = document.querySelector('.start-instruction-window-1')
  const startWindow2 = document.querySelector('.start-instruction-window-2')
  const startWindow3 = document.querySelector('.start-instruction-window-3')

  // Функція для приховання елемента
  const hideElement = (element) => element.classList.add('instruction-hidden')

  // Функція для відображення елемента
  const showElement = (element) => element.classList.remove('instruction-hidden')

  // Функція розмиття непотрібних елементів під час проходження інструкції для новачків
  const blurElement = (element, state) => element.classList[state]('instruction-blur')

  // Функція розмиття та відключення кліка непотрібних елементів під час проходження інструкції для новачків
  const blurAndNoClick = (element, state) => element.classList[state]('instruction-click-none')

  // Перевірка локального сховища
  const localStorageEmpty = () => localStorage.getItem('visitedInstruction1/2') === null

  // Перша інструкція. Якщо в локальному сховищі немає 'visitedInstruction1/2', то
  if (!localStorage.getItem('visitedInstruction1/2')) {
    blurAndNoClick(mapElement, 'add') // Додаю блюр і неможливість кліку на мапі
    setTimeout(() => {
      showElement(startWindow1) //Показую інструкцію №1 через 1 секунди після заходу на сайт
      setTimeout(() => {
        blurAndNoClick(mapElement, 'remove') // Видаляю блюр мапи через 2 секунди
      }, 2000)
    }, 1000)
    blurElement(emptyTrainingList, 'add') // Додаю блюр надпису "Список тренувань порожній"
    blurAndNoClick(disclosureWorkoutsContainer, 'add') // Додаю блюр і неможливість кліку на кнопку розгортання сайдбару
    blurAndNoClick(filterButton, 'add') // Додаю блюр і неможливість кліку фільтрування
    blurAndNoClick(logo, 'add') // Додаю блюр і неможливість кліку на логотип
    disclosureWorkoutsContainer.style.background = 'transparent' // Додаю прозорий бекграунд для кнопки розгортання сайдбару

    // Прослуховування кліку на карті для переходу до наступного етапу інструкції
    map.addListener('click', () => {
      if (localStorageEmpty()) {
        hideElement(startWindow1) // Ховаю інструкцію №1
        showElement(startWindow2) // Показую інструкцію №2
        blurAndNoClick(mapElement, 'add') // Додаю блюр і неможливість кліку на мапі
      }
    })
  } //---------------------------------------------------------------------------------

  // Друга інструкція
  form.addEventListener('submit', () => {
    if (localStorageEmpty() && handleFormSubmit()) {
      // --Якщо заповнюю форму в інструкції, то спрацьовує ця частина коду--
      hideElement(startWindow2) // Ховаю інструкцію №2
      blurAndNoClick(mapElement, 'remove') // Знімаю блюр і неможливість кліку з мапи
      blurAndNoClick(containerWorkouts, 'add') // Додаю блюр і неможливість кліку на створеному тренуванні
      setTimeout(() => showElement(startWindow3), 1000) // Показ третього вікна інструкції після затримки в 1 секунду
      localStorage.setItem('visitedInstruction1/2', 'true') // Перша частина інструкції була завершена, зберігаю це в локальному сховищі
    } else {
      handleFormSubmit() // --Якщо заповнюю форму після проходження інструкції, просто створює тренування, то спрацьовує ця частина коду--
    }
  }) //---------------------------------------------------------------------------------

  // Третя інструкція. Якщо в локальному сховищі немає 'visitedInstruction2/2', то
  if (!localStorage.getItem('visitedInstruction2/2')) {
    // Очікує завершення завантаження маркерів на карту перед викликом функції
    waitForMarkersToLoad().then(() => {
      arrOfMarkers.forEach((el) => {
        el.addListener('click', () => {
          hideElement(startWindow3) // Після кліку на створений маркер ховаю інструкцію №3
          blurElement(emptyTrainingList, 'remove') // Знімаю блюр з надпису "Список тренувань порожній"
          blurAndNoClick(filterButton, 'remove') // Знімаю блюр і неможливість кліку з фільтрування
          blurAndNoClick(logo, 'remove') // Знімаю блюр і неможливість кліку з логотипа
          blurAndNoClick(containerWorkouts, 'remove') // Знімаю блюр і неможливість кліку з створеного тренування
          blurAndNoClick(disclosureWorkoutsContainer, 'remove') // Знімаю блюр і неможливість кліку з кнопки розгортання сайдбару
          disclosureWorkoutsContainer.style.background = null // Знімаю прозорий бекграунд з кнопки розгортання сайдбару

          localStorage.setItem('visitedInstruction2/2', 'true') // Друга частина інструкції була завершена, зберігаю це в локальному сховищі
        })
      })
    })
  }
} //---------------------------------------------------------------------------------

// Функція для оновлення тексту плейсхолдеру в інпутах в залежності від ширини вікна
function updatePlaceholder() {
  const windowWidth = window.innerWidth // Отримання ширини вікна

  // Перевірка ширини вікна і встановлення відповідних текстів для кожного плейсхолдеру
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

updatePlaceholder() // Виклик функції оновлення тексту плейсхолдеру
window.addEventListener('resize', updatePlaceholder) // Також виклик функції при зміні розмірів вікна
//---------------------------------------------------------------------------------

// Функція для фільтру. При натисканні на тип тренування, чи скидання фільтра вони трансформуються.
const scaleFilterItems = () => {
  filterCheckBox.addEventListener('click', (e) => {
    const checkboxes = filterCheckBox.querySelectorAll('.header__item-running, .header__item-cycling')

    // Перед натисканням на наступний фільтр скинути попередній.
    checkboxes.forEach((checkbox) => {
      checkbox.classList.remove('filter-item-focus')
    })

    // Застосовуємо при натисканні на фільтри тренування анімацію, яка апскейлить іх.
    if (e.target.innerText === 'Біг' || e.target.innerText === 'Велосипед') {
      e.target.classList.add('filter-item-focus')
    }

    // Застосовуємо при натисканні на напис "Скинути фільтри" анімацію.
    if (e.target.innerText === 'Скинути фільтри') {
      e.target.classList.add('filter-item-clear')
      setTimeout(() => e.target.classList.remove('filter-item-clear'), 300)
    }
  })
}
scaleFilterItems()
//---------------------------------------------------------------------------------

// Функція для розгортання/згортання сайдбару зі списком тренувань
const disclosureWorkouts = (state) => {
  // Додає або видаляє класи для зміни стилів в залежності від стану (відкрито/закрито)
  sidebar.classList[state]('disclosure-workouts') // Розгортає або згортає сайдбар на height: 95vh
  disclosureArrow.classList[state]('rotate-arrow') // При згорнутому сайдбарі стрілка дивиться наверх, і навпаки при розгорнутому вниз
  disclosureWorkoutsContainer.classList[state]('background-close-workouts') // Змінює бекграунд кнопки згортання/розгортання
  mapElement.classList[state]('map-blur') // Блюрить мапу, якщо сайдбар розкритий, і навпаки
}

// Обробник події для розгортання/згортання сайдбару при кліці на контейнері
disclosureWorkoutsContainer.addEventListener('click', () => {
  // Викликає функцію зміни стилів з параметром 'toggle' для перемикання між розгортанням і згортанням
  disclosureWorkouts('toggle')
})
