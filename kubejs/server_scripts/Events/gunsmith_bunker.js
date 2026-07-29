// ==============================================
//  Вооружённые мобы + дроп патронов + тест-команда
// ==============================================

const WILD_ZONE = 1500
const BUNKER_SPAWN_DIST = 5000
const FREE_GUNS_DIST = 7000

// --- Оружие для каждого моба ---
const MOB_GUNS = {
  'minecraft:skeleton':        'cgs:revolver',
  'minecraft:zombie':          'cgs:shotgun',
  'minecraft:pillager':        'cgs:flintlock',      // Разбойник
  'minecraft:wither_skeleton': 'cgs:blazegun',    // Визер-скелет
}
// --- Универсальная функция создания наездника ---
function spawnGunRider(level, x, y, z, mountId, riderName) {
  // Создаём транспорт
  const mount = level.createEntity(mountId)
  mount.setPosition(x, y, z)
  mount.persistentData.putBoolean('gunsmith_guard', true)
  mount.setDropChance('mainhand', 0.0)

  // Создаём всадника — скелет с револьвером
  const rider = level.createEntity('minecraft:skeleton')
  rider.setPosition(x, y, z)
  armMob(rider, 'cgs:revolver', riderName)

  // Спавним обоих
  mount.spawn()
  rider.spawn()

  // Сажаем скелета верхом
  rider.startRiding(mount, true)
}

// --- Патроны, которые дропает каждый тип моба ---
// (что падает вместо оружия)
const MOB_AMMO_DROP = {
  'minecraft:skeleton':        { item: 'cgs:round_revolver_blank', min: 2, max: 6 },
  'minecraft:zombie':          { item: 'cgs:round_shotgun_blank',         min: 1, max: 4 },
  'minecraft:pillager':        { item: 'cgs:paper_cartridge',  min: 2, max: 5 },
  'minecraft:wither_skeleton': { item: 'cgs:frag_grenade',  min: 1, max: 2 }  // граната сама как "патрон"
}

function distFromCenter(pos) {
  return Math.sqrt(pos.x * pos.x + pos.z * pos.z)
}

// --- Вооружение моба ---
function armMob(entity, gunId, guardName) {
  entity.setItemSlot('mainhand', Item.of(gunId))
  entity.persistentData.putBoolean('gunsmith_guard', true)

  // ВАЖНО: запрещаем дроп оружия из руки (drop chance = 0)
  entity.setDropChance('mainhand', 0.0)

  entity.potionEffects.add('minecraft:resistance', 999999, 0, false, false)

  if (guardName) {
    entity.setCustomName(Text.of(guardName).red())
  }
}

// --- Спавн для всех типов вооружённых мобов ---
Object.keys(MOB_GUNS).forEach(mobType => {
  EntityEvents.spawned(mobType, event => {
    handleGunMob(event, mobType)
  })
})

function handleGunMob(event, type) {
  const { entity } = event
  const pos = entity.blockPosition()
  const dist = distFromCenter(pos)
  const gun = MOB_GUNS[type]

  if (dist < WILD_ZONE) return

  // Внутри бункера
  if (dist >= BUNKER_SPAWN_DIST && pos.y <= 30) {
    if (Math.random() < 0.5) {
      armMob(entity, gun, 'Часовой Бункера')
    }
    return
  }

  // Свободный спавн после 7000
  if (dist >= FREE_GUNS_DIST) {
    if (Math.random() < 0.35) {
      armMob(entity, gun, 'Мародёр Пустошей')
    }
  }
}

// ==============================================
//  ДРОП ПАТРОНОВ вместо оружия при смерти
// ==============================================
EntityEvents.death(event => {
  const { entity } = event

  // Дропают только вооружённые "часовые/мародёры"
  if (!entity.persistentData.getBoolean('gunsmith_guard')) return

  const type = entity.type
  const dropInfo = MOB_AMMO_DROP[type]
  if (!dropInfo) return

  const count = dropInfo.min + Math.floor(Math.random() * (dropInfo.max - dropInfo.min + 1))
  if (count <= 0) return

  const pos = entity.blockPosition()
  entity.level.spawnItem(pos.x, pos.y, pos.z, Item.of(dropInfo.item, count))
})

// ==============================================
//  ТЕСТОВАЯ КОМАНДА /gunmob <тип>
// ==============================================
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  const NAME_TO_MOB = {
    'skeleton':        'minecraft:skeleton',
    'zombie':          'minecraft:zombie',
    'pillager':        'minecraft:pillager',
    'wither_skeleton': 'minecraft:wither_skeleton'
  }

  // Специальные наездники
  const RIDERS = {
    'spider_rider':  { mount: 'minecraft:spider',  name: 'ТЕСТ Наездник-Стрелок' },
    'phantom_rider': { mount: 'minecraft:phantom', name: 'ТЕСТ Воздушный Стрелок' }
  }

  event.register(
    Commands.literal('gunmob')
      .then(Commands.argument('type', Arguments.STRING.create(event))
        .suggests((ctx, builder) => {
          Object.keys(NAME_TO_MOB).forEach(n => builder.suggest(n))
          Object.keys(RIDERS).forEach(n => builder.suggest(n))
          return builder.buildFuture()
        })
        .executes(ctx => {
          const player = ctx.source.player
          if (!player) return 0
          const type = Arguments.STRING.getResult(ctx, 'type')
          const pos = player.blockPosition()

          // --- Наездники ---
          if (RIDERS[type]) {
            const r = RIDERS[type]
            spawnGunRider(player.level, pos.x + 2, pos.y + (type === 'phantom_rider' ? 3 : 0), pos.z, r.mount, r.name)
            player.tell(Text.of(`Заспавнен наездник: ${type}`).green())
            return 1
          }

          // --- Обычные вооружённые мобы ---
          const mobId = NAME_TO_MOB[type]
          if (!mobId) {
            player.tell(Text.of(`Неизвестный тип: ${type}`).red())
            return 0
          }

          const gunId = MOB_GUNS[mobId]
          const mob = player.level.createEntity(mobId)
          mob.setPosition(pos.x + 2, pos.y, pos.z)
          armMob(mob, gunId, 'ТЕСТ Часовой')
          mob.spawn()

          player.tell(Text.of(`Заспавнен ${type} с оружием ${gunId}`).green())
          return 1
        })
      )
  )
})