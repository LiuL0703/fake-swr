// Cache
const __cache = new Map()

function cacheGet(key) {
  return __cache.get(key) || undefined
}

function cacheSet(key, value) {
  return __cache.set(key, value)
}

function cacheClear() {
  __cache.clear()
}


function useSWR(...args) {
  let _key,
    fn,
    config= {}

  if (args.length >= 1) {
    _key = args[0]
  }
  if (typeof args[1] === 'function') {
    fn = args[1]
  } else if (typeof args[1] === 'object') {
    config = args[1]
  }
  if (typeof args[2] === 'object') {
    config = args[2]
  }

  // we assume `key` as the identifier of the request
  // `key` can change but `fn` shouldn't
  // (because `revalidate` only depends on `key`)
  const [key, fnArgs] = getKeyArgs(_key)

  // `keyErr` is the cache key for error objects
  const keyErr = getErrorKey(key)

  config = Object.assign(
    {},
    defaultConfig,
    useContext(SWRConfigContext),
    config
  )

  if (typeof fn === 'undefined') {
    // use a global fetcher
    fn = config.fetcher
  }

  // it is fine to call `useHydration` conditionally here
  // because `config.suspense` should never change
  const shouldReadCache = config.suspense || !useHydration()
  const initialData =
    (shouldReadCache ? cacheGet(key) : undefined) || config.initialData
  const initialError = shouldReadCache ? cacheGet(keyErr) : undefined

  let [state, dispatch] = useReducer(mergeState, {
    data: initialData,
    error: initialError,
    isValidating: false
  })

  // error ref inside revalidate (is last request errored?)
  const unmountedRef = useRef(false)
  const keyRef = useRef(key)
  const dataRef = useRef(initialData)
  const errorRef = useRef(initialError)

  // start a revalidation
  const revalidate = useCallback(
    async (
      revalidateOpts = {}
    ) => {
      if (!key || !fn) return false
      if (unmountedRef.current) return false
      revalidateOpts = Object.assign({ dedupe: false }, revalidateOpts)

      let loading = true
      let shouldDeduping =
        typeof CONCURRENT_PROMISES[key] !== 'undefined' && revalidateOpts.dedupe

      // start fetching
      try {
        dispatch({
          isValidating: true
        })

        let newData
        let startAt

        if (shouldDeduping) {
          // there's already an ongoing request,
          // this one needs to be deduplicated.
          startAt = CONCURRENT_PROMISES_TS[key]
          newData = await CONCURRENT_PROMISES[key]
        } else {
          // if no cache being rendered currently (it shows a blank page),
          // we trigger the loading slow event.
          if (config.loadingTimeout && !cacheGet(key)) {
            setTimeout(() => {
              if (loading) config.onLoadingSlow(key, config)
            }, config.loadingTimeout)
          }

          if (fnArgs !== null) {
            CONCURRENT_PROMISES[key] = fn(...fnArgs)
          } else {
            CONCURRENT_PROMISES[key] = fn(key)
          }

          CONCURRENT_PROMISES_TS[key] = startAt = Date.now()

          setTimeout(() => {
            delete CONCURRENT_PROMISES[key]
            delete CONCURRENT_PROMISES_TS[key]
          }, config.dedupingInterval)

          newData = await CONCURRENT_PROMISES[key]

          // trigger the success event,
          // only do this for the original request.
          config.onSuccess(newData, key, config)
        }

        // if the revalidation happened earlier than the local mutation,
        // we have to ignore the result because it could override.
        // meanwhile, a new revalidation should be triggered by the mutation.
        if (MUTATION_TS[key] && startAt <= MUTATION_TS[key]) {
          dispatch({ isValidating: false })
          return false
        }

        cacheSet(key, newData)
        cacheSet(keyErr, undefined)
        keyRef.current = key

        // new state for the reducer
        const newState = {
          isValidating: false
        }

        if (typeof errorRef.current !== 'undefined') {
          // we don't have an error
          newState.error = undefined
          errorRef.current = undefined
        }
        if (deepEqual(dataRef.current, newData)) {
          // deep compare to avoid extra re-render
          // do nothing
        } else {
          // data changed
          newState.data = newData
          dataRef.current = newData
        }

        // merge the new state
        dispatch(newState)

        if (!shouldDeduping) {
          // also update other hooks
          broadcastState(key, newData, undefined)
        }
      } catch (err) {
        delete CONCURRENT_PROMISES[key]
        delete CONCURRENT_PROMISES_TS[key]

        cacheSet(keyErr, err)
        keyRef.current = key

        // get a new error
        // don't use deep equal for errors
        if (errorRef.current !== err) {
          errorRef.current = err

          // we keep the stale data
          dispatch({
            isValidating: false,
            error: err
          })

          if (!shouldDeduping) {
            // also broadcast to update other hooks
            broadcastState(key, undefined, err)
          }
        }

        // events and retry
        config.onError(err, key, config)
        if (config.shouldRetryOnError) {
          // when retrying, we always enable deduping
          const retryCount = (revalidateOpts.retryCount || 0) + 1
          config.onErrorRetry(
            err,
            key,
            config,
            revalidate,
            Object.assign({ dedupe: true }, revalidateOpts, { retryCount })
          )
        }
      }

      loading = false
      return true
    },
    [key]
  )
}