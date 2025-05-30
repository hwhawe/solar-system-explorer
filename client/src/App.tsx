import { Canvas, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei'; 
import Planet from './components/Planet';
import CameraControl from './components/CameraControl';
import PlanetInfoPanel from './components/PlanetInfoPanel';
import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Mesh } from 'three'; 
import { planetData } from './data/planetData'; 


interface SceneLogicProps {
  currentPlanetIndex: number;
  planetPositions: [number, number, number][];
  planetActualSizes: Vector3[];
  selectedPlanet: typeof planetData[0] | null; 
  selectedPlanetMesh: Mesh | null; 
  setPanelPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>; 
}


const SceneLogic: React.FC<SceneLogicProps> = ({
  currentPlanetIndex,
  planetPositions,
  planetActualSizes,
  selectedPlanet,
  selectedPlanetMesh,
  setPanelPosition,
}) => {
  const { camera, gl } = useThree(); 
  const orbitControlsRef = useRef<any>(null); 

  
  useEffect(() => {
    if (selectedPlanet) {
      
      const offsetFromEdge = gl.domElement.clientWidth * 0.20;
      const panelX = gl.domElement.clientWidth - offsetFromEdge;
      const panelY = gl.domElement.clientHeight / 2;
      setPanelPosition({ x: panelX, y: panelY });

   
      if (orbitControlsRef.current && selectedPlanetMesh) {
        orbitControlsRef.current.target.copy(selectedPlanetMesh.position);
        orbitControlsRef.current.update();
        
        const currentPlanetSize = planetActualSizes[currentPlanetIndex];
        const maxDim = Math.max(currentPlanetSize.x, currentPlanetSize.y, currentPlanetSize.z);
        const distance = Math.max(8.0, maxDim * 2.5); 

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
   
      <CameraControl
        targetIndex={currentPlanetIndex}
        planetPositions={planetPositions}
        planetActualSizes={planetActualSizes}
        enabled={!selectedPlanet} 
      />

      
      <OrbitControls
        ref={orbitControlsRef}
        enabled={Boolean(selectedPlanet && selectedPlanetMesh)}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        
        minDistance={selectedPlanetMesh ? Math.max(0.5, planetActualSizes[currentPlanetIndex].length() * 0.8) : 1.0}
        maxDistance={selectedPlanetMesh ? Math.max(8.0, planetActualSizes[currentPlanetIndex].length() * 1.5) : 1000} 
        target={selectedPlanetMesh ? selectedPlanetMesh.position : new Vector3(0,0,0)}
      />
    </>
  );
};



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

  
  const [showOtherPlanetsWhenPanelOpen, setShowOtherPlanetsWhenPanelOpen] = useState(false);


  useEffect(() => {
    if (loadedIndexes.current.size === planetPositions.length && planetPositions.length > 0) {
      setIsAllModelsLoaded(true);
      console.log("Semua model 3D berhasil dimuat!");
    } else {
      setIsAllModelsLoaded(false);
    }
  }, [loadedIndexes.current.size, planetPositions.length]);

  
  useEffect(() => {
    if (selectedPlanet) {
      document.body.classList.add('has-info-panel'); 
    } else {
      document.body.classList.remove('has-info-panel'); 
    }
  }, [selectedPlanet]);

  
  const handlePlanetClick = (planetName: string, index: number) => {
    console.log(`Planet ${planetName} diklik!`);
    setCurrentPlanetIndex(index);
    setSelectedPlanet(planetData[index]); 
   
    if (planetRefs.current[index]) {
      setSelectedPlanetMesh(planetRefs.current[index]);
    }
  
    setShowOtherPlanetsWhenPanelOpen(false);
  };

  
  const goToNextPlanet = () => {
    setCurrentPlanetIndex((prevIndex) => {
      const newIndex = Math.min(prevIndex + 1, planetPositions.length - 1);
     
      if (selectedPlanet !== null) { 
        setSelectedPlanet(planetData[newIndex]);
        if (planetRefs.current[newIndex]) {
          setSelectedPlanetMesh(planetRefs.current[newIndex]);
        }
      }
      return newIndex;
    });
  };

 
  const goToPrevPlanet = () => {
    setCurrentPlanetIndex((prevIndex) => {
      const newIndex = Math.max(prevIndex - 1, 0);
     
      if (selectedPlanet !== null) { 
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

  
  const handleCloseInfoPanel = () => {
    setSelectedPlanet(null); 
    setSelectedPlanetMesh(null); 
    setShowOtherPlanetsWhenPanelOpen(false); 
  };

  return (
    <div id="canvas-container">
      
      <div className="project-info">
        <p>Proyek: Penjelajah Tata Surya</p>
        <p>Model AI: IBM Granite</p>
      </div>

 
      <div className="interaction-info">
        <p>Klik planet untuk informasi lebih lanjut dan interaksi AI.</p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }} 
        shadows 
      >
        
        {isAllModelsLoaded && (
          <SceneLogic
            currentPlanetIndex={currentPlanetIndex}
            planetPositions={planetPositions}
            planetActualSizes={planetActualSizes}
            selectedPlanet={selectedPlanet}
            selectedPlanetMesh={selectedPlanetMesh} 
            setPanelPosition={setPanelPosition}
          />
        )}


        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2} /> 

        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {planetPositions.map((pos, index) => (
          <Planet
            key={`planet-${index}`}
            modelPath={`/models/${planetData[index].name.toLowerCase()}.glb`}
            position={pos}
            scale={planetScales[index]}
            onClick={() => handlePlanetClick(planetData[index].name, index)} 
            onLoad={(size) => handlePlanetLoad(index, size)} 
            ref={(el) => { planetRefs.current[index] = el; }} 
            
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
