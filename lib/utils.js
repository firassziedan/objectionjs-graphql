const _ = require('lodash')

function isExcluded(opt, prop) {
  return (opt.include && opt.include.indexOf(prop) === -1)
    || (opt.exclude && opt.exclude.indexOf(prop) !== -1)
}

function typeNameForModel(modelClass) {
  return _.upperFirst(_.camelCase(modelClass.tableName))
}

function capitalizeFirstLetter(string) {
  return _.upperFirst(_.camelCase(string))
}

function removePlural(string) {
  if (string.endsWith('s') && (!string.endsWith('ss') && !string.endsWith('ies') && !string.endsWith('us'))) {
    return string.replace(/s$/, '')
  }

  if (string.endsWith('ies')) {
    return string.replace(/ies$/, 'y')
  }

  return string
}

module.exports = {
  isExcluded,
  typeNameForModel,
  capitalizeFirstLetter,
  removePlural
}
