// //--------------------------------------------------------------------------------------------------------------------------------------
// // ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ MAP ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃
// //--------------------------------------------------------------------------------------------------------------------------------------
// // Глобальные переменные для карты
// let map
// let currentPosition
// let clickedPosition
// let bouncingMark
// let arrOfMarkers = []

// //prettier-ignore
// const months = [
//   'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
//   'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря',
// ]

// // DOM элементы
// const containerWorkouts = document.querySelector('.workouts')
// const everyWorkout = document.querySelectorAll('.workout')
// const form = document.querySelector('.form')
// const formInput = document.querySelectorAll('.form__input')
// const inputType = document.querySelector('.form__input--type')
// const inputDistance = document.querySelector('.form__input--distance')
// const inputDuration = document.querySelector('.form__input--duration')
// const inputCadence = document.querySelector('.form__input--cadence')
// const inputElevation = document.querySelector('.form__input--elevation')

// const sidebar = document.querySelector('.sidebar')
// const header = document.querySelector('.header')

// const mapElement = document.getElementById('map')

// const errorMessage = document.querySelector('.header__error-input-message-wrap')

// const focusOn = document.querySelector('.form__input')

// const sortButton = document.querySelector('.header__sort-wrap')
// const sortCheckBox = document.querySelector('.header__checkbox-wrap')

// // Если в локальном хранилище нет данных, то создать пустой массив, чтобы не было ошибок в консоли.
// if (!localStorage.getItem('myWorkouts')) {
//   localStorage.setItem('myWorkouts', JSON.stringify([]))
// }

// // Присваивание данных из локального хранилища в переменную dataLocalStorage
// const dataLocalStorage = JSON.parse(localStorage.getItem('myWorkouts'))
// //-------------------------------------------------------------------------------------------------------------------

// // Функция для отображения карты
// const initializeMap = async () => {
//   // Получение объекта карты из библиотеки
//   const { Map } = await google.maps.importLibrary('maps')

//   // Опции карты
//   const mapOptions = {
//     center: currentPosition,
//     zoom: 14,
//     mapId: 'a1c415ef104b9ec4',
//     mapTypeControl: false,
//     streetViewControl: false,
//     fullscreenControl: false,
//   }

//   // Присваивание экземпляра переменной map
//   map = new Map(document.getElementById('map'), mapOptions)

//   // Вызов функции markersOnMap и передача в эту функцию аргумента map
//   clickedOnMap(map)

//   // Вызов функции loadMarkers и передача в эту функцию аргумента map
//   loadMarkers(map)
// }

// //-------------------------------------------------------------------------------------------------------------------

// // Функция для обработки успешной геолокации.
// const handleGeolocationSuccess = (position) => {
//   // Получение объекта внутри которого координаты моего местоположения
//   const coordinates = position.coords

//   // Получение из объекта coordinates широты и долготы моего местоположения
//   currentPosition = {
//     lat: coordinates.latitude,
//     lng: coordinates.longitude,
//   }

//   // Создание карты только после получения координат
//   initializeMap()
// }

// //------------------------------------------------------------------------------------------------------------------

// // Функция для обработки ошибок геолокации
// const handleGeolocationError = (error) => {
//   // html код, который вставляется на странице в случае какой-то ошибки
//   const errorHtml = `
//   <div class="errors-window">
//     <div class="errors-window__content">
//       <div class="errors-window__icon-wrap">
//         <img class="errors-window__icon" src="icons/error-geolocation.svg" alt="" />
//       </div>
//       <p class="errors-window__text">
//       ${
//         error.code === 1
//           ? `Невозможно получить доступ к вашей геолокации. Пожалуйста, предоставьте доступ и перезагрузите страницу.`
//           : `Возникла непредвиденная ошибка: код ошибки - ${error.code}.
//           <br> Проверьте подключение к интернету.`
//       }
//       </p>
//     </div>
//   </div>
// `

//   if (error.code === 1) {
//     mapElement.insertAdjacentHTML('beforeend', errorHtml)
//     sidebar.classList.add('hidden-sidebar')
//   } else {
//     mapElement.insertAdjacentHTML('afterend', errorHtml)
//   }
// }
// //-------------------------------------------------------------------------------------------------------------------

