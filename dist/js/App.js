class App {
  constructor() {
    // Загрузка и десериализация списка тренировок из LocalStorage
    const loadedWorkouts = localStorage.getItem('myWorkouts')

    // Массив для хранения тренировок
    this.workouts

    if (loadedWorkouts) {
      this.workouts = JSON.parse(loadedWorkouts)
    }

    this.originalWorkouts = loadedWorkouts ? JSON.parse(loadedWorkouts) : []
    this.currentWorkouts = [...this.originalWorkouts]

    form.addEventListener('submit', this.handleFormSubmit.bind(this))

    const availablTraining = () => {}
    if (this.workouts.length === 0) {
      trainingNothing.classList.remove('hidden-workout')
    }
  }

  createWorkout(distance, duration, cadence, elevation) {
    try {
      let workout

      if (inputType.value === 'running' && distance !== '' && duration !== '' && cadence !== '') {
        workout = new Running(distance, duration, cadence)
      } else if (inputType.value === 'cycling' && distance !== '' && duration !== '' && elevation !== '') {
        workout = new Cycling(distance, duration, elevation)
      } else {
        errorMessage.classList.remove('hidden-input-error')
        throw new Error('Некорректно введенные данные')
      }

      this.originalWorkouts.push(workout)

      errorMessage.classList.add('hidden-input-error')

      workout.createTraining()

      this.workouts.push(workout) // Добавляем тренировку в массив

      // Сохранение списка тренировок в LocalStorage после добавления новой тренировки
      const serializedWorkouts = JSON.stringify(this.workouts)
      localStorage.setItem('myWorkouts', serializedWorkouts)

      if (this.workouts.length !== 0) {
        trainingNothing.classList.add('hidden-workout')
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  /////
  // Функция для удаления тренировки
  deleteWorkout(workoutId) {
    const indexToDelete = this.workouts.findIndex((workout) => workout.trainingId === workoutId)
    if (indexToDelete !== -1) {
      // Удаляем тренировку из массива this.workouts
      this.workouts.splice(indexToDelete, 1)

      // Удаляем тренировку из массива this.originalWorkouts
      const originalIndexToDelete = this.originalWorkouts.findIndex((workout) => workout.trainingId === workoutId)
      if (originalIndexToDelete !== -1) {
        this.originalWorkouts.splice(originalIndexToDelete, 1)
      }

      // Находим соответствующий маркер
      const markerIndex = hiddenMarkers.findIndex((marker) => marker.trainingId === workoutId)
      if (markerIndex !== -1) {
        const marker = hiddenMarkers.splice(markerIndex, 1)[0]
        marker.setMap(null) // Скрываем маркер на карте
      }

      // Сохраняем обновленный массив в локальное хранилище
      const serializedWorkouts = JSON.stringify(this.workouts)
      localStorage.setItem('myWorkouts', serializedWorkouts)

      if (this.workouts.length !== 0) {
        trainingNothing.classList.add('hidden-workout')
      } else {
        trainingNothing.classList.remove('hidden-workout')
      }
    }
  }

  sortTraining(typeTraining) {
    // Очищаем контейнер перед добавлением отсортированных тренировок
    containerWorkouts.innerHTML = ''

    // Переместите форму перед отображенными тренировками
    containerWorkouts.insertAdjacentElement('beforeend', form)

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

    this.currentWorkouts = this.originalWorkouts
      .filter((workout) => workout.typeTraining === typeTraining)
      .sort((a, b) => b.timestamp - a.timestamp)

    // Перебираем отсортированные тренировки и добавляем их в контейнер
    this.currentWorkouts.forEach((el) => {
      containerWorkouts.insertAdjacentHTML('beforeend', el.insertTypeHtml)
    })
  }

  restoreTraining() {
    containerWorkouts.innerHTML = ''

    this.workouts.forEach((workout) => {
      const originalWorkout = this.originalWorkouts.find((original) => original.trainingId === workout.trainingId)
      if (originalWorkout) {
        containerWorkouts.insertAdjacentHTML('afterbegin', originalWorkout.insertTypeHtml)
      }
    })

    // Функция для восстановления всех маркеров
    hiddenMarkers.forEach((el) => {
      el.setMap(map) // Показываем скрытый маркер на карте
    })
    hiddenMarkers.length = 0 // Очищаем массив скрытых маркеров

    // Переместите форму перед отображенными тренировками
    containerWorkouts.insertAdjacentElement('afterbegin', form)
  }

  handleFormSubmit(e) {
    e.preventDefault()
    this.createWorkout(inputDistance.value, inputDuration.value, inputCadence.value, inputElevation.value)
  }
}
