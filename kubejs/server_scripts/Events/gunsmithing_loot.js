const NITER = 'cgs:niter'   // сверь ID в JEI!

LootJS.lootTables(event => {

    // ===== КРИПЕР (уже работает) =====
    let creeper = event.modifyEntityTables('minecraft:creeper')
    creeper.removeItem('minecraft:gunpowder')
    creeper.createPool(pool => {
        pool.addEntry(NITER)
    })

    // ===== СУНДУКИ =====
    // Берём все таблицы сундуков (chests/*) и меняем в них порох
    let chests = event.modifyLootTables(/minecraft:chests\/.*/)
    chests.removeItem('minecraft:gunpowder')
    chests.createPool(pool => {
        pool.addEntry(NITER)
    })
})