// // Запрос текущего местоположения пользователя и обработка результатов
// navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError)

// // Всё, что связано с кликом на карту. Параметр принимает map из функции initializeMap.
// function clickedOnMap(map) {
//   // Добавляю обработчик события клика по карте
//   map.addListener('click', (e) => {
//     // Получение координат кликнутой позиции
//     clickedPosition = {
//       lat: e.latLng.lat(),
//       lng: e.latLng.lng(),
//     }

//     // Если метка при клике уже существует, удаляем ее
//     if (bouncingMark) {
//       bouncingMark.setMap(null)
//     }

//     // Создаем новую метку ГДЕ КЛИКНУЛИ МЫШКОЙ с анимацией [для удобства отображения геопозиции перед постановкой метки]
//     bouncingMark = new google.maps.Marker({
//       position: clickedPosition, // Кликнутая позиция
//       map, // Карта
//       animation: google.maps.Animation.BOUNCE, // Анимация прыжков
//       icon: {
//         path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, // Иконка метки
//         scale: 4, // Размер метки
//         fillColor: 'transparent', // Цвет метки
//         strokeWeight: 1, // Толщина границы
//         strokeColor: 'white', // Цвет границы
//       },
//     })

//     // Удаляем класс hidden при клике на карту, чтобы отобразить форму
//     form.classList.remove('hidden')
//   })
// }

// //-------------------------------------------------------------------------------------------------------------------
// function createMarkerAndInfoWindow(
//   position,
//   typeTraining,
//   distance,
//   duration,
//   cadence,
//   elevation,
//   dateTraining,
//   map,
//   markerId,
//   animate
// ) {
//   const iconPath = typeTraining === 'running' ? 'marker-running.svg' : 'marker-cycling.svg'

//   // Определим анимацию на основе параметра `animate`
//   const animation = animate ? google.maps.Animation.DROP : null

//   const infoWindowRunning = `
//   <span class="info-window-style-metrics">Показатели ❯</span> ${distance} км • ${duration} мин •
//   ${cadence} шагов • ${(distance * 1000) / duration} м/мин
//   `

//   const infoWindowCycling = `
//   <span class="info-window-style-metrics">Показатели ❯</span> ${distance} км • ${duration} мин •
//   ${elevation} метров • ${(distance / (duration / 60)).toFixed(2)} км/ч
//   `

//   const content = `<div class="info-window-style">
//     <p class="info-window-style__item"><span class="info-window-style-metrics">Дата тренировки ❯</span> ${dateTraining}</p>
//     <p class="info-window-style__item">${typeTraining === 'running' ? infoWindowRunning : infoWindowCycling}</p>

//     <div class="info-window-style-wrap">
//   ${
//     typeTraining === 'running'
//       ? '<span class="info-window-style__purple"></span>'
//       : '<span class="info-window-style__orange"></span>'
//   }
//   </div>
//   </div>`

//   // Создаем маркер
//   const marker = new google.maps.Marker({
//     map,
//     position,
//     icon: `icons/${iconPath}`,
//     animation: `${animation}`,
//     optimized: true,
//     markerID: markerId,
//   })

//   arrOfMarkers.push(marker)

//   // Создаем информационное окно
//   const infowindow = new google.maps.InfoWindow({
//     content,
//   })

//   // Инициализируем переменную для отслеживания состояния маркера
//   let isOpen
//   // Добавляем обработчик события клика на метку
//   {
//     marker.addListener('click', () => {
//       // Если маркер закрыт, открываем его
//       if (!isOpen) {
//         infowindow.open(map, marker)
//         isOpen = true
//       } else {
//         // Если маркер открыт, закрываем его
//         infowindow.close()
//         isOpen = false
//       }
//     })
//   }

//   // Добавляем обработчик события закрытия информационного окна
//   infowindow.addListener('closeclick', () => {
//     isOpen = false // Устанавливаем флаг isOpen в false при закрытии окна

