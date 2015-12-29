import most from "most";

export default (rate, stream) => 
	stream.scan((withCount, e)  => [e, withCount[1]+1] ,[null,0]).skip(1)
	.sampleWith(most.periodic(rate, true))
	.skipRepeatsWith((a,b) => a[1] === b[1])
	.map(s=> s[0]);		

	