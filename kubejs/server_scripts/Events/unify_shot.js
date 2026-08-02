const CBC_SHOT = 'createbigcannons:shot_balls' // убираем
const CGS_SHOT = 'cgs:lead_balls'              // оставляем

ServerEvents.recipes(event => {

    // 1. Удаляем рецепты, создающие картечь CBC
    event.remove({ output: CBC_SHOT })

    // 2. Везде, где картечь CBC была входом — подставляем CGS
    event.replaceInput({}, CBC_SHOT, CGS_SHOT)

    // 3. Конвертация старой картечи CBC → CGS
    event.shapeless(CGS_SHOT, [CBC_SHOT])
})