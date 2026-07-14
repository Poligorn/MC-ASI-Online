// ============================================================
// СИСТЕМА ПРИВАТОВ WAYSTONE — всё в одном файле
// (global запрещён в этой версии KubeJS)
// ============================================================

const WS_FILE = 'kubejs/data/waystone_claims.json'
const WILD_RADIUS = 1500


// ---------- ХРАНИЛИЩЕ ----------
const wsLoad = () => {
  let d = JsonIO.read(WS_FILE)
  return d ? d : {}
}
const wsSave = (d) => JsonIO.write(WS_FILE, d)

const wsCanUse = (entry, uuid) => {
  if (!entry) return true                 // ничейный — доступен всем
  if (entry.public) return true
  if (entry.owner === uuid) return true
  return entry.friends.indexOf(uuid) !== -1
}

// ---------- ИМЯ С ВЛАДЕЛЬЦЕМ ----------
const UUIDCls = Java.loadClass('java.util.UUID')

const wsFindByUid = (server, key) => {
  try {
    let manager = Java.loadClass('net.blay09.mods.waystones.core.WaystoneManagerImpl').get(server)
    let opt = manager.getWaystoneById(UUIDCls.fromString(key))
    return (opt && opt.isPresent()) ? opt.get() : null
  } catch (e) {
    console.error('[WS-NAME] поиск по UUID: ' + e)
    return null
  }
}

const wsApplyOwnerName = (server, key, entry) => {
  let ws = wsFindByUid(server, key)
  if (!ws) return
  try {
    let base = entry && entry.name ? entry.name : ws.getName().getString().replace(/ §7\[.*\]$/, '')
    let display = entry
      ? base + ' §7[⚑ §e' + entry.ownerName + '§7]'
      : base                                    // ничейный — чистое имя
    ws.setName(Component.literal(display))
    // Разослать обновление клиентам:
    Java.loadClass('net.blay09.mods.waystones.core.WaystoneSyncManager')
      .sendWaystoneUpdateToAll(server, ws)
  } catch (e) {
    console.error('[WS-NAME] setName: ' + e)
  }
}

// Достаём объект Waystone из блока (для ПКМ и команд)
const wsFromBlock = (block) => {
  if (!block || !String(block.id).startsWith('waystones:')) return null
  let be = block.entity
  if (!be) return null
  try {
    let ws = be.getWaystone()
    if (ws && ws.getWaystoneUid) return ws
  } catch (e) {}
  return null
}

// ---------- 1. ЗАХВАТ ПКМ ----------
BlockEvents.rightClicked(event => {
  const block = event.block
  const player = event.player
  const ws = wsFromBlock(block)
  if (!ws) return

  let key = String(ws.getWaystoneUid())
  let data = wsLoad()
  let uuid = String(player.uuid)

  if (!data[key]) {
    data[key] = {
      owner: uuid,
      ownerName: player.username,
      friends: [],
      public: false,
      name: String(ws.getName ? ws.getName().getString() : ''),
      pos: block.pos.x + ',' + block.pos.y + ',' + block.pos.z,
      dim: String(event.level.dimension)
    }
    wsSave(data)
    player.tell('§6⚑ Вы захватили этот Waystone! §7Управление: /ws')
    event.server.tell('§e' + player.username + ' §7захватил Waystone §e' + data[key].pos)
  } else if (!wsCanUse(data[key], uuid)) {
    player.tell('§cВладелец запретил телепортацию через этот Waystone. §7Владелец: ' + data[key].ownerName)
  }
})

