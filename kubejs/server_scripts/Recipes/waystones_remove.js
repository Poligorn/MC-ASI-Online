ServerEvents.recipes(event => {
  // Удаляем ВСЕ рецепты мода Waystones
  event.remove({ mod: 'waystones' })
})