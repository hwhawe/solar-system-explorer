import { Canvas, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei'; // Import OrbitControls
import Planet from './components/Planet';
import CameraControl from './components/CameraControl';
import PlanetInfoPanel from './components/PlanetInfoPanel';
import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Mesh } from 'three'; // Pastikan Mesh diimpor dari three
import { planetData } from './data/planetData'; // Pastikan path ini benar

// --- Komponen Pembantu untuk Logika Scene dan Kamera ---
// Interface untuk props komponen SceneLogic
interface SceneLogicProps {
  currentPlanetIndex: number;
  planetPositions: [number, number, number][];
  planetActualSizes: Vector3[];
  selectedPlanet: typeof planetData[0] | null; // Untuk mengetahui kapan panel aktif
  selectedPlanetMesh: Mesh | null; // <-- Properti penting: Mesh objek planet yang dipilih
  setPanelPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>; // Callback untuk mengatur posisi panel 2D
}

// Komponen ini akan mengelola CameraControl kustom dan OrbitControls kondisional
const SceneLogic: React.FC<SceneLogicProps> = ({
  currentPlanetIndex,
  planetPositions,
  planetActualSizes,
  selectedPlanet,
  selectedPlanetMesh,
  setPanelPosition,
}) => {
  const { camera, gl } = useThree(); // useThree di sini, karena SceneLogic berada di dalam Canvas
  const orbitControlsRef = useRef<any>(null); // Ref untuk OrbitControls global

  // Efek untuk menghitung posisi 2D panel di layar
  useEffect(() => {
    if (selectedPlanet) {
      // Posisi panel (tengah kanan layar)
      const offsetFromEdge = gl.domElement.clientWidth * 0.20;
      const panelX = gl.domElement.clientWidth - offsetFromEdge;
      const panelY = gl.domElement.clientHeight / 2;
      setPanelPosition({ x: panelX, y: panelY });

      // Saat planet dipilih, pastikan OrbitControls menargetkan planet tersebut
      if (orbitControlsRef.current && selectedPlanetMesh) {
        orbitControlsRef.current.target.copy(selectedPlanetMesh.position);
        orbitControlsRef.current.update();
        // Opsional: Atur posisi kamera awal agar tidak terlalu dekat/jauh saat OrbitControls mengambil alih
        // Ini bisa membantu transisi mulus dari CameraControl ke OrbitControls
        const currentPlanetSize = planetActualSizes[currentPlanetIndex];
        const maxDim = Math.max(currentPlanetSize.x, currentPlanetSize.y, currentPlanetSize.z);
        const distance = Math.max(8.0, maxDim * 2.5); // Jarak adaptif yang nyaman

        camera.position.set(
          selectedPlanetMesh.position.x,
          selectedPlanetMesh.position.y,
          selectedPlanetMesh.position.z + distance
        );
        camera.lookAt(selectedPlanetMesh.position);
        camera.updateProjectionMatrix();
      }

    } else {
      setPanelPosition(null);
    }
  }, [selectedPlanet, selectedPlanetMesh, gl.domElement.clientWidth, gl.domElement.clientHeight, setPanelPosition, camera, currentPlanetIndex, planetActualSizes]);

  return (
    <>
      {/* CameraControl kustom (aktif jika tidak ada planet yang dipilih) */}
      <CameraControl
        targetIndex={currentPlanetIndex}
        planetPositions={planetPositions}
        planetActualSizes={planetActualSizes}
        enabled={!selectedPlanet} // Aktif hanya jika tidak ada planet yang dipilih
      />

      {/* OrbitControls - Selalu render, tapi aktifkan/nonaktifkan interaksi */}
      {/* Aktifkan interaksi hanya jika ada planet yang dipilih */}
      <OrbitControls
        ref={orbitControlsRef}
        enabled={Boolean(selectedPlanet && selectedPlanetMesh)} // Aktif hanya jika ada planet yang dipilih DAN mesh tersedia
        enablePan={true} // Aktifkan pan (geser view)
        enableZoom={true} // Aktifkan zoom
        enableRotate={true} // Aktifkan rotasi
        // Batasi zoom agar tidak menembus planet
        minDistance={selectedPlanetMesh ? Math.max(0.5, planetActualSizes[currentPlanetIndex].length() * 0.8) : 1.0}
        maxDistance={selectedPlanetMesh ? Math.max(8.0, planetActualSizes[currentPlanetIndex].length() * 1.5) : 1000} // <-- Diubah: 8.0 dan 1.5
        target={selectedPlanetMesh ? selectedPlanetMesh.position : new Vector3(0,0,0)} // Targetkan posisi mesh yang dipilih
      />
    </>
  );
};
// --- Akhir Komponen Pembantu SceneLogic ---


