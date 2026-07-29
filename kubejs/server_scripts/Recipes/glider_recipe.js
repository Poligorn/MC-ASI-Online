ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'paraglider:paraglider' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('paraglider:paraglider', [
    'SAS',
    'ASA',
    'S S'
  ], {
    A: 'aeroscapes:aerolite_twig', // Аэролит вместо кожи!
    S: 'minecraft:stick'
  })
})