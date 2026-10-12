import {registerTranslations, translateDOM, formatCountCopy} from './i18n.mjs';
import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import {searchState, searchAsk, searchMidpoint, LOGIC_ITEMS, logicReplay, PROBABILITY_CELLS, probabilityState, probabilityToggle, probabilityCheck} from './explore-a-engine.mjs';

// Every visible and assistive string is original copy in zh-CN / en / es-MX.
export const COPY = {
  searchNav: ['折半寻找', 'Narrow it down', 'Reduce la búsqueda'],
  logicNav: ['线索排队', 'Arrange the clues', 'Ordena con pistas'],
  probabilityNav: ['概率方格', 'Count the chances', 'Cuenta las posibilidades'],
  undo: ['↶ 撤回', '↶ Undo', '↶ Deshacer'], reset: ['重来', 'Start over', 'Reiniciar'],
  hint: ['✧ 给我一点灵感', '✧ A little hint', '✧ Una pista'], nextHint: ['再给一点提示 →', 'One more hint →', 'Otra pista →'], lastHint: ['✧ 再看这条提示', '✧ Read this hint again', '✧ Volver a ver la pista'],
  searchEyebrow: ['用问题，缩小未知', 'Ask away the uncertainty', 'Preguntas que despejan dudas'],
  searchTitle: ['六十四种可能。', '64 possibilities.', '64 posibilidades.'],
  searchPremise: ['一个整数藏在 1 到 64 之间。你只能问“它大于这个数吗？”用真实的回答，把可能范围缩到一个数。', 'An integer is hidden between 1 and 64. You may only ask, “Is it greater than this number?” Use truthful answers to leave just one possibility.', 'Hay un entero oculto entre 1 y 64. Solo puedes preguntar: “¿Es mayor que este número?”. Usa respuestas verdaderas hasta dejar una sola posibilidad.'],
  searchLabel: ['信息与区间', 'Information & intervals', 'Información e intervalos'],
  searchRule: ["输入当前范围内的一个整数 x，但不能选最大值，再提交“隐藏数大于 x 吗？”。回答只会是“大于”或“不大于”，不会直接告诉你是否猜中。目标是缩到只剩一个数；不限制提问次数。", "Enter an integer x within the current range, but not its largest value, then ask whether the hidden number is greater than x. The answer is only greater or not greater, never a direct hit. Narrow the range to one number; there is no question limit.", "Escribe un entero x del intervalo actual, excepto el valor mayor, y pregunta si el número oculto es mayor que x. Solo responde mayor o no mayor, nunca si acertaste directamente. Reduce el intervalo a un solo número; no hay límite de preguntas."],
  searchRange: ['还可能是 {low}–{high} · {count} 个数', 'Possible: {low}–{high} · {count} numbers', 'Posibles: {low}–{high} · {count} números'],
  searchBoard: ['1 到 64 的可能数。尚未排除：{low} 到 {high}。', 'Candidate numbers 1 to 64. Still possible: {low} to {high}.', 'Números posibles del 1 al 64. Quedan del {low} al {high}.'],
  searchInput: ['它大于……', 'Is it greater than…', '¿Es mayor que…'], searchAsk: ['问一问 →', 'Ask →', 'Preguntar →'],
  searchNew: ['换个隐藏数', 'New hidden number', 'Otro número oculto'],
  searchStart: ['64 个数都可能。第一个问题，在哪里分开？', 'All 64 numbers are possible. Where will you make the first cut?', 'Los 64 números son posibles. ¿Dónde harás el primer corte?'],
  searchProgress: ['第 {questions} 问：{answer} {cut}。还剩 {count} 个可能。', 'Question {questions}: {answer} {cut}. {count} possibilities remain.', 'Pregunta {questions}: {answer} {cut}. Quedan {count} posibilidades.'],
  searchGreater: ['大于', 'greater than', 'mayor que'], searchNotGreater: ['不大于', 'not greater than', 'no mayor que'],
  searchWon: ['由证据确定了：{number}。用了 {questions} 问，现在只剩这一种可能。', 'The evidence pins it down: {number}. After {questions} questions, it is the only possibility.', 'Las respuestas lo confirman: {number}. Después de {questions} preguntas, es la única posibilidad.'],
  searchInvalid: ['请输入 {low} 到 {cutMax} 之间的整数，让问题把剩余范围分成两部分。', 'Enter a whole number from {low} to {cutMax}, so the question splits the remaining range.', 'Ingresa un entero del {low} al {cutMax} para dividir el intervalo restante.'],
  searchHistory: ['我的证据', 'My evidence', 'Mis respuestas'], searchHistoryEmpty: ['每次回答都会留在这里。', 'Each answer will stay here.', 'Aquí se guardará cada respuesta.'],
  searchRecord: ['大于 {cut}？{answer} → 剩 {low}–{high}', 'Greater than {cut}? {answer} → {low}–{high} remain', '¿Mayor que {cut}? {answer} → Quedan {low}–{high}'],
  yes: ['是', 'Yes', 'Sí'], no: ['否', 'No', 'No'],
  searchHint1: ['问一个偏向边缘的问题，可能一下缩很小，也可能几乎没帮助。怎样让两个答案都带来进展？', 'A cut near an end may eliminate almost everything, or almost nothing. How could either answer make good progress?', 'Un corte cerca de un extremo puede descartar casi todo o casi nada. ¿Cómo lograr que ambas respuestas ayuden bastante?'],
  searchHint2: ['尽量把剩下的数分成同样大的两组。无论回答是什么，至少排除接近一半。', 'Split the remaining numbers into two groups of similar size. Either answer removes about half.', 'Divide los números restantes en dos grupos de tamaño parecido. Cualquier respuesta descarta cerca de la mitad.'],
  searchHint3: ['当前可在 {cut} 处分开：{left} 个数在左，{right} 个数在右。', 'Try a cut at {cut}: {left} candidates on the left, {right} on the right.', 'Prueba un corte en {cut}: quedan {left} candidatos a la izquierda y {right} a la derecha.'],
  searchHintSolved: ['只有一个数符合全部回答。确定它靠的是留下的证据。', 'Only one number fits every answer. The remaining evidence identifies it.', 'Solo un número coincide con todas las respuestas. Esa evidencia lo identifica.'],
  searchProofTitle: ['好问题，让两种回答都有用。', 'A good question makes either answer useful.', 'Una buena pregunta aprovecha ambas respuestas.'],
  searchProof: ['64 → 32 → 16 → 8 → 4 → 2 → 1。每次平分，6 个二选一的回答就足以区分 64 个数。你的每一步都留下一个包含隐藏数的区间，直到证据只允许一个答案。', '64 → 32 → 16 → 8 → 4 → 2 → 1. With balanced cuts, six two-way answers distinguish all 64 numbers. Every step keeps an interval containing the hidden number, until the evidence permits only one answer.', '64 → 32 → 16 → 8 → 4 → 2 → 1. Al dividir a la mitad, seis respuestas de dos opciones distinguen los 64 números. Cada paso conserva un intervalo que contiene el número oculto, hasta permitir una sola respuesta.'],
  searchQuiet: ['一次排除多少，比一次猜多准更值得想。', 'How much can one question rule out?', '¿Cuánto puede descartar una pregunta?'],
  logicEyebrow: ['五件物品，五条线索', 'Five objects. Five clues.', 'Cinco objetos. Cinco pistas.'],
  logicTitle: ['让线索同时成立。', 'Make every clue fit.', 'Haz que todas las pistas encajen.'],
  logicPremise: ['一排收藏品的标签被打乱了。把贝壳、叶片、羽毛、石头和透镜放进五个位置，让所有线索同时成立。', 'The labels on a small collection got mixed up. Place the shell, leaf, feather, stone and lens in five positions so every clue holds at once.', 'Se mezclaron las etiquetas de una colección. Acomoda la concha, la hoja, la pluma, la piedra y la lente en cinco lugares para cumplir todas las pistas.'],
  logicLabel: ['同时满足的条件', 'Simultaneous constraints', 'Condiciones simultáneas'],
  logicRule: ["先选物品，再点编号位置。物品可以移动，放到已有物品的位置会交换两者。单说“在左边”指编号更小；说“紧挨”时才必须相邻。所有线索都要同时满足。", "Choose an object, then a numbered position. Objects can move; placing one onto another swaps them. Left by itself means a smaller position number; immediately left means neighboring positions. Every clue must hold at once.", "Elige un objeto y luego un lugar numerado. Puedes moverlos; colocar uno sobre otro los intercambia. A la izquierda significa un número menor; inmediatamente a la izquierda significa posiciones vecinas. Todas las pistas deben cumplirse a la vez."],
  logicCount: ['{count} / 5 条线索成立', '{count} / 5 clues hold', 'Se cumplen {count} de 5 pistas'],
  shell: ['贝壳', 'Shell', 'Concha'], leaf: ['叶片', 'Leaf', 'Hoja'], feather: ['羽毛', 'Feather', 'Pluma'], stone: ['石头', 'Stone', 'Piedra'], lens: ['透镜', 'Lens', 'Lente'],
  logicChoose: ['选一种物品', 'Choose an object', 'Elige un objeto'],
  logicItemAria: ['{item} · {state}', '{item} · {state}', '{item} · {state}'],
  selected: ['已选', 'selected', 'seleccionado'], available: ['可选', 'available', 'disponible'],
  logicPosition: ['位置 {number}', 'Position {number}', 'Lugar {number}'], logicEmpty: ['待放', 'Empty', 'Vacío'],
  logicSlotAria: ['位置 {number}：{item}。{action}', 'Position {number}: {item}. {action}', 'Lugar {number}: {item}. {action}'],
  logicPlaceAction: ['点击放入{item}', 'Place {item} here', 'Colocar {item} aquí'], logicChooseAction: ['先选择上方的一件物品', 'First choose an object above', 'Primero elige un objeto arriba'],
  logicClue1: ['贝壳紧挨在叶片左边。', 'The shell is immediately left of the leaf.', 'La concha está inmediatamente a la izquierda de la hoja.'],
  logicClue2: ['羽毛在透镜左边，不一定相邻。', 'The feather is left of the lens, not necessarily next to it.', 'La pluma está a la izquierda de la lente, aunque no necesariamente junto a ella.'],
  logicClue3: ['石头不在最左或最右的位置。', 'The stone is at neither end.', 'La piedra no está en ninguno de los extremos.'],
  logicClue4: ['羽毛和贝壳之间刚好隔着一件物品。', 'Exactly one object is between the feather and the shell.', 'Hay exactamente un objeto entre la pluma y la concha.'],
  logicClue5: ['叶片在石头左边。', 'The leaf is left of the stone.', 'La hoja está a la izquierda de la piedra.'],
  logicPending: ['· 等待相关物品', '· Waiting for objects', '· Faltan objetos'], logicFits: ['✓ 成立', '✓ Fits', '✓ Se cumple'], logicConflict: ['× 再想想', '× Conflict', '× No se cumple'],
  logicStart: ['从一条线索开始，再检查它会影响哪几条。', 'Start with one clue, then see which other clues it affects.', 'Empieza con una pista y observa qué otras pistas afecta.'],
  logicSelected: ['已选{item}。点一个位置来放置或交换。', 'Selected: {item}. Choose a position to place or swap it.', 'Elegiste: {item}. Toca un lugar para colocarlo o intercambiarlo.'],
  logicProgress: ['已放 {placed} 件，{count} 条线索成立。所有条件要一起满足。', '{placed} objects placed; {count} clues hold. All conditions must agree.', 'Colocaste {placed} objetos; se cumplen {count} pistas. Todas las condiciones deben coincidir.'],
  logicNeedItem: ['先点选一种物品，再点它要去的位置。', 'Choose an object first, then its position.', 'Primero elige un objeto y luego su lugar.'],
  logicWon: ['五条线索全部成立。这是 120 种排列中唯一符合的顺序。', 'All five clues fit. This is the only matching order among 120 arrangements.', 'Se cumplen las cinco pistas. Es el único orden que coincide entre 120 acomodos.'],
  logicHint1: ['先把贝壳与叶片看成一对。它们的前后顺序不能变，也不能分开。', 'Treat the shell and leaf as a pair. Their order is fixed, and nothing fits between them.', 'Piensa en la concha y la hoja como una pareja. Su orden es fijo y no puede haber nada entre ellas.'],
  logicHint2: ['贝壳—叶片这对可能从位置 1、2、3 或 4 开始。结合“羽毛隔一件”和“石头在内侧”，逐个排除。', 'The shell–leaf pair could start at 1, 2, 3 or 4. Test each using the feather’s one-object gap and the stone’s interior position.', 'La pareja concha–hoja puede empezar en 1, 2, 3 o 4. Prueba cada opción con la separación de la pluma y la posición interior de la piedra.'],
  logicHint3: ['叶片必须在石头左边，而石头不能在位置 5。试着让贝壳、叶片从位置 1、2 开始。', 'The leaf must precede the stone, and the stone cannot be at 5. Try starting shell, leaf in positions 1, 2.', 'La hoja debe ir antes que la piedra, y la piedra no puede estar en 5. Prueba concha y hoja en los lugares 1 y 2.'],
  logicProofTitle: ['一个局部选择，会传递到整排。', 'One local choice reshapes the whole row.', 'Una decisión cambia toda la fila.'],
  logicProof: ['贝壳—叶片若从位置 2 开始，羽毛只能在 4，透镜在 5，石头就被挤到禁用的边缘。从 3 开始会让叶片右边没有可放石头的内侧位置；从 4 开始更不行。所以贝壳、叶片在 1、2，羽毛在 3，石头在 4，透镜在 5。', 'If shell–leaf starts at 2, the feather must be at 4 and the lens at 5, forcing the stone onto an end. Starting at 3 leaves no interior position to the leaf’s right for the stone; starting at 4 also fails. So shell and leaf occupy 1, 2; feather takes 3, stone 4, and lens 5.', 'Si concha–hoja empieza en 2, la pluma va en 4 y la lente en 5, dejando la piedra en un extremo. Empezar en 3 no deja un lugar interior a la derecha de la hoja para la piedra; empezar en 4 tampoco sirve. Así, concha y hoja van en 1 y 2; pluma en 3, piedra en 4 y lente en 5.'],
  logicQuiet: ['单独看似合理，不等于放在一起也成立。', 'Clues that each seem fine can still clash.', 'Las pistas se entienden juntas.'],
  probabilityEyebrow: ['把“或者”画出来', 'Draw what “or” includes', 'Dibuja lo que incluye “o”'],
  probabilityTitle: ['机会，占了几格？', 'How much of the grid?', '¿Qué parte de la cuadrícula?'],
  probabilityPremise: ['同时掷两颗公平、独立的四面骰子，每颗标着 1、2、3、4。选出“点数和至少是 6，或者两颗相同”的全部结果，再写出准确概率。', 'Roll two fair, independent four-sided dice, each labeled 1, 2, 3, 4. Select every result where the sum is at least 6 OR the faces match, then give the exact probability.', 'Lanza dos dados justos e independientes de cuatro caras, con 1, 2, 3 y 4. Selecciona todos los resultados cuya suma sea al menos 6 O cuyas caras coincidan, y escribe la probabilidad exacta.'],
  probabilityLabel: ['等可能的样本空间', 'An equally likely sample space', 'Un espacio de resultados equiprobables'],
  probabilityRule: ["点格子来选中或取消。每格的两个数依次代表第一颗、第二颗骰子的点数，例如 (1,4) 和 (4,1) 是两个结果。16 格机会相同。“或者”允许只满足一条或同时满足两条，每格只数一次。", "Tap a cell to select or clear it. Its numbers are the first die, then the second: (1,4) and (4,1) are different outcomes. All 16 cells are equally likely. OR includes either condition or both; count each cell once.", "Toca una casilla para marcarla o quitar la marca. Sus números corresponden al primer dado y luego al segundo: (1,4) y (4,1) son resultados distintos. Las 16 casillas son igual de probables. O incluye cualquiera de las condiciones o ambas; cuenta cada casilla una vez."],
  probabilityCount: ['已选 {count} / 16 格', '{count} / 16 cells selected', '{count} de 16 casillas elegidas'],
  probabilityBoard: ['两颗四面骰子的 16 种有序结果。点击格子选择或取消。', 'The 16 ordered outcomes of two four-sided dice. Select a cell to include or remove it.', 'Los 16 resultados ordenados de dos dados de cuatro caras. Toca una casilla para incluirla o quitarla.'],
  probabilityAxes: ['从上到下：第一颗 1–4；从左到右：第二颗 1–4。', 'Top to bottom: first die 1–4. Left to right: second die 1–4.', 'De arriba abajo: primer dado, 1–4. De izquierda a derecha: segundo dado, 1–4.'],
  probabilityCell: ['第一颗 {first}，第二颗 {second}，和为 {sum} · {state}', 'First die {first}, second die {second}, sum {sum} · {state}', 'Primer dado {first}, segundo dado {second}, suma {sum} · {state}'],
  notSelected: ['未选', 'not selected', 'sin seleccionar'],
  probabilityFraction: ['这个事件的概率', 'Probability of this event', 'Probabilidad de este evento'],
  numerator: ['分子', 'Numerator', 'Numerador'], denominator: ['分母', 'Denominator', 'Denominador'],
  probabilityFractionRule: ['用整数填写分子、分母（1–999；分子可为 0）。等值分数也可以。', 'Use whole numbers from 1 to 999 (the numerator may be 0). Equivalent fractions are welcome.', 'Usa enteros del 1 al 999 (el numerador puede ser 0). También valen fracciones equivalentes.'],
  probabilityCheck: ['检查事件与概率', 'Check event & probability', 'Revisar evento y probabilidad'],
  probabilityStart: ['先圈出符合条件的格子。概率来自计数，不需要模拟掷骰子。', 'First select the cells that meet the condition. Find the probability by counting; no simulated rolls needed.', 'Primero elige las casillas que cumplen la condición. Calcula la probabilidad contando, sin simular lanzamientos.'],
  probabilityChanged: ['已选 {count} 格。检查每个有序结果，再填写概率。', '{count} cells selected. Check each ordered outcome, then write the probability.', 'Elegiste {count} casillas. Revisa cada resultado ordenado y escribe la probabilidad.'],
  probabilityInvalid: ['请填写整数分子和非零的正整数分母，最大 999。', 'Enter a whole-number numerator and a positive, nonzero denominator, each at most 999.', 'Ingresa un numerador entero y un denominador positivo distinto de cero, ambos de máximo 999.'],
  probabilityWrongCells: ["事件还没圈准确：漏了 {missing} 格，多圈了 {extra} 格。逐格检查是否符合任一条件。", "The event is not exact yet: {missing} missing cells and {extra} extra cells. Check whether each cell meets either condition.", "El evento aún no es exacto: faltan {missing} casillas y sobran {extra}. Revisa si cada casilla cumple al menos una condición."],
  probabilityWrongFraction: ['格子全部选对了。概率是符合条件的格数除以全部 16 格，再检查你的分数。', 'Every selected cell is correct. The probability is the event’s cell count divided by all 16 cells. Check your fraction.', 'Elegiste exactamente las casillas correctas. La probabilidad es su cantidad dividida entre las 16 casillas. Revisa tu fracción.'],
  probabilityWon: ['事件与分数都准确：8 / 16 = 1 / 2。两个条件同时成立的格子只数了一次。', 'Exact event, exact fraction: 8 / 16 = 1 / 2. Cells meeting both conditions were counted once.', 'Evento y fracción exactos: 8 / 16 = 1 / 2. Las casillas que cumplen ambas condiciones se contaron una sola vez.'],
  probabilityHint1: ['(2, 4) 与 (4, 2) 是不同格子。先找和为 6、7、8 的结果。', '(2, 4) and (4, 2) are different cells. First find the outcomes with sums 6, 7 and 8.', '(2, 4) y (4, 2) son casillas distintas. Primero busca los resultados con sumas de 6, 7 y 8.'],
  probabilityHint2: ['和至少 6 的结果有 6 格，相同点数有 4 格。但 (3, 3) 与 (4, 4) 在两组里都出现了。', 'There are 6 cells with sum at least 6 and 4 matching pairs. But (3, 3) and (4, 4) appear in both groups.', 'Hay 6 casillas con suma de al menos 6 y 4 pares iguales. Pero (3, 3) y (4, 4) aparecen en ambos grupos.'],
  probabilityHint3: ['合并两组时，把重复的 2 格减掉：6 + 4 − 2 = 8。全部结果有 16 格。', 'When joining the groups, subtract the 2 repeated cells: 6 + 4 − 2 = 8. There are 16 outcomes altogether.', 'Al unir los grupos, resta las 2 casillas repetidas: 6 + 4 − 2 = 8. Hay 16 resultados en total.'],
  probabilityProofTitle: ['“或者”要合并，也要去重。', '“Or” combines without double-counting.', '“O” combina sin contar dos veces.'],
  probabilityProof: ['和至少为 6 的格子有 (2,4)、(3,3)、(3,4)、(4,2)、(4,3)、(4,4)。相同点数再补进 (1,1)、(2,2)。因此有 8 个有利结果，共 16 个等可能结果，概率是 8/16 = 1/2。这是精确计数，不是一次试验的频率。', 'Sums of at least 6 give (2,4), (3,3), (3,4), (4,2), (4,3), (4,4). Matching faces add (1,1) and (2,2). That makes 8 favorable outcomes out of 16 equally likely outcomes: 8/16 = 1/2. This is exact counting, not the frequency in a trial.', 'Las sumas de al menos 6 dan (2,4), (3,3), (3,4), (4,2), (4,3) y (4,4). Las caras iguales agregan (1,1) y (2,2). Son 8 resultados favorables de 16 equiprobables: 8/16 = 1/2. Es un conteo exacto, no la frecuencia observada en un ensayo.'],
  probabilityQuiet: ['把所有可能画全，才知道机会有多大。', 'Count the whole space before measuring a chance.', 'Cuenta todas las posibilidades para medir una probabilidad.'],
};
export const EXPLORE_A_COPY = COPY;
for (const [key, values] of Object.entries(COPY)) if (key.endsWith('Nav')) registerTranslations({[key]: {'zh-CN': values[0], en: values[1], 'es-MX': values[2]}});
const $ = id => document.getElementById(id);
export function exploreAText(key, params = {}) {
  const values = COPY[key]; if (!values) throw new Error(`Missing explore-a copy: ${key}`);
  const index = document.documentElement.lang === 'es-MX' ? 2 : document.documentElement.lang === 'en' ? 1 : 0;
  return formatCountCopy(values[index], params, document.documentElement.lang).replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
const text = (id, key, params) => { $(id).textContent = exploreAText(key, params); };
const read = id => { try { return JSON.parse(localStorage.getItem(`quidence-${id}-v1`)); } catch { return null; } };
const save = (id, value) => { try { localStorage.setItem(`quidence-${id}-v1`, JSON.stringify(value)); } catch {} };
const intro = id => `<div class="intro"><p class="eyebrow"><span></span><span class="explore-a-eyebrow" data-explore-a-text="${id}Eyebrow"></span></p><h1 id="${id}-title" data-explore-a-text="${id}Title"></h1><p class="premise" data-explore-a-text="${id}Premise"></p></div>`;
const below = id => `<div class="mini-below"><button id="${id}-hint" class="hint-button" aria-expanded="false" aria-controls="${id}-hint-text"></button><p id="${id}-hint-text" class="hint-copy" hidden></p></div><div id="${id}-insight" class="discovery" hidden><h2 data-explore-a-text="${id}ProofTitle"></h2><p data-explore-a-text="${id}Proof"></p></div><p class="quiet-note" data-explore-a-text="${id}Quiet"></p>`;
const controls = id => `<div class="history-controls">${id === 'probability' ? '' : `<button type="button" id="${id}-undo" class="text-button" data-explore-a-text="undo"></button>`}<button type="button" id="${id}-reset" class="text-button" data-explore-a-text="${id === 'search' ? 'searchNew' : 'reset'}"></button></div>`;
const root = $('activity-center');
root.insertAdjacentHTML('beforeend', `
<section id="activity-search" class="activity-view explore-a-game" hidden aria-labelledby="search-title">${intro('search')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-explore-a-text="searchLabel"></span><span id="search-range" class="board-caption"></span></div><p class="rule-reminder" data-explore-a-text="searchRule"></p><div id="search-candidates" class="search-candidates" role="img"></div><form id="search-form" class="explore-a-form" novalidate><label for="search-input" data-explore-a-text="searchInput"></label><input id="search-input" type="number" inputmode="numeric" step="1" min="1" max="63" aria-describedby="search-status" autocomplete="off"><button id="search-ask" class="primary-button" type="submit" data-explore-a-text="searchAsk"></button></form><div class="status-row"><p id="search-status" role="status" aria-live="polite"></p>${controls('search')}</div></div><details class="explore-a-history"><summary data-explore-a-text="searchHistory"></summary><ol id="search-log"></ol></details>${below('search')}</section>
<section id="activity-logic" class="activity-view explore-a-game" hidden aria-labelledby="logic-title">${intro('logic')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-explore-a-text="logicLabel"></span><span id="logic-count" class="board-caption"></span></div><p class="rule-reminder" data-explore-a-text="logicRule"></p><div id="logic-items" class="logic-items" role="group" data-explore-a-aria="logicChoose"></div><div id="logic-slots" class="logic-slots"></div><ol id="logic-clues" class="logic-clues"></ol><div class="status-row"><p id="logic-status" role="status" aria-live="polite"></p>${controls('logic')}</div></div>${below('logic')}</section>
<section id="activity-probability" class="activity-view explore-a-game" hidden aria-labelledby="probability-title">${intro('probability')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-explore-a-text="probabilityLabel"></span><span id="probability-count" class="board-caption"></span></div><p class="rule-reminder" data-explore-a-text="probabilityRule"></p><p class="probability-axes" data-explore-a-text="probabilityAxes"></p><div id="probability-grid" class="probability-grid" role="group" data-explore-a-aria="probabilityBoard"></div><form id="probability-form" class="probability-form" novalidate><p class="probability-fraction-title" data-explore-a-text="probabilityFraction"></p><div class="probability-fraction"><div><label for="probability-numerator" data-explore-a-text="numerator"></label><input id="probability-numerator" type="number" inputmode="numeric" min="0" max="999" step="1" aria-describedby="probability-fraction-rule probability-status" autocomplete="off"></div><span aria-hidden="true">/</span><div><label for="probability-denominator" data-explore-a-text="denominator"></label><input id="probability-denominator" type="number" inputmode="numeric" min="1" max="999" step="1" aria-describedby="probability-fraction-rule probability-status" autocomplete="off"></div></div><p id="probability-fraction-rule" class="probability-axes" data-explore-a-text="probabilityFractionRule"></p><button id="probability-check" class="primary-button" type="submit" data-explore-a-text="probabilityCheck"></button></form><div class="status-row"><p id="probability-status" role="status" aria-live="polite"></p>${controls('probability')}</div></div>${below('probability')}</section>`);
function hint(id, level, key, params) {
  text(id + '-hint', level === 0 ? 'hint' : level < 3 ? 'nextHint' : 'lastHint');
  $(id + '-hint').setAttribute('aria-expanded', String(level > 0)); $(id + '-hint-text').hidden = !level;
  if (level) text(id + '-hint-text', key, params);
}

const freshSecret = old => { const next = 1 + Math.floor(Math.random() * (old ? 63 : 64)); return old && next >= old ? next + 1 : next; };
let search;
try { const saved = read('search'); if (!Array.isArray(saved?.cuts)) throw 0; searchState(saved.secret, saved.cuts); search = {secret: saved.secret, cuts: saved.cuts}; }
catch { search = {secret: freshSecret(), cuts: []}; }
let searchHint = 0, searchInvalid = false;
const candidateNodes = [];
for (let n = 1; n <= 64; n++) { const cell = document.createElement('span'); cell.textContent = n; cell.setAttribute('aria-hidden', 'true'); candidateNodes.push(cell); $('search-candidates').append(cell); }
// Leave the next question to the learner; requested hints can suggest a midpoint.
const setSearchInput = () => { $('search-input').value = ''; };
function renderSearch() {
  const state = searchState(search.secret, search.cuts), last = state.evidence.at(-1), midpoint = searchMidpoint(search.secret, search.cuts);
  text('search-range', 'searchRange', state); $('search-candidates').setAttribute('aria-label', exploreAText('searchBoard', state));
  candidateNodes.forEach((node, i) => { node.classList.toggle('is-ruled-out', i + 1 < state.low || i + 1 > state.high); node.classList.toggle('is-only', state.won && i + 1 === state.low); });
  $('search-input').setAttribute('min', String(state.low)); $('search-input').setAttribute('max', String(state.high - 1)); $('search-input').setAttribute('aria-invalid', String(searchInvalid));
  $('search-input').disabled = state.won; $('search-ask').disabled = state.won; $('search-undo').disabled = !search.cuts.length;
  text('search-status', searchInvalid ? 'searchInvalid' : state.won ? 'searchWon' : last ? 'searchProgress' : 'searchStart', {...state, cutMax: state.high - 1, cut: last?.cut, number: state.low, answer: exploreAText(last?.greater ? 'searchGreater' : 'searchNotGreater')});
  const list = $('search-log'); list.replaceChildren();
  for (const entry of state.evidence.length ? state.evidence : [null]) { const li = document.createElement('li'); li.textContent = entry ? exploreAText('searchRecord', {...entry, answer: exploreAText(entry.greater ? 'yes' : 'no')}) : exploreAText('searchHistoryEmpty'); list.append(li); }
  hint('search', searchHint, state.won ? 'searchHintSolved' : `searchHint${searchHint || 1}`, {cut: midpoint, left: midpoint - state.low + 1, right: state.high - midpoint});
  $('search-insight').hidden = !state.won; save('search', search); if (state.won) markCompleted('search');
  reportOutcome('search',state.won);
}
setSearchInput();
$('search-form').addEventListener('submit', event => {
  event.preventDefault(); if (searchState(search.secret, search.cuts).won) return;
  const raw = $('search-input').value.trim();
  try { if (!/^\d{1,2}$/.test(raw)) throw 0; search.cuts = searchAsk(search.secret, search.cuts, Number(raw)); searchInvalid = false; searchHint = 0; setSearchInput(); }
  catch { searchInvalid = true; }
  renderSearch();
});
$('search-undo').addEventListener('click', () => { search.cuts.pop(); searchHint = 0; searchInvalid = false; setSearchInput(); renderSearch(); });
$('search-reset').addEventListener('click', () => { search = {secret: freshSecret(search.secret), cuts: []}; searchHint = 0; searchInvalid = false; setSearchInput(); renderSearch(); });
$('search-hint').addEventListener('click', () => { searchHint = Math.min(3, searchHint + 1); renderSearch(); });

let logic;
try { const saved = read('logic'); if (!Array.isArray(saved?.moves)) throw 0; logicReplay(saved.moves); logic = {moves: saved.moves}; }
catch { logic = {moves: []}; }
let logicSelected = null, logicHint = 0, logicMessage = null;
const logicItems = [], logicSlots = [], clueNodes = [];
const symbols = {shell: '◎', leaf: '◇', feather: '〰', stone: '⬡', lens: '◉'};
for (const item of LOGIC_ITEMS) {
  const button = document.createElement('button'); button.id = 'logic-item-' + item; button.className = 'logic-item'; button.type = 'button';
  button.addEventListener('click', () => { logicSelected = logicSelected === item ? null : item; logicMessage = null; renderLogic(); });
  logicItems.push(button); $('logic-items').append(button);
}
for (let position = 0; position < 5; position++) {
  const button = document.createElement('button'); button.id = 'logic-slot-' + position; button.className = 'logic-slot'; button.type = 'button';
  button.addEventListener('click', () => {
    if (!logicSelected) { logicMessage = 'logicNeedItem'; renderLogic(); return; }
    // No-op placements do not fill Undo or storage.
    if (logicReplay(logic.moves).slots[position] !== logicSelected) {
      const move = {item: logicSelected, position}; logicReplay([...logic.moves, move]); logic.moves.push(move);
    }
    logicSelected = null; logicMessage = null; logicHint = 0; renderLogic();
  });
  logicSlots.push(button); $('logic-slots').append(button);
  const clue = document.createElement('li'), wording = document.createElement('span'), status = document.createElement('span');
  wording.id = 'logic-clue-' + position; status.id = 'logic-clue-state-' + position; status.className = 'logic-clue-state'; clue.append(wording, status); clueNodes.push(clue); $('logic-clues').append(clue);
}
function renderLogic() {
  const state = logicReplay(logic.moves);
  logicItems.forEach((button, i) => {
    const item = LOGIC_ITEMS[i]; button.textContent = `${symbols[item]} ${exploreAText(item)}`; button.setAttribute('aria-pressed', String(logicSelected === item));
    button.setAttribute('aria-label', exploreAText('logicItemAria', {item: exploreAText(item), state: exploreAText(logicSelected === item ? 'selected' : 'available')}));
  });
  logicSlots.forEach((button, i) => {
    const item = state.slots[i]; button.replaceChildren();
    const number = document.createElement('span'); number.className = 'logic-slot-number'; number.textContent = exploreAText('logicPosition', {number: i + 1});
    const name = document.createElement('span'); name.className = 'logic-slot-name'; name.textContent = item ? `${symbols[item]} ${exploreAText(item)}` : exploreAText('logicEmpty'); button.append(number, name);
    button.classList.toggle('is-filled', Boolean(item));
    button.setAttribute('aria-label', exploreAText('logicSlotAria', {number: i + 1, item: exploreAText(item || 'logicEmpty'), action: logicSelected ? exploreAText('logicPlaceAction', {item: exploreAText(logicSelected)}) : exploreAText('logicChooseAction')}));
    text('logic-clue-' + i, 'logicClue' + (i + 1)); text('logic-clue-state-' + i, state.clues[i] === null ? 'logicPending' : state.clues[i] ? 'logicFits' : 'logicConflict'); clueNodes[i].classList.toggle('is-fit', state.clues[i] === true);
  });
  text('logic-count', 'logicCount', {count: state.satisfied});
  text('logic-status', logicMessage || (state.won ? 'logicWon' : logicSelected ? 'logicSelected' : state.placed ? 'logicProgress' : 'logicStart'), {item: logicSelected ? exploreAText(logicSelected) : '', placed: state.placed, count: state.satisfied});
  $('logic-undo').disabled = !logic.moves.length; $('logic-reset').disabled = !logic.moves.length && !logicSelected;
  hint('logic', logicHint, `logicHint${logicHint || 1}`); $('logic-insight').hidden = !state.won;
  save('logic', logic); if (state.won) markCompleted('logic');
  reportOutcome('logic',state.won);
}
$('logic-undo').addEventListener('click', () => { logic.moves.pop(); logicSelected = null; logicMessage = null; logicHint = 0; renderLogic(); });
$('logic-reset').addEventListener('click', () => { logic = {moves: []}; logicSelected = null; logicMessage = null; logicHint = 0; renderLogic(); });
$('logic-hint').addEventListener('click', () => { logicHint = Math.min(3, logicHint + 1); renderLogic(); });

let probability;
try {
  const saved = read('probability'); probabilityState(saved.selected);
  if (![saved.numerator, saved.denominator].every(value => typeof value === 'string' && value.length <= 24) || typeof saved.checked !== 'boolean') throw 0;
  probability = {selected: saved.selected, numerator: saved.numerator, denominator: saved.denominator, checked: saved.checked};
} catch { probability = {selected: [], numerator: '', denominator: '', checked: false}; }
const fractionValue = raw => /^\d{1,3}$/.test(raw.trim()) ? Number(raw.trim()) : null;
let probabilityHint = 0;
const probabilityCells = [];
for (const cell of PROBABILITY_CELLS) {
  const button = document.createElement('button'); button.id = 'probability-cell-' + cell.id; button.className = 'probability-cell'; button.type = 'button'; button.textContent = `${cell.first}, ${cell.second}`;
  button.addEventListener('click', () => { probability.selected = probabilityToggle(probability.selected, cell.id); probability.checked = false; renderProbability(); });
  probabilityCells.push(button); $('probability-grid').append(button);
}
$('probability-numerator').value = probability.numerator; $('probability-denominator').value = probability.denominator;
function renderProbability() {
  const state = probabilityCheck(probability.selected, fractionValue(probability.numerator), fractionValue(probability.denominator));
  probabilityCells.forEach((button, i) => { const cell = PROBABILITY_CELLS[i], chosen = probability.selected.includes(i); button.setAttribute('aria-pressed', String(chosen)); button.setAttribute('aria-label', exploreAText('probabilityCell', {...cell, sum: cell.first + cell.second, state: exploreAText(chosen ? 'selected' : 'notSelected')})); });
  text('probability-count', 'probabilityCount', state);
  let key = probability.selected.length || probability.numerator || probability.denominator ? 'probabilityChanged' : 'probabilityStart';
  if (probability.checked) key = !state.validFraction ? 'probabilityInvalid' : !state.exact ? 'probabilityWrongCells' : !state.fractionCorrect ? 'probabilityWrongFraction' : 'probabilityWon';
  text('probability-status', key, {...state, missing: state.missing.length, extra: state.extra.length});
  for (const id of ['probability-numerator', 'probability-denominator']) $(id).setAttribute('aria-invalid', String(probability.checked && !state.validFraction));
  $('probability-insight').hidden = !(probability.checked && state.won);
  $('probability-reset').disabled = !probability.selected.length && !probability.numerator && !probability.denominator && !probability.checked;
  hint('probability', probabilityHint, `probabilityHint${probabilityHint || 1}`);
  save('probability', probability); if (probability.checked && state.won) markCompleted('probability');
  reportOutcome('probability',probability.checked && state.won);
}
for (const part of ['numerator', 'denominator']) $('probability-' + part).addEventListener('input', () => { probability[part] = $('probability-' + part).value.slice(0, 24); probability.checked = false; renderProbability(); });
$('probability-form').addEventListener('submit', event => { event.preventDefault(); probability.numerator = $('probability-numerator').value.slice(0, 24); probability.denominator = $('probability-denominator').value.slice(0, 24); probability.checked = true; renderProbability(); });
$('probability-reset').addEventListener('click', () => { probability = {selected: [], numerator: '', denominator: '', checked: false}; $('probability-numerator').value = ''; $('probability-denominator').value = ''; probabilityHint = 0; renderProbability(); });
$('probability-hint').addEventListener('click', () => { probabilityHint = Math.min(3, probabilityHint + 1); renderProbability(); });

function renderLanguage() {
  root.querySelectorAll('[data-explore-a-text]').forEach(element => { element.textContent = exploreAText(element.dataset.exploreAText); });
  root.querySelectorAll('[data-explore-a-aria]').forEach(element => { element.setAttribute('aria-label', exploreAText(element.dataset.exploreAAria)); });
  renderSearch(); renderLogic(); renderProbability();
}
translateDOM(); window.addEventListener('languagechange', renderLanguage); renderLanguage();
window.dispatchEvent(new Event('activitiesready'));