//     // При закрытии информационного окна, установить фокус на инпут, иначе фокус будет на метке и будет её обводить.
//     focusOn.focus()
//   })
// }

// // Функция для создания маркера на основе последней тренировки
// function createMarkerForLastWorkout(map) {
//   const workoutForWindow = JSON.parse(localStorage.getItem('myWorkouts'))
//   const lastWorkout = workoutForWindow[workoutForWindow.length - 1]

//   createMarkerAndInfoWindow(
//     lastWorkout.latLng,
//     lastWorkout.typeTraining,
//     lastWorkout.distance,
//     lastWorkout.duration,
//     lastWorkout.cadence,
//     lastWorkout.elevation,
//     lastWorkout.dateTraining,
//     map,
//     lastWorkout.trainingId,
//     true
//   )
// }

// // Функция для загрузки маркеров при загрузке страницы
// function loadMarkers(map) {
//   // Пройдитесь по списку маркеров и создайте их на карте
//   dataLocalStorage.forEach((el) => {
//     createMarkerAndInfoWindow(
//       el.latLng,
//       el.typeTraining,
//       el.distance,
//       el.duration,
//       el.cadence,
//       el.elevation,
//       el.dateTraining,
//       map,
//       el.trainingId,
//       false
//     )

//     form.insertAdjacentHTML('afterend', el.insertTypeHtml)
//   })
// }

// function waitForMarkersToLoad() {
//   return new Promise((resolve) => {
//     // Проверяйте, заполнен ли массив arrOfMarkers, и если да, то выполните resolve
//     const checkMarkers = () => {
//       if (arrOfMarkers.length > 0) {
//         resolve()
//       } else {
//         setTimeout(checkMarkers, 100) // Проверьте снова через 100 миллисекунд
//       }
//     }
//     checkMarkers()
//   })
// }

// // ZOOM
// // Добавляем обработчик события клика на элемент .workout
// containerWorkouts.addEventListener('click', (e) => {
//   if (e.target.classList.contains('workout')) {
//     const workoutItem = e.target
//     const workoutId = workoutItem.dataset.workoutId

//     const matchingMarker = arrOfMarkers.find((marker) => marker.markerID === workoutId)

//     if (matchingMarker) {
//       const markerPosition = matchingMarker.getPosition()
//       map.setCenter(markerPosition)

//       const currentCenter = map.getCenter()
//       const horizontalOffset = -0.025
//       const newCenterLng = currentCenter.lng() - horizontalOffset
//       const newCenter = new google.maps.LatLng(currentCenter.lat(), newCenterLng)

//       // Установите уровень зума
//       map.setZoom(14)

//       // Установите новый центр карты с анимацией за 0.5 секунды
//       map.panTo(newCenter, 500) // 500 миллисекунд (0.5 секунды)

//       // Установите анимацию только для matchingMarker
//       matchingMarker.setAnimation(google.maps.Animation.BOUNCE)

//       // Установите таймер для снятия анимации
//       setTimeout(() => {
//         matchingMarker.setAnimation(null)
//       }, 2150)

//       // Отключите анимацию для всех других маркеров
//       arrOfMarkers.forEach((marker) => {
//         if (marker !== matchingMarker) {
//           marker.setAnimation(null)
//         }
//       })
//     }
//   }
// })

// // delete markers
// function deleteMarkersAndWorkouts() {
//   containerWorkouts.addEventListener('click', (e) => {
//     if (e.target.classList.contains('delete-workouts__icon')) {
//       // Получи родительский элемент, который имеет класс "workout"
//       const workoutItem = e.target.closest('.workout')

//       const workoutId = workoutItem.dataset.workoutId // Получи ID тренировки

//       // Поиск маркера по уникальному свойству markerID
//       const markerIndexToDelete = arrOfMarkers.findIndex((everyMarker) => everyMarker.markerID === workoutId)

//       if (markerIndexToDelete !== -1) {
//         // Удаление маркера по индексу
//         const deletedMarker = arrOfMarkers.splice(markerIndexToDelete, 1)[0]
//         deletedMarker.setMap(null)
//       }

