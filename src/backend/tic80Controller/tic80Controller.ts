// common interface.
// encapsulates TIC-80 process control (args, launch/kill/reload for run/watch/launch)
export interface ITic80Controller {
  // launch a TIC-80 instance with optional cart path (process should be totally detached from current
  // and survive after parent exits)
  // used by
  // * `tic80` command to just launch the tic80 instance
  // * `run` command to launch the cart after building
  launchFireAndForget(cartPath?: string | undefined): Promise<void>;

  // for the `watch` command, we want to launch in a way that is tracked/controlled.
  // for vanilla tic-80 builds, this means we launch and keep the PID/handle to be able to kill it later.
  // for our custom remote-capable build, we keep the same instance running and use IPC to reload the cart.
  // does not return exit codes. again: this controller interface should (mostly)
  // hide the fact that it's a separate process.
  launchAndControlCart(cartPath: string): Promise<void>;

  // if a managed instance is running, stops it.
  // for vanilla builds, kills the process.
  // for remote builds, sends IPC command to close.
  // does not wait for the process to exit, does not return exit code.
  stop(): Promise<void>;

  // register a callback for when the TIC-80 process exits on its own.
  // callbacks may be invoked multiple times if the process is restarted.
  onExit(handler: () => void): void;
}
