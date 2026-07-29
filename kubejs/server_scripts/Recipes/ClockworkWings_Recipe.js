ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'clockwork:clockwork_wings' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('clockwork:clockwork_wings', [
    'SMS',
    'BEB',
    'AGA'
  ], {
    A: 'aeroscapes:golden_aerolite_twig', // Аэролит вместо кожи!
    E: 'minecraft:elytra',
    B: 'create:brass_sheet',
    G: 'simulated:gyroscopic_mechanism',
    S: 'simulated:spring',
    M: 'supplementaries:altimeter'
  })
})