//       // Удаление тренировки и элемента из DOM, как ранее
//       workoutItem.remove()
//       app.deleteWorkout(workoutId)
//     }
//   })
// }
// deleteMarkersAndWorkouts()

// // INSTRUCTION
// const startWindow1 = document.querySelector('.start-instruction-window-1')
// const startWindow2 = document.querySelector('.start-instruction-window-2')
// const startWindow3 = document.querySelector('.start-instruction-window-3')

// // Первая инструкция
// if (!localStorage.getItem('visitedInstruction1/2')) {
//   startWindow1.classList.remove('instruction-hidden')

//   mapElement.addEventListener('click', () => {
//     // Проверяем, что ключ 'visitedInstruction1/2' равен 'false' или отсутствует
//     if (
//       localStorage.getItem('visitedInstruction1/2') === 'false' ||
//       localStorage.getItem('visitedInstruction1/2') === null
//     ) {
//       startWindow1.classList.add('instruction-hidden')
//       startWindow2.classList.remove('instruction-hidden')
//     }
//   })

//   formInput.forEach((el) => {
//     el.addEventListener('input', (e) => {
//       e.preventDefault()
//       // Проверяем, что элемент является <input>.
//       if (el.nodeName === 'INPUT' && el.value !== '') {
//         form.addEventListener('submit', () => {
//           if (
//             localStorage.getItem('visitedInstruction2/2') === 'false' ||
//             localStorage.getItem('visitedInstruction2/2') === null
//           ) {
//             startWindow2.classList.add('instruction-hidden')
//             startWindow3.classList.remove('instruction-hidden')
//           }
//           localStorage.setItem('visitedInstruction1/2', 'true')
//         })
//       }
//     })
//   })
// }

// // Вторая инструкция
// if (!localStorage.getItem('visitedInstruction2/2')) {
//   waitForMarkersToLoad().then(() => {
//     arrOfMarkers.forEach((el) => {
//       el.addListener('click', () => {
//         startWindow3.classList.add('instruction-hidden')
//         localStorage.setItem('visitedInstruction2/2', 'true')
//       })
//     })
//   })
// }

// //-------------------------------------------------------------------------------------------------------------------

// //--------------------------------------------------------------------------------------------------------------------------------------
// // ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ CREATE APP ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃
// //--------------------------------------------------------------------------------------------------------------------------------------
// class TrainingComponents {
//   constructor() {
//     // Дата и время
//     const currentDate = new Date() // Получение текущей даты и времени
//     this.getMinutes = currentDate.getMinutes().toString().padStart(2, '0') // Получение минут с добавлением нуля в начале, если нужно
//     this.getHours = currentDate.getHours() // Получение часов
//     this.getDay = currentDate.getDate() // Получение текущего дня месяца
//     this.getMonth = months[currentDate.getMonth()] // Получение текущего месяца
//     this.dateTraining = `${this.getDay} ${this.getMonth} ${this.getHours}:${this.getMinutes}` // Конечная дата и время тренировки

//     // id тренировки
//     this.trainingId = String(new Date().getTime()).slice(-5)

//     // Название тренировки + первая буква заглавная
//     this.typeTraining = inputType.value

//     // Широта и долгота маркера и тренировки
//     this.latLng = clickedPosition

//     // html код для отображения тренировки
//     this.insertTypeHtml = `<li class="workout ${
//       inputType.value === 'running' ? 'workout--running' : 'workout--cycling'
//     }" data-workout-id="${this.trainingId}">

//     <img class="delete-workouts__icon" src="icons/cross.svg" alt="Видалити тренування"  />

//     <div class="workout__title-wrap">
//     <div class="workout__training-wrap">
//     <span class="workout__type-training"> ${inputType.value === 'running' ? 'Бег' : 'Велосипед'} ❯</span>
//     <div class="workout__date-training">${this.dateTraining}</div>
//   </div>
//     </div>

//     <div class="workout__details">
//     <span class="workout__icon">${inputType.value === 'running' ? '🏃🏻' : '🚴🏻'}</span>
//     <span class="workout__value">${inputDistance.value}</span>
//     <span class="workout__unit">км</span>
//     </div>

