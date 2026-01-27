// this uses a forked custom build of TIC-80 that supports IPC.

// see: https://github.com/thenfour/TIC-80-ticbuild/blob/ticbuild-remoting/src/ticbuild_remoting/README.md
// for the full protocol & how to use.

// first step: just reuse the internal controller behavior to get plumbing in place.
// after that is working, implement the remoting protocol here.

import { VanillaTic80Controller } from "./vanillaController";

// before implementing remoting protocol, just get this abstraction to work.
export const CustomTic80Controller = VanillaTic80Controller;
