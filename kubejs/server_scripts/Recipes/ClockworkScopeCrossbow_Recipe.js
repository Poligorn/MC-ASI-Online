ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'clockwork:scope_crossbow' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('clockwork:scope_crossbow', [
    'TST',
    'BCB',
    ' W '
  ], {
    T: 'aeroscapes:golden_aerolite_twig', // Аэролит вместо кожи!
    C: 'minecraft:crossbow',
    B: 'create:brass_sheet',
    S: 'simulated:spring',
    W: 'minecraft:spyglass'
  })
})