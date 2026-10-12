import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import {formatCountCopy} from './i18n.mjs';
import {CLOCK_STEPS, clockMove, clockPosition, clockSolution, TILE_MODES, tileColor, adjacentCells, placeDomino, tileCounts, tilingSolution, TRIANGLE_INITIAL, TRIANGLE_TARGETS, triangleSums, swapTriangle, triangleSolution} from './more-engine.mjs';

// Original, complete UI copy. Keys are stable; saved progress never stores translated text.
export const MORE_COPY = {
  undo: ['↶ 撤回', '↶ Undo', '↶ Deshacer'], reset: ['重来', 'Start over', 'Reiniciar'],
  hint: ['✧ 给我一点灵感', '✧ A little hint', '✧ Una pista'], nextHint: ['再给一点提示 →', 'One more hint →', 'Otra pista →'], lastHint: ['✧ 再看这条提示', '✧ Read this hint again', '✧ Volver a ver la pista'],
  history: ['我的尝试', 'My experiments', 'Mis intentos'], historyCount: ['{count} 步', '{count} moves', '{count} movimientos'],
  emptyHistory: ['还没有尝试。每一步都可以撤回。', 'No moves yet. You can undo every step.', 'Aún no hay movimientos. Puedes deshacer cada paso.'],
  recentHistory: ['这里只显示最近 30 步。', 'Only the latest 30 moves are shown here.', 'Aquí se muestran los últimos 30 movimientos.'],
  clockEyebrow: ['绕一圈，能到每个地方吗？', 'A circle with a few surprises', 'Una vuelta, muchas preguntas'],
  clockTitle: ['绕着走，能到吗？', 'Can you get there?', '¿Puedes llegar?'],
  clockPremise: ["圆环有 12 格，编号 0–11。从 0 出发，每次只能顺时针走 4 格或 6 格。选一个目标，试着走到它；如果到不了，想想每一步都保留了什么规律。", "The ring has 12 spaces, numbered 0–11. Start at 0 and move clockwise by exactly 4 or 6 spaces each time. Choose a target and try to reach it; if you cannot, look for a rule every move preserves.", "El círculo tiene 12 lugares, numerados del 0 al 11. Empieza en 0 y avanza exactamente 4 o 6 lugares en sentido horario cada vez. Elige una meta e intenta llegar; si no puedes, busca una regla que se mantenga en cada salto."],
  clockLabel: ['绕圈实验', 'Clock experiment', 'Experimento del reloj'], clockCaption: ['12 格 · 两种步长', '12 spaces · two moves', '12 lugares · dos saltos'],
  clockRule: ["点“+4”或“+6”走一步。经过 11 后，继续从 0 数起；例如 10 再走 4 格会到 2。换一个目标会清空这次路线，从 0 重新出发。", "Tap +4 or +6 for a move. After 11, keep counting from 0: for example, moving 4 spaces from 10 reaches 2. Choosing another target clears this route and starts at 0.", "Toca +4 o +6 para avanzar. Después del 11, sigue contando desde 0: por ejemplo, avanzar 4 lugares desde 10 llega a 2. Cambiar de meta borra esta ruta y te lleva al 0."],
  clockTargets: ['选择目标', 'Choose a target', 'Elige una meta'], clockTarget: ['目标 {target}', 'Target {target}', 'Meta {target}'],
  clockCurrent: ['当前位置', 'You are here', 'Estás aquí'], clockFace: ['12 格圆环，当前位置 {position}，目标 {target}。', '12-space clock. Current position {position}; target {target}.', 'Reloj de 12 lugares. Posición actual: {position}; meta: {target}.'],
  clockAdd: ['顺时针 +{step}', 'Clockwise +{step}', 'Avanza +{step}'],
  clockImpossible: ['我认为到不了', 'I think it is impossible', 'Creo que es imposible'],
  clockStart: ['目标是 {target}。先走一步，再看看回到哪里。', 'The target is {target}. Try a move and see where you land.', 'La meta es {target}. Da un salto y observa dónde caes.'],
  clockProgress: ['来到 {position} · 已走 {count} 步。目标仍是 {target}。', 'At {position} after {count} moves. Your target is {target}.', 'Estás en {position} tras {count} movimientos. Tu meta es {target}.'],
  clockWon: ['到了！{count} 步，恰好停在 {target}。', 'You made it! Exactly {target}, in {count} moves.', '¡Llegaste! Exactamente a {target}, en {count} movimientos.'],
  clockWrongProof: ["这个目标能到，但只看奇偶性还不够。试着实际走出一条到达目标的路径。", "This target is reachable, but parity alone is not a construction. Try building a path that reaches it.", "Sí se puede llegar a esta meta, pero la paridad por sí sola no construye un camino. Intenta trazar uno que llegue."],
  clockProved: ['你的判断对了：从偶数出发，只加偶数，永远到不了 {target}。', 'Exactly: starting even and adding only even numbers can never reach {target}.', 'Exacto: al empezar en un número par y sumar solo pares, nunca llegarás a {target}.'],
  clockProofTitle: ['看见了“每一步都不变”的东西。', 'Something stays the same.', 'Hay algo que nunca cambia.'],
  clockProof: ['4、6 和 12 的最大公约数是 2。从 0 出发，位置始终是偶数；绕回一圈也不会改变奇偶性。所以所有奇数目标都不可能。六个偶数位置都能到，例如 4 + 4 + 6 = 14，绕一圈后就是 2。', 'The greatest common divisor of 4, 6 and 12 is 2. Starting at 0, every position stays even; wrapping around changes nothing. Odd targets are impossible. All six even positions are reachable: for example, 4 + 4 + 6 = 14 wraps around to 2.', 'El máximo común divisor de 4, 6 y 12 es 2. Al empezar en 0, siempre caes en un número par, incluso después de dar la vuelta. Las metas impares son imposibles. Sí puedes llegar a los seis pares: por ejemplo, 4 + 4 + 6 = 14 termina en 2.'],
  clockHint1: ['看一看：你经过的位置，是奇数还是偶数？', 'Look at the positions you have visited. Are they odd or even?', 'Observa los lugares que has visitado. ¿Son pares o impares?'],
  clockHint2: ['4 和 6 都是偶数。绕回一圈，相当于减去 12；这也不会改变奇偶性。', 'Both 4 and 6 are even. Wrapping around subtracts 12, which also preserves parity.', '4 y 6 son pares. Dar la vuelta equivale a restar 12, así que tampoco cambia la paridad.'],
  clockHintOdd: ['目标 {target} 是奇数。你能用“偶数加偶数仍是偶数”说明为什么到不了吗？', 'Target {target} is odd. Can “even plus even is even” explain why it is unreachable?', 'La meta {target} es impar. ¿Puedes explicar por qué no se puede llegar usando “par más par da par”?'],
  clockHintMove: ['从当前位置，可以先走 +{step}。之后再观察。', 'From here, try +{step} next. Then look again.', 'Desde aquí, prueba +{step}. Luego vuelve a observar.'],
  clockHintSolved: ['已经到达了。换成奇数目标，还会一样吗？', 'You have arrived. Would an odd target behave the same way?', 'Ya llegaste. ¿Pasaría lo mismo con una meta impar?'],
  clockRecord: ['{from} → +{step} → {to}', '{from} → +{step} → {to}', '{from} → +{step} → {to}'],
  clockQuiet: ['有时候，“到不了”也是一个有力的发现。', 'Sometimes “impossible” is the discovery.', 'A veces, descubrir que es imposible es la respuesta.'],
  tilesEyebrow: ['铺满之前，先看看颜色', 'Before you cover it, look closer', 'Antes de cubrirlo, observa los colores'],
  tilesTitle: ['少了两格，还能铺满？', 'Two squares missing.', 'Faltan dos cuadros.'],
  tilesPremise: ["4 × 4 棋盘去掉了两格。用 7 块骨牌盖住剩下的全部 14 格：每块占上下或左右相邻的两格，不能斜放、重叠或盖到缺口上。", "Two squares are missing from a 4 × 4 board. Cover all 14 remaining squares with 7 dominoes. Each covers two squares next to each other vertically or horizontally; no diagonals, overlaps or missing squares.", "Faltan dos cuadros de un tablero de 4 × 4. Cubre los 14 restantes con 7 fichas. Cada ficha ocupa dos cuadros vecinos vertical u horizontalmente: sin diagonales, superposiciones ni huecos cubiertos."],
  tilesLabel: ['铺砖实验', 'Domino experiment', 'Experimento del dominó'],
  tilesModes: ['选择挖空方式', 'Choose the missing squares', 'Elige los cuadros que faltan'],
  tilesCorners: ['对角少两格', 'Opposite corners', 'Esquinas opuestas'], tilesAdjacent: ['相邻少两格', 'Adjacent squares', 'Cuadros vecinos'],
  tilesRule: ['点两个共边的空格，放一块骨牌。点已放的骨牌可取下。切换棋盘会清空当前尝试。', 'Select two empty squares sharing an edge. Select a placed domino to remove it. Changing boards clears your placements.', 'Elige dos cuadros vacíos que compartan un lado. Toca una ficha colocada para quitarla. Cambiar de tablero borra las fichas.'],
  tilesBoard: ['4 行 4 列棋盘，每格都是一个按钮', 'A 4 by 4 board; each square is a button', 'Tablero de 4 por 4; cada cuadro es un botón'],
  tilesDark: ['深色', 'dark', 'oscuro'], tilesLight: ['浅色', 'light', 'claro'],
  tilesRemoved: ['已挖空', 'removed', 'retirado'], tilesFree: ['空格', 'empty', 'vacío'], tilesOccupied: ['骨牌 {number}，点击取下', 'domino {number}; select to remove', 'ficha {number}; toca para quitarla'],
  tilesCell: ['第 {row} 行第 {column} 列，{color}，{state}', 'Row {row}, column {column}, {color}, {state}', 'Fila {row}, columna {column}, {color}, {state}'],
  tilesCounts: ['未覆盖：深色 {dark} 格 · 浅色 {light} 格', 'Uncovered: {dark} dark · {light} light', 'Sin cubrir: {dark} oscuros · {light} claros'],
  tilesImpossible: ['我认为铺不满', 'I think it cannot be tiled', 'Creo que no se puede cubrir'],
  tilesStart: ['先选一个空格，再选与它共边的另一个空格。', 'Choose an empty square, then an empty neighbor sharing an edge.', 'Elige un cuadro vacío y después otro que comparta un lado.'],
  tilesSelected: ['已选第 {row} 行第 {column} 列。再点一个共边的空格，或再点一次取消。', 'Selected row {row}, column {column}. Choose an empty neighbor, or select it again to cancel.', 'Elegiste la fila {row}, columna {column}. Elige un vecino vacío o vuelve a tocar el mismo cuadro para cancelar.'],
  tilesNotAdjacent: ['这两格没有共边。保留第一格，再选一个上下左右相邻的空格。', 'These squares do not share an edge. Keep the first square and choose an empty neighbor above, below, left or right.', 'Estos cuadros no comparten un lado. Conserva el primero y elige uno vacío arriba, abajo, a la izquierda o a la derecha.'],
  tilesProgress: ['已放 {count} 块，还剩 {remaining} 格。也可以点骨牌取下。', '{count} dominoes placed; {remaining} squares left. Select any domino to remove it.', 'Hay {count} fichas colocadas; faltan {remaining} cuadros. Toca una ficha para quitarla.'],
  tilesWon: ['铺满了！7 块骨牌，刚好覆盖 14 格。', 'A perfect fit! 7 dominoes cover all 14 squares.', '¡Encaja perfecto! Las 7 fichas cubren los 14 cuadros.'],
  tilesProved: ['对角的两个洞同色。原本剩下 6 格深色、8 格浅色，不可能用骨牌铺满。', 'The missing corners have the same color. After removing the corners, 6 dark and 8 light squares remain, so a tiling is impossible.', 'Las esquinas que faltan son del mismo color. Al inicio quedan 6 cuadros oscuros y 8 claros: es imposible cubrirlos con fichas.'],
  tilesWrongProof: ["这一块棋盘能铺满。颜色数量相等只是必要条件；试着一行一行铺满，给出实际摆法。", "This board can be tiled. Equal color counts are necessary, but a complete arrangement proves it. Try working row by row.", "Este tablero sí se puede cubrir. Tener la misma cantidad de cada color es necesario, pero una colocación completa lo demuestra. Prueba por filas."],
  tilesProofTitle: ['每块骨牌，带走一对颜色。', 'Each domino takes a pair.', 'Cada ficha ocupa un par de colores.'],
  tilesProof: ['每一对共边的格子，都是一深一浅。因此每块骨牌一定盖住一格深色和一格浅色。对角挖空后，颜色数量不相等，所以一定铺不满。颜色数量相等只是必要条件；相邻挖空的棋盘，能否铺满还要靠实际摆法来证明。', 'Every pair of edge-adjacent squares has one dark and one light square. Every domino therefore covers one of each. Removing same-colored corners leaves unequal counts, proving impossibility. Equal counts alone do not guarantee a tiling; an actual arrangement proves the adjacent-square board works.', 'Dos cuadros que comparten un lado siempre tienen colores distintos. Por eso cada ficha cubre un cuadro oscuro y uno claro. Quitar esquinas del mismo color deja cantidades desiguales y demuestra que es imposible. Tener cantidades iguales no basta: una colocación completa demuestra que el tablero con huecos vecinos sí funciona.'],
  tilesHint1: ['一块骨牌占的两格，会是什么颜色？', 'What colors are the two squares under a domino?', '¿De qué colores son los dos cuadros debajo de una ficha?'],
  tilesHint2: ['每放一块，就同时少一格深色和一格浅色。看看没铺的两种颜色数量。', 'Each domino removes one dark and one light square. Compare the uncovered counts.', 'Cada ficha cubre un cuadro oscuro y uno claro. Compara cuántos quedan de cada color.'],
  tilesHintImpossible: ['两个对角洞都在深色上。原本剩下的 6 格深色和 8 格浅色，能一一配对吗？', 'Both missing corners are dark. Can the remaining 6 dark squares pair up with the 8 light ones?', 'Los dos huecos de las esquinas son oscuros. ¿Puedes emparejar los 6 cuadros oscuros y los 8 claros que había al inicio?'],
  tilesHintMove: ['可试第 {row1} 行第 {column1} 列，与第 {row2} 行第 {column2} 列。这个摆法能接着铺满。', 'Try row {row1}, column {column1} with row {row2}, column {column2}. This move leaves a completable board.', 'Prueba la fila {row1}, columna {column1}, con la fila {row2}, columna {column2}. Después de este paso aún se puede completar el tablero.'],
  tilesHintBlocked: ['当前摆法已经留不出完整铺法。撤回或取下一块骨牌，再看看提示。', 'This arrangement cannot be completed. Undo or remove a domino, then check the hint again.', 'Esta colocación ya no se puede completar. Deshaz un paso o quita una ficha y vuelve a consultar la pista.'],
  tilesHintSolved: ['已经铺满。换成对角挖空，再看看哪里不同。', 'All covered. Try the opposite-corner board and see what changes.', 'Ya cubriste todo. Prueba el tablero con esquinas opuestas y observa qué cambia.'],
  tilesPlaced: ['放置：({r1}, {c1}) 与 ({r2}, {c2})', 'Placed: ({r1}, {c1}) and ({r2}, {c2})', 'Colocada: ({r1}, {c1}) y ({r2}, {c2})'],
  tilesTaken: ['取下：({r1}, {c1}) 与 ({r2}, {c2})', 'Removed: ({r1}, {c1}) and ({r2}, {c2})', 'Retirada: ({r1}, {c1}) y ({r2}, {c2})'],
  tilesQuiet: ['不是每个棋盘，都需要铺到最后才知道答案。', 'Some boards reveal the answer before the last tile.', 'A veces el tablero revela la respuesta antes de la última ficha.'],
  sumsEyebrow: ['同样的数字，换个位置', 'Same numbers, different places', 'Los mismos números, en otro lugar'],
  sumsTitle: ['三条边，一样多。', 'Three sides. One total.', 'Tres lados. Una suma.'],
  sumsPremise: ['把 1 到 6 各用一次，让每条边上三个数的和，都等于你选的目标。', 'Use each number from 1 to 6 once. Make the three numbers on each side add up to your chosen target.', 'Usa una vez cada número del 1 al 6. Haz que los tres números de cada lado sumen la meta elegida.'],
  sumsLabel: ['三角求和', 'Triangle experiment', 'Experimento del triángulo'],
  sumsRule: ['先点一个数，再点另一个数，交换位置。切换目标会保留当前排列。', 'Select one number, then another, to swap them. Changing the target keeps your arrangement.', 'Elige un número y después otro para intercambiarlos. Cambiar la meta conserva tu colocación.'],
  sumsTargets: ['选择每条边的目标和', 'Choose the total for each side', 'Elige la suma de cada lado'], sumsTarget: ['每边 {target}', '{target} per side', '{target} por lado'],
  sumsBoard: ['三角形上的六个数，选择两个进行交换', 'Six numbers on a triangle; select two to swap', 'Seis números en un triángulo; elige dos para intercambiarlos'],
  slotTop: ['顶角', 'top corner', 'la esquina superior'], slotLeftMid: ['左边中点', 'left midpoint', 'el punto medio izquierdo'], slotRightMid: ['右边中点', 'right midpoint', 'el punto medio derecho'], slotLeft: ['左下角', 'bottom-left corner', 'la esquina inferior izquierda'], slotBase: ['底边中点', 'base midpoint', 'el punto medio de la base'], slotRight: ['右下角', 'bottom-right corner', 'la esquina inferior derecha'],
  sumsSlot: ['{slot}：{value}，点击选择交换', '{slot}: {value}; select to swap', '{slot}: {value}; toca para intercambiar'],
  sumsLeft: ['左边', 'Left side', 'Lado izquierdo'], sumsRight: ['右边', 'Right side', 'Lado derecho'], sumsBase: ['底边', 'Base', 'Base'],
  sumsSideAria: ['{side}：{terms} = {sum}，目标 {target}', '{side}: {terms} = {sum}; target {target}', '{side}: {terms} = {sum}; meta {target}'],
  sumsStart: ['目标：每条边都是 {target}。从交换两个数字开始。', 'Aim for {target} on every side. Start by swapping two numbers.', 'La meta es {target} en cada lado. Empieza intercambiando dos números.'],
  sumsSelected: ['已选 {value}（{slot}）。再点另一个数进行交换，或再点一次取消。', 'Selected {value} at the {slot}. Choose another number to swap, or select it again to cancel.', 'Elegiste el {value} en {slot}. Elige otro número para intercambiarlo o toca el mismo para cancelar.'],
  sumsProgress: ['已交换 {count} 次。当前三边：{left}、{right}、{base}；目标都是 {target}。', '{count} swaps. Side totals: {left}, {right}, {base}; aim for {target} on all three.', '{count} intercambios. Las sumas son {left}, {right}, {base}; busca {target} en los tres lados.'],
  sumsWon: ['三条边都是 {target}！你找到了一个排列。还可以换个目标。', 'All three sides total {target}! You found an arrangement. Try another target.', '¡Los tres lados suman {target}! Encontraste una colocación. Puedes probar otra meta.'],
  sumsProofTitle: ['角上的数字，被算了两遍。', 'The corners count twice.', 'Las esquinas cuentan dos veces.'],
  sumsProof: ['1 到 6 的总和是 21。把三条边相加时，中点算一次，三个角各算两次。所以“3 × 每边的和 = 21 + 三个角的和”。当前每边要等于 {target}，三个角就需要合计 {corners}。这只是必要条件；还要让每条边都达到目标。', 'The numbers 1 through 6 total 21. Adding all three sides counts midpoints once and corners twice. So 3 × side total = 21 + corner total. For a side total of {target}, the three corners must total {corners}. This is necessary, but each side must still be checked.', 'Los números del 1 al 6 suman 21. Al sumar los tres lados, los puntos medios cuentan una vez y las esquinas dos. Así, 3 × suma por lado = 21 + suma de las esquinas. Para tener {target} por lado, las tres esquinas deben sumar {corners}. Esto es necesario, pero todavía hay que revisar cada lado.'],
  sumsRange: ['三个角最少是 1 + 2 + 3 = 6，最多是 4 + 5 + 6 = 15，所以相等的边和只能在 9 到 12 之间。这四个整数目标，每一个都有可行排列。', 'The three corners total at least 1 + 2 + 3 = 6 and at most 4 + 5 + 6 = 15. Thus an equal integer side total must be between 9 and 12. Each of these four targets has a solution.', 'Las tres esquinas suman como mínimo 1 + 2 + 3 = 6 y como máximo 4 + 5 + 6 = 15. Por eso, la suma común de cada lado solo puede ser un entero de 9 a 12. Las cuatro metas tienen solución.'],
  sumsHint1: ['三个角上的数字，各自属于几条边？边中点呢？', 'How many sides share each corner? What about a midpoint?', '¿En cuántos lados aparece cada esquina? ¿Y cada punto medio?'],
  sumsHint2: ["三个边和的总数是 3 × {target}。减去 21，三个角需要合计 {corners}。这是必要条件，还要检查每条边是否达到目标。", "All three side totals add to 3 × {target}. Subtract 21: the corners must total {corners}. This is necessary; you still need to check each side.", "Los tres lados suman 3 × {target}. Resta 21: las esquinas deben sumar {corners}. Esto es necesario; todavía debes revisar cada lado."],
  sumsHintMove: ['可以先交换 {a}（{slotA}）和 {b}（{slotB}），再看看三条边。', 'Try swapping {a} at the {slotA} with {b} at the {slotB}, then compare the sides.', 'Prueba a intercambiar {a} en {slotA} con {b} en {slotB}; luego compara los lados.'],
  sumsHintSolved: ['已经找到啦。试着用“三个角被算了两次”解释这个排列。', 'You have it. Can you explain it using the twice-counted corners?', 'Ya lo lograste. ¿Puedes explicarlo usando las esquinas que cuentan dos veces?'],
  sumsRecord: ['交换 {a} 与 {b} → 三边 {left}、{right}、{base}', 'Swap {a} and {b} → totals {left}, {right}, {base}', 'Intercambia {a} y {b} → sumas {left}, {right}, {base}'],
  sumsQuiet: ['先试一试，再把偶然的成功变成能解释的规律。', 'Experiment first. Then find the reason it works.', 'Primero prueba. Después descubre por qué funciona.'],
};
const $ = id => document.getElementById(id);
const languageIndex = () => document.documentElement.lang === 'es-MX' ? 2 : document.documentElement.lang === 'en' ? 1 : 0;
export const moreText = (key, params = {}) => {
  if (!MORE_COPY[key]) throw new Error(`Missing UI copy: ${key}`);
  return formatCountCopy(MORE_COPY[key][languageIndex()], params, document.documentElement.lang).replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
};
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const copy = (id, key, params) => { $(id).textContent = moreText(key, params); };
const historyMarkup = prefix => `<details class="more-history"><summary><span data-more-text="history"></span> <span id="${prefix}-count"></span></summary><ol id="${prefix}-log"></ol><p id="${prefix}-recent" data-more-text="recentHistory" hidden></p></details>`;
const belowMarkup = prefix => `<div class="mini-below"><button id="${prefix}-hint" class="hint-button" data-more-text="hint" aria-expanded="false" aria-controls="${prefix}-hint-text"></button><p id="${prefix}-hint-text" class="hint-copy" hidden></p></div>`;
const controlsMarkup = prefix => `<div class="history-controls"><button id="${prefix}-undo" class="text-button" data-more-text="undo"></button><button id="${prefix}-reset" class="text-button" data-more-text="reset"></button></div>`;
const introMarkup = (prefix, eyebrow, title, premise) => `<div class="intro"><p class="eyebrow"><span></span><span class="more-eyebrow-copy" data-more-text="${eyebrow}"></span></p><h1 id="${prefix}-title" data-more-text="${title}"></h1><p class="premise" data-more-text="${premise}"></p></div>`;
const root = $('activity-center');
root.insertAdjacentHTML('beforeend', `
<section id="activity-clock" class="activity-view more-game" hidden aria-labelledby="clock-title">
${introMarkup('clock', 'clockEyebrow', 'clockTitle', 'clockPremise')}
<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-more-text="clockLabel"></span><span class="board-caption" data-more-text="clockCaption"></span></div>
<p class="rule-reminder" data-more-text="clockRule"></p><div id="clock-targets" class="more-options" role="group" data-more-aria="clockTargets"></div>
<div class="clock-layout"><div id="clock-face" class="clock-face" role="img"><div class="clock-guide" aria-hidden="true"></div><div id="clock-needle" class="clock-needle" aria-hidden="true"></div><div class="clock-center" aria-hidden="true"><strong id="clock-position">0</strong><span data-more-text="clockCurrent"></span></div><div id="clock-points" aria-hidden="true"></div></div>
<div class="clock-actions"><button id="clock-add-4" class="primary-button"></button><button id="clock-add-6" class="primary-button"></button><button id="clock-impossible" class="text-button more-proof-button" data-more-text="clockImpossible"></button></div></div>
<div class="status-row"><p id="clock-status" role="status" aria-live="polite"></p>${controlsMarkup('clock')}</div></div>
${belowMarkup('clock')}<p id="clock-completion-guide" class="quiet-note"></p><div id="clock-insight" class="discovery" hidden><h2 data-more-text="clockProofTitle"></h2><p data-more-text="clockProof"></p></div>${historyMarkup('clock')}<p class="quiet-note" data-more-text="clockQuiet"></p></section>
<section id="activity-tiles" class="activity-view more-game" hidden aria-labelledby="tiles-title">
${introMarkup('tiles', 'tilesEyebrow', 'tilesTitle', 'tilesPremise')}
<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-more-text="tilesLabel"></span><span id="tiles-counts" class="board-caption"></span></div>
<div id="tiles-modes" class="more-options" role="group" data-more-aria="tilesModes"><button id="tiles-corners" data-more-text="tilesCorners"></button><button id="tiles-adjacent" data-more-text="tilesAdjacent"></button></div><p class="rule-reminder" data-more-text="tilesRule"></p>
<div id="tiles-board" class="tiles-board" role="group" data-more-aria="tilesBoard"></div><div class="more-proof-row"><button id="tiles-impossible" class="text-button more-proof-button" data-more-text="tilesImpossible"></button></div>
<div class="status-row"><p id="tiles-status" role="status" aria-live="polite"></p>${controlsMarkup('tiles')}</div></div>
${belowMarkup('tiles')}<p id="tiles-completion-guide" class="quiet-note"></p><div id="tiles-insight" class="discovery" hidden><h2 data-more-text="tilesProofTitle"></h2><p data-more-text="tilesProof"></p></div>${historyMarkup('tiles')}<p class="quiet-note" data-more-text="tilesQuiet"></p></section>
<section id="activity-sums" class="activity-view more-game" hidden aria-labelledby="sums-title">
${introMarkup('sums', 'sumsEyebrow', 'sumsTitle', 'sumsPremise')}
<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-more-text="sumsLabel"></span></div><p class="rule-reminder" data-more-text="sumsRule"></p><div id="sums-targets" class="more-options" role="group" data-more-aria="sumsTargets"></div>
<div id="sums-board" class="sums-board" role="group" data-more-aria="sumsBoard"><svg class="sums-lines" viewBox="0 0 320 250" aria-hidden="true" focusable="false"><path d="M160 30 L35 215 L285 215 Z" fill="none"/></svg></div>
<div class="sums-totals"><div id="sums-side-0"><span data-more-text="sumsLeft"></span><strong id="sums-total-0"></strong></div><div id="sums-side-1"><span data-more-text="sumsRight"></span><strong id="sums-total-1"></strong></div><div id="sums-side-2"><span data-more-text="sumsBase"></span><strong id="sums-total-2"></strong></div></div>
<div class="status-row"><p id="sums-status" role="status" aria-live="polite"></p>${controlsMarkup('sums')}</div></div>
${belowMarkup('sums')}<div id="sums-insight" class="discovery" hidden><h2 data-more-text="sumsProofTitle"></h2><p id="sums-proof"></p><p data-more-text="sumsRange"></p></div>${historyMarkup('sums')}<p class="quiet-note" data-more-text="sumsQuiet"></p></section>`);

