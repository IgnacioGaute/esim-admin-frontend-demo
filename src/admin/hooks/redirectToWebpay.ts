export const redirectToWebpay = (url: string, token: string) => {
  const form = document.createElement("form")
  form.method = "POST"
  form.action = url
  form.style.display = "none"

  const input = document.createElement("input")
  input.type = "hidden"
  input.name = "token_ws"
  input.value = token

  form.appendChild(input)
  document.body.appendChild(form)
  form.submit()
}