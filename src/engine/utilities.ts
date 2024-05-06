// a function to delay the execution of the next line of code
// a little juice for the UI
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
