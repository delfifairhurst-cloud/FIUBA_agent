// periodic-table.js - Tabla periódica interactiva (118 elementos, sin IA)
const ELEMENTS = [
  {z:1,sym:"H",name:"Hidrógeno",mass:1.008,cat:"no-metal",row:1,col:1,econfig:"1s¹",desc:"Elemento más abundante del universo. Inflamable."},
  {z:2,sym:"He",name:"Helio",mass:4.003,cat:"noble",row:1,col:18,econfig:"1s²",desc:"Gas noble. No se solidifica a presión normal."},
  {z:3,sym:"Li",name:"Litio",mass:6.941,cat:"alcalino",row:2,col:1,econfig:"[He]2s¹",desc:"Metal más ligero. Usado en baterías."},
  {z:4,sym:"Be",name:"Berilio",mass:9.012,cat:"alcalinotérreo",row:2,col:2,econfig:"[He]2s²",desc:"Metal ligero y resistente."},
  {z:5,sym:"B",name:"Boro",mass:10.81,cat:"metaloide",row:2,col:13,econfig:"[He]2s²2p¹",desc:"Necesario para vidrio硼硅."},
  {z:6,sym:"C",name:"Carbono",mass:12.011,cat:"no-metal",row:2,col:14,econfig:"[He]2s²2p²",desc:"Base de la química orgánica. Diamante y grafito."},
  {z:7,sym:"N",name:"Nitrógeno",mass:14.007,cat:"no-metal",row:2,col:15,econfig:"[He]2s²2p³",desc:"78% de la atmósfera. Usado en fertilizantes."},
  {z:8,sym:"O",name:"Oxígeno",mass:15.999,cat:"no-metal",row:2,col:16,econfig:"[He]2s²2p⁴",desc:"Esencial para respiración y combustión."},
  {z:9,sym:"F",name:"Flúor",mass:18.998,cat:"halógeno",row:2,col:17,econfig:"[He]2s²2p⁵",desc:"El elemento más electronegativo."},
  {z:10,sym:"Ne",name:"Neón",mass:20.18,cat:"noble",row:2,col:18,econfig:"[He]2s²2p⁶",desc:"Usado en neones y láseres."},
  {z:11,sym:"Na",name:"Sodio",mass:22.99,cat:"alcalino",row:3,col:1,econfig:"[Ne]3s¹",desc:"Reacciona violentamente con agua."},
  {z:12,sym:"Mg",name:"Magnesio",mass:24.305,cat:"alcalinotérreo",row:3,col:2,econfig:"[Ne]3s²",desc:"Ligero y resistente. Usado en aviación."},
  {z:13,sym:"Al",name:"Aluminio",mass:26.982,cat:"post-transición",row:3,col:13,econfig:"[Ne]3s²3p¹",desc:"Metal más abundante en la corteza terrestre."},
  {z:14,sym:"Si",name:"Silicio",mass:28.086,cat:"metaloide",row:3,col:14,econfig:"[Ne]3s²3p²",desc:"Base de la industria de semiconductores."},
  {z:15,sym:"P",name:"Fósforo",mass:30.974,cat:"no-metal",row:3,col:15,econfig:"[Ne]3s²3p³",desc:"Esencial para ADN y huesos."},
  {z:16,sym:"S",name:"Azufre",mass:32.065,cat:"no-metal",row:3,col:16,econfig:"[Ne]3s²3p⁴",desc:"Amarillo. Usado en vulcanización y ácido sulfúrico."},
  {z:17,sym:"Cl",name:"Cloro",mass:35.453,cat:"halógeno",row:3,col:17,econfig:"[Ne]3s²3p⁵",desc:"Desinfectante. Compuesto de sal de mesa."},
  {z:18,sym:"Ar",name:"Argón",mass:39.948,cat:"noble",row:3,col:18,econfig:"[Ne]3s²3p⁶",desc:"0.93% de la atmósfera. Usado en soldadura."},
  {z:19,sym:"K",name:"Potasio",mass:39.098,cat:"alcalino",row:4,col:1,econfig:"[Ar]4s¹",desc:"Esencial para nervios y músculos."},
  {z:20,sym:"Ca",name:"Calcio",mass:40.078,cat:"alcalinotérreo",row:4,col:2,econfig:"[Ar]4s²",desc:"Forma huesos y dientes. Quinto más abundante."},
  {z:21,sym:"Sc",name:"Escandio",mass:44.956,cat:"transición",row:4,col:3,econfig:"[Ar]3d¹4s²",desc:"Metal ligero. Usado en aleaciones."},
  {z:22,sym:"Ti",name:"Titanio",mass:47.867,cat:"transición",row:4,col:4,econfig:"[Ar]3d²4s²",desc:"Resistente y liviano. Usado en implantes."},
  {z:23,sym:"V",name:"Vanadio",mass:50.942,cat:"transición",row:4,col:5,econfig:"[Ar]3d³4s²",desc:"Endurece el acero."},
  {z:24,sym:"Cr",name:"Cromo",mass:51.996,cat:"transición",row:4,col:6,econfig:"[Ar]3d⁵4s¹",desc:"Muy duro. Usado en cromado."},
  {z:25,sym:"Mn",name:"Manganeso",mass:54.938,cat:"transición",row:4,col:7,econfig:"[Ar]3d⁵4s²",desc:"Desoxidante en la producción de acero."},
  {z:26,sym:"Fe",name:"Hierro",mass:55.845,cat:"transición",row:4,col:8,econfig:"[Ar]3d⁶4s²",desc:"Metal más usado. Base del acero."},
  {z:27,sym:"Co",name:"Cobalto",mass:58.933,cat:"transición",row:4,col:9,econfig:"[Ar]3d⁷4s²",desc:"Azul cobalto. Imán permanente."},
  {z:28,sym:"Ni",name:"Níquel",mass:58.693,cat:"transición",row:4,col:10,econfig:"[Ar]3d⁸4s²",desc:"Resistente a corrosión. Monedas."},
  {z:29,sym:"Cu",name:"Cobre",mass:63.546,cat:"transición",row:4,col:11,econfig:"[Ar]3d¹⁰4s¹",desc:"Excelente conductor. Tuberías y cables."},
  {z:30,sym:"Zn",name:"Zinc",mass:65.38,cat:"transición",row:4,col:12,econfig:"[Ar]3d¹⁰4s²",desc:"Protección contra corrosión (galvanizado)."},
  {z:31,sym:"Ga",name:"Galio",mass:69.723,cat:"post-transición",row:4,col:13,econfig:"[Ar]3d¹⁰4s²4p¹",desc:"Se funde en la mano. Usado en semiconductores."},
  {z:32,sym:"Ge",name:"Germanio",mass:72.64,cat:"metaloide",row:4,col:14,econfig:"[Ar]3d¹⁰4s²4p²",desc:"Semiconductores y fibra óptica."},
  {z:33,sym:"As",name:"Arsénico",mass:74.922,cat:"metaloide",row:4,col:15,econfig:"[Ar]3d¹⁰4s²4p³",desc:"Tóxico. Usado en semiconductores."},
  {z:34,sym:"Se",name:"Selenio",mass:78.96,cat:"no-metal",row:4,col:16,econfig:"[Ar]3d¹⁰4s²4p⁴",desc:"Esencial en trazas. Celdas solares."},
  {z:35,sym:"Br",name:"Bromo",mass:79.904,cat:"halógeno",row:4,col:17,econfig:"[Ar]3d¹⁰4s²4p⁵",desc:"Único halógeno líquido a T° amb."},
  {z:36,sym:"Kr",name:"Kriptón",mass:83.798,cat:"noble",row:4,col:18,econfig:"[Ar]3d¹⁰4s²4p⁶",desc:"Usado en iluminación y láseres."},
  {z:37,sym:"Rb",name:"Rubidio",mass:85.468,cat:"alcalino",row:5,col:1,econfig:"[Kr]5s¹",desc:"Reacciona explosivamente con agua."},
  {z:38,sym:"Sr",name:"Estroncio",mass:87.62,cat:"alcalinotérreo",row:5,col:2,econfig:"[Kr]5s²",desc:"Fuegos artificiales rojos."},
  {z:39,sym:"Y",name:"Itrio",mass:88.906,cat:"transición",row:5,col:3,econfig:"[Kr]4d¹5s²",desc:"Usado en LEDs y superconductores."},
  {z:40,sym:"Zr",name:"Circonio",mass:91.224,cat:"transición",row:5,col:4,econfig:"[Kr]4d²5s²",desc:"Resistente a corrosión. Reactores nucleares."},
  {z:41,sym:"Nb",name:"Niobio",mass:92.906,cat:"transición",row:5,col:5,econfig:"[Kr]4d⁴5s¹",desc:"Superconductor. Aleaciones de acero."},
  {z:42,sym:"Mo",name:"Molibdeno",mass:95.96,cat:"transición",row:5,col:6,econfig:"[Kr]4d⁵5s¹",desc:"Muy alto punto de fusión. Lubricantes."},
  {z:43,sym:"Tc",name:"Tecnecio",mass:98,cat:"transición",row:5,col:7,econfig:"[Kr]4d⁵5s²",desc:"Primer elemento artificialmente producido."},
  {z:44,sym:"Ru",name:"Rutenio",mass:101.07,cat:"transición",row:5,col:8,econfig:"[Kr]4d⁷5s¹",desc:"Catalizador. Electrónica."},
  {z:45,sym:"Rh",name:"Rodio",mass:102.906,cat:"transición",row:5,col:9,econfig:"[Kr]4d⁸5s¹",desc:"Muy caro. Catalizadores automotrices."},
  {z:46,sym:"Pd",name:"Paladio",mass:106.42,cat:"transición",row:5,col:10,econfig:"[Kr]4d¹⁰",desc:"Absorción de hidrógeno. Joyería."},
  {z:47,sym:"Ag",name:"Plata",mass:107.868,cat:"transición",row:5,col:11,econfig:"[Kr]4d¹⁰5s¹",desc:"Mejor conductor eléctrico. Joyería."},
  {z:48,sym:"Cd",name:"Cadmio",mass:112.411,cat:"transición",row:5,col:12,econfig:"[Kr]4d¹⁰5s²",desc:"Tóxico. Baterías NiCd."},
  {z:49,sym:"In",name:"Indio",mass:114.818,cat:"post-transición",row:5,col:13,econfig:"[Kr]4d¹⁰5s²5p¹",desc:"Pantallas táctiles (ITO)."},
  {z:50,sym:"Sn",name:"Estaño",mass:118.71,cat:"post-transición",row:5,col:14,econfig:"[Kr]4d¹⁰5s²5p²",desc:"Soldadura. Lata de conservas."},
  {z:51,sym:"Sb",name:"Antimonio",mass:121.76,cat:"metaloide",row:5,col:15,econfig:"[Kr]4d¹⁰5s²5p³",desc:"Retardante de llama. Aleaciones."},
  {z:52,sym:"Te",name:"Telurio",mass:127.6,cat:"metaloide",row:5,col:16,econfig:"[Kr]4d¹⁰5s²5p⁴",desc:"Semiconductores. Celdas solares."},
  {z:53,sym:"I",name:"Yodo",mass:126.904,cat:"halógeno",row:5,col:17,econfig:"[Kr]4d¹⁰5s²5p⁵",desc:"Esencial para tiroides. Desinfectante."},
  {z:54,sym:"Xe",name:"Xenón",mass:131.293,cat:"noble",row:5,col:18,econfig:"[Kr]4d¹⁰5s²5p⁶",desc:"Usado en faros de autos y láseres."},
  {z:55,sym:"Cs",name:"Cesio",mass:132.905,cat:"alcalino",row:6,col:1,econfig:"[Xe]6s¹",desc:"Define el segundo atómico. Relojes atómicos."},
  {z:56,sym:"Ba",name:"Bario",mass:137.327,cat:"alcalinotérreo",row:6,col:2,econfig:"[Xe]6s²",desc:"Rayos X (sulfato de bario). Fuegos artificiales verdes."},
  {z:57,sym:"La",name:"Lantano",mass:138.905,cat:"lantánido",row:9,col:3,econfig:"[Xe]5d¹6s²",desc:"Primer lantánido. Catalizadores de petróleo."},
  {z:58,sym:"Ce",name:"Cerio",mass:140.116,cat:"lantánido",row:9,col:4,econfig:"[Xe]4f¹5d¹6s²",desc:"Más abundante de los lantánidos. Pulido de vidrio."},
  {z:59,sym:"Pr",name:"Praseodimio",mass:140.908,cat:"lantánido",row:9,col:5,econfig:"[Xe]4f³6s²",desc:"Imanes NdFeB. Vidrio de soldadura."},
  {z:60,sym:"Nd",name:"Neodimio",mass:144.242,cat:"lantánido",row:9,col:6,econfig:"[Xe]4f⁴6s²",desc:"Imanes permanentes muy potentes. Láseres."},
  {z:61,sym:"Pm",name:"Prometio",mass:145,cat:"lantánido",row:9,col:7,econfig:"[Xe]4f⁵6s²",desc:"Radiactivo. Fuentes de energía nucleares."},
  {z:62,sym:"Sm",name:"Samario",mass:150.36,cat:"lantánido",row:9,col:8,econfig:"[Xe]4f⁶6s²",desc:"Imanes SmCo. Reactores nucleares."},
  {z:63,sym:"Eu",name:"Europio",mass:151.964,cat:"lantánido",row:9,col:9,econfig:"[Xe]4f⁷6s²",desc:"Fosforo rojo en pantallas. Billetes antifalsificación."},
  {z:64,sym:"Gd",name:"Gadolinio",mass:157.25,cat:"lantánido",row:9,col:10,econfig:"[Xe]4f⁷5d¹6s²",desc:"Contraste en resonancia magnética (IRM)."},
  {z:65,sym:"Tb",name:"Terbio",mass:158.925,cat:"lantánido",row:9,col:11,econfig:"[Xe]4f⁹6s²",desc:"Fosforo verde. Actuadores magnetostrictivos."},
  {z:66,sym:"Dy",name:"Disprosio",mass:162.5,cat:"lantánido",row:9,col:12,econfig:"[Xe]4f¹⁰6s²",desc:"Imanes NdFeB de alta temperatura."},
  {z:67,sym:"Ho",name:"Holmio",mass:164.93,cat:"lantánido",row:9,col:13,econfig:"[Xe]4f¹¹6s²",desc:"Mayor momento magnético de cualquier elemento."},
  {z:68,sym:"Er",name:"Erbio",mass:167.259,cat:"lantánido",row:9,col:14,econfig:"[Xe]4f¹²6s²",desc:"Fibra óptica amplificadora. Láseres médicos."},
  {z:69,sym:"Tm",name:"Tulio",mass:168.934,cat:"lantánido",row:9,col:15,econfig:"[Xe]4f¹³6s²",desc:"Más raro de los lantánidos. Rayos X portátiles."},
  {z:70,sym:"Yb",name:"Iterbio",mass:173.045,cat:"lantánido",row:9,col:16,econfig:"[Xe]4f¹⁴6s²",desc:"Láseres de alta potencia. Aceros inoxidables."},
  {z:71,sym:"Lu",name:"Lutecio",mass:174.967,cat:"lantánido",row:9,col:17,econfig:"[Xe]4f¹⁴5d¹6s²",desc:"Catalizador de petróleo. Detectores PET."},
  {z:72,sym:"Hf",name:"Hafnio",mass:178.49,cat:"transición",row:6,col:4,econfig:"[Xe]4f¹⁴5d²6s²",desc:"Resistente a neutrones. Varillas de control nuclear."},
  {z:73,sym:"Ta",name:"Tantalio",mass:180.948,cat:"transición",row:6,col:5,econfig:"[Xe]4f¹⁴5d³6s²",desc:"Muy resistente a corrosión. Condensadores electrónicos."},
  {z:74,sym:"W",name:"Wolframio",mass:183.84,cat:"transición",row:6,col:6,econfig:"[Xe]4f¹⁴5d⁴6s²",desc:"Mayor punto de fusión (3422°C). Filamentos de bombilla."},
  {z:75,sym:"Re",name:"Renio",mass:186.207,cat:"transición",row:6,col:7,econfig:"[Xe]4f¹⁴5d⁵6s²",desc:"Muy raro. Motores a reacción."},
  {z:76,sym:"Os",name:"Osmio",mass:190.23,cat:"transición",row:6,col:8,econfig:"[Xe]4f¹⁴5d⁶6s²",desc:"Elemento más denso (22.59 g/cm³)."},
  {z:77,sym:"Ir",name:"Iridio",mass:192.217,cat:"transición",row:6,col:9,econfig:"[Xe]4f¹⁴5d⁷6s²",desc:"Muy duro y denso. Buoyías de la balanza del kilogramo."},
  {z:78,sym:"Pt",name:"Platino",mass:195.084,cat:"transición",row:6,col:10,econfig:"[Xe]4f¹⁴5d⁹6s¹",desc:"Catalizador. Joyería. Muy resistente."},
  {z:79,sym:"Au",name:"Oro",mass:196.967,cat:"transición",row:6,col:11,econfig:"[Xe]4f¹⁴5d¹⁰6s¹",desc:"No se corroe. Monedas y joyería."},
  {z:80,sym:"Hg",name:"Mercurio",mass:200.59,cat:"transición",row:6,col:12,econfig:"[Xe]4f¹⁴5d¹⁰6s²",desc:"Único metal líquido a T° amb. Termómetros."},
  {z:81,sym:"Tl",name:"Talio",mass:204.383,cat:"post-transición",row:6,col:13,econfig:"[Xe]4f¹⁴5d¹⁰6s²6p¹",desc:"Muy tóxico. Antiguamente en venenos para ratas."},
  {z:82,sym:"Pb",name:"Plomo",mass:207.2,cat:"post-transición",row:6,col:14,econfig:"[Xe]4f¹⁴5d¹⁰6s²6p²",desc:"Denso. Radiación. Antiguamente en gasolina."},
  {z:83,sym:"Bi",name:"Bismuto",mass:208.98,cat:"post-transición",row:6,col:15,econfig:"[Xe]4f¹⁴5d¹⁰6s²6p³",desc:"Cristales de colores. Medicinas y cosméticos."},
  {z:84,sym:"Po",name:"Polonio",mass:209,cat:"post-transición",row:6,col:16,econfig:"[Xe]4f¹⁴5d¹⁰6s²6p⁴",desc:"Muy radiactivo. Descubierto por Marie Curie."},
  {z:85,sym:"At",name:"Astato",mass:210,cat:"halógeno",row:6,col:17,econfig:"[Xe]4f¹⁴5d¹⁰6s²6p⁵",desc:"Elemento más raro de la corteza terrestre."},
  {z:86,sym:"Rn",name:"Radón",mass:222,cat:"noble",row:6,col:18,econfig:"[Xe]4f¹⁴5d¹⁰6s²6p⁶",desc:"Gas radiactivo. Riesgo en edificios."},
  {z:87,sym:"Fr",name:"Francio",mass:223,cat:"alcalino",row:7,col:1,econfig:"[Rn]7s¹",desc:"Muy radiactivo e inestable. Raro."},
  {z:88,sym:"Ra",name:"Radio",mass:226,cat:"alcalinotérreo",row:7,col:2,econfig:"[Rn]7s²",desc:"Descubierto por Marie Curie. Radiactivo."},
  {z:89,sym:"Ac",name:"Actinio",mass:227,cat:"actínido",row:10,col:3,econfig:"[Rn]6d¹7s²",desc:"Primer actínido. Radiactivo."},
  {z:90,sym:"Th",name:"Torio",mass:232.038,cat:"actínido",row:10,col:4,econfig:"[Rn]6d²7s²",desc:"Potencial combustible nuclear. Faros."},
  {z:91,sym:"Pa",name:"Protactinio",mass:231.036,cat:"actínido",row:10,col:5,econfig:"[Rn]5f²6d¹7s²",desc:"Muy radiactivo y raro."},
  {z:92,sym:"U",name:"Uranio",mass:238.029,cat:"actínido",row:10,col:6,econfig:"[Rn]5f³6d¹7s²",desc:"Combustible nuclear. Bomba atómica."},
  {z:93,sym:"Np",name:"Neptunio",mass:237,cat:"actínido",row:10,col:7,econfig:"[Rn]5f⁴6d¹7s²",desc:"Primer transuránico. Radiactivo."},
  {z:94,sym:"Pu",name:"Plutonio",mass:244,cat:"actínido",row:10,col:8,econfig:"[Rn]5f⁶7s²",desc:"Combustible y armas nucleares. Muy radiactivo."},
  {z:95,sym:"Am",name:"Americio",mass:243,cat:"actínido",row:10,col:9,econfig:"[Rn]5f⁷7s²",desc:"Detectores de humo. Investigación."},
  {z:96,sym:"Cm",name:"Curio",mass:247,cat:"actínido",row:10,col:10,econfig:"[Rn]5f⁷6d¹7s²",desc:"Nombrado en honor a Marie y Pierre Curie."},
  {z:97,sym:"Bk",name:"Berkelio",mass:247,cat:"actínido",row:10,col:11,econfig:"[Rn]5f⁹7s²",desc:"Sintetizado en 1949. Radiactivo."},
  {z:98,sym:"Cf",name:"Californio",mass:251,cat:"actínido",row:10,col:12,econfig:"[Rn]5f¹⁰7s²",desc:"Fuente portátil de neutrones. Detectores."},
  {z:99,sym:"Es",name:"Einsteinio",mass:252,cat:"actínido",row:10,col:13,econfig:"[Rn]5f¹¹7s²",desc:"Nombrado en honor a Albert Einstein."},
  {z:100,sym:"Fm",name:"Fermio",mass:257,cat:"actínido",row:10,col:14,econfig:"[Rn]5f¹²7s²",desc:"Solo producido en reactores nucleares."},
  {z:101,sym:"Md",name:"Mendeleivio",mass:258,cat:"actínido",row:10,col:15,econfig:"[Rn]5f¹³7s²",desc:"Nombrado en honor a Mendeléyev."},
  {z:102,sym:"No",name:"Nobelio",mass:259,cat:"actínido",row:10,col:16,econfig:"[Rn]5f¹⁴7s²",desc:"Nombrado en honor a Alfred Nobel."},
  {z:103,sym:"Lr",name:"Lawrencio",mass:262,cat:"actínido",row:10,col:17,econfig:"[Rn]5f¹⁴7s²7p¹",desc:"Elemento más pesado de los actínidos."},
  {z:104,sym:"Rf",name:"Rutherfordio",mass:267,cat:"transición",row:7,col:4,econfig:"[Rn]5f¹⁴6d²7s²",desc:"Elemento superpesado. Muy inestable."},
  {z:105,sym:"Db",name:"Dubnio",mass:268,cat:"transición",row:7,col:5,econfig:"[Rn]5f¹⁴6d³7s²",desc:"Sintetizado artificialmente."},
  {z:106,sym:"Sg",name:"Seaborgio",mass:271,cat:"transición",row:7,col:6,econfig:"[Rn]5f¹⁴6d⁴7s²",desc:"Nombrado en honor a Glenn Seaborg."},
  {z:107,sym:"Bh",name:"Bohrio",mass:270,cat:"transición",row:7,col:7,econfig:"[Rn]5f¹⁴6d⁵7s²",desc:"Nombrado en honor a Niels Bohr."},
  {z:108,sym:"Hs",name:"Hasio",mass:277,cat:"transición",row:7,col:8,econfig:"[Rn]5f¹⁴6d⁶7s²",desc:"Nombrado en honor a Hesse."},
  {z:109,sym:"Mt",name:"Meitnerio",mass:276,cat:"transición",row:7,col:9,econfig:"[Rn]5f¹⁴6d⁷7s²",desc:"Nombrado en honor a Lise Meitner."},
  {z:110,sym:"Ds",name:"Darmstadtio",mass:281,cat:"transición",row:7,col:10,econfig:"[Rn]5f¹⁴6d⁸7s²",desc:"Nombrado en honor a Darmstadt."},
  {z:111,sym:"Rg",name:"Roentgenio",mass:282,cat:"transición",row:7,col:11,econfig:"[Rn]5f¹⁴6d⁹7s²",desc:"Nombrado en honor a Wilhelm Röntgen."},
  {z:112,sym:"Cn",name:"Copernicio",mass:285,cat:"transición",row:7,col:12,econfig:"[Rn]5f¹⁴6d¹⁰7s²",desc:"Nombrado en honor a Nicolás Copérnico."},
  {z:113,sym:"Nh",name:"Nihonio",mass:286,cat:"post-transición",row:7,col:13,econfig:"[Rn]5f¹⁴6d¹⁰7s²7p¹",desc:"Nombre del japonés Nihon."},
  {z:114,sym:"Fl",name:"Flerovio",mass:289,cat:"post-transición",row:7,col:14,econfig:"[Rn]5f¹⁴6d¹⁰7s²7p²",desc:"Nombrado en honor a Flerov."},
  {z:115,sym:"Mc",name:"Moscovio",mass:290,cat:"post-transición",row:7,col:15,econfig:"[Rn]5f¹⁴6d¹⁰7s²7p³",desc:"Nombrado en honor a Moscú."},
  {z:116,sym:"Lv",name:"Livermorio",mass:293,cat:"post-transición",row:7,col:16,econfig:"[Rn]5f¹⁴6d¹⁰7s²7p⁴",desc:"Nombrado en honor a Livermore."},
  {z:117,sym:"Ts",name:"Teneso",mass:294,cat:"halógeno",row:7,col:17,econfig:"[Rn]5f¹⁴6d¹⁰7s²7p⁵",desc:"Nombre del estado Tennessee."},
  {z:118,sym:"Og",name:"Oganesón",mass:294,cat:"noble",row:7,col:18,econfig:"[Rn]5f¹⁴6d¹⁰7s²7p⁶",desc:"Elemento más pesado conocido. Gas noble superpesado."},
];

