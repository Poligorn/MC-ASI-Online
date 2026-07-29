ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'clockwork:clockwork_flamethrower' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('clockwork:clockwork_flamethrower',[
    ' BB',
    'PNB',
    ' T '
  ], {
    P: 'create:propeller',
    N: 'createbigcannons:congealed_nitro',
    B: 'create:brass_sheet',
    T: 'aeroscapes:golden_aerolite_twig'
  })
})