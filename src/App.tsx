import { AnimWrapper } from '@/components/anim-wrapper.tsx';

import { useState } from 'react';

const demoModes = ['fullscreen', 'multi', 'particles'] as const;
type DemoMode = (typeof demoModes)[number];

function stepDemoMode(currentMode: DemoMode, step: 1 | -1) {
  const index = demoModes.indexOf(currentMode) + step;
  return demoModes[
    ((index % demoModes.length) + demoModes.length) % demoModes.length
  ];
}

function App() {
  const [demoMode, setDemoMode] = useState<DemoMode>(demoModes[0]);

  return (
    <div className="flex flex-1">
      {demoMode === 'fullscreen' && (
        <AnimWrapper className={'absolute h-full w-full '} />
      )}
      {demoMode === 'multi' && <div>{demoMode}</div>}
      {demoMode === 'particles' && <div>{demoMode}</div>}

      <div className="absolute flex flex-row bg-black">
        <button
          onClick={() => setDemoMode(stepDemoMode(demoMode, -1))}
          className="bg-red-400 p-1 px-3"
        >
          &lt;
        </button>
        <div className="text-white">{demoMode}</div>
        <button
          onClick={() => setDemoMode(stepDemoMode(demoMode, 1))}
          className="bg-red-400 p-1 px-3"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

// <div className="absolute flex flex-col">
//         <button
//           onClick={() => setCount(count - 1)}
//           className="bg-red-400 p-1 px-3"
//         >
//           -
//         </button>
//         <button
//           onClick={() => setCount(count + 1)}
//           className="bg-red-400 p-1 px-3"
//         >
//           +
//         </button>
//       </div>

export default App;
