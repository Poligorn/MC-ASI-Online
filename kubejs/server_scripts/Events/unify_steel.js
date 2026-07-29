const CBC_STEEL = 'createbigcannons:steel_ingot' // убираем
const CGS_STEEL = 'cgs:steel_ingot'              // оставляем

ServerEvents.recipes(event => {

    // 1. Удаляем рецепты, которые СОЗДАЮТ стальной слиток CBC
    event.remove({ output: CBC_STEEL })

    // 2. Везде, где слиток CBC был ВХОДОМ — подставляем CGS
    event.replaceInput({}, CBC_STEEL, CGS_STEEL)

    // 3. Конвертация: если слиток CBC уже есть в инвентаре — крафтим в CGS
    event.shapeless(CGS_STEEL, [CBC_STEEL])
    event.remove({ output: 'createbigcannons:steel_scrap' })
    event.remove({ output: 'createbigcannons:steel_block' })
})
