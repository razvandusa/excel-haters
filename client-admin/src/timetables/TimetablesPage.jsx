import TimetablesTerminalTable from './components/TimetablesTerminalTable.jsx'
import timetablesContent from './config/timetablesContent.js'
import useTimetablesOverview from './hooks/useTimetablesOverview.js'

export default function TimetablesPage() {
  const { terminals, terminalsError, terminalsLoading } = useTimetablesOverview()

  return (
    <section className="mt-4">
      <div className="border border-cyan-400/15 bg-cyan-400/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          {timetablesContent.kicker}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{timetablesContent.title}</h1>

        <div className="mt-8">
          <TimetablesTerminalTable
            terminals={terminals}
            terminalsTitle={timetablesContent.terminalsTableTitle}
            componentsTitle={timetablesContent.componentsTableTitle}
            assignmentsTitle={timetablesContent.assignmentsTableTitle}
            isLoading={terminalsLoading}
            error={terminalsError}
          />
        </div>
      </div>
    </section>
  )
}
