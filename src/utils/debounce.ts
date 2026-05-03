export function debounce(
  fn: (value: string) => void,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>

  return (value: string) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(value)
    }, delay)
  }
}