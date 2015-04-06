angular.module('vtexNgFilter')
  .filter 'toBoolean', -> 
    (input) -> !!input 