//     <div class="workout__details">
//     <span class="workout__icon">⏱</span>
//     <span class="workout__value">${inputDuration.value}</span>
//     <span class="workout__unit">мин</span>
//     </div>

//     <div class="workout__details">
//     <span class="workout__icon">💨</span>
//     <span class="workout__value">${
//       inputType.value === 'running'
//         ? (inputDistance.value * 1000) / inputDuration.value
//         : (inputDistance.value / (inputDuration.value / 60)).toFixed(2)
//     } <span>
//     <span class="workout__unit">${inputType.value === 'running' ? 'м/мин' : 'км/ч'}</span>
//     </div>

//     <div class="workout__details">
//     <span class="workout__icon">${inputType.value === 'running' ? '🦶🏼' : '🖤'}</span>
//     <span class="workout__value">${inputType.value === 'running' ? inputCadence.value : inputElevation.value}</span>
//     <span class="workout__unit">${inputType.value === 'running' ? 'шагов' : 'уд/мин'}</span>
//     </li>`
//   }

//   // Создание тренировки (вставка html кода)
//   createTraining() {
//     form.insertAdjacentHTML('afterend', this.insertTypeHtml)
//   }
// }
// //-------------------------------------------------------------------------------------------------------------------

// class Running extends TrainingComponents {
//   constructor(distance, duration, cadence) {
//     super()
//     this.distance = distance
//     this.duration = duration
//     this.cadence = cadence
//   }
// }

// class Cycling extends TrainingComponents {
//   constructor(distance, duration, elevation) {
//     super()
//     this.distance = distance
//     this.duration = duration
//     this.elevation = elevation
//   }
// }
// //-------------------------------------------------------------------------------------------------------------------

// class App {
//   constructor() {
//     // Загрузка и десериализация списка тренировок из LocalStorage
//     const loadedWorkouts = localStorage.getItem('myWorkouts')

//     // Массив для хранения тренировок
//     this.workouts

//     if (loadedWorkouts) {
//       this.workouts = JSON.parse(loadedWorkouts)
//     }

//     this.originalWorkouts = loadedWorkouts ? JSON.parse(loadedWorkouts) : []
//     this.currentWorkouts = [...this.originalWorkouts]

//     form.addEventListener('submit', this.handleFormSubmit.bind(this))
//   }

//   createWorkout(distance, duration, cadence, elevation) {
//     try {
//       let workout

//       if (inputType.value === 'running' && distance !== '' && duration !== '' && cadence !== '') {
//         workout = new Running(distance, duration, cadence)
//       } else if (inputType.value === 'cycling' && distance !== '' && duration !== '' && elevation !== '') {
//         workout = new Cycling(distance, duration, elevation)
//       } else {
//         errorMessage.classList.remove('hidden-input-error')
//         // header.insertAdjacentHTML('afterbegin', errorForSidebar)
//         throw new Error('Некорректно введенные данные')
//       }

//       this.originalWorkouts.push(workout)

//       errorMessage.classList.add('hidden-input-error')

//       workout.createTraining()

//       this.workouts.push(workout) // Добавляем тренировку в массив

//       // Сохранение списка тренировок в LocalStorage после добавления новой тренировки
//       const serializedWorkouts = JSON.stringify(this.workouts)
//       localStorage.setItem('myWorkouts', serializedWorkouts)
//     } catch (error) {
//       console.error(error.message)
//     }
//   }

//   /////
//   // Функция для удаления тренировки
//   deleteWorkout(workoutId) {
//     const indexToDelete = this.workouts.findIndex((workout) => workout.trainingId === workoutId)
//     if (indexToDelete !== -1) {
//       // Удаляем тренировку из массива
//       this.workouts.splice(indexToDelete, 1)

//       // Сохраняем обновленный массив в локальное хранилище
//       const serializedWorkouts = JSON.stringify(this.workouts)
//       localStorage.setItem('myWorkouts', serializedWorkouts)
//     }
//   }

//   sortTraining(type) {
//     // Очищаем контейнер перед добавлением отсортированных тренировок
//     containerWorkouts.innerHTML = ''

