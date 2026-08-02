// === Часть 1: убираем свободный крафт клейм-блока ===
ServerEvents.recipes(event => {
    event.remove({ output: 'aeroclaims:claim_block' })
})

// === Часть 2: сколько клейм-блоков даёт каждый ранг ===
const CLAIMS_BY_RANK = {
    cadet: 5,
    // добавишь остальные ранги позже
}

// Выдаёт клеймы игроку. claim_block — обычный предмет.
// БЕЗ global — функция видна другим server_scripts автоматически.
function grantClaims(player, rank) {
    const amount = CLAIMS_BY_RANK[rank]
    if (!amount) {
        console.warn(`[PilotWings] Неизвестный ранг: ${rank}`)
        return
    }
    player.give(Item.of('aeroclaims:claim_block', amount))
    player.tell(Text.green(`Начислено ${amount} клейм-блоков (ранг: ${rank})`))
}