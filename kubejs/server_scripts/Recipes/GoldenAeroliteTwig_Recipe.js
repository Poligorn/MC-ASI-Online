ServerEvents.recipes(event => {
  // Удалить старый рецепт глайдера
  event.remove({ output: 'aeroscapes:golden_aerolite_twig' })

  // Добавить новый рецепт глайдера с аэролитом
  event.shaped('aeroscapes:golden_aerolite_twig',[
    'GGG',
    'GTG',
    'GGG'
  ], {
    T: 'aeroscapes:aerolite_twig', // Аэролит вместо кожи!
    G: 'minecraft:gold_ingot',
  })
})