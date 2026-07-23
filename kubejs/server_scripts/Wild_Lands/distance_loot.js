// ============================================
// СИСТЕМА ДОПОЛНИТЕЛЬНОГО ЛУТА ПО ДИСТАНЦИИ
// ============================================
const LootConfig = {
    WILD_LANDS_START: 1500,
    STEP_DISTANCE: 500,

    // Таблицы лута по тирам (случайный дроп + шанс)
    // Каждый тир добавляется к предыдущему
    lootTables: [
        // Тир 1-4 (1500 - 3500 блоков)
        {
            minTier: 1,
            maxTier: 4,
            drops: [
                { item: "minecraft:iron_ingot", chance: 0.15, min: 1, max: 2 },
                { item: "minecraft:gold_nugget", chance: 0.10, min: 1, max: 3 },
                { item: "minecraft:experience_bottle", chance: 0.05, min: 1, max: 1 }
            ]
        },
        // Тир 5-9 (3500 - 6000 блоков)
        {
            minTier: 5,
            maxTier: 9,
            drops: [
                { item: "minecraft:gold_ingot", chance: 0.20, min: 1, max: 3 },
                { item: "minecraft:diamond", chance: 0.05, min: 1, max: 1 },
                { item: "minecraft:experience_bottle", chance: 0.10, min: 1, max: 2 }
                // Пример предмета из Create:
                // { item: "create:brass_ingot", chance: 0.10, min: 1, max: 2 }
            ]
        },
        // Тир 10+ (6000 - 10000 блоков, близко к Энду)
        {
            minTier: 10,
            maxTier: 999,
            drops: [
                { item: "minecraft:diamond", chance: 0.15, min: 1, max: 3 },
                { item: "minecraft:emerald", chance: 0.20, min: 1, max: 4 },
                { item: "minecraft:netherite_scrap", chance: 0.02, min: 1, max: 1 },
                { item: "minecraft:experience_bottle", chance: 0.20, min: 2, max: 4 }
            ]
        }
    ]
}

// Выдача бонусного лута
function dropBonusLoot(entity, tier) {
    let level = entity.level
    let random = level.random

    LootConfig.lootTables.forEach(table => {
        if (tier >= table.minTier && tier <= table.maxTier) {
            table.drops.forEach(drop => {
                if (random.nextFloat() < drop.chance) {
                    let count = drop.min + random.nextInt(drop.max - drop.min + 1)
                    let stack = Item.of(drop.item, count)
                    entity.block.popItemFromFace(stack, "up") // или через level
                    level.spawnEntity(
                        level.createEntity("minecraft:item").tap(e => {})
                    )
                    // Простой дроп предмета в точке смерти:
                    entity.level.spawnEntity(entity.level.createEntity("item"))
                }
            })
        }
    })
}

// ============================================
// СОБЫТИЕ СМЕРТИ МОБА
// ============================================
EntityEvents.death(event => {
    let entity = event.entity

    if (entity.level.isClientSide()) return
    if (!entity.living) return
    if (entity.player) return

    // Проверяем, был ли моб масштабирован
    if (!entity.persistentData.getBoolean("difficultyScaled")) return

    let tier = entity.persistentData.getInt("distanceTier")
    if (tier <= 0) return

    // Убийца должен быть игроком (защита от фарма нежизнеспособного)
    let source = event.source
    let killer = source ? source.player : null
    if (!killer) return

    // Выдаём бонусный лут
    LootConfig.lootTables.forEach(table => {
        if (tier >= table.minTier && tier <= table.maxTier) {
            table.drops.forEach(drop => {
                if (entity.level.random.nextFloat() < drop.chance) {
                    let count = drop.min + entity.level.random.nextInt(drop.max - drop.min + 1)
                    entity.level.spawnEntityAt(
                        Item.of(drop.item, count),
                        entity.x, entity.y, entity.z
                    )
                }
            })
        }
    })

    // Бонусный опыт
    let bonusXp = tier * 2
    if (killer.player) {
        killer.giveXP(bonusXp)
    }
})