import useTerminalManager from '../../configurator/hooks/useTerminalManager.js'

export default function useTimetablesOverview() {
  const { terminals, terminalsError, terminalsLoading } = useTerminalManager()

  return {
    terminals,
    terminalsError,
    terminalsLoading,
  }
}
