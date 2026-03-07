import TerminalTable from '../../configurator/components/TerminalTable.jsx'

export default function TimetablesTerminalTable({
  terminals,
  title,
  isLoading = false,
  error = '',
}) {
  return (
    <TerminalTable
      terminals={terminals}
      title={title}
      isLoading={isLoading}
      error={error}
      showType={false}
      showIsActive={false}
    />
  )
}
