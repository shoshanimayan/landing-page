import React, { useState, useRef, useEffect } from "react";
import { Canvas ,useThree} from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from 'three'
import "./styles.css";

const Backend = `http://localhost:8000` 

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Scene({ orbitControlsRef, isRecording, setAnimation ,clip,setClip,exportVid=false, resetExportVideo}) {



  function CamRecord({orbitControlsRef, isRecording, setRecord,clip,setClip,exportVid=false, resetExportVideo})
  {
    const [index,setIndex]= useState(0);
    const [urls,setUrls] = useState([])
    useEffect(()=>{console.log(clip)},[clip])
    const vec = new Vector3()
    const { gl } = useThree();
    const canvas = gl.domElement;

    const uploadDataURls=async ()=>{
        if(urls.length>0&exportVid)
        {
      await fetch(Backend+"/vidMaker/generate/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({images: urls}),
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(data => {
      console.log('Success:', data);
      console.log("XXX")
      handleDownload(data)
    })
    .catch(error => {
      console.error('Error:', error);
    });
        }
        resetExportVideo();
    }

    const handleDownload = (blob) => {
    var url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url
    link.download = "output.mp4";
    document.body.appendChild(link); // Append to body
    link.click();
    document.body.removeChild(link); // Remove from body
  };

    useFrame((state,delta)=>{
      
      if(!isRecording)
      {
        if(clip.length>0)
        {
          if(index<clip.length)
          {
            orbitControlsRef.current.object.position.lerp(vec.set(clip[index].x,clip[index].y,clip[index].z),delta*5)
            if(exportVid)
            {
              const dataURL = canvas.toDataURL('image/png');
             
              setUrls(prev=>[...prev,dataURL])
            }
            setIndex(prev=>
            {
              prev++;
              setIndex(prev);
            }
            )
          }
          else
          {

            setClip([]);
            setIndex(0)
            if(exportVid)
            {
              uploadDataURls()
            }
          }

        }
          
      }
  })
    return (<OrbitControls
      ref={orbitControlsRef}
      clip= {clip}
      setClip={setClip}
      onChange={
        (e)=>{
          if(isRecording)
            {
              let target = e.target;

              setRecord(prev=>{
                let pos = target.object.position
                prev.push({x:pos.x,y:pos.y,z:pos.z})
                return prev;
              })
            }
        }
      }
    />)
  }

  const [record,setRecord]= useState([])
  
  useEffect(()=>{

    if(isRecording)
    {
      setRecord([])
    }
    else
    {
      

      if(record.length>0)
      {
        setAnimation(record)
        setRecord([])

      }
    }

  

  },[isRecording])

  useEffect(()=>{},[clip])

  return (


    <Canvas gl={{ preserveDrawingBuffer: true }}>
      <ambientLight intensity={3.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Model url="https://modelviewer.dev/shared-assets/models/Astronaut.glb" />
      <CamRecord orbitControlsRef={orbitControlsRef} isRecording={isRecording} setRecord={setRecord} clip ={clip} setClip={setClip} exportVid={exportVid} resetExportVideo={resetExportVideo}/>
    </Canvas>
  );
}

function App() {
  const [animationName, setAnimationName] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [exportVid, setExportVid] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [animation, setAnimation] = useState([]);
  const [playedClip, setPlayedClip] = useState([]);


  const orbitControlsRef = useRef();

  const backendCheck=async()=>{
    await fetch(Backend+"/vidMaker/status/").then(response => {
      if (!response.ok) {
        setBackendConnected(false)

        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      if(data.available)
      {
        setBackendConnected(true)
      } 
      else
      {
        setBackendConnected(false)
      }  
    })
    .catch(error => {
      setBackendConnected(false)

      console.error('Error:', error);
    });
  }

  useEffect(() => {
    backendCheck()
  }, []);

  useEffect(() => {
    if (isRecording) {
      setAnimation([]);
    }
    else
    {
     
    }
  }, [isRecording]);

  useEffect(() => {
   
    if (animation.length > 0) {
      setAnimations((prev) => {
        prev.push({ name: animationName, clip: animation });
    
        return prev;
      });
      setAnimation([]);

    }
  }, [isConfiguring]);

  const resetExportVideo=()=>{setExportVid(false)}

  return (
    <div className="app">
      <div className="panel left-panel">
        <Scene
          orbitControlsRef={orbitControlsRef}
          isRecording={isRecording}
          setAnimation={setAnimation}
          clip={playedClip}
          setClip={setPlayedClip} 
          exportVid={exportVid}
          resetExportVideo={resetExportVideo}
        />
      </div>
      <div className="panel right-panel">
        {isConfiguring ? (
          <>
            <input
              type="text"
              value={animationName}
              onChange={(e) => setAnimationName(e.target.value)}
              placeholder="Animation Name"
            />

            <button
              onClick={() => {
                setIsRecording(!isRecording);
              }}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
            <button
              onClick={() => {
                setIsConfiguring(false);
                // push the animation configuration to animations
              }}
            >
              Save Animation
            </button>
          </>
        ) : (
          <>
            {animations &&
              animations.length > 0 &&
              animations.map((a, index) => (
                <div key={index} style={{ display: "flex", gap: "10px" }}>

                  <span>{a.name+" "}</span>
                  <button
                    onClick={() => {
                      setPlayedClip(a.clip)
                    }}
                  >
                    Play
                  </button>
                  {backendConnected&&  <button
                    onClick={() => {
                      setPlayedClip(a.clip)
                      setExportVid(true)
                    }}
                  >
                    Export Video
                  </button>}
                </div>
              ))}
            <button
              onClick={() => {
                setIsConfiguring(true);
              }}
            >
              Add Animation
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
