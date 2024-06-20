let abortController = new AbortController()

export const sleep = (ms, context) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms)
    abortController.signal.addEventListener('abort', () => {
      clearTimeout(timeout) // Clear the timeout to avoid memory leaks
      const error = new Error('Aborted')
      error.context = context
      reject(error)
    })
  })
}

export const abortSleep = () => {
  abortController.abort()
  abortController = new AbortController()
}
