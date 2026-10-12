// Complete witnesses for the extreme challenges. Viewing these is recorded
// separately from submitting a solution; none of these values enter a draft.
export const ANSWER_FIELDS={
water:['1>2 2>3 3>1 2>3 1>2 2>3 3>1 2>3 1>2 2>3 3>1'],
lights:['1 3 4 5 6 8 9'],
coins:['O O O O R R R L L L R L','O R R R L L O O O L R L','R L O R O R L O L R O L'],
numbers:['2 2 -2 2'],
clock:['8 8 8 8 8 21'],
tiles:['5 6\n11 12\n3 4\n2 7 8\n13 14\n9 10\n17 18\n19 20\n15 16\n23 24\n29 30\n28 34 35\n21 22\n27 33\n25 26\n31 32'],
sums:['1 3 2 4 9 5 11 12 8 7 10 6'],
bridge:['1 2\n1\n3 4\n2\n1 2\n1\n1 5\n1\n1 6'],
takeaway:['1 1\n1 3\n1 3\n1 3\n1 3\n2 1\n2 2'],
path:['A B C A D E C F D B E F A'],
search:['5 6 7 8\n3 4 7 8\n2 4 6 8\n2 3 5 8\n2 3 6 7\n2 4 5 7'],
logic:['2 4 1 5 3','4 1 5 3 2','3 5 2 1 4'],
probability:['1/5','1/15','6/7','4/7'],
sorting:['1>2 4>5 3>5 3>4 2>5 1>4 1>3 2>4 2>3'],
schedule:['1 0\n2 0\n1 3\n2 7\n2 2\n1 10\n2 10'],
coloring:['1 2 1 2 3 1 2 1 2 3 4','2 4 1 6 3 5'],
fractions:['3 4 5 6 20'],
reflection:['ABCDEFGHIK;J;L','ABCDEFGHIK;J;L','-2 -2','1 0','0']
};
export const ANSWER_COPY={
view:['看答案','View answer','Ver solución'],
hide:['收起答案','Hide answer','Ocultar solución'],
title:['答案与解法','Answer and solution','Respuesta y explicación'],
notice:['看答案后，此题皇冠会显示为空心，并保留这个标记。','Viewing the answer makes this crown hollow and keeps that mark.','Al ver la solución, esta corona quedará hueca y conservará esa marca.'],
viewed:['已看过答案：此题皇冠保持空心。','Answer viewed: this crown stays hollow.','Solución vista: esta corona permanece hueca.'],
reason:['为什么可行','Why it works','Por qué funciona'],
construction:['一组完整解法（可对照互动图自己操作）','One complete solution (try the steps in the interactive diagram)','Una solución completa (prueba los pasos en el diagrama interactivo)'],
solvedViewed:['解法通过验证。你看过这题的答案，皇冠保持空心。','Solution verified. You viewed this answer, so the crown stays hollow.','Solución verificada. Como viste esta solución, la corona permanece hueca.'],
proof:['完整证明','Complete proof','Demostración completa']
};
// Extra explanation where a witness alone would not explain decoding or proof.
export const ANSWER_EXPLANATIONS={
water:[
'下面每行给出一次倒水后的 A、B、C 水量；第 0 行是初始状态。每一步都倒到源槽空或目标槽满，没有凭刻度停在中途。',
'Each row below gives A, B, C after one pour; row 0 is the start. Every pour empties its source or fills its destination, without stopping at an unmarked intermediate amount.',
'Cada fila muestra A, B y C después de un trasvase; la fila 0 es el inicio. Cada trasvase vacía el origen o llena el destino, sin detenerse en una cantidad intermedia sin marcar.'
],
lights:[
'第一行按 1、3、4；接着按第二行的 5、6、8，清掉第一行的亮灯；再按第三行的 9，清掉第二行。此时第三、四行也全灭。每个按钮只按一次，共 7 次。',
'Press 1, 3, 4 in row one, then 5, 6, 8 in row two to clear row one. Press 9 in row three to clear row two. Rows three and four are now off too. Each button is pressed once: seven presses.',
'Pulsa 1, 3 y 4 en la primera fila; luego 5, 6 y 8 en la segunda para apagar la primera. Pulsa 9 en la tercera para apagar la segunda. También quedan apagadas la tercera y la cuarta: siete pulsaciones, sin repeticiones.'
],
coins:[
'L=左盘、R=右盘、O=不上秤。每次都是左 4 枚、右 4 枚。解码时，把“左盘较重、右盘较重、平衡”分别记为 L、R、O。表中一枚硬币的三个字母就是它偏重时的结果；它偏轻时交换 L 与 R，O 不变。例如 OOR 表示 1 号偏重，OOL 表示 1 号偏轻。12 个码及其相反码互不相同，也都不是 OOO，因此能区分全部 24 种情况。',
'L=left pan, R=right pan, O=off. Each weighing has four coins per pan. To decode, write L for left heavier, R for right heavier, O for balance. A coin’s three-letter code in the table is its outcome when heavy; when light, swap L and R and leave O unchanged. For example, OOR means coin 1 is heavy; OOL means coin 1 is light. The 12 codes and their opposites are all distinct and none is OOO, distinguishing all 24 cases.',
'L=plato izquierdo, R=plato derecho, O=fuera. Cada pesada lleva cuatro monedas por plato. Para descifrar, escribe L si pesa más la izquierda, R si pesa más la derecha y O si hay equilibrio. El código de cada moneda es su resultado si pesa más; si pesa menos, intercambia L y R y conserva O. Por ejemplo, OOR indica que la moneda 1 pesa más; OOL, que pesa menos. Los 12 códigos y sus opuestos son distintos y ninguno es OOO: distinguen los 24 casos.'
],
numbers:[
'完整分解为 n⁴+4=(n²+2n+2)(n²−2n+2)。由平方差得到恒等式，再分别写成 (n+1)²+1 和 (n−1)²+1，便能确认两个整数因子在整个 n≥2 范围内都大于 1。',
'The full factorisation is n⁴+4=(n²+2n+2)(n²−2n+2). A difference of squares gives the identity. Writing the factors as (n+1)²+1 and (n−1)²+1 shows that both integer factors exceed 1 throughout n≥2.',
'La factorización completa es n⁴+4=(n²+2n+2)(n²−2n+2). La diferencia de cuadrados da la identidad. Los factores (n+1)²+1 y (n−1)²+1 son enteros mayores que 1 para todo n≥2.'
],
clock:[
'位置依次是 0→8→16→24→32→40→1。最后一步从 40 前进 21，按模 60 计算为 61−60=1。',
'The positions are 0→8→16→24→32→40→1. The final step adds 21 to 40; modulo 60, 61−60=1.',
'Las posiciones son 0→8→16→24→32→40→1. El último paso suma 21 a 40; módulo 60, 61−60=1.'
],
tiles:[
'两块 L 覆盖 {2,7,8} 与 {28,34,35}；其余 14 行各是一块多米诺。格号按行排列，逐块核对共边、形状和已用格，34 格恰好各覆盖一次。',
'The two L pieces cover {2,7,8} and {28,34,35}; the other 14 rows are dominoes. With row-wise cell numbers, check shared edges, shapes and used cells: all 34 remaining cells are covered exactly once.',
'Las dos L cubren {2,7,8} y {28,34,35}; las otras 14 filas son dominós. Con las casillas numeradas por filas, comprueba lados compartidos, formas y casillas usadas: las 34 casillas restantes quedan cubiertas una sola vez.'
],
sums:[
'六条线逐一核对：ACGH=1+2+11+12，CEIJ=2+9+8+7，EAKL=9+1+10+6，BDGI=3+4+11+8，DFJK=4+5+7+10，FBHL=5+3+12+6；全部等于 26。每点被两条线计入，所以公共线和必为 2×78÷6=26。',
'Check each line: ACGH=1+2+11+12, CEIJ=2+9+8+7, EAKL=9+1+10+6, BDGI=3+4+11+8, DFJK=4+5+7+10, FBHL=5+3+12+6. All equal 26. Each point is counted twice, forcing the common sum to be 2×78÷6=26.',
'Comprueba cada línea: ACGH=1+2+11+12, CEIJ=2+9+8+7, EAKL=9+1+10+6, BDGI=3+4+11+8, DFJK=4+5+7+10, FBHL=5+3+12+6. Todas suman 26. Cada punto se cuenta dos veces: la suma común debe ser 2×78÷6=26.'
],
bridge:[
'→ 表示带灯去右岸，← 表示带灯返回左岸。表中的“本次”是较慢者的用时。载荷最大的组合也只有 4；最后所有人及灯都在右岸，累计 49 分钟。',
'→ carries the lamp right; ← brings it left. Each step takes the slower person’s time. No group has a load above 4. Everyone and the lamp finish on the right in 49 minutes.',
'→ lleva la lámpara a la derecha; ← la devuelve a la izquierda. Cada cruce tarda lo que la persona más lenta. Ningún grupo supera la carga 4. Todas las personas y la lámpara terminan a la derecha en 49 minutos.'
],
takeaway:[
'下面的“堆号 数量”只记录你的回合；电脑会自动回应。先从第 1 堆取 1 个。电脑改变某堆余数后，你要把两个余数重新配成一样；不必总从同一堆取。比如 (2,3) 时从第 2 堆取 1，得到 (2,2)。终局 (0,2) 再取第 2 堆 2 个，拿到最后一个。所列完整走法对应本题电脑的固定回应规则。',
'The “heap amount” rows record only your turns; the computer replies automatically. Start by taking one from heap 1. After the computer changes a remainder, make the two remainders equal again; the heap you use may change. At (2,3), take one from heap 2 to get (2,2). At (0,2), take the last two from heap 2 and win. The full sequence shown matches this puzzle’s fixed computer reply rule.',
'Las filas «montón cantidad» solo registran tus turnos; el ordenador responde automáticamente. Empieza quitando uno del montón 1. Después de que cambie un resto, iguala ambos restos de nuevo; puedes cambiar de montón. En (2,3), quita uno del montón 2 para obtener (2,2). En (0,2), quita los dos últimos del montón 2 y gana. La secuencia completa corresponde a la regla fija de respuesta de este reto.'
],
path:[
'按给出的顶点顺序走，边依次是 AB、BC、CA、AD、DE、EC、CF、FD、DB、BE、EF、FA。每条有向边只用一次，颜色依次红、蓝交替，最后回到 A。这里的“经过同一个点多次”允许，“重复同一条边”不允许。',
'Following the vertex sequence uses AB, BC, CA, AD, DE, EC, CF, FD, DB, BE, EF, FA. Each directed edge is used once, colours alternate red and blue, and the route returns to A. Revisiting a vertex is allowed; reusing an edge is not.',
'La secuencia usa AB, BC, CA, AD, DE, EC, CF, FD, DB, BE, EF y FA. Recorre cada arista dirigida una vez, alterna rojo y azul y vuelve a A. Se permite volver a un vértice, pero no repetir una arista.'
],
search:[
'六行集合分别就是六个问题：“秘密数是否在这一行里？”回答是记 1，否记 0。表中是每个秘密数的正确六位回答。收到回答后，找与它相差至多一位的码字；这样的码字最多一个。示例：收到 001101，只与数 2 的 001111 相差一位，所以秘密数是 2。',
'Each of the six sets asks, “Is the secret number in this row?” Encode yes as 1 and no as 0. The table gives the correct six-bit answers for each number. Decode by finding the codeword differing from the received answer in at most one bit; there is at most one. For example, 001101 differs in one bit from number 2’s 001111, so the number is 2.',
'Cada conjunto pregunta: «¿Está el número secreto en esta fila?» Usa 1 para sí y 0 para no. La tabla muestra las seis respuestas correctas de cada número. Busca el código que difiera de las respuestas recibidas en como máximo un bit; hay a lo sumo uno. Por ejemplo, 001101 difiere en un bit de 001111, el código del número 2: el secreto es 2.'
],
logic:[
'表中的屋号从左到右为 1–5。可先串联 Q 紧左 A 与 Q 同屋 X，得到“Q/X 紧左 A”；再串联 D 同屋 V 与 D 邻 P，以及 E 紧左 Y 与 E 邻 W。对这些小组尝试位置，并用 C 与 S 相距两屋、C 邻 W、T 邻 X 和每类不重复排除冲突，最终只剩表中排列。输入框要写 A–E、P–T、U–Y 各对象所在的屋号，不是每屋对象的顺序。',
'Houses run left to right as 1–5. Combine Q immediately left of A with Q sharing X: Q/X is immediately left of A. Also combine D sharing V with D next to P, and E immediately left of Y with E next to W. Try placements for these groups, then eliminate conflicts using the C–S distance of two, C next to W, T next to X and no repeats within a category. Only the table’s arrangement survives. The input rows give house numbers for objects A–E, P–T, U–Y, not objects listed house by house.',
'Las casas van de izquierda a derecha del 1 al 5. Combina Q justo a la izquierda de A con Q en la misma casa que X: Q/X queda justo a la izquierda de A. Combina también D con V y junto a P, y E justo a la izquierda de Y y junto a W. Prueba posiciones y descarta conflictos con la distancia de dos entre C y S, C junto a W, T junto a X y sin repetir objetos de cada categoría. Solo queda la disposición de la tabla. Las filas de entrada indican las casas de A–E, P–T y U–Y, no los objetos en orden de casa.'
],
probability:[
'证据是按顺序红、红、蓝，且不放回。A 的似然为 (4/6)(3/5)(2/4)=1/5；B 为 (2/6)(1/5)(4/4)=1/15。乘先验后，A 与 B 的权重为 2/15 和 1/45，比值 6:1，故后验 A=6/7。下一球红的条件概率在 A 下为 2/3、B 下为 0，因此总概率 (6/7)(2/3)+(1/7)×0=4/7。',
'The evidence is red, red, blue in that order, without replacement. Its likelihood under A is (4/6)(3/5)(2/4)=1/5; under B it is (2/6)(1/5)(4/4)=1/15. Multiplying by priors gives weights 2/15 and 1/45, a 6:1 ratio, so posterior A=6/7. The next-red probability is 2/3 under A and 0 under B, giving (6/7)(2/3)+(1/7)×0=4/7.',
'La evidencia es roja, roja, azul, en ese orden y sin reposición. Su probabilidad en A es (4/6)(3/5)(2/4)=1/5; en B, (2/6)(1/5)(4/4)=1/15. Al multiplicar por las probabilidades iniciales, los pesos son 2/15 y 1/45, en proporción 6:1: la posterior de A es 6/7. La próxima roja tiene probabilidad 2/3 en A y 0 en B; en total, (6/7)(2/3)+(1/7)×0=4/7.'
],
sorting:[
'按顺序执行全部 9 个比较器。i>j 表示把较小值放到位置 i，不是无条件交换，也不是比较数值 i 与 j。这套固定网络通过全部 32 种零一输入；零一原则将这个有限检查提升为对任意数值的保证。',
'Execute all nine comparators in order. i>j puts the smaller value at position i; it is neither an unconditional swap nor a comparison of the numbers i and j. This fixed network passes all 32 binary inputs, and the zero-one principle extends that finite check to all numeric values.',
'Ejecuta los nueve comparadores en orden. i>j coloca el menor en la posición i; no es un intercambio incondicional ni compara los números i y j. La red fija supera las 32 entradas binarias; el principio cero-uno extiende esa comprobación a todos los valores numéricos.'
],
schedule:[
'区间写为 [开始,结束)，允许一项结束时另一项立刻开始。仪器依次用于 C：[3,7)、D：[7,10)、F：[10,14)，没有重叠。B 在 2 完成、E 在 4 完成，所以 F 与 G 的全部前置任务都已按时结束。第三台机器可闲置，不影响合法性或最优性。',
'Intervals are [start,end), allowing a task to start exactly when another ends. The instrument runs C:[3,7), D:[7,10), F:[10,14), without overlap. B finishes at 2 and E at 4, so all prerequisites of F and G finish on time. Machine 3 may stay idle; that affects neither validity nor optimality.',
'Los intervalos son [inicio,fin): una tarea puede empezar justo cuando termina otra. El instrumento ejecuta C:[3,7), D:[7,10), F:[10,14), sin solaparse. B termina en 2 y E en 4, así que todos los requisitos de F y G acaban a tiempo. La máquina 3 puede quedar libre sin afectar la validez ni la optimalidad.'
],
coloring:[
'前五个颜色给 v1–v5，接着五个给 u1–u5，最后一个给 w。这给出四色上界；下方按 2→4→1→6→3→5 排列的完整证明说明三色不够，两者合起来才确定最少四色。',
'The first five colours belong to v1–v5, the next five to u1–u5, the last to w. This proves a four-colour upper bound. The full proof below, ordered 2→4→1→6→3→5, rules out three colours. Together they establish that exactly four are needed.',
'Los cinco primeros colores son de v1–v5; los cinco siguientes, de u1–u5; el último, de w. Esto prueba que cuatro bastan. La demostración completa en orden 2→4→1→6→3→5 descarta tres. Ambas partes establecen que se necesitan exactamente cuatro.'
],
fractions:[
'先用上界确定 1/3 必须出现：1/4+1/5+1/6+1/7+1/8<1。尝试接上 1/4、1/5、1/6，四项之和是 19/20，恰好留下允许使用且不重复的 1/20。通分到 60 得到 (20+15+12+10+3)/60=1，五个分母都在 3–20 内。',
'An upper bound forces 1/3: 1/4+1/5+1/6+1/7+1/8<1. Try adding 1/4, 1/5, 1/6; these four terms sum to 19/20, leaving the allowed, distinct term 1/20. With denominator 60, (20+15+12+10+3)/60=1, and all five denominators lie in 3–20.',
'Una cota obliga a usar 1/3: 1/4+1/5+1/6+1/7+1/8<1. Prueba añadir 1/4, 1/5 y 1/6: las cuatro suman 19/20 y dejan 1/20, permitido y sin repetir. Con denominador 60, (20+15+12+10+3)/60=1; los cinco denominadores están entre 3 y 20.'
],
reflection:[
'沿同字母边配对端点并传递合并，A、B、C、D、E、F、G、H、I、K 连成一组；J、L 各自保留，故 V=3。十二条边成六对，E=6；一张多边形给 F=1。I 的每对箭头符号相反，可持续选择正反面；II 中 a 和 c 各出现两次同向，粘合会翻转方向。可定向性是同胚不变量，所以即使 χ 相同，两者也不同胚。',
'Match endpoints of equal-letter edges and close the identifications transitively. A, B, C, D, E, F, G, H, I, K form one group; J and L remain separate, so V=3. Twelve edges form six pairs, E=6, and one polygon gives F=1. In I each pair has opposite arrow signs, allowing a consistent orientation. In II, a and c each occur twice with the same sign, reversing orientation across a seam. Orientability is a homeomorphism invariant, so equal χ does not make the surfaces homeomorphic.',
'Empareja extremos de lados con la misma letra y completa las uniones transitivamente. A, B, C, D, E, F, G, H, I y K forman un grupo; J y L quedan separados: V=3. Doce lados forman seis pares, E=6; un polígono da F=1. En I cada par tiene signos opuestos y permite una orientación coherente. En II, a y c aparecen dos veces con el mismo signo, invirtiendo la orientación al cruzar la unión. La orientabilidad es un invariante de homeomorfismo: tener el mismo χ no hace homeomorfas las superficies.'
]
};
const H=(zh,en,es)=>[zh,en,es];
export const ANSWER_TABLES={
water:{headers:[H('步','Step','Paso'),H('操作','Pour','Trasvase'),H('A（升）','A (L)','A (L)'),H('B（升）','B (L)','B (L)'),H('C（升）','C (L)','C (L)')],rows:[
['0','—',12,0,0],['1','A → B',5,7,0],['2','B → C',5,2,5],['3','C → A',10,2,0],['4','B → C',10,0,2],['5','A → B',3,7,2],['6','B → C',3,4,5],['7','C → A',8,4,0],['8','B → C',8,0,4],['9','A → B',1,7,4],['10','B → C',1,6,5],['11','C → A',6,6,0]]},
coins:{headers:[H('硬币号','Coin','Moneda'),H('偏重时的结果','Outcomes if heavy','Resultados si pesa más')],rows:Array.from({length:12},(_,i)=>[i+1,ANSWER_FIELDS.coins.map(row=>row.split(' ')[i]).join('')])},
bridge:{headers:[H('步','Step','Paso'),H('方向','Direction','Dirección'),H('人号','People','Personas'),H('本次（分钟）','Step (min)','Cruce (min)'),H('累计（分钟）','Total (min)','Total (min)')],rows:[
[1,'→','1, 2',3,3],[2,'←','1',1,4],[3,'→','3, 4',8,12],[4,'←','2',3,15],[5,'→','1, 2',3,18],[6,'←','1',1,19],[7,'→','1, 5',12,31],[8,'←','1',1,32],[9,'→','1, 6',17,49]]},
search:{headers:[H('秘密数','Secret number','Número secreto'),H('正确回答（是=1，否=0）','Correct answers (yes=1, no=0)','Respuestas correctas (sí=1, no=0)')],rows:Array.from({length:8},(_,i)=>[i+1,ANSWER_FIELDS.search[0].split('\n').map(row=>row.split(' ').includes(String(i+1))?'1':'0').join('')])},
logic:{headers:[H('屋号','House','Casa'),H('人','Person','Persona'),H('宠物代号','Pet code','Código de mascota'),H('饮品代号','Drink code','Código de bebida')],rows:[[1,'C','Q','X'],[2,'A','T','W'],[3,'E','S','U'],[4,'B','P','Y'],[5,'D','R','V']]},
schedule:{headers:[H('任务','Task','Tarea'),H('机器号','Machine','Máquina'),H('开始','Start','Inicio'),H('结束','End','Fin')],rows:[['A',1,0,3],['B',2,0,2],['C',1,3,7],['D',2,7,10],['E',2,2,4],['F',1,10,14],['G',2,10,12]]}
};
