import { createAnim, Anim } from '@/components/anim';
import { cn } from '@/utils/cn';
import { ClassValue } from 'clsx';
import { useEffect, useRef } from 'react';

type AnimWrapperProps = {
  className: ClassValue;
};

export function AnimWrapper({ className }: AnimWrapperProps) {
  const anim = useRef<Anim>(null);
  const containingDiv = useRef(null);

  // Create and destroy

  useEffect(() => {
    if (containingDiv.current) {
      const _anim = createAnim();
      if (_anim) {
        anim.current = _anim; // For this comp to communicate with
        const initResult = _anim.init({ parent: containingDiv.current });
        return () => {
          async function delayedDestroy() {
            anim.current = null; // Prevent references from this component
            await initResult; // Ensure the init is complete before destroying (this is required for safe mode compatibility)
            _anim?.destroy(); // This may be async
          }
          delayedDestroy();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Needed to trigger HMR on anim change
  }, [createAnim]); // Triggers HMR when anim function changes

  // Communications
  // via anim.current

  // Notes:
  // `overflow-hidden` is required to stop the canvas pushing out the size of its own container
  return (
    <div ref={containingDiv} className={cn('overflow-hidden', className)} />
  );
}
