// Space English Adventure - Vocabulario y Preguntas
// Organizado por "Planetas" que representan los niveles progresivos.

const GAME_DATA = {
  planets: [
    {
      id: "planet-1",
      name: "Planeta Arcoíris y Hogar",
      subtitle: "Colors & House (1º Básico)",
      emoji: "🌈",
      color: "#e84393",
      vocabulary: [
        // Colores
        { word: "red", translation: "rojo", emoji: "🔴", category: "colors" },
        { word: "blue", translation: "azul", emoji: "🔵", category: "colors" },
        { word: "green", translation: "verde", emoji: "🟢", category: "colors" },
        { word: "yellow", translation: "amarillo", emoji: "🟡", category: "colors" },
        { word: "orange", translation: "naranja", emoji: "🟠", category: "colors" },
        { word: "purple", translation: "morado", emoji: "🟣", category: "colors" },
        { word: "pink", translation: "rosado", emoji: "💗", category: "colors" },
        { word: "brown", translation: "marrón", emoji: "🟤", category: "colors" },
        { word: "black", translation: "negro", emoji: "⚫", category: "colors" },
        { word: "white", translation: "blanco", emoji: "⚪", category: "colors" },
        // Casa
        { word: "kitchen", translation: "cocina", emoji: "🍳", category: "house" },
        { word: "bedroom", translation: "dormitorio", emoji: "🛏️", category: "house" },
        { word: "bathroom", translation: "baño", emoji: "🚿", category: "house" },
        { word: "living room", translation: "sala de estar", emoji: "🛋️", category: "house" },
        { word: "garden", translation: "jardín", emoji: "🏡", category: "house" },
        { word: "garage", translation: "garaje", emoji: "🚗", category: "house" },
        { word: "dining room", translation: "comedor", emoji: "🍽️", category: "house" }
      ]
    },
    {
      id: "planet-2",
      name: "Planeta Salvaje y Juguetes",
      subtitle: "Animals & Toys (1º Básico)",
      emoji: "🦁",
      color: "#fdcb6e",
      vocabulary: [
        // Animales
        { word: "dog", translation: "perro", emoji: "🐶", category: "animals" },
        { word: "cat", translation: "gato", emoji: "🐱", category: "animals" },
        { word: "bird", translation: "pájaro", emoji: "🐦", category: "animals" },
        { word: "fish", translation: "pez", emoji: "🐟", category: "animals" },
        { word: "rabbit", translation: "conejo", emoji: "🐰", category: "animals" },
        { word: "mouse", translation: "ratón", emoji: "🐭", category: "animals" },
        { word: "lion", translation: "león", emoji: "🦁", category: "animals" },
        { word: "elephant", translation: "elefante", emoji: "🐘", category: "animals" },
        { word: "monkey", translation: "mono", emoji: "🐵", category: "animals" },
        { word: "tiger", translation: "tigre", emoji: "🐯", category: "animals" },
        // Juguetes
        { word: "ball", translation: "pelota", emoji: "⚽", category: "toys" },
        { word: "doll", translation: "muñeca", emoji: "🪆", category: "toys" },
        { word: "car", translation: "auto", emoji: "🏎️", category: "toys" },
        { word: "train", translation: "tren", emoji: "🚂", category: "toys" },
        { word: "blocks", translation: "bloques", emoji: "🧱", category: "toys" },
        { word: "teddy bear", translation: "oso de peluche", emoji: "🧸", category: "toys" },
        { word: "kite", translation: "volantín", emoji: "🪁", category: "toys" },
        { word: "puzzle", translation: "rompecabezas", emoji: "🧩", category: "toys" }
      ]
    },
    {
      id: "planet-3",
      name: "Planeta de la Escuela",
      subtitle: "School Supplies (1º Básico)",
      emoji: "🎒",
      color: "#0984e3",
      vocabulary: [
        { word: "pencil", translation: "lápiz", emoji: "✏️", category: "school" },
        { word: "pen", translation: "lápiz pasta", emoji: "🖊️", category: "school" },
        { word: "eraser", translation: "goma de borrar", emoji: "🧼", category: "school" },
        { word: "ruler", translation: "regla", emoji: "📏", category: "school" },
        { word: "book", translation: "libro", emoji: "📖", category: "school" },
        { word: "notebook", translation: "cuaderno", emoji: "📓", category: "school" },
        { word: "schoolbag", translation: "mochila", emoji: "🎒", category: "school" },
        { word: "pencil case", translation: "estuche", emoji: "👝", category: "school" },
        { word: "sharpener", translation: "sacapuntas", emoji: "✏️", category: "school" },
        { word: "scissors", translation: "tijeras", emoji: "✂️", category: "school" }
      ]
    },
    {
      id: "planet-4",
      name: "Planeta Meteorológico",
      subtitle: "Weather & Greetings (2º Básico - U1)",
      emoji: "⚡",
      color: "#00cec9",
      vocabulary: [
        // Clima
        { word: "cloudy", translation: "nublado", emoji: "☁️", category: "weather" },
        { word: "fall", translation: "otoño", emoji: "🍂", category: "weather" },
        { word: "hot", translation: "caluroso", emoji: "🥵", category: "weather" },
        { word: "spring", translation: "primavera", emoji: "🌸", category: "weather" },
        { word: "summer", translation: "verano", emoji: "☀️", category: "weather" },
        { word: "winter", translation: "invierno", emoji: "❄️", category: "weather" },
        { word: "sunny", translation: "soleado", emoji: "🌞", category: "weather" },
        { word: "cold", translation: "frío", emoji: "🥶", category: "weather" },
        { word: "windy", translation: "ventoso", emoji: "💨", category: "weather" },
        { word: "rainy", translation: "lluvioso", emoji: "🌧️", category: "weather" },
        // Saludos
        { word: "good morning", translation: "buenos días", emoji: "🌅", category: "greetings" },
        { word: "good afternoon", translation: "buenas tardes", emoji: "☀️", category: "greetings" },
        { word: "good evening", translation: "buenas noches (al llegar)", emoji: "🌆", category: "greetings" },
        { word: "good night", translation: "buenas noches (al dormir)", emoji: "🌌", category: "greetings" }
      ]
    },
    {
      id: "planet-5",
      name: "Planeta Bicho-Numérico",
      subtitle: "Numbers & Insects (2º Básico - U2)",
      emoji: "🐜",
      color: "#6c5ce7",
      vocabulary: [
        // Números
        { word: "one", translation: "uno", emoji: "1️⃣", category: "numbers" },
        { word: "two", translation: "dos", emoji: "2️⃣", category: "numbers" },
        { word: "three", translation: "tres", emoji: "3️⃣", category: "numbers" },
        { word: "four", translation: "cuatro", emoji: "4️⃣", category: "numbers" },
        { word: "five", translation: "cinco", emoji: "5️⃣", category: "numbers" },
        { word: "six", translation: "seis", emoji: "6️⃣", category: "numbers" },
        { word: "seven", translation: "siete", emoji: "7️⃣", category: "numbers" },
        { word: "eight", translation: "ocho", emoji: "8️⃣", category: "numbers" },
        { word: "nine", translation: "nueve", emoji: "9️⃣", category: "numbers" },
        { word: "ten", translation: "diez", emoji: "🔟", category: "numbers" },
        { word: "eleven", translation: "once", emoji: "🔢", category: "numbers" },
        { word: "twelve", translation: "doce", emoji: "🔢", category: "numbers" },
        { word: "thirteen", translation: "trece", emoji: "🔢", category: "numbers" },
        { word: "fourteen", translation: "catorce", emoji: "🔢", category: "numbers" },
        { word: "fifteen", translation: "quince", emoji: "🔢", category: "numbers" },
        { word: "sixteen", translation: "dieciséis", emoji: "🔢", category: "numbers" },
        { word: "seventeen", translation: "diecisiete", emoji: "🔢", category: "numbers" },
        { word: "eighteen", translation: "dieciocho", emoji: "🔢", category: "numbers" },
        { word: "nineteen", translation: "diecinueve", emoji: "🔢", category: "numbers" },
        { word: "twenty", translation: "veinte", emoji: "🔢", category: "numbers" },
        // Insectos
        { word: "ant", translation: "hormiga", emoji: "🐜", category: "insects" },
        { word: "bee", translation: "abeja", emoji: "🐝", category: "insects" },
        { word: "firefly", translation: "luciérnaga", emoji: "💡", category: "insects" },
        { word: "ladybug", translation: "chinita", emoji: "🐞", category: "insects" },
        { word: "grasshopper", translation: "saltamontes", emoji: "🦗", category: "insects" },
        { word: "caterpillar", translation: "oruga", emoji: "🐛", category: "insects" },
        { word: "spider", translation: "araña", emoji: "🕷️", category: "insects" },
        { word: "butterfly", translation: "mariposa", emoji: "🦋", category: "insects" }
      ]
    },
    {
      id: "planet-6",
      name: "Planeta Celebración y Familia",
      subtitle: "Birthday, Family & Prepositions (2º Básico - U3)",
      emoji: "🎂",
      color: "#ff7675",
      vocabulary: [
        // Cumpleaños y Familia
        { word: "balloon", translation: "globo", emoji: "🎈", category: "birthday" },
        { word: "cake", translation: "torta", emoji: "🎂", category: "birthday" },
        { word: "candle", translation: "vela", emoji: "🕯️", category: "birthday" },
        { word: "gift", translation: "regalo", emoji: "🎁", category: "birthday" },
        { word: "chest", translation: "baúl", emoji: "📦", category: "birthday" },
        { word: "present", translation: "obsequio", emoji: "🎁", category: "birthday" },
        { word: "popcorn", translation: "cabritas", emoji: "🍿", category: "birthday" },
        { word: "sandwich", translation: "sándwich", emoji: "🥪", category: "birthday" },
        { word: "table", translation: "mesa", emoji: "🟫", category: "birthday" },
        { word: "grandma", translation: "abuela", emoji: "👵", category: "family" },
        { word: "birthday", translation: "cumpleaños", emoji: "🎉", category: "birthday" },
        { word: "dad", translation: "papá", emoji: "👨", category: "family" },
        { word: "aunt", translation: "tía", emoji: "👩", category: "family" },
        { word: "brother", translation: "hermano", emoji: "👦", category: "family" },
        { word: "sister", translation: "hermana", emoji: "👧", category: "family" },
        { word: "uncle", translation: "tío", emoji: "👨‍🦰", category: "family" },
        { word: "night", translation: "noche", emoji: "🌃", category: "birthday" },
        { word: "mom", translation: "mamá", emoji: "👩‍🦱", category: "family" },
        { word: "cousin", translation: "primo / prima", emoji: "🧑", category: "family" },
        { word: "grandpa", translation: "abuelo", emoji: "👴", category: "family" }
      ],
      specialQuestions: [
        // Preposiciones con lógica especial de imágenes o frases
        { 
          type: "preposition", 
          phrase: "The alien is ___ the box.", 
          preposition: "in", 
          translation: "El alien está dentro de la caja.", 
          options: ["in", "on", "under"],
          visual: "📦👽 (dentro)" 
        },
        { 
          type: "preposition", 
          phrase: "The rocket is ___ the planet.", 
          preposition: "on", 
          translation: "El cohete está sobre el planeta.", 
          options: ["in", "on", "under"],
          visual: "🚀🪐 (sobre)" 
        },
        { 
          type: "preposition", 
          phrase: "The gift is ___ the table.", 
          preposition: "under", 
          translation: "El regalo está debajo de la mesa.", 
          options: ["in", "on", "under"],
          visual: "🟫🎁 (debajo)" 
        }
      ]
    }
  ],
  stickers: [
    { id: "st-rocket", name: "Cohete Dorado", emoji: "🚀", desc: "¡Perfecto en el Planeta 1!" },
    { id: "st-alien", name: "Cosmo Bailarín", emoji: "🕺👽", desc: "¡Perfecto en el Planeta 2!" },
    { id: "st-star", name: "Supernova Radiante", emoji: "🌟", desc: "¡Perfecto en el Planeta 3!" },
    { id: "st-ufo", name: "Platillo Volador", emoji: "🛸", desc: "¡Perfecto en el Planeta 4!" },
    { id: "st-astronaut", name: "Astronauta Pro", emoji: "🧑‍🚀", desc: "¡Perfecto en el Planeta 5!" },
    { id: "st-crown", name: "Rey/Reina del Cosmos", emoji: "👑🪐", desc: "¡Perfecto en el Planeta 6!" }
  ]
};
