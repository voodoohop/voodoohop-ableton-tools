
const mtof = d => Math.pow(2,(d-69)/12)*440;

const ftom = f => 69+12*Math.log2(f/440);

export default (bpm,pitch) => 60000/(1000/mtof(ftom(1/((60000/bpm)/1000))+pitch));