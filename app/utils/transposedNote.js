import {note} from "teoria";

function getTransposed(noteString, semitones=0) {
    console.log("transposing",noteString,semitones);
    semitones = parseInt(semitones);
    if (isNaN(semitones))
        semitones=0;
    var isMinor = noteString.toUpperCase().endsWith("M");
    var teoriaNote=note(noteString.toUpperCase().replace("M",""));
    var transposed=note.fromMIDI((teoriaNote.midi()+semitones)%12);
    return (""+transposed.name()+transposed.accidental()+(isMinor ? "M":"")).toUpperCase();
}

export default getTransposed;