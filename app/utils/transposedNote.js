import {note} from "teoria";
import log from "../utils/streamLog";


function getTransposed(noteString, semitones=0) {
    if (!noteString)
    {console.error("no noteString");return "";};
    // console.log("transposing",noteString,semitones);
    if (noteString.toUpperCase().indexOf("N") >=0)
        return noteString;
    semitones = parseInt(semitones);
    if (isNaN(semitones))
        semitones=0;
    var isMinor = noteString.toUpperCase().endsWith("M");
    log("making teoria note for",noteString);
    var teoriaNote=note(noteString.toUpperCase().replace("M",""));
    var transposed=note.fromMIDI((teoriaNote.midi()+semitones)%12);
    return (""+transposed.name().toUpperCase()+transposed.accidental().toLowerCase())+(isMinor ? "m":"");//.toUpperCase();
}

export default getTransposed;