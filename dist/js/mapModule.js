// Глобальные переменные для карты
let map
let currentPosition
let clickedPosition
let bouncingMark

// Функция для отображения карты и маркеров
const initializeMap = async () => {
  const { Map } = await google.maps.importLibrary('maps')

  // Опции карты
  const mapOptions = {
    center: currentPosition,
    zoom: 14,
    mapId: 'a1c415ef104b9ec4',
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  }

  // Создание карты
  map = new Map(document.getElementById('map'), mapOptions)

  // Добавляем обработчик события клика по карте
  map.addListener('click', (e) => {
    clickedPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }

    if (bouncingMark) {
      // Если метка уже существует, удаляем ее
      bouncingMark.setMap(null)
    }

    // Создаем новую метку ГДЕ КЛИКНУЛИ МЫШКОЙ с анимацией [для удобства отображения геопозиции перед постановкой метки]
    bouncingMark = new google.maps.Marker({
      position: clickedPosition,
      map: map,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 4, // Размер метки
        fillColor: 'transparent', // Цвет метки
        strokeWeight: 1, // Толщина границы
        strokeColor: 'white', // Цвет границы
      },
      animation: google.maps.Animation.BOUNCE,
    })

    // Удалить метку при нажатии клавиши "Escape"
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Закрываю метку (удаляем ее с карты)
        bouncingMark.setMap(null)
        // Очищаю стили незаполненных инпутов(красного цвета)
        formInput.forEach((el) => {
          resetInputStyles(el)
        })
        // Добавляю класс hidden, чтобы убрать форму
        form.classList.add('hidden')
      }
    })

    // Удаляем класс hidden, чтобы отобразить форму
    form.classList.remove('hidden')
  })
}

// Функция для создания маркера тренировок
const createMarker = (position, map) => {
  const iconPath = inputType.value === 'running' ? 'Бег.png' : 'Вело.png'
  const storedWorkouts = JSON.parse(localStorage.getItem('workouts'))
  const lastWorkout = storedWorkouts[storedWorkouts.length - 1]

  //prettier-ignore
  const infoWindowRunning = `
  <span class="info-window-style-metrics">Показатели ❯</span> ${lastWorkout.distance} км • ${lastWorkout.duration} мин • 
  ${lastWorkout.cadence} шагов • ${(inputDuration.value / inputDistance.value).toFixed(2)} мин/км
  `
  //prettier-ignore
  const infoWindowCycling = `
  <span class="info-window-style-metrics">Показатели ❯</span> ${lastWorkout.distance} км • ${lastWorkout.duration} мин •
  ${lastWorkout.elevation} метров • ${(inputDistance.value / (inputDuration.value / 60)).toFixed(2)} км/ч
  `

  const content = `<div class="info-window-style">
  <p class="info-window-style__item"><span class="info-window-style-metrics">Дата тренировки ❯</span> ${
    lastWorkout.dateTraining
  }</p>
  <p class="info-window-style__item">${lastWorkout.typeTraining === 'Running' ? infoWindowRunning : infoWindowCycling}</p>
  
  <div class="info-window-style-wrap">
${
  lastWorkout.typeTraining === 'Running'
    ? '<span class="info-window-style__green"></span>'
    : '<span class="info-window-style__orange"></span>'
}
</div>
</div>`

  // Создаем маркер
  const marker = new google.maps.Marker({
    map,
    position,
    icon: `icons/${iconPath}`,
  })

  // Создаем информационное окно
  const infowindow = new google.maps.InfoWindow({
    content,
  })

  // Инициализируем переменную для отслеживания состояния маркера
  let isOpen
  // Добавляем обработчик события клика на метку
  marker.addListener('click', () => {
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

  // Добавляем обработчик события закрытия информационного окна
  infowindow.addListener('closeclick', () => {
    isOpen = false // Устанавливаем флаг isOpen в false при закрытии окна

    // При закрытии информационного окна, установить фокус на инпут, иначе фокус будет на метке и буде её обводить.
    document.querySelector('.form__input').focus()
  })
}

// Функция для обработки успешной геолокации
const handleGeolocationSuccess = (pos) => {
  const crd = pos.coords
  currentPosition = { lat: crd.latitude, lng: crd.longitude }

  // Создание карты только после получения координат
  initializeMap()
}

// Функция для обработки ошибок геолокации
const handleGeolocationError = (err) => {
  if (err.message === 'User denied Geolocation') {
    alert('Невозможно получить доступ к вашей геолокации из-за настроек приватности')
  }
  if (err.message === 'Origin does not have permission to use Geolocation service') {
    alert('Невозможно получить доступ к вашей геолокации')
  } else {
    alert(`Возникла непредвиденная ошибка: ${err.message}`)
  }
}

// Запрос текущего местоположения пользователя и обработка результатов
navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError, {
  enableHighAccuracy: true,
})
