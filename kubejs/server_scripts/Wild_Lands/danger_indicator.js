// server_scripts/danger_indicator.js
let tickCounter = 0
ServerEvents.tick && PlayerEvents.tick(event => {
    let player = event.player
    tickCounter++
    if (tickCounter % 40 != 0) return // раз в 2 сек

    if (player.level.dimension != "minecraft:overworld") return

    let dist = Math.sqrt(player.x * player.x + player.z * player.z)
    if (dist < 1500) return

    let tier = Math.floor((dist - 1500) / 500)
    player.setStatusMessage(
        Text.of(`§c⚠ Зона опасности: Тир ${tier} §7(${Math.floor(dist)} блоков)`)
    )
})