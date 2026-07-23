// ============================================
// НАСТРОЙКИ СИСТЕМЫ
// ============================================
const DifficultyConfig = {
    // Дистанция начала диких земель (сложность начинается отсюда)
    WILD_LANDS_START: 1500,
    // Дистанция портала в Энд
    END_DISTANCE: 10000,

    // За сколько блоков считается 1 "ступень" сложности
    STEP_DISTANCE: 500,

    // Максимальный множитель здоровья
    MAX_HEALTH_MULT: 6.0,
    // Максимальный множитель урона
    MAX_DAMAGE_MULT: 4.0,
    // Максимальный множитель скорости
    MAX_SPEED_MULT: 1.5,

    // Прирост на каждую ступень (500 блоков)
    HEALTH_PER_STEP: 0.15,   // +15% HP за 500 блоков
    DAMAGE_PER_STEP: 0.10,   // +10% урона за 500 блоков
    SPEED_PER_STEP: 0.02,    // +2% скорости за 500 блоков

    // Измерение, где работает система (overworld)
    DIMENSION: "minecraft:overworld"
}

// Функция расчёта дистанции от спавна (0,0)
function getDistanceFromSpawn(entity) {
    let x = entity.x
    let z = entity.z
    return Math.sqrt(x * x + z * z)
}

// Функция расчёта уровня сложности (ступени)
function getDifficultyTier(distance) {
    if (distance < DifficultyConfig.WILD_LANDS_START) return 0
    let effectiveDist = distance - DifficultyConfig.WILD_LANDS_START
    return Math.floor(effectiveDist / DifficultyConfig.STEP_DISTANCE)
}

// Применение бафов к мобу
function applyDifficultyScaling(entity, tier) {
    if (tier <= 0) return

    // --- Здоровье ---
    let healthMult = Math.min(
        1.0 + (tier * DifficultyConfig.HEALTH_PER_STEP),
        DifficultyConfig.MAX_HEALTH_MULT
    )
    let maxHealthAttr = entity.getAttribute("minecraft:generic.max_health")
    if (maxHealthAttr) {
        // Удаляем старый модификатор если есть, затем добавляем новый
        let baseHealth = maxHealthAttr.baseValue
        maxHealthAttr.baseValue = baseHealth * healthMult
        entity.setHealth(entity.maxHealth)
    }

    // --- Урон ---
    let damageMult = Math.min(
        1.0 + (tier * DifficultyConfig.DAMAGE_PER_STEP),
        DifficultyConfig.MAX_DAMAGE_MULT
    )
    let damageAttr = entity.getAttribute("minecraft:generic.attack_damage")
    if (damageAttr) {
        damageAttr.baseValue = damageAttr.baseValue * damageMult
    }

    // --- Скорость ---
    let speedMult = Math.min(
        1.0 + (tier * DifficultyConfig.SPEED_PER_STEP),
        DifficultyConfig.MAX_SPEED_MULT
    )
    let speedAttr = entity.getAttribute("minecraft:generic.movement_speed")
    if (speedAttr) {
        speedAttr.baseValue = speedAttr.baseValue * speedMult
    }

    // --- Броня (доп. защита на высоких тирах) ---
    let armorAttr = entity.getAttribute("minecraft:generic.armor")
    if (armorAttr) {
        let bonusArmor = Math.min(tier * 0.5, 20)
        armorAttr.baseValue = armorAttr.baseValue + bonusArmor
    }

    // Помечаем моба как обработанного и сохраняем тир
    entity.persistentData.putInt("distanceTier", tier)
    entity.persistentData.putBoolean("difficultyScaled", true)
}

// ============================================
// СОБЫТИЕ СПАВНА МОБА
// ============================================
EntityEvents.spawned(event => {
    let entity = event.entity

    // Проверки
    if (entity.level.isClientSide()) return
    if (!entity.living) return
    if (entity.player) return // не трогаем игроков
    if (entity.type == "minecraft:armor_stand") return

    // Только враждебные мобы (можно расширить фильтр)
    if (!entity.isMonster()) return

    // Проверка измерения
    if (entity.level.dimension != DifficultyConfig.DIMENSION) return

    // Уже обработан?
    if (entity.persistentData.getBoolean("difficultyScaled")) return

    let distance = getDistanceFromSpawn(entity)
    let tier = getDifficultyTier(distance)

    if (tier > 0) {
        applyDifficultyScaling(entity, tier)
    }
})