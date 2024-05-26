module.exports = {
  '*.{js,ts}': (filenames) => [
    `npx prettier --write ${filenames.join(' ')} --writeclear`
  ]
}
