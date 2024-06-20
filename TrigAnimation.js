import { sleep } from './sleep.js'

export class TrigAnimation {
  // Due to floating-point precision issues in JavaScript,
  // Math.tan(Math.PI / 4) may not return exactly 1.
  #state = Object.freeze({
    cos: {
      angle: Math.PI * 2,
      angleEl: null,
      controller: null
    },
    sin: {
      angle: Math.PI / 2,
      angleEl: null,
      controller: null
    },
    tan: {
      angle: Math.PI / 4,
      angleEl: null,
      controller: null
    }
  })

  #DONE = 1
  #currentPromises = []

  #getFractionalPart = number => (number % 1).toString().slice(2)
  #getIntegerPart = number => Math.trunc(number)

  #getIntFractional = number => [
    this.#getIntegerPart(number),
    this.#getFractionalPart(number).toString()
  ]

  async #animateDigit (targetDigit, fractional, type, int, angleEl) {
    const digitElement = document.createElement('span')
    angleEl.appendChild(digitElement)

    const resultEl = document.getElementById(`math_${type}`)

    for (let i = 0; i <= targetDigit; i++) {
      if (this.#state[type].controller.signal.aborted)
        throw new Error('Aborted')

      digitElement.style.opacity = 0
      await sleep(500)
      digitElement.innerText = i
      digitElement.style.opacity = 1
      await sleep(500)
      const angle = parseFloat(`${int}.${fractional}${i}`)
      const result = Math[type](angle)
      resultEl.value = result
      await sleep(500)
      if (result === this.#DONE) return result
    }
  }

  async #animateTrig (angleEl) {
    const intElement = document.createElement('span')
    const type = angleEl.dataset.type
    const [int, fractional] = this.#getIntFractional(
      this.#state[type].angle.toString()
    )

    intElement.innerText = `${int}.`
    angleEl.appendChild(intElement)

    for (const [index, _] of fractional.split('').entries()) {
      // first iteration
      // fractional: 2831853
      // currentFractionalSegment: 2
      // currentDigit: 2
      // fractionalSlice: ''

      // second iteration
      // fractional: 2831853
      // currentFractionalSegment: 28
      // currentDigit: 8
      // fractionalSlice: '2'
      const currentFractionalSegment = fractional.slice(0, index + 1)
      const currentDigit = parseInt(currentFractionalSegment.at(-1), 10)
      const fractionalSlice = fractional.slice(0, index)
      const result = await this.#animateDigit(
        currentDigit,
        fractionalSlice,
        type,
        int,
        angleEl
      )

      if (result === this.#DONE) break
    }
  }

  async #runAnimateTrig (angleEl, type) {
    this.#state[type].controller = new AbortController()

    await this.#animateTrig(angleEl).catch(error => console.log(error))
  }

  async #waitAllSettled () {
    while (this.#currentPromises.length > 0) {
      const results = await Promise.allSettled(this.#currentPromises)
      this.#currentPromises = this.#currentPromises.filter((promise, index) => {
        return results[index].status === 'pending'
      })
      await sleep(100) // Small delay to avoid tight loop
    }
  }

  async start () {
    const angles = document.getElementsByClassName('argument')

    this.#currentPromises = Array.from(angles).map(async angleEl => {
      this.#state[angleEl.dataset.type].angleEl = angleEl
      await this.#runAnimateTrig(angleEl, angleEl.dataset.type)
    })

    await this.#waitAllSettled()
    console.log('All animations completed')
  }

  async restart (type) {
    this.#state[type].controller.abort()
    document.getElementById(`math_${type}`).value = ''
    const angleEl = this.#state[type].angleEl
    angleEl.innerHTML = ''
    angleEl.innerText = ''
    await sleep(1000)
    this.#runAnimateTrig(angleEl, type)
  }
}
