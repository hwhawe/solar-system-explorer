interface PlanetInfo {
  name: string;
  description: string;
  facts: string[];
}

export const planetData: PlanetInfo[] = [
  {
    name: "Sun",
    description: "Matahari adalah bintang di pusat Tata Surya kita. Dia adalah bola plasma panas yang hampir sempurna, dipanaskan hingga pijar oleh fusi nuklir di intinya. Matahari memancarkan energi dalam jumlah besar yang menopang kehidupan di Bumi.",
    facts: [
      "Diameter: sekitar 1.39 juta kilometer",
      "Umur: sekitar 4.6 miliar tahun",
      "Komposisi: sekitar 74% Hidrogen, 24% Helium",
      "Suhu permukaan: sekitar 5.500 °C"
    ]
  },
  {
    name: "Mercury",
    description: "Merkurius adalah planet terkecil dan terdekat dengan Matahari. Permukaannya berlubang dan mirip dengan Bulan, tanpa atmosfer yang signifikan.",
    facts: [
      "Diameter: sekitar 4.879 km",
      "Suhu permukaan: -173 °C (malam) hingga 427 °C (siang)",
      "Tidak memiliki bulan",
      "Satu hari Merkurius sama dengan 59 hari Bumi"
    ]
  },
  {
    name: "Venus",
    description: "Venus sering disebut 'kembaran Bumi' karena ukuran dan massanya yang serupa, tetapi memiliki atmosfer yang sangat padat dan panas yang menyebabkannya menjadi planet terpanas di Tata Surya.",
    facts: [
      "Diameter: sekitar 12.104 km",
      "Suhu permukaan: sekitar 462 °C",
      "Memiliki efek rumah kaca yang ekstrem",
      "Berotasi berlawanan arah dengan sebagian besar planet"
    ]
  },
  {
    name: "Earth",
    description: "Bumi adalah satu-satunya planet yang diketahui memiliki kehidupan. Dengan air cair di permukaannya dan atmosfer yang kaya oksigen, ia adalah rumah bagi berbagai macam spesies.",
    facts: [
      "Diameter: sekitar 12.742 km",
      "Suhu rata-rata: sekitar 15 °C",
      "Memiliki satu bulan",
      "Dikenal sebagai 'Planet Biru'"
    ]
  },
  {
    name: "Mars",
    description: "Mars, atau 'Planet Merah', adalah planet terestrial dengan permukaan yang berdebu, pegunungan, lembah, dan kawah. Ada bukti adanya air di masa lalu dan mungkin masih ada es di bawah permukaannya.",
    facts: [
      "Diameter: sekitar 6.779 km",
      "Suhu permukaan: -153 °C hingga 20 °C",
      "Memiliki dua bulan: Phobos dan Deimos",
      "Memiliki gunung berapi terbesar di Tata Surya, Olympus Mons"
    ]
  },
  {
    name: "Jupiter",
    description: "Jupiter adalah planet terbesar di Tata Surya, raksasa gas yang sebagian besar terdiri dari hidrogen dan helium. Ia memiliki Great Red Spot, badai raksasa yang telah berlangsung selama berabad-abad.",
    facts: [
      "Diameter: sekitar 139.820 km",
      "Memiliki 95 bulan yang diketahui",
      "Berotasi paling cepat di antara semua planet",
      "Terkenal dengan cincinnya, meskipun tidak sejelas Saturnus"
    ]
  },
  {
    name: "Saturn",
    description: "Saturnus terkenal dengan cincin-cincinnya yang spektakuler, yang terbuat dari miliaran partikel es dan batu. Ia adalah raksasa gas kedua terbesar di Tata Surya.",
    facts: [
      "Diameter: sekitar 116.460 km",
      "Memiliki 146 bulan yang diketahui",
      "Kepadatan rendah, bisa mengapung di air",
      "Sistem cincinnya sangat luas"
    ]
  },
  {
    name: "Uranus",
    description: "Uranus adalah raksasa es yang unik karena berotasi di sisinya, hampir tegak lurus dengan orbitnya. Atmosfernya berwarna biru-hijau karena adanya metana.",
    facts: [
      "Diameter: sekitar 50.724 km",
      "Memiliki 27 bulan yang diketahui",
      "Planet terdingin di Tata Surya",
      "Berotasi dengan kemiringan ekstrem"
    ]
  },
  {
    name: "Neptune",
    description: "Neptunus adalah raksasa es yang jauh dan gelap, menjadi planet terjauh dari Matahari. Dikenal dengan anginnya yang sangat kencang dan badai besar.",
    facts: [
      "Diameter: sekitar 49.244 km",
      "Memiliki 14 bulan yang diketahui",
      "Memiliki Great Dark Spot (badai besar yang menghilang)",
      "Planet paling jauh dari Matahari"
    ]
  }
];