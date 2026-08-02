// Лицензии пилота — 4 ранга
const LICENSE_RANKS = [
  { id: 'cadet',   name: 'Лицензия пилота: Кадет',          rarity: 'uncommon' },
  { id: 'second',  name: 'Лицензия пилота: Второй офицер',  rarity: 'rare' },
  { id: 'first',   name: 'Лицензия пилота: Первый офицер',  rarity: 'rare' },
  { id: 'captain', name: 'Лицензия пилота: Капитан',        rarity: 'epic' },
  { id: 'admin', name: 'Лицензия пилота: Админ',        rarity: 'epic' }
]

StartupEvents.registry('item', event => {
  LICENSE_RANKS.forEach(rank => {
    event.create(`pilot_license_${rank.id}`)
      .displayName(rank.name)
      .rarity(rank.rarity)
      .maxStackSize(1)
  })
})