const appendLog = (prefix, entries, total = entries.length) => {
  const list = $(prefix + '-log'); list.replaceChildren();
  for (const text of entries.slice(-30)) { const li = document.createElement('li'); li.textContent = text; list.append(li); }
  if (!entries.length) { const li = document.createElement('li'); li.textContent = moreText('emptyHistory'); list.append(li); }
  copy(prefix + '-count', 'historyCount', {count: total}); $(prefix + '-recent').hidden = total <= 30;
};
const renderHint = (prefix, level, key, params) => {
  copy(prefix + '-hint', level === 0 ? 'hint' : level < 3 ? 'nextHint' : 'lastHint');
  $(prefix + '-hint-text').hidden = level === 0;
  $(prefix + '-hint').setAttribute('aria-expanded', String(level > 0));
  if (level) copy(prefix + '-hint-text', key, params);
};
let clock = read('quidence-clock-v1');
try { if (!clock || ![8, 2, 5].includes(clock.target) || !Array.isArray(clock.moves) || clock.moves.length > 10000 || typeof clock.proved !== 'boolean') throw 0; clockPosition(clock.moves); if (clock.proved && clock.target !== 5) throw 0; } catch { clock = {target: 8, moves: [], proved: false}; }
let clockHint = 0, clockMessage = null;
for (const target of [8, 2, 5]) {
  const button = document.createElement('button'); button.dataset.target = String(target);
  button.addEventListener('click', () => { if (clock.target === target) return; clock = {target, moves: [], proved: false}; clockHint = 0; clockMessage = null; renderClock(); });
  $('clock-targets').append(button);
}
for (let i = 0; i < 12; i++) {
  const point = document.createElement('span'); point.className = 'clock-point'; point.textContent = String(i); point.style.setProperty('--point', i); $('clock-points').append(point);
}
function renderClock() {
  const position = clockPosition(clock.moves), won = position === clock.target;
  let past=0; for(const step of clock.moves){past=clockMove(past,step);if(past===clock.target)markCompleted('clock');}
  reportOutcome('clock',won);
  [...$('clock-targets').children].forEach(button => { const target = Number(button.dataset.target); button.textContent = moreText('clockTarget', {target}); button.setAttribute('aria-pressed', String(clock.target === target)); });
  [...$('clock-points').children].forEach((point, i) => { point.classList.toggle('is-target', i === clock.target); point.classList.toggle('is-current', i === position); });
  $('clock-face').setAttribute('aria-label', moreText('clockFace', {position, target: clock.target}));
  $('clock-needle').style.setProperty('--position', position); $('clock-position').textContent = String(position);
  for (const step of CLOCK_STEPS) copy('clock-add-' + step, 'clockAdd', {step});
  copy('clock-status', clockMessage || (clock.proved ? 'clockProved' : won ? 'clockWon' : clock.moves.length ? 'clockProgress' : 'clockStart'), {position, target: clock.target, count: clock.moves.length});
  $('clock-undo').disabled = !clock.moves.length; $('clock-reset').disabled = !clock.moves.length && !clock.proved;
  $('clock-insight').hidden = !won && !clock.proved;
  const path = clockSolution(position, clock.target);
  renderHint('clock', clockHint, clockHint === 1 ? 'clockHint1' : clockHint === 2 ? 'clockHint2' : path === null ? 'clockHintOdd' : path.length ? 'clockHintMove' : 'clockHintSolved', {target: clock.target, step: path?.[0]});
  let from = 0; const entries = clock.moves.map(step => { const to = clockMove(from, step), label = moreText('clockRecord', {from, step, to}); from = to; return label; }); appendLog('clock', entries);
  save('quidence-clock-v1', clock);
}
for (const step of CLOCK_STEPS) $('clock-add-' + step).addEventListener('click', () => { clock.moves.push(step); clockHint = 0; clockMessage = null; renderClock(); });
$('clock-undo').addEventListener('click', () => { clock.moves.pop(); clockHint = 0; clockMessage = null; renderClock(); });
$('clock-reset').addEventListener('click', () => { clock.moves = []; clock.proved = false; clockHint = 0; clockMessage = null; renderClock(); });
$('clock-impossible').addEventListener('click', () => { if (clockSolution(0, clock.target) === null) { clock.proved = true; clockMessage = null; } else clockMessage = 'clockWrongProof'; renderClock(); });
$('clock-hint').addEventListener('click', () => { clockHint = Math.min(clockHint + 1, 3); renderClock(); });

