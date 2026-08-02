ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'clockwork:clockwork_potion_sprayer' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('clockwork:clockwork_potion_sprayer',[
    ' GB',
    'PMB',
    ' T '
  ], {
    P: 'create:propeller',
    M: 'create:precision_mechanism',
    B: 'create:brass_sheet',
    G: 'minecraft:glass_bottle',
    T: 'aeroscapes:golden_aerolite_twig'
  })
})