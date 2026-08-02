// ===== КОНФИГ =====
const EXAM = {
  // Блок-активатор (стойка регистрации в аэропорту)
  trigger: { x: 100, y: 65, z: -200, dim: 'minecraft:overworld' }, // ← ЗАМЕНИ
  cooldownMin: 10,          // минут блокировки после провала
}

// ===== СОСТОЯНИЕ (в памяти) =====
const exam = { active: false, player: null, startedAt: 0 }

// ===== АКТИВАЦИЯ =====
BlockEvents.rightClicked(event => {
  const { player, block, level } = event
  if (level.dimension.toString() !== EXAM.trigger.dim) return
  if (block.x !== EXAM.trigger.x || block.y !== EXAM.trigger.y || block.z !== EXAM.trigger.z) return

  event.cancel() // не открывать лектерн/не жать кнопку по-настоящему

  // 1. Уже идёт экзамен?
  if (exam.active) {
    if (exam.player === player.username) return // сам сдающий тыкает повторно
    player.tell(Text.red(`Экзамен уже проводится (сдаёт ${global.exam.player}). Подождите.`))
    return
  }

  // 2. Кулдаун после провала?
  const cds = event.server.persistentData.pilotExamCooldowns
  const uuid = player.uuid.toString()
  if (cds && cds.contains(uuid)) {
    const leftMs = cds.getLong(uuid) + EXAM.cooldownMin * 60000 - Date.now()
    if (leftMs > 0) {
      player.tell(Text.red(`Пересдача через ${Math.ceil(leftMs / 60000)} мин.`))
      return
    }
  }

  // 3. Старт!
exam.active = true
exam.player = player.username
exam.startedAt = Date.now()
  player.tell(Text.green('Экзамен начат! Займите место в самолёте.'))
  event.server.tell(Text.gray(`✈ ${player.username} сдаёт экзамен пилота`))
  // TODO Фаза 3: спавн самолёта
  // TODO Фаза 5: запуск bossbar-таймера
})

// ===== СТРАХОВКА: сдающий вышел с сервера =====
PlayerEvents.loggedOut(event => {
  if (exam.active && exam.player === event.player.username) {
    exam.active = false
    exam.player = null
    event.server.tell(Text.gray('✈ Экзамен прерван: пилот покинул сервер'))
    // TODO Фаза 3: удалить самолёт
  }
})

// ===== АДМИН-КОМАНДА СБРОСА (если что-то зависло) =====
ServerEvents.commandRegistry(event => {
  const { commands: cmd } = event
  event.register(cmd.literal('examreset')
    .requires(s => s.hasPermission(2))
    .executes(ctx => {
      exam.active = false
      exam.player = null
      ctx.source.sendSuccess(Text.green('Состояние экзамена сброшено'), true)
      return 1
    }))
})