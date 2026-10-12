import {registerTranslations, translateDOM, formatCountCopy} from './i18n.mjs';
import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import {SORTING_PAIRS, SORTING_LIMIT, sortingState, sortingAdd, sortingSolution, SCHEDULE_TASKS, SCHEDULE_HORIZON, SCHEDULE_OPTIMUM, scheduleState, schedulePlace, scheduleRemove, scheduleSolution, COLORING_NODES, COLORING_EDGES, coloringState, coloringSet, coloringSolution} from './explore-b-engine.mjs';

// Original editorial copy: arrays are always Simplified Chinese / English / Mexican Spanish.
export const COPY = {
  sortingNav: ["排序步骤", "Sorting steps", "Pasos para ordenar"],
  scheduleNav: ['并行排程', 'Two workstations', 'Dos estaciones'],
  coloringNav: ['图着色', 'Graph coloring', 'Colorea el grafo'],
  bReset: ['重新探索', 'Start over', 'Volver a empezar'],
  bUndo: ['撤回最后一步', 'Undo last step', 'Deshacer el último paso'],
  bHint: ['✧ 给我一点灵感', '✧ A little hint', '✧ Una pista'],
  bHintNext: ['再给一点提示 →', 'One more hint →', 'Otra pista →'],
  bHintLast: ['再看这条提示', 'Read this hint again', 'Volver a ver la pista'],
  sortingEyebrow: ['一套规则，所有输入', 'One rule. Every input.', 'Una regla. Todas las entradas.'],
  sortingTitle: ["最多五步，把四个数排好。", "Sort four numbers in at most five steps.", "Ordena cuatro números en hasta cinco pasos."],
  sortingPremise: ["四条线从上到下编号为 1、2、3、4，每条线上放一个数。设计最多五步的比较顺序，让任何四个数经过这些步骤后，都从上到下由小到大排列。所有输入必须使用同一套步骤。", "The four lines are numbered 1, 2, 3, 4 from top to bottom, with one number on each. Design at most five comparisons that put any four numbers in ascending order from top to bottom. Every input must use the same steps.", "Las cuatro líneas están numeradas 1, 2, 3 y 4 de arriba abajo, con un número en cada una. Diseña hasta cinco comparaciones para ordenar cualquier grupo de cuatro números de menor a mayor. Todas las entradas deben usar los mismos pasos."],
  sortingLabel: ["比较步骤实验", "Comparison steps", "Experimento de comparación"],
  sortingRule: ["点“比较”按钮添加一步：只比较所选两条线上的数，把小的放在上方、大的放在下方，其他两条线不变。步骤从左到右执行。添加后点“测试这套步骤”；系统会自动检查，不需要你填写数字。", "A Compare button adds one step: compare only the two selected lines, put the smaller value on the upper line and the larger on the lower line, and leave the other two unchanged. Steps run from left to right. Then test your steps; the system supplies the numbers.", "Cada botón de comparar agrega un paso: compara solo las dos líneas elegidas, deja el valor menor arriba y el mayor abajo, sin cambiar las otras dos. Los pasos se ejecutan de izquierda a derecha. Luego prueba tus pasos; el sistema pone los números."],
  sortingExample: ["例如：第 1 条线上是 8，第 3 条线上是 2。“比较 1 与 3”后，这两条线分别变成 2 和 8。测试会检查由 0 和 1 组成的全部 16 组四数输入。", "Example: line 1 holds 8 and line 3 holds 2. Comparing 1 and 3 leaves 2 on line 1 and 8 on line 3. The test checks all 16 groups of four numbers made from 0 and 1.", "Ejemplo: la línea 1 tiene 8 y la 3 tiene 2. Comparar 1 y 3 deja 2 en la línea 1 y 8 en la 3. La prueba revisa los 16 grupos de cuatro números formados con 0 y 1."],
  sortingCount: ['已用 {count} / 5 次比较', '{count} / 5 comparisons', '{count} / 5 comparaciones'],
  sortingAdd: ['比较 {a} 与 {b}', 'Compare {a} & {b}', 'Compara {a} y {b}'],
  sortingCompareAria: ['添加：比较第 {a} 和第 {b} 条线', 'Add: compare wires {a} and {b}', 'Agregar: comparar las líneas {a} y {b}'],
  sortingBoard: ['四条水平线，从上到下为 1、2、3、4。比较器从左到右执行。当前顺序：{sequence}。', 'Four horizontal wires, numbered 1, 2, 3, 4 from top to bottom. Comparators run left to right. Current sequence: {sequence}.', 'Cuatro líneas horizontales, numeradas 1, 2, 3 y 4 de arriba abajo. Los comparadores actúan de izquierda a derecha. Secuencia actual: {sequence}.'],
  sortingNone: ['尚无比较', 'no comparisons yet', 'aún no hay comparaciones'],
  sortingOrder: ['第 {step} 次：{a} ↔ {b}', 'Step {step}: {a} ↔ {b}', 'Paso {step}: {a} ↔ {b}'],
  sortingTest: ["测试这套步骤", "Test these steps", "Probar estos pasos"],
  sortingStart: ["先点一个“比较”按钮，添加第一步。之后还可以添加、撤回，再测试这套步骤。", "Tap a Compare button to add your first step. You can add more, undo, then test your sequence.", "Toca un botón de comparar para agregar el primer paso. Puedes añadir más, deshacer y luego probar tu secuencia."],
  sortingReady: ["已安排 {count} 步比较。点“测试这套步骤”，检查是否每一组都能排好。", "You have {count} comparison steps. Test them to check whether every group is sorted.", "Tienes {count} pasos de comparación. Pruébalos para revisar si todos los grupos quedan ordenados."],
  sortingFailed: ['通过 {passed} / 16 种。反例：{input} → {output}，仍未排好。调整比较顺序再试试。', '{passed} / 16 passed. Counterexample: {input} → {output}, still out of order. Adjust the sequence and try again.', 'Pasaron {passed} de 16. Contraejemplo: {input} → {output}, todavía sin ordenar. Ajusta la secuencia e inténtalo de nuevo.'],
  sortingWon: ['全部通过！{count} 次比较排好了 16 种二进制输入，也就能排好任意四个数。', 'All passed! {count} comparisons sort all 16 binary inputs, so they sort any four numbers.', '¡Pasaron todas! {count} comparaciones ordenan las 16 entradas binarias y, por tanto, cualquier grupo de cuatro números.'],
  sortingHint1: ['先分别整理两对，再让两对之间交换信息。仅比较相邻两条线，并不是唯一的选择。', 'First sort two pairs, then let the pairs exchange information. Comparisons need not connect neighboring wires.', 'Primero ordena dos parejas y luego intercambia información entre ellas. Las comparaciones no tienen que unir líneas vecinas.'],
  sortingHint2: ["先把两对数各自排好，再比较较小的两个数和较大的两个数。最小和最大的数就位后，哪一对的顺序还没确定？", "First sort two pairs, then compare the smaller values and the larger values. Once the minimum and maximum are in place, which pair is still unordered?", "Primero ordena dos parejas; luego compara sus valores menores y sus valores mayores. Cuando el mínimo y el máximo estén en su lugar, ¿qué pareja sigue sin ordenar?"],
  sortingHintMove: ['接着比较 {a} 和 {b}。保留目前的顺序，仍能在五次内完成。', 'Next compare {a} and {b}. Your current sequence can still become a sorter within five comparisons.', 'Ahora compara {a} y {b}. Tu secuencia todavía puede ordenar todo con cinco comparaciones.'],
  sortingHintBlocked: ['当前开头无法在五次内排好所有输入。撤回一次，再试别的线对；也可以重新开始。', 'This prefix cannot sort every input within five comparisons. Undo a step and try another pair, or start over.', 'Este inicio no puede ordenar todas las entradas con cinco comparaciones. Deshaz un paso y prueba otra pareja, o vuelve a empezar.'],
  sortingHintSolved: ['观察中间两条线：最后一次比较补上了它们之间尚未确定的顺序。', 'Look at the middle two wires: the final comparison resolves their remaining uncertainty.', 'Observa las dos líneas centrales: la última comparación resuelve el orden que faltaba.'],
  sortingProofTitle: ['为什么只测试 0 和 1？', 'Why do zeroes and ones suffice?', '¿Por qué bastan ceros y unos?'],
  sortingProof: ['假如某组数输出后仍有逆序，就在那两个数之间画一条门槛：小于门槛记为 0，大于门槛记为 1。比较交换与这一步转换可互换，因此这组二进制输入也会失败。所有 16 种都通过，就排除了这种可能。四个不同数有 24 种顺序；四次比较最多区分 16 种，所以至少需要五次。', 'If a numerical output were out of order, place a threshold between an inverted pair: values below it become 0, values above it become 1. Thresholding commutes with compare–swap, so that binary input would fail too. Passing all 16 rules this out. Four distinct numbers have 24 orders; four comparisons distinguish at most 16, so at least five are needed.', 'Si una salida numérica quedara desordenada, coloca un umbral entre dos valores invertidos: los menores se vuelven 0 y los mayores, 1. Aplicar el umbral antes o después de comparar e intercambiar da lo mismo; esa entrada binaria también fallaría. Probar las 16 descarta esa posibilidad. Cuatro números distintos tienen 24 órdenes; cuatro comparaciones distinguen como máximo 16, así que hacen falta al menos cinco.'],
  sortingQuiet: ['少量测试，也可以构成完整的证明。', 'A small test set can carry a whole proof.', 'Un conjunto pequeño de pruebas puede sostener toda una demostración.'],
  scheduleEyebrow: ['同时开始，不等于同时完成', 'Starting together is only a start.', 'Empezar a la vez es solo el inicio.'],
  scheduleTitle: ['两张工作台，多久能完成？', 'Two workstations. How soon?', 'Dos estaciones. ¿Cuánto tardas?'],
  schedulePremise: ["安排 A–E 五项任务，让它们全部尽早完成。你有两张工作台，每张同时只能做一项任务；任务卡写着所需时间和必须先完成的任务。", "Schedule tasks A–E so they all finish as early as possible. You have two workstations, each running one task at a time. Each card lists the duration and the tasks that must finish first.", "Organiza las tareas A–E para que todas terminen lo antes posible. Tienes dos estaciones y cada una hace una tarea a la vez. Cada tarjeta indica la duración y las tareas que deben terminar antes."],
  scheduleLabel: ['并行排程实验', 'Parallel scheduling experiment', 'Experimento de tareas paralelas'],
  scheduleRule: ["先选任务，再选工作台和整数开始时间，最后点“安排任务”。时间从 0 起算，任务开始后不能暂停。两张台可以同时工作，但所有前置任务完成后，后续任务才能开始。", "Choose a task, a station and a whole-number start time, then place the task. Time starts at 0; tasks cannot pause once started. Both stations may run together, but a task must wait for every prerequisite to finish.", "Elige una tarea, una estación y un tiempo de inicio entero; después coloca la tarea. El tiempo empieza en 0 y las tareas no se pueden pausar. Las estaciones pueden trabajar a la vez, pero cada tarea debe esperar a que terminen todos sus requisitos."],
  scheduleCount: ['已排 {count} / 5 项 · 结束于 {time}', '{count} / 5 placed · finish at {time}', '{count} de 5 colocadas · fin en {time}'],
  scheduleTask: ['{id} · {duration} 单位', '{id} · {duration} units', '{id} · {duration} unidades'],
  scheduleAfter: ['等 {tasks} 完成', 'After {tasks}', 'Después de {tasks}'],
  scheduleFree: ['无前置任务', 'No prerequisites', 'Sin requisitos previos'],
  scheduleTaskAria: ['任务 {id}，时长 {duration}。{dependency}。{position}。{selected}', 'Task {id}, duration {duration}. {dependency}. {position}. {selected}', 'Tarea {id}, duración {duration}. {dependency}. {position}. {selected}'],
  scheduleUnplaced: ['尚未安排', 'not placed', 'sin colocar'],
  schedulePosition: ['工作台 {machine}，{start}–{end}', 'station {machine}, {start}–{end}', 'estación {machine}, {start}–{end}'],
  bSelected: ['已选中', 'selected', 'seleccionado'], bAvailable: ['可选择', 'available', 'disponible'],
  scheduleStation: ['工作台', 'Workstation', 'Estación'],
  scheduleStationName: ['工作台 {machine}', 'Station {machine}', 'Estación {machine}'],
  scheduleStartRange: ["任务 {id} 的开始时间（0–{max}）", "Start time for {id} (0–{max})", "Tiempo de inicio de {id} (0–{max})"],
  scheduleStartLabel: ["开始时间", "Start time", "Tiempo de inicio"],
  schedulePlace: ['安排任务 {id}', 'Place task {id}', 'Colocar tarea {id}'],
  scheduleRemove: ['移除所选及后续任务', 'Remove selected & dependents', 'Quitar la elegida y sus dependientes'],
  scheduleTimeline: ['{station} 的时间轴：{tasks}。时间范围 0 到 14。', '{station} timeline: {tasks}. Time range 0 to 14.', 'Línea de tiempo de {station}: {tasks}. Intervalo de 0 a 14.'],
  scheduleEmpty: ['空闲', 'empty', 'vacía'],
  scheduleBlock: ['{id}，从 {start} 到 {end}', '{id}, from {start} to {end}', '{id}, de {start} a {end}'],
  scheduleStart: ['先选 A 或 B，它们不需要等待。总工作量是 14；两张台的最短工期会是 7 吗？', 'A and B can start without waiting. The total work is 14 units. Could two stations finish in 7?', 'A y B pueden empezar sin esperar. El trabajo total es de 14 unidades. ¿Pueden dos estaciones terminar en 7?'],
  scheduleProgress: ['已排好 {count} 项，当前最晚结束于 {time}。还有哪些工作可以同时进行？', '{count} tasks placed; the latest ends at {time}. What else could run at the same time?', 'Colocaste {count} tareas; la última acaba en {time}. ¿Cuáles pueden hacerse a la vez?'],
  scheduleSlow: ['五项都完成了，总工期 {time}。还可以更短：观察 A → C → E 这条链。', 'All five tasks finish at {time}. A shorter plan exists: inspect the chain A → C → E.', 'Las cinco tareas terminan en {time}. Hay un plan más corto: observa la cadena A → C → E.'],
  scheduleWon: ['8 个单位，已经最短！两张台都遵守依赖，没有重叠。', '8 units: the shortest possible! Both stations respect every dependency without overlap.', '¡8 unidades, el mínimo posible! Las estaciones respetan todas las dependencias sin superposiciones.'],
  scheduleErrorInput: ['请输入非负整数，且让整项任务在 14 以内结束。', 'Enter a nonnegative whole number, with the entire task ending by 14.', 'Ingresa un número entero no negativo que permita terminar toda la tarea antes de 14 o justo en 14.'],
  scheduleErrorMissing: ['任务 {task} 需要 {dependency}。请先安排前置任务。', 'Task {task} needs {dependency}. Place the prerequisite first.', 'La tarea {task} necesita {dependency}. Coloca primero su requisito previo.'],
  scheduleErrorDependency: ['{task} 开始得太早：必须等 {dependency} 完成。移动前置任务也要照顾已排好的后续任务。', '{task} starts too early: it must wait for {dependency}. Moving a prerequisite must also preserve its scheduled dependents.', '{task} empieza demasiado pronto: debe esperar a {dependency}. Al mover un requisito previo, también debes respetar las tareas que dependen de él.'],
  scheduleErrorOverlap: ['{task} 与 {other} 在同一张工作台重叠了。换个时间或工作台。', '{task} overlaps {other} on the same station. Try another time or station.', '{task} se superpone con {other} en la misma estación. Prueba otra hora u otra estación.'],
  scheduleRemoved: ["移除了 {count} 项任务。", "Removed {count} tasks.", "Se quitaron {count} tareas."],
  scheduleHint1: ['A、C、E 必须依次做。把它们的时长相加：3 + 2 + 3。这给出了无法再短的下界。', 'A, C and E must run in order. Add their durations: 3 + 2 + 3. This gives a finish time no plan can beat.', 'A, C y E deben hacerse en orden. Suma sus duraciones: 3 + 2 + 3. Ningún plan puede terminar antes.'],
  scheduleHint2: ['让 A 和 B 从 0 同时开始。A 完成后，C 和 D 可以并行；接着 E 能在哪张台开始？', 'Start A and B together at 0. After A finishes, C and D can run in parallel. Where can E start next?', 'Empieza A y B juntas en 0. Cuando termine A, C y D pueden hacerse a la vez. ¿Dónde puede empezar E después?'],
  scheduleHintMove: ['可把 {id} 放在工作台 {machine}，从 {start} 开始。沿这条路仍能在 8 结束。', 'Place {id} on station {machine} at {start}. This still leaves a way to finish at 8.', 'Coloca {id} en la estación {machine} desde {start}. Así todavía puedes terminar en 8.'],
  scheduleHintBlocked: ['保留当前安排无法在 8 结束。移除较晚的任务和它的后续任务，再从关键链 A → C → E 出发。', 'Keeping these placements cannot finish at 8. Remove a late task and its dependents, then build around A → C → E.', 'Con estas posiciones no puedes terminar en 8. Quita una tarea tardía y sus dependientes; después organiza el plan alrededor de A → C → E.'],
  scheduleHintSolved: ['你把关键链排得没有空隙，其余工作正好藏进两张台的空闲时间。', 'Your critical chain has no gaps. The other work fits into the remaining station time.', 'Tu cadena crítica no tiene pausas. El trabajo restante cabe en los espacios libres de las estaciones.'],
  scheduleProofTitle: ['工作总量，不是唯一的限制。', 'Total work is only one limit.', 'El trabajo total no es el único límite.'],
  scheduleProof: ['14 个单位的工作分给两张台，至少需要 7。但 A → C → E 不能并行，单是这条链就需要 8。一种安排是：工作台 1 做 A（0–3）和 D（3–7）；工作台 2 做 B（0–2）、C（3–5）和 E（5–8）。下界与实际安排相遇，8 就是最优值。程序也枚举整数时间的所有可行安排，确认没有更短的解。', 'Fourteen units of work on two stations need at least 7 units of time. But A → C → E cannot overlap, so that chain alone needs 8. One plan: station 1 runs A (0–3) and D (3–7); station 2 runs B (0–2), C (3–5) and E (5–8). A matching lower bound and construction prove 8 is optimal. Exhaustive integer-time search also finds no shorter feasible plan.', 'Catorce unidades de trabajo en dos estaciones requieren al menos 7 unidades de tiempo. Pero A → C → E no puede hacerse en paralelo: esa cadena necesita 8. Un plan: estación 1 con A (0–3) y D (3–7); estación 2 con B (0–2), C (3–5) y E (5–8). Una cota inferior y un plan que la alcanza demuestran que 8 es óptimo. La búsqueda exhaustiva en tiempos enteros también confirma que no hay un plan más corto.'],
  scheduleQuiet: ['等待，有时藏在任务之间。', 'Sometimes the waiting lives between tasks.', 'A veces, la espera está entre las tareas.'],
  coloringEyebrow: ['相连的点，不能同色', 'Neighbors need different colors.', 'Los vecinos necesitan colores distintos.'],
  coloringTitle: ['这个轮子，需要几种颜色？', 'How many colors for this wheel?', '¿Cuántos colores necesita esta rueda?'],
  coloringPremise: ["给 A–F 六个点全部着色。凡是由线直接相连的两个点，颜色都必须不同；不相连的点可以同色。目标是用尽可能少的颜色完成整张图。", "Color all six points A–F. Points directly joined by a line must have different colors; unconnected points may share a color. Use as few colors as possible for the whole graph.", "Colorea los seis puntos A–F. Dos puntos unidos directamente por una línea deben tener colores distintos; los que no están unidos pueden compartir color. Usa la menor cantidad de colores posible para todo el grafo."],
  coloringLabel: ['图着色实验', 'Graph-coloring experiment', 'Experimento de coloreado'],
  coloringRule: ['先选颜色，再点字母。数字标记与颜色对应；虚线表示冲突。用擦除可以清空一个点。', 'Choose a color, then a letter. Number labels identify the colors too; dashed lines mark conflicts. Use the eraser to clear a vertex.', 'Elige un color y después una letra. Los números también identifican los colores; las líneas punteadas indican conflictos. Usa el borrador para limpiar un vértice.'],
  coloringCount: ['已涂 {filled} / 6 个点 · 用了 {used} 种颜色', '{filled} / 6 colored · {used} colors used', '{filled} de 6 coloreados · {used} colores usados'],
  coloringColor: ['颜色 {color}', 'Color {color}', 'Color {color}'],
  coloringEraser: ['擦除', 'Eraser', 'Borrador'],
  coloringPalette: ['选择画笔颜色或擦除', 'Choose a color or eraser', 'Elige un color o el borrador'],
  coloringBlank: ['未着色', 'uncolored', 'sin color'],
  coloringNode: ['点 {node}：{color}。相邻点：{neighbors}。{conflict}', 'Vertex {node}: {color}. Neighbors: {neighbors}. {conflict}', 'Vértice {node}: {color}. Vecinos: {neighbors}. {conflict}'],
  coloringConflictAria: ['与相邻点同色', 'shares a color with a neighbor', 'tiene el mismo color que un vecino'],
  coloringOkayAria: ['目前没有冲突', 'no current conflict', 'sin conflictos por ahora'],
  coloringBoard: ['A、B、C、D、E 连成五边形，中心 F 与这五个点都相连。相邻点不能同色。', 'A, B, C, D and E form a pentagon. Center F connects to all five. Adjacent vertices must have different colors.', 'A, B, C, D y E forman un pentágono. El centro F conecta con los cinco. Los vértices vecinos deben tener colores diferentes.'],
  coloringStart: ['先从外圈试起。两种颜色能绕一圈回到起点吗？', 'Start around the rim. Can two colors take you all the way back to the start?', 'Empieza por el borde. ¿Puedes dar toda la vuelta con dos colores?'],
  coloringProgress: ['已涂 {filled} 个点，暂时没有冲突。中心 F 会带来什么限制？', '{filled} vertices colored, with no conflicts so far. What constraint does the center F add?', 'Coloreaste {filled} vértices sin conflictos por ahora. ¿Qué restricción añade el centro F?'],
  coloringConflict: ['还有 {count} 条线两端同色：{edges}。换个颜色，或先擦除一端。', '{count} lines have matching colors at both ends: {edges}. Recolor or erase an endpoint.', 'Hay {count} líneas con el mismo color en ambos extremos: {edges}. Cambia el color o borra uno de sus extremos.'],
  coloringWon: ['全部相邻点都不同色！用了 4 种，恰好是这张图的最小值。', 'Every neighboring pair differs! You used 4 colors, exactly the minimum for this graph.', '¡Todos los vecinos tienen colores distintos! Usaste 4 colores, justo el mínimo para este grafo.'],
  coloringHint1: ['沿五边形轮流用两种颜色。走过五条边回到起点时，哪里发生了冲突？', 'Alternate two colors around the pentagon. After five edges, what happens when you return to the start?', 'Alterna dos colores alrededor del pentágono. Después de cinco lados, ¿qué pasa al volver al inicio?'],
  coloringHint2: ['外圈有奇数条边，至少需要三种颜色。中心 F 接触外圈每个点，还能用其中一种吗？', 'The odd rim needs at least three colors. F touches every rim vertex. Can it share any of those colors?', 'El borde tiene un número impar de lados y necesita al menos tres colores. F toca todos sus vértices. ¿Puede compartir alguno de esos colores?'],
  coloringHintMove: ['可以给 {node} 涂颜色 {color}。保留当前颜色，仍有办法完成。', 'Give {node} color {color}. Your current colors still allow a complete solution.', 'Dale a {node} el color {color}. Los colores actuales todavía permiten completar el grafo.'],
  coloringHintBlocked: ['先修正虚线两端的冲突；如果没有虚线，就擦除一个点，换一种配色方向。', 'First repair a dashed-line conflict. If none is marked, erase a vertex and try a different color arrangement.', 'Primero corrige un conflicto marcado con línea punteada. Si no hay ninguno, borra un vértice y prueba otra distribución.'],
  coloringHintSolved: ['外圈用了三种，中心独占第四种。试着解释为什么少一种不可能。', 'Three colors around the rim; a fourth for the center. Explain why one fewer cannot work.', 'Tres colores en el borde y un cuarto en el centro. Explica por qué no puede hacerse con uno menos.'],
  coloringProofTitle: ['局部限制，也能锁定全局。', 'Local restrictions set a global minimum.', 'Las restricciones locales fijan un mínimo global.'],
  coloringProof: ['外圈是长度为 5 的奇环。若只用两种颜色，沿边交替后最后一条边必定冲突，所以外圈至少需要三种。中心 F 与外圈所有点相邻，必须避开外圈的全部颜色，再加第四种。你给出的合法着色表明四种也足够，因此最小值恰好是四。', 'The rim is an odd cycle of length 5. With two alternating colors, its closing edge must conflict, so the rim needs at least three. F touches every rim vertex and must avoid every color used there, requiring a fourth. Your proper coloring shows four also suffice, so the minimum is exactly four.', 'El borde es un ciclo impar de longitud 5. Con dos colores alternados, el último lado siempre entra en conflicto; hacen falta al menos tres. F toca todos los vértices del borde y debe evitar todos sus colores, por lo que necesita un cuarto. Tu coloreado válido muestra que cuatro también bastan: ese es el mínimo exacto.'],
  coloringQuiet: ['看一条边，也别忘了看整圈。', 'Inspect each edge, then the whole cycle.', 'Observa cada lado y después el ciclo completo.'],
};
export const EXPLORE_B_COPY = COPY;
for (const [key, values] of Object.entries(COPY)) registerTranslations({[key]: {'zh-CN': values[0], en: values[1], 'es-MX': values[2]}});
const $ = id => document.getElementById(id);
const languageIndex = () => document.documentElement.lang === 'es-MX' ? 2 : document.documentElement.lang === 'en' ? 1 : 0;
export function exploreBText(key, params = {}) {
  if (!COPY[key]) throw new Error(`Missing UI copy: ${key}`);
  return formatCountCopy(COPY[key][languageIndex()], params, document.documentElement.lang).replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
const text = (id, key, params) => { $(id).textContent = exploreBText(key, params); };
const save = (id, value) => { try { localStorage.setItem(`quidence-${id}-v1`, JSON.stringify(value)); } catch {} };
function restore(id, field, fallback, validate) {
  try {
    const raw = localStorage.getItem(`quidence-${id}-v1`); if (!raw || raw.length > 10000) throw 0;
    const value = JSON.parse(raw); validate(value[field]);
    if (!Array.isArray(value[field])) throw 0;
    return value[field];
  } catch { return fallback; }
}
const intro = id => `<div class="intro"><p class="eyebrow"><span></span><span class="explore-b-eyebrow" data-b-text="${id}Eyebrow"></span></p><h1 id="${id}-title" data-b-text="${id}Title"></h1><p class="premise" data-b-text="${id}Premise"></p></div>`;
const below = id => `<div class="mini-below"><button id="${id}-hint" class="hint-button" aria-expanded="false" aria-controls="${id}-hint-text"></button><p id="${id}-hint-text" class="hint-copy" hidden></p></div><div id="${id}-insight" class="discovery" hidden><h2 data-b-text="${id}ProofTitle"></h2><p data-b-text="${id}Proof"></p></div><p class="quiet-note" data-b-text="${id}Quiet"></p>`;
const reset = id => `<button id="${id}-reset" class="text-button" data-b-text="bReset"></button>`;
const root = $('activity-center');
root.insertAdjacentHTML('beforeend', `
<section id="activity-sorting" class="activity-view explore-b" hidden aria-labelledby="sorting-title">
${intro('sorting')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-b-text="sortingLabel"></span><span id="sorting-count" class="board-caption"></span></div><p class="rule-reminder" data-b-text="sortingRule"></p><p class="sorting-example" data-b-text="sortingExample"></p>
<div id="sorting-board" class="sorting-board" role="img"><svg id="sorting-svg" viewBox="0 0 520 206" aria-hidden="true" focusable="false"></svg></div><div id="sorting-sequence" class="sorting-sequence"></div><div id="sorting-pairs" class="sorting-pairs"></div><div class="b-action-row"><button id="sorting-test" class="primary-button" data-b-text="sortingTest"></button></div>
<div class="status-row"><p id="sorting-status" role="status" aria-live="polite"></p><div class="history-controls"><button id="sorting-undo" class="text-button" data-b-text="bUndo"></button>${reset('sorting')}</div></div></div>${below('sorting')}</section>
<section id="activity-schedule" class="activity-view explore-b" hidden aria-labelledby="schedule-title">
${intro('schedule')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-b-text="scheduleLabel"></span><span id="schedule-count" class="board-caption"></span></div><p class="rule-reminder" data-b-text="scheduleRule"></p>
<div id="schedule-tasks" class="schedule-tasks"></div><div class="schedule-editor"><label><span data-b-text="scheduleStation"></span><select id="schedule-machine"></select></label><label><span id="schedule-start-label" data-b-text="scheduleStartLabel"></span><input id="schedule-start" type="number" inputmode="numeric" min="0" max="12" step="1" value="0"/></label></div><div class="b-action-row"><button id="schedule-place" class="primary-button"></button><button id="schedule-remove" class="b-outline" data-b-text="scheduleRemove"></button></div>
<div class="schedule-timelines"><div class="schedule-ruler" aria-hidden="true"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span><span>12</span><span>14</span></div><p id="schedule-station-0" class="schedule-station"></p><div id="schedule-lane-0" class="schedule-lane" role="img"></div><p id="schedule-station-1" class="schedule-station"></p><div id="schedule-lane-1" class="schedule-lane" role="img"></div></div>
<div class="status-row"><p id="schedule-status" role="status" aria-live="polite"></p><div class="history-controls">${reset('schedule')}</div></div></div>${below('schedule')}</section>
<section id="activity-coloring" class="activity-view explore-b" hidden aria-labelledby="coloring-title">
${intro('coloring')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-b-text="coloringLabel"></span><span id="coloring-count" class="board-caption"></span></div><p class="rule-reminder" data-b-text="coloringRule"></p>
<div id="coloring-palette" class="coloring-palette" role="group" data-b-aria="coloringPalette"></div><div id="coloring-board" class="coloring-board" role="group" data-b-aria="coloringBoard"><svg class="coloring-graph" viewBox="0 0 500 440" aria-hidden="true" focusable="false"><g id="coloring-lines"></g></svg></div>
<div class="status-row"><p id="coloring-status" role="status" aria-live="polite"></p><div class="history-controls">${reset('coloring')}</div></div></div>${below('coloring')}</section>`);
const levels = {sorting: 0, schedule: 0, coloring: 0};
function hint(id, key, params) {
  const level = levels[id]; text(`${id}-hint`, level === 0 ? 'bHint' : level < 3 ? 'bHintNext' : 'bHintLast');
  $(`${id}-hint`).setAttribute('aria-expanded', String(level > 0)); $(`${id}-hint-text`).hidden = !level;
  if (level) text(`${id}-hint-text`, key, params);
}
let network = restore('sorting', 'network', [], sortingState), tested = false;
// Restore an explicit test only for this exact validated network. Legacy saves
// without test provenance remain editable and require the learner to run a test.
try {
  const saved = JSON.parse(localStorage.getItem('quidence-sorting-v1'));
  tested = saved?.tested === true && saved.testedNetwork === JSON.stringify(network);
} catch {}
for (const [a, b] of SORTING_PAIRS) {
  const button = document.createElement('button'); button.id = `sorting-add-${a}-${b}`; button.className = 'b-outline';
  button.addEventListener('click', () => { network = sortingAdd(network, [a, b]); tested = false; levels.sorting = 0; renderSorting(); });
  $('sorting-pairs').append(button);
}
function renderSorting() {
  const state = sortingState(network);
  text('sorting-count', 'sortingCount', state);
  SORTING_PAIRS.forEach(([a, b]) => { const button = $(`sorting-add-${a}-${b}`); button.textContent = exploreBText('sortingAdd', {a: a + 1, b: b + 1}); button.setAttribute('aria-label', exploreBText('sortingCompareAria', {a: a + 1, b: b + 1})); button.disabled = network.length >= SORTING_LIMIT; });
  $('sorting-svg').innerHTML = [0, 1, 2, 3].map(i => `<path class="sorting-wire" d="M40 ${30 + i * 48}H498"/><text class="sorting-wire-label" x="18" y="${36 + i * 48}">${i + 1}</text>`).join('') + network.map(([a, b], index) => `<path class="sorting-comparator" d="M${90 + index * 84} ${30 + a * 48}V${30 + b * 48}"/><circle class="sorting-end" cx="${90 + index * 84}" cy="${30 + a * 48}" r="7"/><circle class="sorting-end" cx="${90 + index * 84}" cy="${30 + b * 48}" r="7"/><text class="sorting-step" x="${90 + index * 84}" y="201">${index + 1}</text>`).join('');
  const sequence = network.length ? network.map(([a, b], index) => exploreBText('sortingOrder', {a: a + 1, b: b + 1, step: index + 1})) : [exploreBText('sortingNone')];
  $('sorting-board').setAttribute('aria-label', exploreBText('sortingBoard', {sequence: sequence.join('; ')}));
  $('sorting-sequence').replaceChildren(); sequence.forEach(value => { const item = document.createElement('span'); item.textContent = value; $('sorting-sequence').append(item); });
  text('sorting-status', tested ? state.won ? 'sortingWon' : 'sortingFailed' : network.length ? 'sortingReady' : 'sortingStart', {...state, input: state.counterexample?.input.join(' '), output: state.counterexample?.output.join(' ')});
  $('sorting-undo').disabled = !network.length; $('sorting-reset').disabled = !network.length && !tested;
  $('sorting-insight').hidden = !(tested && state.won);
  let key = levels.sorting === 1 ? 'sortingHint1' : 'sortingHint2', params = {};
  if (levels.sorting === 3) { const solution = sortingSolution(network), next = solution?.[network.length]; key = state.won ? 'sortingHintSolved' : next ? 'sortingHintMove' : 'sortingHintBlocked'; params = {a: next?.[0] + 1, b: next?.[1] + 1}; }
  hint('sorting', key, params); save('sorting', {network, tested, testedNetwork: tested ? JSON.stringify(network) : null}); if (tested && state.won) markCompleted('sorting');
  reportOutcome('sorting',tested && state.won);
}
$('sorting-test').addEventListener('click', () => { tested = true; renderSorting(); });
$('sorting-undo').addEventListener('click', () => { network.pop(); tested = false; levels.sorting = 0; renderSorting(); });
$('sorting-reset').addEventListener('click', () => { network = []; tested = false; levels.sorting = 0; renderSorting(); });

let placements = restore('schedule', 'placements', [], scheduleState), selectedTask = 'A', scheduleMessage = null;
const taskButtons = new Map();
for (const task of SCHEDULE_TASKS) {
  const button = document.createElement('button'); button.id = `schedule-task-${task.id}`; button.className = 'schedule-task';
  const title = document.createElement('strong'), dependency = document.createElement('span'), position = document.createElement('span'); button.append(title, dependency, position);
  button.addEventListener('click', () => { selectedTask = task.id; scheduleMessage = null; const placed = placements.find(value => value.id === task.id); if (placed) { $('schedule-machine').value = String(placed.machine); $('schedule-start').value = String(placed.start); } renderSchedule(); });
  taskButtons.set(task.id, {button, title, dependency, position}); $('schedule-tasks').append(button);
}
for (let machine = 0; machine < 2; machine++) { const option = document.createElement('option'); option.id = `schedule-option-${machine}`; option.value = String(machine); $('schedule-machine').append(option); }
$('schedule-machine').value = '0';
function renderSchedule() {
  const max = SCHEDULE_HORIZON - SCHEDULE_TASKS.find(task => task.id === selectedTask).duration;
  text('schedule-start-label', 'scheduleStartRange', {id: selectedTask, max}); $('schedule-start').setAttribute('max', String(max));
  const state = scheduleState(placements); text('schedule-count', 'scheduleCount', {count: state.count, time: state.makespan});
  for (const task of SCHEDULE_TASKS) {
    const {button, title, dependency, position} = taskButtons.get(task.id), placed = placements.find(value => value.id === task.id);
    title.textContent = exploreBText('scheduleTask', task); dependency.textContent = exploreBText(task.after.length ? 'scheduleAfter' : 'scheduleFree', {tasks: task.after.join(' + ')});
    position.textContent = placed ? exploreBText('schedulePosition', {machine: placed.machine + 1, start: placed.start, end: placed.start + task.duration}) : exploreBText('scheduleUnplaced');
    button.setAttribute('aria-pressed', String(selectedTask === task.id)); button.setAttribute('aria-label', exploreBText('scheduleTaskAria', {...task, dependency: dependency.textContent, position: position.textContent, selected: exploreBText(selectedTask === task.id ? 'bSelected' : 'bAvailable')}));
  }
  for (let machine = 0; machine < 2; machine++) {
    text(`schedule-option-${machine}`, 'scheduleStationName', {machine: machine + 1}); text(`schedule-station-${machine}`, 'scheduleStationName', {machine: machine + 1});
    const lane = $(`schedule-lane-${machine}`), tasks = placements.filter(value => value.machine === machine).sort((a, b) => a.start - b.start); lane.replaceChildren();
    for (const placement of tasks) { const task = SCHEDULE_TASKS.find(value => value.id === placement.id), block = document.createElement('span'); block.className = 'schedule-block'; block.dataset.task = placement.id; block.textContent = placement.id; block.style.setProperty('grid-column', `${placement.start + 1} / span ${task.duration}`); block.setAttribute('aria-hidden', 'true'); lane.append(block); }
    lane.setAttribute('aria-label', exploreBText('scheduleTimeline', {station: exploreBText('scheduleStationName', {machine: machine + 1}), tasks: tasks.length ? tasks.map(placement => exploreBText('scheduleBlock', {id: placement.id, start: placement.start, end: placement.start + SCHEDULE_TASKS.find(task => task.id === placement.id).duration})).join('; ') : exploreBText('scheduleEmpty')}));
  }
  text('schedule-place', 'schedulePlace', {id: selectedTask}); $('schedule-remove').disabled = !placements.some(value => value.id === selectedTask); $('schedule-reset').disabled = !placements.length && !scheduleMessage && selectedTask === 'A' && $('schedule-start').value === '0' && $('schedule-machine').value === '0';
  text('schedule-status', scheduleMessage?.key || (state.won ? 'scheduleWon' : state.finished ? 'scheduleSlow' : state.count ? 'scheduleProgress' : 'scheduleStart'), scheduleMessage?.params || {count: state.count, time: state.makespan});
  $('schedule-insight').hidden = !state.won;
  let key = levels.schedule === 1 ? 'scheduleHint1' : 'scheduleHint2', params = {};
  if (levels.schedule === 3) { const solution = scheduleSolution(placements), next = solution?.placements.find(task => !placements.some(value => value.id === task.id)); key = state.won ? 'scheduleHintSolved' : solution?.makespan === SCHEDULE_OPTIMUM && next ? 'scheduleHintMove' : 'scheduleHintBlocked'; params = next ? {...next, machine: next.machine + 1} : {}; }
  hint('schedule', key, params); save('schedule', {placements}); if (state.won) markCompleted('schedule');
  reportOutcome('schedule',state.won);
}
$('schedule-place').addEventListener('click', () => {
  try { const raw = $('schedule-start').value.trim(); if (!/^\d+$/.test(raw)) throw {code: 'input'}; placements = schedulePlace(placements, selectedTask, Number($('schedule-machine').value), Number(raw)); scheduleMessage = null; $('schedule-start').setAttribute('aria-invalid', 'false'); levels.schedule = 0; }
  catch (error) { scheduleMessage = {key: {missing: 'scheduleErrorMissing', dependency: 'scheduleErrorDependency', overlap: 'scheduleErrorOverlap'}[error.code] || 'scheduleErrorInput', params: {task: error.task, dependency: error.dependency, other: error.other}}; $('schedule-start').setAttribute('aria-invalid', String(error.code === 'input')); }
  renderSchedule();
});
$('schedule-remove').addEventListener('click', () => { const count = placements.length; placements = scheduleRemove(placements, selectedTask); scheduleMessage = {key: 'scheduleRemoved', params: {count: count - placements.length}}; levels.schedule = 0; renderSchedule(); });
$('schedule-reset').addEventListener('click', () => { placements = []; selectedTask = 'A'; scheduleMessage = null; levels.schedule = 0; $('schedule-start').value = '0'; $('schedule-machine').value = '0'; $('schedule-start').setAttribute('aria-invalid', 'false'); renderSchedule(); });

let colors = restore('coloring', 'colors', Array(6).fill(null), coloringState), paint = 0;
for (let color = 0; color < 5; color++) {
  const button = document.createElement('button'); button.id = `coloring-paint-${color}`; button.className = 'coloring-paint'; button.dataset.color = color < 4 ? String(color) : 'erase';
  button.addEventListener('click', () => { paint = color === 4 ? null : color; renderColoring(); }); $('coloring-palette').append(button);
}
COLORING_EDGES.forEach(([a, b], index) => { const start = COLORING_NODES[a], end = COLORING_NODES[b]; $('coloring-lines').insertAdjacentHTML('beforeend', `<path id="coloring-edge-${index}" class="coloring-edge" d="M${start.x} ${start.y}L${end.x} ${end.y}"/>`); });
COLORING_NODES.forEach((node, index) => {
  const button = document.createElement('button'); button.id = `coloring-node-${node.id}`; button.className = 'coloring-node'; button.style.setProperty('left', `${node.x / 5}%`); button.style.setProperty('top', `${node.y / 4.4}%`);
  button.addEventListener('click', () => { colors = coloringSet(colors, index, paint); levels.coloring = 0; renderColoring(); }); $('coloring-board').append(button);
});
function renderColoring() {
  const state = coloringState(colors); text('coloring-count', 'coloringCount', state);
  for (let color = 0; color < 5; color++) { const button = $(`coloring-paint-${color}`); button.textContent = exploreBText(color === 4 ? 'coloringEraser' : 'coloringColor', {color: color + 1}); button.setAttribute('aria-pressed', String(paint === (color === 4 ? null : color))); }
  COLORING_EDGES.forEach(([a, b], index) => $(`coloring-edge-${index}`).classList.toggle('is-conflict', colors[a] !== null && colors[a] === colors[b]));
  COLORING_NODES.forEach((node, index) => {
    const button = $(`coloring-node-${node.id}`), conflicted = state.conflicts.some(edge => edge.includes(index)); button.dataset.color = colors[index] === null ? 'blank' : String(colors[index]); button.classList.toggle('is-conflict', conflicted); button.textContent = `${node.id} · ${colors[index] === null ? '–' : colors[index] + 1}`;
    button.setAttribute('aria-label', exploreBText('coloringNode', {node: node.id, color: colors[index] === null ? exploreBText('coloringBlank') : exploreBText('coloringColor', {color: colors[index] + 1}), neighbors: COLORING_EDGES.filter(edge => edge.includes(index)).map(edge => COLORING_NODES[edge.find(value => value !== index)].id).join(', '), conflict: exploreBText(conflicted ? 'coloringConflictAria' : 'coloringOkayAria')}));
  });
  text('coloring-status', state.won ? 'coloringWon' : state.conflicts.length ? 'coloringConflict' : state.filled ? 'coloringProgress' : 'coloringStart', {...state, count: state.conflicts.length, edges: state.conflicts.map(([a, b]) => `${COLORING_NODES[a].id}–${COLORING_NODES[b].id}`).join(', ')});
  $('coloring-reset').disabled = !state.filled; $('coloring-insight').hidden = !state.won;
  let key = levels.coloring === 1 ? 'coloringHint1' : 'coloringHint2', params = {};
  if (levels.coloring === 3) { const solution = coloringSolution(colors), next = colors.indexOf(null); key = state.won ? 'coloringHintSolved' : solution && next >= 0 ? 'coloringHintMove' : 'coloringHintBlocked'; params = solution && next >= 0 ? {node: COLORING_NODES[next].id, color: solution[next] + 1} : {}; }
  hint('coloring', key, params); save('coloring', {colors}); if (state.won) markCompleted('coloring');
  reportOutcome('coloring',state.won);
}
$('coloring-reset').addEventListener('click', () => { colors = Array(6).fill(null); paint = 0; levels.coloring = 0; renderColoring(); });
const renders = {sorting: renderSorting, schedule: renderSchedule, coloring: renderColoring};
for (const id of Object.keys(renders)) $(`${id}-hint`).addEventListener('click', () => { levels[id] = Math.min(3, levels[id] + 1); renders[id](); });
function renderLanguage() {
  root.querySelectorAll('[data-b-text]').forEach(element => { element.textContent = exploreBText(element.dataset.bText); });
  root.querySelectorAll('[data-b-aria]').forEach(element => { element.setAttribute('aria-label', exploreBText(element.dataset.bAria)); });
  renderSorting(); renderSchedule(); renderColoring();
}
translateDOM(); window.addEventListener('languagechange', renderLanguage); renderLanguage();
window.dispatchEvent(new Event('activitiesready'));
