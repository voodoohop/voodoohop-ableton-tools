
import { create } from '@most/create';

const now = fn => setTimeout(fn, 0)

export default function Subject(initial = null) {
  let _add
  let _end
  let _error

  const stream = create((add, end, error) => {
    _add = add
    _end = end
    _error = error
    return _error
  }).multicast()

  stream.push = v => now(
    () => typeof _add === `function` ? _add(v) : void 0
  )

  stream.end = () => now(
    () => typeof _end === `function` ? _end() : void 0
  )

  stream.error = e => now(
    () => typeof _error === `function` ? _error(e) : void 0
  )

  stream.plug = value$ => {
    value$.forEach(stream.push)
  }

  if (initial !== null) {
    setTimeout(() => stream.push(initial), 10);
  }

  return stream
}

// export default Subject;
