import { AnimComp } from '@/components/anim-comp';

import { useControls } from 'leva';

const modes = ['fullscreen', 'multi', 'particles'] as const;
// type DemoMode = (typeof demoModes)[number];

function App() {
  const { mode } = useControls({
    mode: {
      options: modes,
      value: modes[2],
    },
  });

  return (
    <div className="flex flex-1">
      {mode === 'fullscreen' && (
        <AnimComp
          picPath="img/pic-a.jpg"
          className={'absolute h-full w-full '}
        />
      )}
      {mode === 'multi' && (
        <div className="flex flex-row p-10 gap-10 items-center justify-center flex-wrap flex-1">
          <AnimComp
            picPath="img/pic-b.jpg"
            className={'w-[320px] h-[240px] rounded-sm'}
          />
          <AnimComp
            picPath="img/pic-a.jpg"
            className={'w-[320px] h-[240px] rounded-sm'}
          />
          <AnimComp
            picPath="img/pic-b.jpg"
            className={'w-[320px] h-[240px] rounded-sm'}
          />
          <AnimComp
            picPath="img/pic-a.jpg"
            className={'w-[320px] h-[240px] rounded-sm'}
          />
        </div>
      )}
      {mode === 'particles' && (
        <div className="absolute w-full h-full p-10 self-stretch">
          <AnimComp
            picPath="img/pic-b.jpg"
            enableParticles={true}
            className={'w-full h-full rounded-sm'}
          />
        </div>
      )}

      {/* <div className="absolute flex flex-row bg-black">
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
      </div> */}
    </div>
  );
}

export default App;
