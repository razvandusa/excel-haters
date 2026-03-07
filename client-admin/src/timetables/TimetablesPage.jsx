import TimetablesTerminalTable from './components/TimetablesTerminalTable.jsx'
import timetablesContent from './config/timetablesContent.js'
import useTimetablesOverview from './hooks/useTimetablesOverview.js'

export default function TimetablesPage() {
  const { terminals, terminalsError, terminalsLoading } = useTimetablesOverview()

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--timetables">
        <p className="page-kicker page-kicker--timetables">
          {timetablesContent.kicker}
        </p>
        <h1 className="page-title">{timetablesContent.title}</h1>

        <div className="mt-8">
          <TimetablesTerminalTable
            terminals={terminals}
            terminalsTitle={timetablesContent.terminalsTableTitle}
            componentsTitle={timetablesContent.componentsTableTitle}
            isLoading={terminalsLoading}
            error={terminalsError}
          />
        </div>
      </div>
    </section>
  )
}
