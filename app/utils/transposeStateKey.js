import transposedNote from "./transposedNote";

export default (state) => state.scan((prevState, state) => state.set("tracks", state.get("tracks").map((v, trackId) => {
    if (prevState === null)
        return v;
    const pv = prevState.getIn(["tracks", trackId]);
    if (!pv)
        return v;
    // console.log("pv",pv);
    if (!v.getIn(["fileData", "id3Metadata", "initialkey"]))
        return v;
    const pitch = v.getIn(["liveData", "pitch"]) || 0;
    //  if (!pitch)
    //     pitch=0;
    // console.log("table",);
    // console.table([pv.get("liveData"),v.get("liveData")]);
    if (pv.getIn(["liveData", "pitch"]) === pitch && pv.getIn(["liveData", "file_path"]) === v.getIn(["liveData", "file_path"]) && pv.getIn(["liveData", "transposedChords"]))
        return v
            .setIn(["liveData", "transposedChords"], pv.getIn(["liveData", "transposedChords"]))
            .setIn(["liveData", "transposedKey"], pv.getIn(["liveData", "transposedKey"]));
    const chords = (
        (v.getIn(["fileData", "vampChord_HPA"]) && !v.getIn(["fileData", "vampChord_HPA", "error"]) && v.getIn(["fileData", "vampChord_HPA"]))
        || (v.getIn(["fileData", "vampChord_QM"]) && !v.getIn(["fileData", "vampChord_QM", "error"]) && v.getIn(["fileData", "vampChord_QM"]))
    );

    var resTransposedKey = v
        .setIn(["liveData", "transposedKey"], transposedNote(v.getIn(["fileData", "id3Metadata", "initialkey"]), pitch));

    if (chords)
        resTransposedKey = resTransposedKey
            .setIn(["liveData", "transposedChords"], chords.map(chord => chord.set("chord", transposedNote(chord.get("chord"), pitch))));
    return resTransposedKey;
})), null).skip(1);