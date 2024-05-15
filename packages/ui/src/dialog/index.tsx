import * as RadixDialog from '@radix-ui/react-dialog';
import '../index.css';
import './index.css';
import React, { PropsWithChildren } from 'react';
import { IconButton } from '../iconbutton';

export const Dialog = ({
  children,
  ...props
}: PropsWithChildren<RadixDialog.DialogProps>) => (
  <RadixDialog.Root {...props}>
    {/* <RadixDialog.Trigger asChild>
      <button className="Button violet">Edit profile</button>
    </RadixDialog.Trigger> */}
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="osc-DialogOverlay" />
      <RadixDialog.Content style={{zIndex:1000}} className="osc osc-DialogContent">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 10px'}}>
          <RadixDialog.Close asChild>
            <IconButton
              className="subtle-button"
              icon="ri-close-line"
              aria-label="Close"
            />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);

// export const RadixDialog = ({children, ...props}: PropsWithChildren<RadixDialog.DialogProps & RadixDialog.PortalProps>) => {
//     return <RadixDialog.Root {...props}>
//       <RadixDialog.Trigger>Open</RadixDialog.Trigger>
//         <RadixDialog.Portal {...props} >
//             <RadixDialog.Overlay />
//             <RadixDialog.Content>
//             <RadixDialog.Title title='sdffdsf'/>
//             <RadixDialog.Description />
//             {children}
//             <RadixDialog.Close />
//             </RadixDialog.Content>
//         </RadixDialog.Portal>
//   </RadixDialog.Root>
// }
