import TerminalTable from '../configurator/components/TerminalTable.jsx'
import useTerminalManager from '../configurator/hooks/useTerminalManager.js'

export default function TimetablesPage() {
  const { terminals, terminalsError, terminalsLoading } = useTerminalManager()

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--timetables">
        <p className="page-kicker page-kicker--timetables">Timetables</p>
        <h1 className="page-title">Timetable management</h1>

        <div className="mt-8">
          <TerminalTable
            terminals={terminals}
            title="Terminals"
            isLoading={terminalsLoading}
            error={terminalsError}
            showType={false}
            showIsActive={false}
          />
        </div>
      </div>
    </section>
  )
}