// ---------- 2. КОМАНДЫ /ws ----------
ServerEvents.commandRegistry(event => {
  const Commands = event.commands
  const Arguments = event.arguments

  const lookedKey = (player) => {
    let ray = player.rayTrace(6)
    if (!ray || !ray.block) return null
    let ws = wsFromBlock(ray.block)
    return ws ? String(ws.getWaystoneUid()) : null
  }

  const requireOwned = (ctx) => {
    let player = ctx.source.player
    let key = lookedKey(player)
    if (!key) { player.tell('§cПосмотрите на Waystone (до 6 блоков)'); return null }
    let data = wsLoad()
    if (!data[key]) { player.tell('§cЭтот Waystone никем не захвачен'); return null }
    if (data[key].owner !== String(player.uuid)) { player.tell('§cВы не владелец'); return null }
    return { player: player, key: key, data: data }   // ← БЕЗ сокращённой записи!
  }

  event.register(Commands.literal('ws')
    .then(Commands.literal('private').executes(ctx => {
      let r = requireOwned(ctx); if (!r) return 0
      r.data[r.key].public = false
      wsSave(r.data)
      r.player.tell('§6Waystone теперь §cприватный')
      return 1
    }))
    .then(Commands.literal('public').executes(ctx => {
      let r = requireOwned(ctx); if (!r) return 0
      r.data[r.key].public = true
      wsSave(r.data)
      r.player.tell('§6Waystone теперь §aпубличный')
      return 1
    }))
    .then(Commands.literal('friend')
      .then(Commands.literal('add').then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(ctx => {
        let r = requireOwned(ctx); if (!r) return 0
        let friend = Arguments.PLAYER.getResult(ctx, 'player')
        let fu = String(friend.uuid)
        if (r.data[r.key].friends.indexOf(fu) === -1) r.data[r.key].friends.push(fu)
        wsSave(r.data)
        r.player.tell('§a' + friend.username + ' §6получил доступ')
        friend.tell('§6' + r.player.username + ' дал вам доступ к своему Waystone')
        return 1
      })))
      .then(Commands.literal('remove').then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(ctx => {
        let r = requireOwned(ctx); if (!r) return 0
        let friend = Arguments.PLAYER.getResult(ctx, 'player')
        let fu = String(friend.uuid)
        r.data[r.key].friends = r.data[r.key].friends.filter(u => u !== fu)
        wsSave(r.data)
        r.player.tell('§c' + friend.username + ' §6лишён доступа')
        return 1
      })))
    )
    .then(Commands.literal('transfer').then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(ctx => {
      let r = requireOwned(ctx); if (!r) return 0
      let target = Arguments.PLAYER.getResult(ctx, 'player')
      r.data[r.key].owner = String(target.uuid)
      r.data[r.key].ownerName = target.username
      wsSave(r.data)
      r.player.tell('§6Владение передано §a' + target.username)
      target.tell('§6' + r.player.username + ' передал вам Waystone!')
      return 1
    })))
    .then(Commands.literal('info').executes(ctx => {
      let player = ctx.source.player
      let key = lookedKey(player)
      if (!key) { player.tell('§cПосмотрите на Waystone'); return 0 }
      let e = wsLoad()[key]
      if (!e) { player.tell('§7Waystone §aничейный§7 — ПКМ, чтобы захватить'); return 1 }
      player.tell('§6Владелец: §e' + e.ownerName + ' §7| ' + (e.public ? '§aпубличный' : '§cприватный') + ' §7| Друзей: ' + e.friends.length)
      return 1
    }))
  )
})

// ---------- 3. ПОТЕРЯ ПРИ СМЕРТИ (дикие земли, убийца — игрок) ----------
EntityEvents.death('minecraft:player', event => {
  const victim = event.entity
  let killer = null
  try { killer = event.source.actual } catch (e) {}
  if (!killer || !killer.isPlayer()) return
  if (String(killer.uuid) === String(victim.uuid)) return

  let spawn = event.server.overworld().getSharedSpawnPos()
  let dx = victim.x - spawn.x
  let dz = victim.z - spawn.z
  if (Math.sqrt(dx * dx + dz * dz) < WILD_RADIUS) return

  let data = wsLoad()
  let vu = String(victim.uuid)
  let lost = []
  for (let key in data) {
    if (data[key].owner === vu) {
      lost.push(data[key])
      delete data[key]
    }
  }
  if (lost.length === 0) return
  wsSave(data)

  lost.forEach(e => victim.tell('§4☠ Вы потеряли Waystone на §c' + e.pos + '§4!'))
  event.server.tell('§c' + victim.username + ' §7пал в диких землях от руки §c' + killer.username + '§7 и потерял §c' + lost.length + '§7 Waystone!')
})

// ---------- 4. ОТМЕНА ТЕЛЕПОРТА ----------
const balmEvents = Java.loadClass('net.blay09.mods.balm.api.Balm').getEvents()
const TpPreCls = Java.loadClass('net.blay09.mods.waystones.api.event.WaystoneTeleportEvent$Pre')
const PlayerCls = Java.loadClass('net.minecraft.world.entity.player.Player')

balmEvents.onEvent(TpPreCls, event => {
  try {
    let ctx = event.getContext()
    let entity = ctx.getEntity()
    if (!PlayerCls.isInstance(entity)) return

    let ws = ctx.getTargetWaystone()
    let key = String(ws.getWaystoneUid())
    let entry = wsLoad()[key]

    if (!wsCanUse(entry, String(entity.getUUID()))) {
      event.setCanceled(true)
      entity.sendSystemMessage(Component.literal('§cВладелец запретил телепортацию через этот Waystone. §7Владелец: ' + entry.ownerName))
    }
  } catch (e) {
    console.error('[WS-TP] ' + e)  // при ошибке не блокируем телепорт
  }
})

// ---------- 5. СКРЫТИЕ ИЗ СПИСКА ТЕЛЕПОРТАЦИИ ----------
try {
  balmEvents.onEvent(
    Java.loadClass('net.blay09.mods.waystones.api.event.BuildWaystoneSelectionMenuEvent'),
    event => {
      try {
        let uuid = String(event.getPlayer().getUUID())
        let data = wsLoad()
        event.getWaystones().removeIf(pws => {
          try {
            let entry = data[String(pws.getWaystoneUid())]
            return !wsCanUse(entry, uuid)
          } catch (e) { return false }
        })
      } catch (e) { console.error('[WS-MENU] ' + e) }
    }
  )
  console.info('[WS] Скрытие из меню подключено ✅')
} catch (e) {
  console.error('[WS] BuildWaystoneSelectionMenuEvent не найден: ' + e)
}

console.info('[WS] Система приватов Waystone загружена ✅')