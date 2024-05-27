/* eslint no-undef: "off" */

const links = document.querySelectorAll('nav a')

const { origin, pathname } = window.location

links.forEach((link) => {
  link.href === origin + pathname && link.classList.add('text-violet-400')
})
