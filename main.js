import { TrigAnimation } from './TrigAnimation.js'
import { sleep } from './sleep.js'

const trigAnimationObj = new TrigAnimation()

;(async () => {
  const refreshIcons = document.getElementsByClassName('refresh-icon')

  Array.from(refreshIcons).forEach(refreshIcon => {
    let rotation = 0
    let isCooldown = false
    refreshIcon.addEventListener('pointerdown', async () => {
      if (isCooldown) return
      isCooldown = true
      refreshIcon.classList.add('cooldown')

      rotation += 360
      refreshIcon.style.transform = `rotate(${rotation}deg)`
      await trigAnimationObj.restart(refreshIcon.dataset.type)
      await sleep(1000)
      // Reset rotation to avoid high values
      if (rotation >= 720) rotation %= 360
      isCooldown = false
      refreshIcon.classList.remove('cooldown')
    })
  })
})()

trigAnimationObj.start()

// Math.cos(Math.PI * 2)
// Math.sin(Math.PI / 2)
// Math.tan(Math.PI / 4)
