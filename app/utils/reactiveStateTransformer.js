
// export default (dependingPropertyPath, resultingPropertyPath, transformFunc, stateStream) => 
//     stateStream.scan((prev,next) => {
//         if (prev === null)
//             return next;
//         if (prev.getIn(dependingPropertyPath) === next.getIn(dependingPropertyPath))
//             return next.setIn(resultingPropertyPath, prev.getIn())
//     },null).skip(1)