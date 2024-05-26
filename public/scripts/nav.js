/* eslint no-undef: "off" */

const links = document.querySelectorAll('nav a')

const { href } = window.location

links.forEach((link) => {
  link.href === href && link.classList.add('text-violet-400')
})