//     // Переместите форму перед отображенными тренировками
//     containerWorkouts.insertAdjacentElement('beforeend', form)

//     // Фильтруем и сортируем только оригинальные тренировки
//     this.currentWorkouts = this.originalWorkouts
//       .filter((workout) => workout.typeTraining === type)
//       .sort((a, b) => a.cadence - b.cadence)

//     // Перебираем отсортированные тренировки и добавляем их в контейнер
//     this.currentWorkouts.forEach((el) => {
//       containerWorkouts.insertAdjacentHTML('beforeend', el.insertTypeHtml)
//     })
//   }

//   restoreTraining() {
//     containerWorkouts.innerHTML = ''

//     this.originalWorkouts.sort((a, b) => b - a)

//     this.originalWorkouts.forEach((el) => {
//       containerWorkouts.insertAdjacentHTML('afterbegin', el.insertTypeHtml)
//     })

//     // Переместите форму перед отображенными тренировками
//     containerWorkouts.insertAdjacentElement('afterbegin', form)
//   }

//   handleFormSubmit(e) {
//     e.preventDefault()
//     this.createWorkout(inputDistance.value, inputDuration.value, inputCadence.value, inputElevation.value)
//   }
// }

// const app = new App()

// const sortRunning = document.querySelector('.header__item-running')
// const sortCycling = document.querySelector('.header__item-cycling')
// const sortDate = document.querySelector('.header__item-date')
// const sortClear = document.querySelector('.header__item-clear')

// sidebar.addEventListener('click', (event) => {
//   if (event.target.classList.contains('header__sort-text')) {
//     sortButton.classList.toggle('header-sort-active')
//     sortCheckBox.classList.toggle('checkbox-wrap-visible')
//   }

//   // Бег
//   if (event.target.classList.contains('header__item-running')) {
//     app.sortTraining('running')
//   }

//   // Вело
//   if (event.target.classList.contains('header__item-cycling')) {
//     app.sortTraining('cycling')
//   }

//   // // Дата
//   // if (event.target.classList.contains('header__item-date')) {
//   //   app.sortTraining('dateTraining')
//   // }

//   // Очистить
//   if (event.target.classList.contains('header__item-clear')) {
//     app.restoreTraining()
//   }
// })
// // Общая функция для создания маркера и информационного окна

// //--------------------------------------------------------------------------------------------------------------------------------------
// // ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ VALIDATE ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃
// //--------------------------------------------------------------------------------------------------------------------------------------
// // Функция для замены ненужных символов на точку между цифрами.
// function validateZeroAndSymbols() {
//   formInput.forEach((el) => {
//     el.addEventListener('input', (e) => {
//       e.preventDefault()

//       // Проверяем, что элемент является <input>.
//       if (el.nodeName === 'INPUT') {
//         // Если первый символ - цифра от 1 до 9, заменяем все символы, отличные от точки, на точку.
//         if (/^[1-9]$/.test(el.value.charAt(0))) {
//           el.value = el.value.replace(/[^0-9.]/g, '.')
//         }
//         // Если первый символ не является цифрой от 1 до 9, не разрешаем ввод других символов.
//         else {
//           el.value = ''
//         }
//       }
//     })
//   })
// }

// // Вызываем функцию для валидации '0', '+', '-', '*', '/', '=', а также для разрешения ввода ',' и '.' после числа.
// validateZeroAndSymbols()
// //-------------------------------------------------------------------------------------------------------------------

// // Функция для обработки отправки формы
// const handleFormSubmit = (e) => {
//   e.preventDefault()
//   let hasEmptyInput = false

//   formInput.forEach((el) => {
//     if (el.value === '' && !el.parentElement.classList.contains('form__row--hidden')) {
//       hasEmptyInput = true
//       markInvalidInput(el)
//     } else {
//       resetInputStyles(el)
//     }
//   })

//   if (!hasEmptyInput) {
//     createMarkerForLastWorkout(map)
//     controlFormRowVisibility()
//     transformSubmitForm()
//     resetForm()

//     if (bouncingMark) {
//       bouncingMark.setMap(null)
//       bouncingMark = null
//     }
//   }
// }
// //-------------------------------------------------------------------------------------------------------------------