const CAT_COLORS = {
  'alcalino': { bg: '#ff6b6b', text: '#fff', label: 'Alcalino' },
  'alcalinotérreo': { bg: '#ffa94d', text: '#fff', label: 'Alcalinotérreo' },
  'transición': { bg: '#ffd43b', text: '#333', label: 'Transición' },
  'post-transición': { bg: '#69db7c', text: '#333', label: 'Post-transición' },
  'metaloide': { bg: '#38d9a9', text: '#fff', label: 'Metaloide' },
  'no-metal': { bg: '#4dabf7', text: '#fff', label: 'No metal' },
  'halógeno': { bg: '#748ffc', text: '#fff', label: 'Halógeno' },
  'noble': { bg: '#da77f2', text: '#fff', label: 'Gas noble' },
  'lantánido': { bg: '#f783ac', text: '#fff', label: 'Lantánido' },
  'actínido': { bg: '#e599f7', text: '#333', label: 'Actínido' },
};

let selectedElement = null;
let ptFilter = 'all';

function renderPeriodicTable() {
  const container = document.getElementById('periodic-view-content');
  if (!container) return;

  const categories = [...new Set(ELEMENTS.map(e => e.cat))];

  let html = `
    <div class="pt-header">
      <h2 class="pt-title">Tabla Periódica</h2>
      <div class="pt-filters">
        <button class="pt-filter-btn ${ptFilter === 'all' ? 'active' : ''}" onclick="window.setPTFilter('all')">Todos</button>
        ${categories.map(c => `<button class="pt-filter-btn ${ptFilter === c ? 'active' : ''}" style="${ptFilter === c ? `background:${CAT_COLORS[c].bg};color:${CAT_COLORS[c].text};border-color:${CAT_COLORS[c].bg}` : ''}" onclick="window.setPTFilter('${c}')">${CAT_COLORS[c].label}</button>`).join('')}
      </div>
    </div>
    <div class="pt-grid-wrapper">
      <div class="pt-grid">`;

  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 18; col++) {
      const el = ELEMENTS.find(e => e.row === row && e.col === col);
      if (!el) {
        if (row === 6 && col === 3) html += `<div class="pt-cell pt-cell-label" style="grid-row:${row};grid-column:${col}"><span>57-71</span><span style="font-size:0.5rem;opacity:0.6">Lantánidos</span></div>`;
        else if (row === 7 && col === 3) html += `<div class="pt-cell pt-cell-label" style="grid-row:${row};grid-column:${col}"><span>89-103</span><span style="font-size:0.5rem;opacity:0.6">Actínidos</span></div>`;
        continue;
      }
      const cat = CAT_COLORS[el.cat] || { bg: '#666', text: '#fff' };
      const dimmed = ptFilter !== 'all' && el.cat !== ptFilter ? 'pt-dimmed' : '';
      html += `<div class="pt-cell ${dimmed}" style="grid-row:${row};grid-column:${col};--el-color:${cat.bg};--el-text:${cat.text}" onclick="window.showElement(${el.z})" title="${el.name}">
        <span class="pt-z">${el.z}</span>
        <span class="pt-sym">${el.sym}</span>
        <span class="pt-mass">${el.mass}</span>
      </div>`;
    }
  }

  html += `</div></div>
    <div id="element-detail" class="pt-detail hidden"></div>
    <div class="pt-legend">
      ${Object.entries(CAT_COLORS).map(([k, v]) => `<div class="pt-legend-item"><span class="pt-legend-dot" style="background:${v.bg}"></span>${v.label}</div>`).join('')}
    </div>`;

  container.innerHTML = html;

  if (selectedElement) showElementDetail(selectedElement);
}

