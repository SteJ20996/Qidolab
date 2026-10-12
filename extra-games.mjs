import {registerTranslations, translateDOM, formatCountCopy} from './i18n.mjs';
import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import {BRIDGE_TIMES, BRIDGE_LIMIT, bridgeState, bridgeCross, bridgeSolution, TAKEAWAY_START, takeawayState, takeawayMove, PATH_NODES, PATH_EDGES, pathState, pathMove, pathSolution} from './extra-engine.mjs';

// Original UI copy. Attempts contain only moves, so switching languages preserves them.
export const EXTRA_COPY = {
  bridgeNav: ['过桥', 'Cross the bridge', 'Cruza el puente'],
  takeawayNav: ['取石子', 'Take the last', 'La última ficha'],
  pathNav: ['一笔走完', 'One stroke', 'Un solo trazo'],
  undo: ['↶ 撤回', '↶ Undo', '↶ Deshacer'], undoTurn: ['↶ 撤回一轮', '↶ Undo turn', '↶ Deshacer turno'],
  reset: ['重来', 'Start over', 'Reiniciar'], hint: ['✧ 给我一点灵感', '✧ A little hint', '✧ Una pista'],
  nextHint: ['再给一点提示 →', 'One more hint →', 'Otra pista →'], lastHint: ['✧ 再看这条提示', '✧ Read this hint again', '✧ Volver a ver la pista'],
  history: ['我的尝试', 'My experiments', 'Mis intentos'], historyCount: ['{count} 步', '{count} moves', '{count} movimientos'],
  emptyHistory: ['还没有尝试。每一步都可以撤回。', 'No moves yet. You can undo every step.', 'Aún no hay movimientos. Puedes deshacer cada paso.'],
  recentHistory: ['这里只显示最近 30 步。', 'Only the latest 30 moves are shown here.', 'Aquí se muestran los últimos 30 movimientos.'],
  bridgeEyebrow: ['四个人，一盏灯', 'Four travelers. One lamp.', 'Cuatro personas. Una lámpara.'],
  bridgeTitle: ['17 分钟，够吗？', 'Is 17 minutes enough?', '¿Alcanzan 17 minutos?'],
  bridgePremise: ["四个人和一盏灯都在出发岸。四人单独过桥分别需 1、2、5、10 分钟。每次最多两人同行，必须带灯。让四个人在总计不超过 17 分钟内全部到达对岸。", "Four people and one lamp start on the same bank. Alone, they take 1, 2, 5 and 10 minutes to cross. At most two may travel together, always carrying the lamp. Get everyone to the far bank within 17 minutes total.", "Cuatro personas y una lámpara empiezan en la misma orilla. Solas tardan 1, 2, 5 y 10 minutos en cruzar. Pueden viajar hasta dos juntas, siempre con la lámpara. Lleva a todas a la otra orilla en un total de 17 minutos o menos."],
  bridgeLabel: ['过桥实验', 'Bridge experiment', 'Experimento del puente'],
  bridgeRule: ["先点灯所在这一岸的一人或两人，再点过桥或返回。两人同行时，用较慢者的时间；返回带灯也计入总时间。灯不能自行回到另一岸。", "Choose one or two people on the lamp’s bank, then cross or return. A pair takes the slower person’s time; bringing the lamp back also counts toward the total. The lamp cannot return on its own.", "Elige una o dos personas de la orilla donde está la lámpara y cruza o regresa. Una pareja tarda lo que la persona más lenta; devolver la lámpara también cuenta en el total. La lámpara no puede volver sola."],
  bridgeLeft: ['出发岸', 'Starting bank', 'Orilla de salida'], bridgeRight: ['对岸', 'Far bank', 'Otra orilla'],
  bridgeLamp: ['灯在这里', 'Lamp is here', 'Aquí está la lámpara'],
  bridgeMinutes: ['{time} 分', '{time} min', '{time} min'], bridgeElapsed: ['已用 {time} / 17 分钟', '{time} / 17 minutes used', '{time} / 17 minutos usados'],
  bridgePerson: ['{time} 分钟的人 · {bank} · {state}', '{time}-minute traveler · {bank} · {state}', 'Persona de {time} minutos · {bank} · {state}'],
  bridgeChosen: ['已选', 'selected', 'seleccionada'], bridgeAvailable: ['可选择', 'available', 'disponible'], bridgeWaiting: ['等待灯返回', 'waiting for the lamp', 'esperando la lámpara'],
  bridgeCross: ['过桥 →', 'Cross →', 'Cruzar →'], bridgeReturn: ['← 带灯返回', '← Bring the lamp back', '← Regresar con la lámpara'],
  bridgeStart: ['灯在出发岸。选好同行的人，再出发。', 'The lamp starts on the left. Choose who travels together.', 'La lámpara está en la orilla de salida. Elige quiénes cruzan.'],
  bridgeSelected: ['已选 {people} 分钟的人。这次需要 {time} 分钟。', 'Selected crossing times: {people} min. This trip takes {time} minutes.', 'Tiempos de cruce elegidos: {people} min. Este viaje tarda {time} minutos.'],
  bridgeProgress: ['已用 {time} 分钟 · 还有 {remaining} 人未到对岸。', '{time} minutes used · {remaining} people still on the starting bank.', '{time} minutos usados · Quedan {remaining} personas en la orilla de salida.'],
  bridgeWon: ['到了！四个人和灯都在对岸，刚好用了 {time} 分钟。', 'Across! All four people and the lamp made it in {time} minutes.', '¡Cruzaron! Las cuatro personas y la lámpara llegaron en {time} minutos.'],
  bridgeOver: ['全员过桥，用了 {time} 分钟。超过 17 分钟了，撤回几步再试试。', 'Everyone crossed in {time} minutes. That is over 17; undo a few trips and try again.', 'Todas cruzaron en {time} minutos. Son más de 17; deshaz algunos viajes y prueba de nuevo.'],
  bridgeFull: ['一次最多同行两人。再点一位已选的人，可以取消选择。', 'At most two people can travel. Select a chosen person again to make room.', 'Pueden cruzar como máximo dos personas. Toca a alguien seleccionado para quitarlo.'],
  bridgeHint1: ['来回送灯也要花时间。怎样减少两位走得慢的人的总用时？', 'Bringing the lamp back takes time. How could the two slower travelers share a trip?', 'Regresar la lámpara también lleva tiempo. ¿Cómo podrían compartir un viaje las dos personas más lentas?'],
  bridgeHint2: ['让 5 和 10 一起过桥，只需 10 分钟。两位走得快的人，可以怎样配合送灯？', 'The 5- and 10-minute travelers can cross together in 10 minutes. How can the two faster people move the lamp?', 'Las personas de 5 y 10 minutos pueden cruzar juntas en 10. ¿Cómo pueden las más rápidas llevar y traer la lámpara?'],
  bridgeHintMove: ['下一步可让 {people} 分钟的人{direction}。从这里完成，最少共需 {total} 分钟。', 'Next, choose crossing times {people} min and {direction}. The best finish from here totals {total} minutes.', 'Ahora elige tiempos de cruce de {people} min para {direction}. El menor tiempo total desde aquí es {total} minutos.'],
  bridgeHintBlocked: ['按照当前走法，即使后面都最省时，也共需 {total} 分钟。撤回一步，重新分配同行的人。', 'Even the best remaining plan totals {total} minutes. Undo a trip and try another pairing.', 'Incluso el mejor plan restante suma {total} minutos. Deshaz un viaje y prueba otra pareja.'],
  bridgeHintSolved: ['两位慢者同行，两位快者送灯。把每次的时间相加，会得到 17。', 'The slower pair shares a crossing; the faster pair handles the lamp. The trip times add up to 17.', 'Las más lentas cruzan juntas; las más rápidas llevan la lámpara. Los tiempos suman 17.'],
  bridgeForwardWord: ['过桥', 'cross', 'cruzar'], bridgeBackWord: ['返回', 'return', 'regresar'],
  bridgeRecord: ['{people} 分钟的人{direction} · +{time} 分 → 累计 {total} 分', '{people} min · {direction} · +{time} min → {total} min total', '{people} min · {direction} · +{time} min → {total} min en total'],
  bridgeProofTitle: ['快的人，不一定要一路陪同。', 'The quickest need not escort everyone.', 'La persona más rápida no tiene que acompañar a todas.'],
  bridgeProof: ['一种走法是：1 和 2 过桥，1 返回；5 和 10 过桥，2 返回；1 和 2 再过桥。2 + 1 + 10 + 2 + 2 = 17。把慢者的时间合并，往往比一直派最快的人陪同更省时。', 'One plan is: 1 and 2 cross; 1 returns; 5 and 10 cross; 2 returns; 1 and 2 cross again. That is 2 + 1 + 10 + 2 + 2 = 17. Sharing the slowest crossing saves more than using the fastest person as every escort.', 'Un plan: cruzan 1 y 2; regresa 1; cruzan 5 y 10; regresa 2; vuelven a cruzar 1 y 2. Son 2 + 1 + 10 + 2 + 2 = 17. Compartir el cruce más lento ahorra más que usar siempre a la persona más rápida como acompañante.'],
  bridgeQuiet: ['有时，配合比单独的速度更重要。', 'Sometimes the pairing matters more than the pace.', 'A veces importa más la pareja que la velocidad.'],
  takeawayEyebrow: ['最后一颗，留给谁？', 'Who takes the last one?', '¿Quién se lleva la última?'],
  takeawayTitle: ['21 颗里的规律。', 'A pattern in 21.', 'Un patrón entre 21.'],
  takeawayPremise: ["桌上有 21 颗石子，你先拿。你和电脑轮流每次拿走 1、2 或 3 颗，不能超过剩下的数量。谁拿到最后一颗，谁就赢。", "There are 21 tokens, and you go first. You and the computer take turns removing 1, 2 or 3, without taking more than remain. Whoever takes the last token wins.", "Hay 21 fichas y tú empiezas. Tú y la computadora se turnan para tomar 1, 2 o 3, sin tomar más de las que quedan. Quien toma la última gana."],
  takeawayLabel: ['取石子实验', 'Takeaway experiment', 'Experimento de las fichas'],
  takeawayRule: ['电脑会采用最优策略。撤回一轮，会一起撤回你的操作和电脑的回应。', 'The computer plays optimally. Undo takes back your move and the computer’s reply together.', 'La computadora usa una estrategia óptima. Deshacer revierte tu movimiento y la respuesta de la computadora.'],
  takeawayRemaining: ['还剩 {count} 颗', '{count} tokens left', 'Quedan {count} fichas'],
  takeawayPile: ['21 个位置，还剩 {count} 颗石子。', '21 spaces; {count} tokens remain.', '21 lugares; quedan {count} fichas.'],
  takeawayTake: ['拿走 {count} 颗', 'Take {count}', 'Tomar {count}'],
  takeawayStart: ['21 颗，你先来。第一步拿多少？', '21 tokens. You go first. How many will you take?', 'Hay 21 fichas. Tú empiezas. ¿Cuántas vas a tomar?'],
  takeawayProgress: ['你拿了 {human} 颗，电脑拿了 {computer} 颗。还剩 {remaining} 颗，轮到你。', 'You took {human}; the computer took {computer}. {remaining} remain. Your turn.', 'Tomaste {human}; la computadora tomó {computer}. Quedan {remaining}. Es tu turno.'],
  takeawayWon: ['最后一颗是你的！你找到了让电脑一直接招的办法。', 'The last one is yours! You kept the computer answering your moves.', '¡La última es tuya! Lograste mantener a la computadora respondiendo a tus movimientos.'],
  takeawayLost: ['电脑拿走了最后一颗。撤回一轮，或从 21 颗重新寻找规律。', 'The computer took the last token. Undo a turn, or start again from 21.', 'La computadora tomó la última ficha. Deshaz un turno o vuelve a empezar con 21.'],
  takeawayHint1: ['如果你留给电脑 4 颗，它无论拿几颗，你下一步都能拿完。', 'Leave the computer 4 tokens. Whatever it takes, you can take the rest.', 'Si le dejas 4 fichas a la computadora, puedes tomar las que queden después de su turno.'],
  takeawayHint2: ['4、8、12、16、20……每次回应，让电脑和你这两次拿走的数量合计为 4。', '4, 8, 12, 16, 20… Reply so the computer’s move and yours add up to 4.', '4, 8, 12, 16, 20… Responde para que lo que tome la computadora y lo que tomes tú sumen 4.'],
  takeawayHintMove: ['现在拿 {count} 颗，留下 {remaining} 颗。此后让每组回应合计为 4。', 'Take {count} now, leaving {remaining}. Then keep each pair of replies adding up to 4.', 'Toma {count} ahora y deja {remaining}. Después haz que cada par de respuestas sume 4.'],
  takeawayHintBlocked: ['轮到你时，数量已是 4 的倍数。只要对手不失误，你就无法保证获胜；撤回，看看在哪一步让出了优势。', 'It is your turn at a multiple of 4. A perfect opponent can now win. Undo and look for where the advantage changed hands.', 'Te toca con un múltiplo de 4. Un rival que juegue perfectamente puede ganar. Deshaz y busca dónde perdiste la ventaja.'],
  takeawayHintLost: ['电脑已经拿走最后一颗。先撤回一轮，再看看怎样给它留下 4 的倍数。', 'The computer took the last token. Undo a turn, then look for a way to leave it a multiple of 4.', 'La computadora tomó la última ficha. Deshaz un turno y busca cómo dejarle un múltiplo de 4.'],
  takeawayHintSolved: ['第一步拿 1，留下 20。之后每次和电脑合计拿 4，最后一颗就会是你的。', 'Take 1 first, leaving 20. Then complete pairs totaling 4, and the last token is yours.', 'Primero toma 1 y deja 20. Después completa pares que sumen 4 y la última ficha será tuya.'],
  takeawayHuman: ['你', 'You took', 'Tomaste'], takeawayComputer: ['电脑', 'The computer took', 'La computadora tomó'],
  takeawayRecord: ['{player}拿走 {count} 颗 → 剩 {remaining} 颗', '{player} {count} → {remaining} left', '{player} {count} → quedan {remaining}'],
  takeawayProofTitle: ['把主动权藏在 4 的倍数里。', 'Keep handing over a multiple of 4.', 'Deja siempre un múltiplo de 4.'],
  takeawayProof: ['0 颗时，轮到的人已经输了。从 4 的倍数出发，无论拿 1、2 还是 3，对手都能补足到 4，重新留下一个 4 的倍数。所以先从 21 拿走 1，再对电脑的每次操作补足到 4，就能拿走最后一颗。', 'With 0 tokens, the player whose turn would be next has lost. From a multiple of 4, taking 1, 2 or 3 lets the opponent complete a group of 4. So take 1 from 21 first, then answer each computer move by completing 4. You will take the last token.', 'Con 0 fichas, quien tendría el siguiente turno ya perdió. Desde un múltiplo de 4, tomar 1, 2 o 3 permite al rival completar un grupo de 4. Por eso, toma 1 de las 21 y después responde completando 4 en cada par de turnos. Así tomarás la última.'],
  takeawayQuiet: ['看见最后一步，也许就能决定第一步。', 'Looking at the last move can reveal the first.', 'Mirar el último paso puede revelar el primero.'],
  pathEyebrow: ['每条箭头，只走一次', 'Every arrow. Exactly once.', 'Cada flecha. Una sola vez.'],
  pathTitle: ['一笔，走遍所有线。', 'One unbroken path.', 'Un camino sin pausas.'],
  pathPremise: ["从一个点出发，沿箭头依次走到下一个点。目标是连续走完全部 7 条箭头，每条恰好走一次；同一个点可以经过多次。", "Start at a point and follow an arrow to each next point. Walk all 7 arrows in one continuous route, using each exactly once. You may visit a point more than once.", "Empieza en un punto y sigue una flecha hacia el siguiente. Recorre las 7 flechas en una sola ruta continua, usando cada una exactamente una vez. Puedes pasar por un punto varias veces."],
  pathLabel: ['一笔画实验', 'One-stroke experiment', 'Experimento de un solo trazo'],
  pathRule: ['线有方向，点可以多次经过。亮线表示已走过；下一步只能沿未用过的箭头。', 'Edges have a direction; you may revisit points. Bright lines are used. Your next move must follow an unused arrow.', 'Las líneas tienen dirección; puedes volver a pasar por un punto. Las líneas claras ya se usaron. Sigue una flecha que aún no hayas recorrido.'],
  pathCount: ['已走 {count} / 7 条线', '{count} / 7 edges used', '{count} / 7 líneas recorridas'],
  pathBoard: ['有向图：A 到 B、B 到 C、C 到 A、A 到 D、D 到 C、C 到 E、E 到 D。点击字母按钮行走。', 'Directed graph: A to B, B to C, C to A, A to D, D to C, C to E, E to D. Use the letter buttons to travel.', 'Grafo dirigido: A a B, B a C, C a A, A a D, D a C, C a E, E a D. Usa los botones con letras para avanzar.'],
  pathNode: ['点 {node} · {state}', 'Point {node} · {state}', 'Punto {node} · {state}'],
  pathChooseStart: ['可选为起点', 'choose as your start', 'elige como inicio'], pathCurrent: ['当前位置', 'current position', 'posición actual'],
  pathAvailable: ['可以到达', 'available next', 'disponible para avanzar'], pathUnavailable: ['这一步无法到达', 'not available on this move', 'no disponible en este paso'],
  pathStart: ['从哪里出发？先观察每个点进出的箭头。', 'Where will you start? Look at the arrows going in and out.', '¿Dónde empezarás? Observa las flechas que entran y salen.'],
  pathProgress: ['现在在 {node} · 已走 {count} 条线。下一步可到：{options}。', 'At {node} · {count} edges used. Next: {options}.', 'Estás en {node} · Llevas {count} líneas. Puedes ir a: {options}.'],
  pathStuck: ['停在 {node}，还有 {remaining} 条线没走。撤回几步，或换一个起点。', 'Stopped at {node}, with {remaining} edges left. Undo a few moves, or try another start.', 'Te detuviste en {node} y faltan {remaining} líneas. Deshaz algunos pasos o prueba otro inicio.'],
  pathInvalid: ['要沿当前点出发的未用箭头行走。不能倒走，也不能跳到别的点。', 'Follow an unused arrow out of your current point. You cannot go backward or jump to another point.', 'Sigue una flecha sin usar que salga de tu punto actual. No puedes retroceder ni saltar a otro punto.'],
  pathWon: ['一笔走完！7 条线各一次，从 {start} 走到了 {end}。', 'One stroke! All 7 edges once, from {start} to {end}.', '¡Un solo trazo! Las 7 líneas una vez, de {start} a {end}.'],
  pathHint1: ['中途经过一个点，通常是“一次进，一次出”。起点和终点有什么不同？', 'At a point in the middle, each arrival needs a departure. What differs at the start and the end?', 'En un punto intermedio, cada entrada necesita una salida. ¿Qué cambia al inicio y al final?'],
  pathHint2: ['A 有两条出箭头、一条进箭头；D 刚好相反。其他点进出一样多。', 'A has two outgoing arrows and one incoming. D has the reverse. The other points have equal counts.', 'A tiene dos flechas de salida y una de entrada. D tiene lo contrario. Los demás puntos tienen cantidades iguales.'],
  pathHintMove: ['下一步可以选 {node}。这样走，还能完成剩下的所有线。', 'Choose {node} next. This leaves a way to finish every remaining edge.', 'Elige {node} ahora. Así aún puedes terminar todas las líneas restantes.'],
  pathHintBlocked: ['当前路线无法走完全部线。撤回，保留通往未走部分的入口；必要时重新从 A 出发。', 'This route cannot finish all the edges. Undo and keep a way into the unused part; if needed, restart at A.', 'Esta ruta ya no permite recorrer todas las líneas. Deshaz y conserva una entrada a la parte sin usar; si hace falta, vuelve a empezar en A.'],
  pathHintSolved: ['你的路线从 A 出发、在 D 结束。看看它们的进出箭头为何相差一条。', 'Your route starts at A and ends at D. Notice why their incoming and outgoing counts differ by one.', 'Tu ruta empieza en A y termina en D. Observa por qué sus entradas y salidas difieren en una.'],
  pathRecordStart: ['从 {node} 出发', 'Started at {node}', 'Empezaste en {node}'], pathRecord: ['{from} → {to}', '{from} → {to}', '{from} → {to}'],
  pathProofTitle: ['起点，多一个出口；终点，多一个入口。', 'One extra way out. One extra way in.', 'Una salida extra. Una entrada extra.'],
  pathProof: ['这张有向图里，A 的出箭头比进箭头多一条，D 的进箭头比出箭头多一条，其他点进出相等。所以若要一笔走完，必须从 A 出发，在 D 结束。你刚走出的完整路线，也证明了这张图确实可以做到。', 'In this directed graph, A has one more outgoing than incoming edge; D has one more incoming than outgoing edge. All other points balance. Any complete one-stroke trail must therefore start at A and finish at D. Your full route also proves that this graph has such a trail.', 'En este grafo, A tiene una salida más que entradas; D tiene una entrada más que salidas. Los otros puntos están equilibrados. Por eso, un recorrido completo debe empezar en A y terminar en D. Tu ruta completa también demuestra que este grafo permite ese recorrido.'],
  pathQuiet: ['开始之前，先看看哪里能结束。', 'Before starting, look for the ending.', 'Antes de empezar, busca dónde terminar.'],
};
for (const key of ['bridgeNav', 'takeawayNav', 'pathNav']) registerTranslations({[key]: {'zh-CN': EXTRA_COPY[key][0], en: EXTRA_COPY[key][1], 'es-MX': EXTRA_COPY[key][2]}});
const $ = id => document.getElementById(id);
const languageIndex = () => document.documentElement.lang === 'es-MX' ? 2 : document.documentElement.lang === 'en' ? 1 : 0;
export function extraText(key, params = {}) {
  if (!EXTRA_COPY[key]) throw new Error(`Missing UI copy: ${key}`);
  return formatCountCopy(EXTRA_COPY[key][languageIndex()], params, document.documentElement.lang).replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const copy = (id, key, params) => { $(id).textContent = extraText(key, params); };
function restore(id, validate) {
  const value = read(`quidence-${id}-v1`);
  try { if (!value || !Array.isArray(value.moves) || value.moves.length > 10000) throw 0; validate(value.moves); return {moves: value.moves}; }
  catch { return {moves: []}; }
}
const intro = id => `<div class="intro"><p class="eyebrow"><span></span><span class="extra-eyebrow-copy" data-extra-text="${id}Eyebrow"></span></p><h1 id="${id}-title" data-extra-text="${id}Title"></h1><p class="premise" data-extra-text="${id}Premise"></p></div>`;
const controls = id => `<div class="history-controls"><button id="${id}-undo" class="text-button" data-extra-text="${id === 'takeaway' ? 'undoTurn' : 'undo'}"></button><button id="${id}-reset" class="text-button" data-extra-text="reset"></button></div>`;
const below = id => `<div class="mini-below"><button id="${id}-hint" class="hint-button" aria-expanded="false" aria-controls="${id}-hint-text"></button><p id="${id}-hint-text" class="hint-copy" hidden></p></div><div id="${id}-insight" class="discovery" hidden><h2 data-extra-text="${id}ProofTitle"></h2><p data-extra-text="${id}Proof"></p></div><details class="extra-history"><summary><span data-extra-text="history"></span> <span id="${id}-count"></span></summary><ol id="${id}-log"></ol><p id="${id}-recent" data-extra-text="recentHistory" hidden></p></details><p class="quiet-note" data-extra-text="${id}Quiet"></p>`;
const root = $('activity-center');
root.insertAdjacentHTML('beforeend', `
<section id="activity-bridge" class="activity-view extra-game" hidden aria-labelledby="bridge-title">
${intro('bridge')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-extra-text="bridgeLabel"></span><span id="bridge-elapsed" class="board-caption"></span></div><p class="rule-reminder" data-extra-text="bridgeRule"></p>
<div class="bridge-scene"><div class="bridge-bank bridge-bank-left"><div class="bridge-bank-heading"><span data-extra-text="bridgeLeft"></span><span id="bridge-lamp-left" class="bridge-lamp" data-extra-text="bridgeLamp"></span></div><div id="bridge-people-left" class="bridge-people"></div></div>
<svg class="bridge-art" viewBox="0 0 72 180" aria-hidden="true" focusable="false"><path class="bridge-water" d="M9 13 Q36 1 62 17 M7 42 Q37 30 65 47 M9 136 Q40 120 66 137 M6 164 Q35 149 66 166"/><path class="bridge-rope" d="M0 72 Q36 86 72 72 M0 101 Q36 113 72 101"/><path class="bridge-planks" d="M5 75 V103 M17 79 V106 M29 81 V109 M41 81 V109 M53 79 V106 M65 75 V103"/></svg>
<div class="bridge-bank bridge-bank-right"><div class="bridge-bank-heading"><span data-extra-text="bridgeRight"></span><span id="bridge-lamp-right" class="bridge-lamp" data-extra-text="bridgeLamp"></span></div><div id="bridge-people-right" class="bridge-people"></div></div></div>
<div class="extra-action-row"><button id="bridge-cross" class="primary-button"></button></div><div class="status-row"><p id="bridge-status" role="status" aria-live="polite"></p>${controls('bridge')}</div></div>${below('bridge')}</section>
<section id="activity-takeaway" class="activity-view extra-game" hidden aria-labelledby="takeaway-title">
${intro('takeaway')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-extra-text="takeawayLabel"></span><span id="takeaway-remaining" class="board-caption"></span></div><p class="rule-reminder" data-extra-text="takeawayRule"></p>
<div id="takeaway-pile" class="takeaway-pile" role="img"></div><div id="takeaway-actions" class="extra-action-row"></div><div class="status-row"><p id="takeaway-status" role="status" aria-live="polite"></p>${controls('takeaway')}</div></div>${below('takeaway')}</section>
<section id="activity-path" class="activity-view extra-game" hidden aria-labelledby="path-title">
${intro('path')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-extra-text="pathLabel"></span><span id="path-count-edges" class="board-caption"></span></div><p class="rule-reminder" data-extra-text="pathRule"></p>
<div id="path-board" class="path-board" role="group" data-extra-aria="pathBoard"><svg class="path-graph" viewBox="0 0 500 340" aria-hidden="true" focusable="false"><defs><marker id="path-arrow-unused" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#9bb5a6"/></marker><marker id="path-arrow-used" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#e8d39b"/></marker></defs><g id="path-lines"></g></svg></div>
<div class="status-row"><p id="path-status" role="status" aria-live="polite"></p>${controls('path')}</div></div>${below('path')}</section>`);
function log(id, entries, count = entries.length) {
  const list = $(id + '-log'); list.replaceChildren(); list.setAttribute('start', String(Math.max(1, entries.length - 29)));
  for (const text of entries.length ? entries.slice(-30) : [extraText('emptyHistory')]) { const li = document.createElement('li'); li.textContent = text; list.append(li); }
  copy(id + '-count', 'historyCount', {count}); $(id + '-recent').hidden = entries.length <= 30;
}
function hint(id, level, key, params) {
  copy(id + '-hint', level === 0 ? 'hint' : level < 3 ? 'nextHint' : 'lastHint');
  $(id + '-hint').setAttribute('aria-expanded', String(level > 0)); $(id + '-hint-text').hidden = !level;
  if (level) copy(id + '-hint-text', key, params);
}

let bridge = restore('bridge', bridgeState), bridgeSelected = [], bridgeHint = 0, bridgeMessage = null;
const bridgePeople = [];
for (let person = 0; person < 4; person++) {
  const button = document.createElement('button'); button.id = 'bridge-person-' + person; button.className = 'bridge-person'; button.dataset.person = String(person);
  button.addEventListener('click', () => {
    bridgeMessage = null;
    if (bridgeSelected.includes(person)) bridgeSelected = bridgeSelected.filter(value => value !== person);
    else if (bridgeSelected.length < 2) bridgeSelected.push(person);
    else bridgeMessage = 'bridgeFull';
    renderBridge();
  });
  bridgePeople.push(button); $('bridge-people-left').append(button);
}
function renderBridge() {
  const state = bridgeState(bridge.moves), remaining = 4 - BRIDGE_TIMES.filter((_, i) => state.mask & (1 << i)).length;
  bridgePeople.forEach((button, person) => {
    const side = Number(Boolean(state.mask & (1 << person))), selected = bridgeSelected.includes(person), bank = $('bridge-people-' + (side ? 'right' : 'left'));
    if (button.parentElement !== bank) bank.append(button);
    button.disabled = state.finished || side !== state.lamp;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', extraText('bridgePerson', {time: BRIDGE_TIMES[person], bank: extraText(side ? 'bridgeRight' : 'bridgeLeft'), state: extraText(selected ? 'bridgeChosen' : side === state.lamp ? 'bridgeAvailable' : 'bridgeWaiting')}));
    button.textContent = extraText('bridgeMinutes', {time: BRIDGE_TIMES[person]});
  });
  $('bridge-lamp-left').hidden = state.lamp !== 0; $('bridge-lamp-right').hidden = state.lamp !== 1;
  copy('bridge-elapsed', 'bridgeElapsed', {time: state.total}); copy('bridge-cross', state.lamp ? 'bridgeReturn' : 'bridgeCross');
  $('bridge-cross').disabled = !bridgeSelected.length || state.finished;
  const people = bridgeSelected.map(person => BRIDGE_TIMES[person]).join(' + '), trip = bridgeSelected.length ? Math.max(...bridgeSelected.map(person => BRIDGE_TIMES[person])) : 0;
  copy('bridge-status', bridgeMessage || (state.won ? 'bridgeWon' : state.finished ? 'bridgeOver' : bridgeSelected.length ? 'bridgeSelected' : bridge.moves.length ? 'bridgeProgress' : 'bridgeStart'), {time: bridgeSelected.length ? trip : state.total, people, remaining});
  $('bridge-undo').disabled = !bridge.moves.length; $('bridge-reset').disabled = !bridge.moves.length && !bridgeSelected.length;
  $('bridge-insight').hidden = !state.won;
  const plan = bridgeSolution(bridge.moves), total = state.total + (plan?.minutes ?? 0), next = plan?.moves[0];
  hint('bridge', bridgeHint, bridgeHint === 1 ? 'bridgeHint1' : bridgeHint === 2 ? 'bridgeHint2' : state.won ? 'bridgeHintSolved' : total > BRIDGE_LIMIT || !next ? 'bridgeHintBlocked' : 'bridgeHintMove', {total, people: next?.map(person => BRIDGE_TIMES[person]).join(' + ') ?? '', direction: extraText(state.lamp ? 'bridgeBackWord' : 'bridgeForwardWord')});
  let sum = 0;
  log('bridge', bridge.moves.map((people, i) => { const time = Math.max(...people.map(person => BRIDGE_TIMES[person])); sum += time; return extraText('bridgeRecord', {people: people.map(person => BRIDGE_TIMES[person]).join(' + '), direction: extraText(i % 2 ? 'bridgeBackWord' : 'bridgeForwardWord'), time, total: sum}); }));
  save('quidence-bridge-v1', bridge); if (state.won) markCompleted('bridge');
  reportOutcome('bridge',state.won);
}
$('bridge-cross').addEventListener('click', () => { bridge.moves = bridgeCross(bridge.moves, bridgeSelected); bridgeSelected = []; bridgeHint = 0; bridgeMessage = null; renderBridge(); });
$('bridge-undo').addEventListener('click', () => { bridge.moves.pop(); bridgeSelected = []; bridgeHint = 0; bridgeMessage = null; renderBridge(); });
$('bridge-reset').addEventListener('click', () => { bridge.moves = []; bridgeSelected = []; bridgeHint = 0; bridgeMessage = null; renderBridge(); });
$('bridge-hint').addEventListener('click', () => { bridgeHint = Math.min(3, bridgeHint + 1); renderBridge(); });

let takeaway = restore('takeaway', takeawayState), takeawayHint = 0;
const tokens = [], takeButtons = [];
for (let i = 0; i < TAKEAWAY_START; i++) { const token = document.createElement('span'); token.className = 'takeaway-token'; token.setAttribute('aria-hidden', 'true'); tokens.push(token); $('takeaway-pile').append(token); }
for (let count = 1; count <= 3; count++) {
  const button = document.createElement('button'); button.id = 'takeaway-take-' + count; button.className = 'primary-button';
  button.addEventListener('click', () => { takeaway.moves = takeawayMove(takeaway.moves, count); takeawayHint = 0; renderTakeaway(); });
  takeButtons.push(button); $('takeaway-actions').append(button);
}
function renderTakeaway() {
  const state = takeawayState(takeaway.moves), human = state.turns.filter(turn => turn.player === 'human').at(-1), computer = state.turns.filter(turn => turn.player === 'computer').at(-1);
  tokens.forEach((token, i) => token.classList.toggle('is-taken', i >= state.remaining));
  $('takeaway-pile').setAttribute('aria-label', extraText('takeawayPile', {count: state.remaining})); copy('takeaway-remaining', 'takeawayRemaining', {count: state.remaining});
  takeButtons.forEach((button, i) => { button.textContent = extraText('takeawayTake', {count: i + 1}); button.disabled = Boolean(state.winner) || i + 1 > state.remaining; });
  copy('takeaway-status', state.winner === 'human' ? 'takeawayWon' : state.winner === 'computer' ? 'takeawayLost' : state.turns.length ? 'takeawayProgress' : 'takeawayStart', {human: human?.count, computer: computer?.count, remaining: state.remaining});
  $('takeaway-undo').disabled = !takeaway.moves.length; $('takeaway-reset').disabled = !takeaway.moves.length;
  $('takeaway-insight').hidden = state.winner !== 'human';
  const count = state.remaining % 4;
  hint('takeaway', takeawayHint, takeawayHint === 1 ? 'takeawayHint1' : takeawayHint === 2 ? 'takeawayHint2' : state.winner === 'human' ? 'takeawayHintSolved' : state.winner === 'computer' ? 'takeawayHintLost' : !count ? 'takeawayHintBlocked' : 'takeawayHintMove', {count, remaining: state.remaining - count});
  log('takeaway', state.turns.map(turn => extraText('takeawayRecord', {player: extraText(turn.player === 'human' ? 'takeawayHuman' : 'takeawayComputer'), count: turn.count, remaining: turn.remaining})));
  save('quidence-takeaway-v1', takeaway); if (state.winner === 'human') markCompleted('takeaway');
  reportOutcome('takeaway',state.winner === 'human');
}
$('takeaway-undo').addEventListener('click', () => { takeaway.moves.pop(); takeawayHint = 0; renderTakeaway(); });
$('takeaway-reset').addEventListener('click', () => { takeaway.moves = []; takeawayHint = 0; renderTakeaway(); });
$('takeaway-hint').addEventListener('click', () => { takeawayHint = Math.min(3, takeawayHint + 1); renderTakeaway(); });

let path = restore('path', pathState), pathHint = 0, pathMessage = null;
// SVG lines are original geometry; native overlaid buttons provide keyboard/touch access.
PATH_EDGES.forEach(([from, to], edge) => {
  const a = PATH_NODES.find(node => node.id === from), b = PATH_NODES.find(node => node.id === to), distance = Math.hypot(b.x - a.x, b.y - a.y), dx = (b.x - a.x) / distance * 48, dy = (b.y - a.y) / distance * 48;
  $('path-lines').insertAdjacentHTML('beforeend', `<path id="path-edge-${edge}" d="M${a.x + dx} ${a.y + dy} L${b.x - dx} ${b.y - dy}" class="path-edge" marker-end="url(#path-arrow-unused)"/>`);
});
const pathButtons = [];
for (const node of PATH_NODES) {
  const button = document.createElement('button'); button.id = 'path-node-' + node.id; button.className = 'path-node'; button.textContent = node.id;
  button.style.setProperty('left', `${node.x / 5}%`); button.style.setProperty('top', `${node.y / 3.4}%`);
  button.addEventListener('click', () => {
    try { path.moves = pathMove(path.moves, node.id); pathMessage = null; pathHint = 0; }
    catch { pathMessage = 'pathInvalid'; }
    renderPath();
  });
  pathButtons.push(button); $('path-board').append(button);
}
function renderPath() {
  const state = pathState(path.moves);
  PATH_EDGES.forEach((_, edge) => { const used = state.edges.includes(edge); $('path-edge-' + edge).classList.toggle('is-used', used); $('path-edge-' + edge).setAttribute('marker-end', `url(#path-arrow-${used ? 'used' : 'unused'})`); });
  pathButtons.forEach((button, i) => {
    const node = PATH_NODES[i].id, available = state.current === null || state.options.includes(node);
    button.disabled = state.won; button.classList.toggle('is-available', available); button.setAttribute('aria-pressed', String(state.current === node));
    button.setAttribute('aria-label', extraText('pathNode', {node, state: extraText(state.current === node ? 'pathCurrent' : state.current === null ? 'pathChooseStart' : available ? 'pathAvailable' : 'pathUnavailable')}));
  });
  copy('path-count-edges', 'pathCount', {count: state.edges.length});
  copy('path-status', pathMessage || (state.won ? 'pathWon' : state.stuck ? 'pathStuck' : state.current === null ? 'pathStart' : 'pathProgress'), {node: state.current, count: state.edges.length, remaining: PATH_EDGES.length - state.edges.length, options: state.options.join(languageIndex() === 0 ? '、' : ', '), start: path.moves[0], end: state.current});
  $('path-undo').disabled = !path.moves.length; $('path-reset').disabled = !path.moves.length; $('path-insight').hidden = !state.won;
  const next = pathSolution(path.moves);
  hint('path', pathHint, pathHint === 1 ? 'pathHint1' : pathHint === 2 ? 'pathHint2' : state.won ? 'pathHintSolved' : next === null ? 'pathHintBlocked' : 'pathHintMove', {node: next?.[0] ?? ''});
  log('path', path.moves.map((node, i) => i ? extraText('pathRecord', {from: path.moves[i - 1], to: node}) : extraText('pathRecordStart', {node})), state.edges.length);
  save('quidence-path-v1', path); if (state.won) markCompleted('path');
  reportOutcome('path',state.won);
}
$('path-undo').addEventListener('click', () => { path.moves.pop(); pathHint = 0; pathMessage = null; renderPath(); });
$('path-reset').addEventListener('click', () => { path.moves = []; pathHint = 0; pathMessage = null; renderPath(); });
$('path-hint').addEventListener('click', () => { pathHint = Math.min(3, pathHint + 1); renderPath(); });
function renderLanguage() {
  root.querySelectorAll('[data-extra-text]').forEach(element => { element.textContent = extraText(element.dataset.extraText); });
  root.querySelectorAll('[data-extra-aria]').forEach(element => { element.setAttribute('aria-label', extraText(element.dataset.extraAria)); });
  renderBridge(); renderTakeaway(); renderPath();
}
translateDOM();
window.addEventListener('languagechange', renderLanguage); renderLanguage();
window.dispatchEvent(new Event('activitiesready'));