const samePair = (a, b) => a[0] === b[0] && a[1] === b[1];
function validTiles(state) {
  if (!state || !Object.hasOwn(TILE_MODES, state.mode) || typeof state.proved !== 'boolean' || state.proved && state.mode !== 'corners' || !Array.isArray(state.history) || !state.history.length || state.history.length > 10000 || state.history[0]?.length !== 0) return false;
  try {
    for (let i = 0; i < state.history.length; i++) {
      const board = state.history[i]; tileCounts(TILE_MODES[state.mode], board);
      if (!i) continue;
      const previous = state.history[i - 1];
      if (board.length === previous.length + 1) { if (!previous.every((pair, j) => samePair(pair, board[j]))) return false; }
      else if (board.length === previous.length - 1) { const removed = previous.filter(pair => !board.some(other => samePair(pair, other))); if (removed.length !== 1 || !board.every(pair => previous.some(other => samePair(pair, other)))) return false; }
      else return false;
    }
    return true;
  } catch { return false; }
}
let tiles = read('quidence-tiles-v1'); if (!validTiles(tiles)) tiles = {mode: 'corners', history: [[]], proved: false};
let tileSelected = null, tileHint = 0, tileMessage = null;
const tileBoard = () => tiles.history.at(-1);
function tileParams(a, b) { return {r1: Math.floor(a / 4) + 1, c1: a % 4 + 1, r2: Math.floor(b / 4) + 1, c2: b % 4 + 1}; }
for (let cell = 0; cell < 16; cell++) {
  const button = document.createElement('button'); button.className = 'tile-cell'; button.dataset.cell = String(cell);
  button.addEventListener('click', () => {
    const board = tileBoard(), occupied = board.findIndex(pair => pair.includes(cell)); tileMessage = null;
    if (occupied >= 0) { tiles.history.push(board.filter((_, i) => i !== occupied).map(pair => pair.slice())); tileSelected = null; tileHint = 0; }
    else if (tileSelected === cell) tileSelected = null;
    else if (tileSelected === null) tileSelected = cell;
    else if (!adjacentCells(tileSelected, cell)) tileMessage = 'tilesNotAdjacent';
    else { tiles.history.push(placeDomino(TILE_MODES[tiles.mode], board, tileSelected, cell)); tileSelected = null; tileHint = 0; }
    renderTiles();
  }); $('tiles-board').append(button);
}
for (const mode of Object.keys(TILE_MODES)) $('tiles-' + mode).addEventListener('click', () => { if (tiles.mode === mode) return; tiles = {mode, history: [[]], proved: false}; tileSelected = null; tileHint = 0; tileMessage = null; renderTiles(); });
function renderTiles() {
  const board = tileBoard(), removed = TILE_MODES[tiles.mode], [dark, light] = tileCounts(removed, board), won = dark + light === 0;
  if(tiles.history.some(board=>tileCounts(removed,board).every(n=>n===0)))markCompleted('tiles');
  reportOutcome('tiles',won);
  for (const mode of Object.keys(TILE_MODES)) $('tiles-' + mode).setAttribute('aria-pressed', String(mode === tiles.mode));
  [...$('tiles-board').children].forEach((button, cell) => {
    const occupied = board.findIndex(pair => pair.includes(cell)), missing = removed.includes(cell), selected = tileSelected === cell;
    button.disabled = missing; button.className = 'tile-cell ' + (tileColor(cell) ? 'tile-light' : 'tile-dark') + (missing ? ' tile-missing' : '') + (occupied >= 0 ? ' tile-covered' : '') + (selected ? ' tile-selected' : '');
    button.setAttribute('aria-pressed', String(selected)); button.textContent = missing ? '×' : occupied >= 0 ? String(occupied + 1) : '·';
    button.setAttribute('aria-label', moreText('tilesCell', {row: Math.floor(cell / 4) + 1, column: cell % 4 + 1, color: moreText(tileColor(cell) ? 'tilesLight' : 'tilesDark'), state: missing ? moreText('tilesRemoved') : occupied >= 0 ? moreText('tilesOccupied', {number: occupied + 1}) : moreText('tilesFree')}));
    if (occupied >= 0) { const other = board[occupied].find(value => value !== cell); button.classList.add(other === cell + 1 ? 'join-right' : other === cell - 1 ? 'join-left' : other === cell + 4 ? 'join-bottom' : 'join-top'); button.style.setProperty('--tile-hue', 142 + (occupied % 4) * 19); }
  });
  copy('tiles-counts', 'tilesCounts', {dark, light});
  const status = tileMessage || (tileSelected !== null ? 'tilesSelected' : tiles.proved ? 'tilesProved' : won ? 'tilesWon' : board.length ? 'tilesProgress' : 'tilesStart');
  copy('tiles-status', status, {row: Math.floor(tileSelected / 4) + 1, column: tileSelected % 4 + 1, count: board.length, remaining: dark + light});
  $('tiles-undo').disabled = tiles.history.length <= 1; $('tiles-reset').disabled = tiles.history.length <= 1 && !tiles.proved && tileSelected === null;
  $('tiles-insight').hidden = !won && !tiles.proved;
  const solution = tileHint >= 3 && tiles.mode === 'adjacent' ? tilingSolution(removed, board) : null, move = solution?.[0];
  renderHint('tiles', tileHint, tileHint === 1 ? 'tilesHint1' : tileHint === 2 ? 'tilesHint2' : tiles.mode === 'corners' ? 'tilesHintImpossible' : won ? 'tilesHintSolved' : move ? 'tilesHintMove' : 'tilesHintBlocked', move ? {row1: Math.floor(move[0] / 4) + 1, column1: move[0] % 4 + 1, row2: Math.floor(move[1] / 4) + 1, column2: move[1] % 4 + 1} : {});
  const entries = tiles.history.slice(1).map((current, i) => { const previous = tiles.history[i], added = current.length > previous.length, pair = added ? current.at(-1) : previous.find(pair => !current.some(other => samePair(pair, other))); return moreText(added ? 'tilesPlaced' : 'tilesTaken', tileParams(...pair)); }); appendLog('tiles', entries);
  save('quidence-tiles-v1', tiles);
}
$('tiles-undo').addEventListener('click', () => { if (tiles.history.length > 1) tiles.history.pop(); tileSelected = null; tileHint = 0; tileMessage = null; renderTiles(); });
$('tiles-reset').addEventListener('click', () => { tiles.history = [[]]; tiles.proved = false; tileSelected = null; tileHint = 0; tileMessage = null; renderTiles(); });
$('tiles-impossible').addEventListener('click', () => { tileSelected = null; if (tiles.mode === 'corners') { tiles.proved = true; tileMessage = null; } else tileMessage = 'tilesWrongProof'; renderTiles(); });
$('tiles-hint').addEventListener('click', () => { tileHint = Math.min(tileHint + 1, 3); renderTiles(); });

