const path = require('path')

const buildCommand = (filenames) => {
  const files = filenames.map((f) => path.relative(process.cwd(), f))
  return [
    `npx prettier --write ${files.join(' --file ')}`,
    `npx eslint --fix ${files.join(' ')} --report-unused-disable-directives --max-warnings 0`,
    `npx jest --runInBand --findRelatedTests ${filenames.join(' ')} --passWithNoTests`
  ]
}

module.exports = {
  '*.{js,ts}': [buildCommand]
}
