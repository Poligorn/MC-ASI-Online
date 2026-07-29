ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'clockwork:clockwork_drill' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('clockwork:clockwork_drill',[
    ' BB',
    'DNB',
    ' TT'
  ], {
    T: 'clockwork:clockwork_gear',
    D: 'create:mechanical_drill',
    N: 'createbigcannons:congealed_nitro',
    B: 'create:brass_sheet'
  })
})