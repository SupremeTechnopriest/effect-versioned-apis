import { Effect, Config, Logger, Layer, References } from 'effect'

const make = Effect.gen(function* () {
  const LOG_LEVEL = yield* Config.logLevel('LOG_LEVEL').pipe(
    Config.withDefault('Info')
  )
  const minimumLogLevel = Layer.succeed(References.MinimumLogLevel, LOG_LEVEL)

  return Logger.layer([Logger.withLeveledConsole(Logger.formatJson)]).pipe(
    Layer.provideMerge(minimumLogLevel)
  )
})

export const makeLogLayer = () => Layer.unwrap(make)