// // Функция для пометки недопустимого ввода
// const markInvalidInput = (el) => {
//   el.style.background = '#CD5C5C'
//   el.classList.remove('correct-input-text-color')
//   el.classList.add('invalid-animation-input', 'invalid-input-text-color')
//   // Перерисовка анимации дрожания
//   el.classList.remove('invalid-animation-input')
//   window.getComputedStyle(el).getPropertyValue('transform')
//   el.classList.add('invalid-animation-input')
// }
// //-------------------------------------------------------------------------------------------------------------------

// // Функция для сброса стилей инпута
// const resetInputStyles = (el) => {
//   el.style.background = null
//   el.classList.remove('invalid-input-text-color', 'correct-input-text-color', 'invalid-animation-input')
// }
// //-------------------------------------------------------------------------------------------------------------------

// // Функция которая после отправки формы сдвигает её вправо и потом возвращает обратно на место
// const transformSubmitForm = () => {
//   form.style.opacity = '0'
//   form.style.opacity = null
// }

// //-------------------------------------------------------------------------------------------------------------------

// // Функция для добавления всем ненужным инпутам класса hidden. Остаются видимыми только 4 первых в Беге.
// const controlFormRowVisibility = () => {
//   // Найти все элементы с классом form__row
//   const formRows = document.querySelectorAll('.form__row')

//   // Пройти по всем элементам начиная с пятого (индекс 4) и добавить им класс form__row--hidden
//   formRows.forEach((row, index) => {
//     if (index >= 4) {
//       row.classList.add('form__row--hidden')
//     } else {
//       row.classList.remove('form__row--hidden')
//     }
//   })
// }
// //-------------------------------------------------------------------------------------------------------------------

// // Функция для сброса формы
// const resetForm = () => {
//   form.reset()
//   form.classList.add('hidden')
//   formInput.forEach((el) => resetInputStyles(el))
// }
// //-------------------------------------------------------------------------------------------------------------------

// // Меняет инпут с метров на высоту и обратно
// const changeInput = () => {
//   inputType.addEventListener('change', (e) => {
//     // Очищает заполненные инпуты при переключении вида тренировок
//     formInput.forEach((el) => {
//       if (el.nodeName === 'INPUT') {
//         el.value = ''
//         errorMessage.classList.add('hidden-input-error')
//         el.style.background = null
//         el.classList.remove('invalid-animation-input')
//         el.classList.replace('invalid-input-text-color', 'correct-input-text-color')
//       }
//     })

//     if (e.target.value === 'cycling') {
//       inputCadence.parentNode.classList.add('form__row--hidden')
//       inputElevation.parentNode.classList.remove('form__row--hidden')
//     }

//     if (e.target.value === 'running') {
//       inputElevation.parentNode.classList.add('form__row--hidden')
//       inputCadence.parentNode.classList.remove('form__row--hidden')
//     }
//   })
// }
// // Вызываем функцию для изменения инпутов с метров на высоту и обратно
// changeInput()

// // Удалить метку или спрятать форму при нажатии клавиши "Escape"
// const keydownHandler = (e) => {
//   if (e.key === 'Escape') {
//     // Прячу фокус на форму
//     focusOn.focus()

//     // Закрываю метку (удаляем ее с карты), если она существует
//     if (bouncingMark) {
//       bouncingMark.setMap(null)
//     }

//     // Очищаю стили незаполненных инпутов (красного цвета)
//     formInput.forEach((el) => {
//       if (el.nodeName === 'INPUT') {
//         el.value = ''
//       }
//       resetInputStyles(el)
//     })

//     // Добавляю класс hidden, чтобы убрать ошибку незаполненных данных
//     errorMessage.classList.add('hidden-input-error')
//     // Добавляю класс hidden, чтобы убрать форму
//     form.classList.add('hidden')
//   }
// }
// // Вызываю функцию
// document.addEventListener('keydown', keydownHandler)

// // Вызываем обработчик отправки формы
// form.addEventListener('submit', handleFormSubmit)

// // -------------------------------------------------------------------------------------------------------------------