window.setPTFilter = function(f) { ptFilter = f; renderPeriodicTable(); };

window.showElement = function(z) {
  selectedElement = z;
  showElementDetail(z);
};

function showElementDetail(z) {
  const el = ELEMENTS.find(e => e.z === z);
  if (!el) return;
  const detail = document.getElementById('element-detail');
  if (!detail) return;
  const cat = CAT_COLORS[el.cat];
  detail.classList.remove('hidden');
  detail.innerHTML = `
    <div class="pt-detail-card" style="--el-color:${cat.bg}">
      <div class="pt-detail-header" style="background:${cat.bg};color:${cat.text}">
        <div class="pt-detail-num">${el.z}</div>
        <div class="pt-detail-sym">${el.sym}</div>
        <div class="pt-detail-name">${el.name}</div>
      </div>
      <div class="pt-detail-body">
        <div class="pt-detail-row"><span>Masa atómica</span><span>${el.mass} u</span></div>
        <div class="pt-detail-row"><span>Categoría</span><span>${cat.label}</span></div>
        <div class="pt-detail-row"><span>Config. electrónica</span><span>${el.econfig}</span></div>
        <div class="pt-detail-row"><span>Período</span><span>${el.row <= 5 ? el.row : el.row <= 7 ? el.row - 4 : el.row === 9 ? 6 : 7}</span></div>
        <p class="pt-detail-desc">${el.desc}</p>
      </div>
    </div>`;
}

window.renderPeriodicTable = renderPeriodicTable;