let sums = read('quidence-sums-v1');
try { if (!sums || !TRIANGLE_TARGETS.includes(sums.target) || !Array.isArray(sums.moves) || sums.moves.length > 10000) throw 0; for (const move of sums.moves) { if (!Array.isArray(move) || move.length !== 2 || move[0] === move[1]) throw 0; swapTriangle(TRIANGLE_INITIAL, ...move); } } catch { sums = {target: 10, moves: []}; }
let sumSelected = null, sumHint = 0;
const sumState = () => sums.moves.reduce((values, pair) => swapTriangle(values, ...pair), [...TRIANGLE_INITIAL]);
const slots = ['slotTop', 'slotLeftMid', 'slotRightMid', 'slotLeft', 'slotBase', 'slotRight'];
const sumButtons = [];
for (const target of TRIANGLE_TARGETS) {
  const button = document.createElement('button'); button.dataset.target = String(target);
  button.addEventListener('click', () => { if (sums.target === target) return; sums.target = target; sumSelected = null; sumHint = 0; renderSums(); }); $('sums-targets').append(button);
}
for (let slot = 0; slot < 6; slot++) {
  const button = document.createElement('button'); button.className = 'sum-node sum-node-' + slot;
  button.addEventListener('click', () => { if (sumSelected === slot) sumSelected = null; else if (sumSelected === null) sumSelected = slot; else { sums.moves.push([sumSelected, slot]); sumSelected = null; sumHint = 0; } renderSums(); }); $('sums-board').append(button); sumButtons.push(button);
}
function renderSums() {
  const values = sumState(), totals = triangleSums(values), won = totals.every(value => value === sums.target), params = {target: sums.target, corners: 3 * sums.target - 21, count: sums.moves.length, left: totals[0], right: totals[1], base: totals[2]};
  [...$('sums-targets').children].forEach(button => { const target = Number(button.dataset.target); button.textContent = moreText('sumsTarget', {target}); button.setAttribute('aria-pressed', String(sums.target === target)); });
  sumButtons.forEach((button, slot) => { button.textContent = String(values[slot]); button.setAttribute('aria-pressed', String(sumSelected === slot)); button.setAttribute('aria-label', moreText('sumsSlot', {slot: moreText(slots[slot]), value: values[slot]})); });
  const sides = [[0, 1, 3], [0, 2, 5], [3, 4, 5]], sideNames = ['sumsLeft', 'sumsRight', 'sumsBase'];
  totals.forEach((total, i) => { $('sums-total-' + i).textContent = String(total); $('sums-side-' + i).classList.toggle('sum-matched', total === sums.target); $('sums-side-' + i).setAttribute('aria-label', moreText('sumsSideAria', {side: moreText(sideNames[i]), terms: sides[i].map(slot => values[slot]).join(' + '), sum: total, target: sums.target})); });
  copy('sums-status', sumSelected !== null ? 'sumsSelected' : won ? 'sumsWon' : sums.moves.length ? 'sumsProgress' : 'sumsStart', {...params, value: values[sumSelected], slot: sumSelected === null ? '' : moreText(slots[sumSelected])});
  $('sums-undo').disabled = !sums.moves.length; $('sums-reset').disabled = !sums.moves.length && sumSelected === null;
  $('sums-insight').hidden = !won; copy('sums-proof', 'sumsProof', params);
  const move = sumHint >= 3 ? triangleSolution(values, sums.target)?.[0] : null;
  renderHint('sums', sumHint, sumHint === 1 ? 'sumsHint1' : sumHint === 2 ? 'sumsHint2' : won ? 'sumsHintSolved' : 'sumsHintMove', {...params, ...(move ? {a: values[move[0]], b: values[move[1]], slotA: moreText(slots[move[0]]), slotB: moreText(slots[move[1]])} : {})});
  let state = [...TRIANGLE_INITIAL]; const entries = sums.moves.map(([a, b]) => { const x = state[a], y = state[b]; state = swapTriangle(state, a, b); const [left, right, base] = triangleSums(state); return moreText('sumsRecord', {a: x, b: y, left, right, base}); }); appendLog('sums', entries);
  save('quidence-sums-v1', sums); if (won) markCompleted('sums');
  reportOutcome('sums',won);
}
$('sums-undo').addEventListener('click', () => { sums.moves.pop(); sumSelected = null; sumHint = 0; renderSums(); });
$('sums-reset').addEventListener('click', () => { sums.moves = []; sumSelected = null; sumHint = 0; renderSums(); });
$('sums-hint').addEventListener('click', () => { sumHint = Math.min(sumHint + 1, 3); renderSums(); });
function renderLanguage() {
  root.querySelectorAll('[data-more-text]').forEach(element => { element.textContent = moreText(element.dataset.moreText); });
  root.querySelectorAll('[data-more-aria]').forEach(element => { element.setAttribute('aria-label', moreText(element.dataset.moreAria)); });
  renderClock(); renderTiles(); renderSums();
}
window.addEventListener('languagechange', renderLanguage); renderLanguage();
window.dispatchEvent(new Event('activitiesready'));