function App() {
  const planetPositions: [number, number, number][] = [
    [0, 0, 0],    // Matahari (Pusat)
    [10, 0, 0],   // Merkurius (Dekat Matahari)
    [18, 0, 0],   // Venus
    [28, 0, 0],   // Bumi (Jarak standar yang nyaman)
    [40, 0, 0],   // Mars
    [65, 0, 0],   // Jupiter (Lompatan jarak yang lebih besar)
    [95, 0, 0],   // Saturnus
    [125, 0, 0],  // Uranus
    [150, 0, 0]   // Neptunus (Planet terjauh)
  ];

  const planetScales: number[] = [
    5.0,        // Matahari (Paling besar)
    0.5,        // Merkurius (Kecil)
    0.9,        // Venus (Agak kecil, mendekati Bumi)
    1.2,        // Bumi (Ukuran "normal" yang nyaman)
    0.7,        // Mars (Kecil)
    3.0,        // Jupiter (Besar)
    2.5,        // Saturnus (Besar)
    1.8,        // Uranus (Sedang ke Besar)
    1.7         // Neptunus (Sedang ke Besar, mirip Uranus)
  ];

  const [planetActualSizes, setPlanetActualSizes] = useState<Vector3[]>(
    Array(planetPositions.length).fill(new Vector3(0, 0, 0))
  );

  const loadedIndexes = useRef(new Set<number>());
  const [isAllModelsLoaded, setIsAllModelsLoaded] = useState(false);

  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState<typeof planetData[0] | null>(null);
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null);

  const planetRefs = useRef<(Mesh | null)[]>([]);
  const [selectedPlanetMesh, setSelectedPlanetMesh] = useState<Mesh | null>(null);

  // State baru untuk mengontrol visibilitas planet lain saat panel terbuka
  const [showOtherPlanetsWhenPanelOpen, setShowOtherPlanetsWhenPanelOpen] = useState(false);


  useEffect(() => {
    if (loadedIndexes.current.size === planetPositions.length && planetPositions.length > 0) {
      setIsAllModelsLoaded(true);
      console.log("Semua model 3D berhasil dimuat!");
    } else {
      setIsAllModelsLoaded(false);
    }
  }, [loadedIndexes.current.size, planetPositions.length]);

  // Efek untuk menambahkan/menghapus kelas CSS ke body saat panel info planet terbuka/tertutup (untuk blur)
  useEffect(() => {
    if (selectedPlanet) {
      document.body.classList.add('has-info-panel'); // Tambahkan kelas untuk blur
    } else {
      document.body.classList.remove('has-info-panel'); // Hapus kelas blur
    }
  }, [selectedPlanet]);

  // Handler saat planet diklik
  const handlePlanetClick = (planetName: string, index: number) => {
    console.log(`Planet ${planetName} diklik!`);
    setCurrentPlanetIndex(index);
    setSelectedPlanet(planetData[index]); // Panel info akan muncul HANYA DI SINI
    // Simpan mesh yang diklik untuk digunakan oleh SceneLogic
    if (planetRefs.current[index]) {
      setSelectedPlanetMesh(planetRefs.current[index]);
    }
    // Reset toggle visibilitas saat planet baru diklik
    setShowOtherPlanetsWhenPanelOpen(false);
  };

  // Handler untuk navigasi ke planet berikutnya
  const goToNextPlanet = () => {
    setCurrentPlanetIndex((prevIndex) => {
      const newIndex = Math.min(prevIndex + 1, planetPositions.length - 1);
      // Jika panel sedang terbuka, perbarui selectedPlanet dan selectedPlanetMesh
      if (selectedPlanet !== null) { // <-- KONDISI BARU
        setSelectedPlanet(planetData[newIndex]);
        if (planetRefs.current[newIndex]) {
          setSelectedPlanetMesh(planetRefs.current[newIndex]);
        }
      }
      return newIndex;
    });
  };

  // Handler untuk navigasi ke planet sebelumnya
  const goToPrevPlanet = () => {
    setCurrentPlanetIndex((prevIndex) => {
      const newIndex = Math.max(prevIndex - 1, 0);
      // Jika panel sedang terbuka, perbarui selectedPlanet dan selectedPlanetMesh
      if (selectedPlanet !== null) { // <-- KONDISI BARU
        setSelectedPlanet(planetData[newIndex]);
        if (planetRefs.current[newIndex]) {
          setSelectedPlanetMesh(planetRefs.current[newIndex]);
        }
      }
      return newIndex;
    });
  };

  const handlePlanetLoad = useCallback((index: number, size: Vector3) => {
    if (!loadedIndexes.current.has(index)) {
      loadedIndexes.current.add(index);
      setPlanetActualSizes((prevSizes) => {
        const newSizes = [...prevSizes];
        newSizes[index] = size;
        return newSizes;
      });
      setPlanetActualSizes(prev => [...prev]);
    }
  }, []);

  // Handler untuk menutup panel informasi planet
  const handleCloseInfoPanel = () => {
    setSelectedPlanet(null); // Tutup panel
    setSelectedPlanetMesh(null); // Penting: Reset mesh yang dipilih agar OrbitControls mati
    setShowOtherPlanetsWhenPanelOpen(false); // Reset toggle visibilitas saat panel ditutup
  };

  return (
    <div id="canvas-container">
      {/* Teks Proyek dan Model AI */}
      <div className="project-info">
        <p>Proyek: Penjelajah Tata Surya</p>
        <p>Model AI: Granite</p>
      </div>

      {/* Penjelasan Interaksi */}
      <div className="interaction-info">
        <p>Klik planet untuk informasi lebih lanjut dan interaksi AI.</p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }} // Posisi kamera awal dan Field of View
        shadows // Aktifkan shadows jika model Anda memilikinya
      >
        {/* Logika Scene dan Kamera */}
        {isAllModelsLoaded && (
          <SceneLogic
            currentPlanetIndex={currentPlanetIndex}
            planetPositions={planetPositions}
            planetActualSizes={planetActualSizes}
            selectedPlanet={selectedPlanet}
            selectedPlanetMesh={selectedPlanetMesh} // Teruskan mesh yang dipilih
            setPanelPosition={setPanelPosition}
          />
        )}

        {/* Cahaya agar objek terlihat */}
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2} /> {/* Matahari di tengah sebagai sumber cahaya utama */}

        {/* Latar belakang bintang-bintang */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Render semua planet utama */}
        {planetPositions.map((pos, index) => (
          <Planet
            key={`planet-${index}`}
            modelPath={`/models/${planetData[index].name.toLowerCase()}.glb`}
            position={pos}
            scale={planetScales[index]}
            onClick={() => handlePlanetClick(planetData[index].name, index)} // Handler klik planet
            onLoad={(size) => handlePlanetLoad(index, size)} // Callback saat model dimuat untuk mendapatkan ukurannya
            ref={(el) => { planetRefs.current[index] = el; }} // Menggunakan ref untuk menyimpan mesh
            // Visible hanya jika tidak ada selectedPlanet, ATAU ini adalah selectedPlanet,
            // ATAU showOtherPlanetsWhenPanelOpen adalah true (saat panel terbuka tapi user ingin melihat semua)
            visible={!selectedPlanet || selectedPlanet.name === planetData[index].name || showOtherPlanetsWhenPanelOpen}
          />
        ))}
      </Canvas>

      <div className="navigation-buttons">
        <button onClick={goToPrevPlanet} disabled={currentPlanetIndex === 0}>
          &lt; Sebelumnya
        </button>
        <button onClick={goToNextPlanet} disabled={currentPlanetIndex === planetPositions.length - 1}>
          Berikutnya &gt;
        </button>
      </div>

      <PlanetInfoPanel
        planet={selectedPlanet}
        onClose={handleCloseInfoPanel}
        panelPosition={panelPosition}
        // Teruskan state dan setter untuk tombol visibilitas
        showOtherPlanets={showOtherPlanetsWhenPanelOpen}
        onToggleShowOtherPlanets={() => setShowOtherPlanetsWhenPanelOpen(prev => !prev)}
      />

      {!isAllModelsLoaded && (
        <div className="loading-overlay">
          Memuat Model 3D... ({loadedIndexes.current.size}/{planetPositions.length})
        </div>
      )}
    </div>
  );
}

export default App;
