module.exports = {
  '*.{js,ts}': filenames => [
    `npx prettier --write ${filenames.join(' ')} --writeclear`,
    `npx eslint --fix --ext .ts .`,
    `npm run test -- --findRelatedTests ${filenames.join(' ')} --passWithNoTests`
  ]
}
